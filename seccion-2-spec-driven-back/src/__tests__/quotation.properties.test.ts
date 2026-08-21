import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { QuotationServiceImpl, DomainError } from '../services/index.js';
import { ShoeTypeRepository, RepairRepository } from '../repositories/index.js';
import { ShoeType, Repair } from '../domain/types.js';

// ─── Reusable Arbitraries ───────────────────────────────────────────────────────

const shoeTypeArb: fc.Arbitrary<ShoeType> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  complexityFactor: fc.double({ min: 0.01, max: 10, noNaN: true }),
});

const repairArb: fc.Arbitrary<Repair> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  basePrice: fc.double({ min: 0.01, max: 1000, noNaN: true }),
  estimatedDays: fc.integer({ min: 1, max: 30 }),
});

// ─── Helper: In-memory repositories from generated data ─────────────────────────

function createShoeTypeRepo(shoeTypes: ShoeType[]): ShoeTypeRepository {
  return {
    findAll: () => [...shoeTypes],
    findById: (id: string) => shoeTypes.find((st) => st.id === id),
  };
}

function createRepairRepo(repairs: Repair[]): RepairRepository {
  return {
    findAll: () => [...repairs],
    findById: (id: string) => repairs.find((r) => r.id === id),
    findByIds: (ids: string[]) => repairs.filter((r) => ids.includes(r.id)),
  };
}

// ─── Helper: Rounding function matching service logic ───────────────────────────

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// ─── Property Tests ─────────────────────────────────────────────────────────────

describe('Quotation Property-Based Tests', () => {
  // Feature: shoe-repair-quotation, Property 1: ShoeType catalog field completeness
  it('P1: every generated ShoeType has id, name, and complexityFactor', () => {
    fc.assert(
      fc.property(fc.array(shoeTypeArb, { minLength: 1, maxLength: 20 }), (shoeTypes) => {
        for (const st of shoeTypes) {
          expect(st).toHaveProperty('id');
          expect(st).toHaveProperty('name');
          expect(st).toHaveProperty('complexityFactor');
          expect(typeof st.id).toBe('string');
          expect(typeof st.name).toBe('string');
          expect(typeof st.complexityFactor).toBe('number');
          expect(st.complexityFactor).toBeGreaterThan(0);
        }
      }),
    );
  });

  // Feature: shoe-repair-quotation, Property 2: Repair catalog field completeness
  it('P2: every generated Repair has id, name, basePrice, and estimatedDays', () => {
    fc.assert(
      fc.property(fc.array(repairArb, { minLength: 1, maxLength: 20 }), (repairs) => {
        for (const r of repairs) {
          expect(r).toHaveProperty('id');
          expect(r).toHaveProperty('name');
          expect(r).toHaveProperty('basePrice');
          expect(r).toHaveProperty('estimatedDays');
          expect(typeof r.id).toBe('string');
          expect(typeof r.name).toBe('string');
          expect(typeof r.basePrice).toBe('number');
          expect(r.basePrice).toBeGreaterThan(0);
          expect(typeof r.estimatedDays).toBe('number');
          expect(r.estimatedDays).toBeGreaterThanOrEqual(1);
          expect(Number.isInteger(r.estimatedDays)).toBe(true);
        }
      }),
    );
  });

  // Feature: shoe-repair-quotation, Property 3: Subtotal formula correctness
  it('P3: subtotal equals round(sum(basePrice * complexityFactor))', () => {
    fc.assert(
      fc.property(
        shoeTypeArb,
        fc.array(repairArb, { minLength: 1, maxLength: 10 }),
        (shoeType, repairs) => {
          const shoeTypeRepo = createShoeTypeRepo([shoeType]);
          const repairRepo = createRepairRepo(repairs);
          const service = new QuotationServiceImpl(shoeTypeRepo, repairRepo);

          const quotation = service.createQuotation({
            shoeTypeId: shoeType.id,
            repairIds: repairs.map((r) => r.id),
            urgent: false,
          });

          const expectedSubtotal = round2(
            repairs.reduce((sum, r) => sum + r.basePrice * shoeType.complexityFactor, 0),
          );

          expect(quotation.subtotal).toBe(expectedSubtotal);
        },
      ),
    );
  });

  // Feature: shoe-repair-quotation, Property 4: No surcharge when urgent=false
  it('P4: surcharge is 0 and total equals subtotal when not urgent', () => {
    fc.assert(
      fc.property(
        shoeTypeArb,
        fc.array(repairArb, { minLength: 1, maxLength: 10 }),
        (shoeType, repairs) => {
          const shoeTypeRepo = createShoeTypeRepo([shoeType]);
          const repairRepo = createRepairRepo(repairs);
          const service = new QuotationServiceImpl(shoeTypeRepo, repairRepo);

          const quotation = service.createQuotation({
            shoeTypeId: shoeType.id,
            repairIds: repairs.map((r) => r.id),
            urgent: false,
          });

          expect(quotation.surcharge).toBe(0);
          expect(quotation.total).toBe(quotation.subtotal);
        },
      ),
    );
  });

  // Feature: shoe-repair-quotation, Property 5: 30% surcharge when urgent=true
  it('P5: surcharge is 30% of subtotal and total = subtotal + surcharge when urgent', () => {
    fc.assert(
      fc.property(
        shoeTypeArb,
        fc.array(repairArb, { minLength: 1, maxLength: 10 }),
        (shoeType, repairs) => {
          const shoeTypeRepo = createShoeTypeRepo([shoeType]);
          const repairRepo = createRepairRepo(repairs);
          const service = new QuotationServiceImpl(shoeTypeRepo, repairRepo);

          const quotation = service.createQuotation({
            shoeTypeId: shoeType.id,
            repairIds: repairs.map((r) => r.id),
            urgent: true,
          });

          // Ensure subtotal is large enough that 30% surcharge doesn't round to 0
          const expectedSurcharge = round2(quotation.subtotal * 0.30);
          fc.pre(expectedSurcharge > 0);

          const expectedTotal = round2(quotation.subtotal + expectedSurcharge);

          expect(quotation.surcharge).toBe(expectedSurcharge);
          expect(quotation.total).toBe(expectedTotal);
          expect(quotation.surcharge).toBeGreaterThan(0);
        },
      ),
    );
  });

  // Feature: shoe-repair-quotation, Property 6: Estimated days without urgency
  it('P6: estimatedDays equals max(repair.estimatedDays) when not urgent', () => {
    fc.assert(
      fc.property(
        shoeTypeArb,
        fc.array(repairArb, { minLength: 1, maxLength: 10 }),
        (shoeType, repairs) => {
          const shoeTypeRepo = createShoeTypeRepo([shoeType]);
          const repairRepo = createRepairRepo(repairs);
          const service = new QuotationServiceImpl(shoeTypeRepo, repairRepo);

          const quotation = service.createQuotation({
            shoeTypeId: shoeType.id,
            repairIds: repairs.map((r) => r.id),
            urgent: false,
          });

          const expectedDays = Math.max(...repairs.map((r) => r.estimatedDays));

          expect(quotation.estimatedDays).toBe(expectedDays);
        },
      ),
    );
  });

  // Feature: shoe-repair-quotation, Property 7: Estimated days with urgency
  it('P7: estimatedDays equals max(1, ceil(maxDays/2)) and is integer >= 1 when urgent', () => {
    fc.assert(
      fc.property(
        shoeTypeArb,
        fc.array(repairArb, { minLength: 1, maxLength: 10 }),
        (shoeType, repairs) => {
          const shoeTypeRepo = createShoeTypeRepo([shoeType]);
          const repairRepo = createRepairRepo(repairs);
          const service = new QuotationServiceImpl(shoeTypeRepo, repairRepo);

          const quotation = service.createQuotation({
            shoeTypeId: shoeType.id,
            repairIds: repairs.map((r) => r.id),
            urgent: true,
          });

          const maxDays = Math.max(...repairs.map((r) => r.estimatedDays));
          const expectedDays = Math.max(1, Math.ceil(maxDays / 2));

          expect(quotation.estimatedDays).toBe(expectedDays);
          expect(Number.isInteger(quotation.estimatedDays)).toBe(true);
          expect(quotation.estimatedDays).toBeGreaterThanOrEqual(1);
        },
      ),
    );
  });

  // Feature: shoe-repair-quotation, Property 8: UUID uniqueness and ISO 8601 createdAt
  it('P8: multiple quotations have distinct UUIDs and valid ISO 8601 createdAt', () => {
    fc.assert(
      fc.property(
        shoeTypeArb,
        fc.array(repairArb, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 2, max: 10 }),
        (shoeType, repairs, count) => {
          const shoeTypeRepo = createShoeTypeRepo([shoeType]);
          const repairRepo = createRepairRepo(repairs);
          const service = new QuotationServiceImpl(shoeTypeRepo, repairRepo);

          const quotations = Array.from({ length: count }, () =>
            service.createQuotation({
              shoeTypeId: shoeType.id,
              repairIds: repairs.map((r) => r.id),
              urgent: false,
            }),
          );

          // All IDs must be unique
          const ids = quotations.map((q) => q.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);

          // All createdAt must parse as valid ISO 8601 dates
          for (const q of quotations) {
            const date = new Date(q.createdAt);
            expect(date.toString()).not.toBe('Invalid Date');
            expect(q.createdAt).toMatch(
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/,
            );
          }
        },
      ),
    );
  });

  // Feature: shoe-repair-quotation, Property 9: Rejection on unknown shoeTypeId
  it('P9: throws DomainError SHOE_TYPE_NOT_FOUND for unknown shoeTypeId', () => {
    fc.assert(
      fc.property(
        shoeTypeArb,
        fc.array(repairArb, { minLength: 1, maxLength: 5 }),
        fc.uuid(),
        (shoeType, repairs, unknownId) => {
          // Ensure unknownId is different from the repo's shoe type
          fc.pre(unknownId !== shoeType.id);

          const shoeTypeRepo = createShoeTypeRepo([shoeType]);
          const repairRepo = createRepairRepo(repairs);
          const service = new QuotationServiceImpl(shoeTypeRepo, repairRepo);

          try {
            service.createQuotation({
              shoeTypeId: unknownId,
              repairIds: repairs.map((r) => r.id),
              urgent: false,
            });
            // Should not reach here
            expect.fail('Expected DomainError to be thrown');
          } catch (error) {
            expect(error).toBeInstanceOf(DomainError);
            expect((error as DomainError).code).toBe('SHOE_TYPE_NOT_FOUND');
          }
        },
      ),
    );
  });

  // Feature: shoe-repair-quotation, Property 10: Rejection on unknown repairIds
  it('P10: throws DomainError REPAIRS_NOT_FOUND when some repairIds are invalid', () => {
    fc.assert(
      fc.property(
        shoeTypeArb,
        fc.array(repairArb, { minLength: 1, maxLength: 5 }),
        fc.array(fc.uuid(), { minLength: 1, maxLength: 3 }),
        (shoeType, repairs, invalidIds) => {
          // Ensure invalidIds don't accidentally match valid repair IDs
          const validIds = new Set(repairs.map((r) => r.id));
          const trueInvalidIds = invalidIds.filter((id) => !validIds.has(id));
          fc.pre(trueInvalidIds.length > 0);

          const shoeTypeRepo = createShoeTypeRepo([shoeType]);
          const repairRepo = createRepairRepo(repairs);
          const service = new QuotationServiceImpl(shoeTypeRepo, repairRepo);

          // Combine valid + invalid repair IDs
          const mixedIds = [repairs[0].id, ...trueInvalidIds];

          try {
            service.createQuotation({
              shoeTypeId: shoeType.id,
              repairIds: mixedIds,
              urgent: false,
            });
            // Should not reach here
            expect.fail('Expected DomainError to be thrown');
          } catch (error) {
            expect(error).toBeInstanceOf(DomainError);
            expect((error as DomainError).code).toBe('REPAIRS_NOT_FOUND');
          }
        },
      ),
    );
  });
});
