# Implementation Plan: Shoe Repair Quotation API

## Overview

Implement a three-layer REST API (HTTP → Service → Repository) with Express 4 + TypeScript on Node.js 20 LTS. The API exposes catalog endpoints (`GET /catalog/shoe-types`, `GET /catalog/repairs`) and a quotation endpoint (`POST /quotations`). All data is stored in memory. Tests are written with Vitest and fast-check.

---

## Tasks

- [ ] 1. Set up project structure and configuration
  - Initialize `package.json` with Node.js 20 LTS as the engine field
  - Install runtime dependencies: `express`, `cors`
  - Install dev dependencies: `typescript`, `@types/express`, `@types/node`, `vitest`, `fast-check`, `@vitest/coverage-v8`, `tsx`
  - Create `tsconfig.json` targeting ES2022, module `NodeNext`, strict mode enabled, `outDir: dist`
  - Create `vitest.config.ts` with environment `node` and include pattern `src/**/*.test.ts`
  - Add npm scripts: `build`, `start`, `dev` (tsx watch), `test` (vitest --run), `test:coverage`
  - Create directory skeleton: `src/`, `src/domain/`, `src/repositories/`, `src/services/`, `src/routes/`, `src/__tests__/`
  - _Requirements: 7.4_

- [ ] 2. Define domain interfaces and data models
  - [ ] 2.1 Create TypeScript interfaces for all domain entities and DTOs
    - Write `src/domain/types.ts` with interfaces: `ShoeType`, `Repair`, `Quotation`, `QuotationRequest`, `ErrorResponse`
    - Include JSDoc comments for every field, matching the constraints in the design (`complexityFactor > 0`, `basePrice > 0`, `estimatedDays >= 1`, UUID v4 format, ISO 8601 `createdAt`)
    - Export all interfaces as named exports
    - _Requirements: 3.2, 3.3, 4.1_

- [ ] 3. Implement the Repository layer
  - [ ] 3.1 Implement `InMemoryShoeTypeRepository`
    - Create `src/repositories/ShoeTypeRepository.ts` with interface `ShoeTypeRepository` and class `InMemoryShoeTypeRepository`
    - Seed data on construction: `st-1` Zapatilla deportiva (1.0), `st-2` Bota (1.5), `st-3` Sandalia (0.8)
    - Implement `findAll(): ShoeType[]` and `findById(id: string): ShoeType | undefined`
    - _Requirements: 1.1, 1.2, 2.3_

  - [ ] 3.2 Implement `InMemoryRepairRepository`
    - Create `src/repositories/RepairRepository.ts` with interface `RepairRepository` and class `InMemoryRepairRepository`
    - Seed data on construction: `r-1` Cambio de suela (25.00, 5d), `r-2` Costura (15.00, 3d), `r-3` Limpieza profunda (10.00, 1d), `r-4` Cambio de taco (20.00, 4d)
    - Implement `findAll(): Repair[]`, `findById(id: string): Repair | undefined`, and `findByIds(ids: string[]): Repair[]`
    - _Requirements: 1.1, 1.2, 2.4_

- [ ] 4. Implement the Service layer
  - [ ] 4.1 Implement `CatalogService`
    - Create `src/services/CatalogService.ts` with interface and class `CatalogServiceImpl`
    - Inject `ShoeTypeRepository` and `RepairRepository` via constructor
    - Implement `getAllShoeTypes(): ShoeType[]` and `getAllRepairs(): Repair[]` (delegate to repositories)
    - _Requirements: 1.1, 1.2, 2.2_

  - [ ] 4.2 Implement `QuotationService` — pricing and time calculation
    - Create `src/services/QuotationService.ts` with interface and class `QuotationServiceImpl`
    - Inject `ShoeTypeRepository` and `RepairRepository` via constructor
    - Implement validation: reject empty `repairIds`, unknown `shoeTypeId`, unknown `repairIds`
    - Implement pricing: `subtotal = Σ(repair.basePrice × shoeType.complexityFactor)`, `surcharge = urgent ? subtotal × 0.30 : 0`, `total = subtotal + surcharge`
    - Implement time: `estimatedDays = urgent ? max(1, ceil(max(days) / 2)) : max(days)`
    - Assign `id = crypto.randomUUID()` and `createdAt = new Date().toISOString()`
    - Throw typed domain errors for each validation failure (to be mapped to HTTP 400 in the router)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.5, 3.6, 4.1, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3_

- [ ] 5. Checkpoint — verify service layer correctness
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement the HTTP layer (Express routers)
  - [ ] 6.1 Create `CatalogRouter`
    - Create `src/routes/catalogRouter.ts` exporting an Express `Router`
    - Mount `GET /shoe-types` → `catalogService.getAllShoeTypes()`, respond HTTP 200 with JSON array
    - Mount `GET /repairs` → `catalogService.getAllRepairs()`, respond HTTP 200 with JSON array
    - _Requirements: 1.1, 1.2, 1.3, 2.2_

  - [ ] 6.2 Create `QuotationRouter`
    - Create `src/routes/quotationRouter.ts` exporting an Express `Router`
    - Mount `POST /` → validate body fields (`shoeTypeId`, `repairIds`, `urgent`); if missing, return HTTP 400 with `ErrorResponse`
    - Delegate to `quotationService.createQuotation(request)`, respond HTTP 201 with `{ quotation }`
    - Catch domain validation errors and map them to HTTP 400 with appropriate `ErrorResponse`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.3, 7.1, 7.4_

  - [ ] 6.3 Create Express application entry point
    - Create `src/app.ts` that wires together `CatalogRouter` (mounted at `/catalog`) and `QuotationRouter` (mounted at `/quotations`)
    - Register `express.json()` middleware and a global error handler that returns HTTP 500 `{ "error": "Error interno del servidor" }` without exposing stack traces
    - Create `src/server.ts` as the executable entry point (imports `app.ts` and listens on `PORT` env variable, default 3000)
    - _Requirements: 7.4_

- [ ] 7. Write example-based (unit) tests
  - [ ] 7.1 Write unit tests for `QuotationService`
    - Create `src/__tests__/quotation.service.test.ts`
    - Test: `repairIds = []` → throws validation error
    - Test: unknown `shoeTypeId` → throws with correct message
    - Test: unknown `repairIds` → throws identifying missing IDs
    - Test: concrete calculation — zapatilla (f=1.0) + suela (25.00) + costura (15.00), urgent=false → `subtotal=40.00`, `surcharge=0`, `total=40.00`, `estimatedDays=5`
    - Test: same inputs urgent=true → `subtotal=40.00`, `surcharge=12.00`, `total=52.00`, `estimatedDays=3`
    - Test: single repair of 1 day, urgent=true → `estimatedDays=1` (minimum floor)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 5.1, 5.2, 5.3_

  - [ ] 7.2 Write example-based tests for catalog routes
    - Create `src/__tests__/catalog.routes.test.ts`
    - Test: `GET /catalog/shoe-types` with seeded repo → HTTP 200, non-empty array
    - Test: `GET /catalog/repairs` with seeded repo → HTTP 200, non-empty array
    - Test: `GET /catalog/shoe-types` with empty repo → HTTP 200, `[]`
    - Test: `GET /catalog/repairs` with empty repo → HTTP 200, `[]`
    - _Requirements: 1.1, 1.2, 1.3, 2.2_

  - [ ] 7.3 Write example-based tests for quotation routes
    - Create `src/__tests__/quotation.routes.test.ts`
    - Test: `POST /quotations` with `repairIds = []` → HTTP 400
    - Test: `POST /quotations` missing `shoeTypeId` → HTTP 400
    - Test: `POST /quotations` valid request → HTTP 201, response contains `quotation` with all required fields
    - Test: `POST /quotations` with invalid JSON body → HTTP 400
    - _Requirements: 2.1, 2.2, 3.3, 7.1, 7.4_

- [ ] 8. Checkpoint — verify all example tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Write property-based tests (fast-check)
  - [ ] 9.1 Create property test file and arbitraries
    - Create `src/__tests__/quotation.properties.test.ts`
    - Define reusable fast-check arbitraries: `shoeTypeArb` (`fc.record` with positive `complexityFactor`), `repairArb` (`fc.record` with positive `basePrice` and positive integer `estimatedDays`), `validRequestArb`
    - Tag every test with comment: `// Feature: shoe-repair-quotation, Property {N}: {texto}`
    - _Requirements: 1.3, 2.3_

  - [ ]* 9.2 Write property test for P1 — ShoeType catalog field completeness
    - **Property 1: Completitud de campos en el catálogo de tipos de calzado**
    - Generate arrays of `ShoeType` objects; verify every element has `id`, `name`, `complexityFactor`
    - **Validates: Requirements 1.3**

  - [ ]* 9.3 Write property test for P2 — Repair catalog field completeness
    - **Property 2: Completitud de campos en el catálogo de reparaciones**
    - Generate arrays of `Repair` objects; verify every element has `id`, `name`, `basePrice`, `estimatedDays`
    - **Validates: Requirements 2.3**

  - [ ]* 9.4 Write property test for P3 — Subtotal formula
    - **Property 3: Fórmula del Subtotal**
    - Generate `shoeType` (positive `complexityFactor`) + non-empty `repairs` array; assert `subtotal === Σ(p × f)`
    - **Validates: Requirements 3.2**

  - [ ]* 9.5 Write property test for P4 — No surcharge when urgent=false
    - **Property 4: Precio sin urgencia (Recargo = 0)**
    - Generate valid requests with `urgent = false`; assert `surcharge === 0` and `total === subtotal`
    - **Validates: Requirements 3.3, 4.4**

  - [ ]* 9.6 Write property test for P5 — 30% surcharge when urgent=true
    - **Property 5: Precio con urgencia (Recargo del 30%)**
    - Generate valid requests with `urgent = true`; assert `surcharge === subtotal × 0.30` and `total === subtotal + surcharge` and `surcharge > 0`
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [ ]* 9.7 Write property test for P6 — Estimated days without urgency
    - **Property 6: Tiempo estimado sin urgencia**
    - Generate non-empty `repairs` array, `urgent = false`; assert `estimatedDays === max(days)` and is an integer
    - **Validates: Requirements 5.1, 5.4**

  - [ ]* 9.8 Write property test for P7 — Estimated days with urgency
    - **Property 7: Tiempo estimado con urgencia**
    - Generate non-empty `repairs` array, `urgent = true`; assert `estimatedDays === max(1, ceil(maxDays / 2))` and is an integer ≥ 1
    - **Validates: Requirements 5.2, 5.3, 5.4**

  - [ ]* 9.9 Write property test for P8 — UUID uniqueness and ISO 8601 createdAt
    - **Property 8: Unicidad y formato del identificador y fecha de creación**
    - Generate ≥ 2 valid requests; assert all `id` values are mutually distinct and every `createdAt` parses without error as ISO 8601
    - **Validates: Requirements 3.1, 6.1, 6.2, 6.3**

  - [ ]* 9.10 Write property test for P9 — Rejection on unknown shoeTypeId
    - **Property 9: Rechazo ante tipo de calzado inexistente**
    - Generate strings that are not seeded shoe type IDs; assert the service throws (or route returns HTTP 4xx) with a message identifying the shoe type
    - **Validates: Requirements 3.5**

  - [ ]* 9.11 Write property test for P10 — Rejection on unknown repairIds
    - **Property 10: Rechazo ante reparaciones inexistentes**
    - Combine valid repair IDs with at least one randomly generated invalid ID; assert HTTP 4xx response identifies the missing IDs
    - **Validates: Requirements 3.6**

- [ ] 10. Final checkpoint — full test suite green
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for full traceability
- Checkpoints (tasks 5, 8, 10) validate incremental progress before moving to the next layer
- Property tests (9.2–9.11) each map to a named property from the design document (P1–P10)
- Unit tests in tasks 7.1–7.3 are not optional and must be implemented
- All monetary rounding follows half-up to two decimal places as required by the design
- Use `crypto.randomUUID()` (Node.js built-in) — no external UUID library needed

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["3.1", "3.2"] },
    { "id": 2, "tasks": ["4.1", "4.2"] },
    { "id": 3, "tasks": ["6.1", "6.2", "7.1"] },
    { "id": 4, "tasks": ["6.3", "7.2", "7.3"] },
    { "id": 5, "tasks": ["9.1"] },
    { "id": 6, "tasks": ["9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10", "9.11"] }
  ]
}
```
