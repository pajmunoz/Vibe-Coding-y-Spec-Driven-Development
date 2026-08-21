# Lista de Tareas de Implementación - Cotizador de Reparación de Calzado

## Estado general: ✅ Completado

---

- [x] **Tarea 1**: Crear las entidades de dominio `Calzado`, `TipoReparacion` y el Value Object `Dinero`.
  - `Calzado.java` — entidad con `id`, `nombre`, `factorComplejidad`
  - `TipoReparacion.java` — entidad con `id`, `nombre`, `precioBase`, `tiempoEstimadoDias`
  - `Dinero.java` — Value Object inmutable con `sumar`, `aplicarPorcentaje`, `multiplicar`
  - `NivelUrgencia.java` — enum `NORMAL` / `URGENTE`
  - `CotizadorApplication.java` + `pom.xml` — Spring Boot 3.3.2, Java 17

---

- [x] **Tarea 2**: Implementar la interfaz `UrgencyPricingStrategy` con sus variantes `NormalPricingStrategy` y `UrgentePricingStrategy`.
  - `UrgencyPricingStrategy.java` — interfaz con `calcularRecargo(Dinero)` y `calcularTiempoEntrega(int)`
  - `NormalPricingStrategy.java` — recargo = 0, tiempo sin cambios
  - `UrgentePricingStrategy.java` — recargo = 30% (RN-02), tiempo = `ceil(base/2)` mínimo 1 (RN-03)

---

- [x] **Tarea 3**: Implementar la entidad agregada `Cotizacion` con el Factory Method para validar invariants (RN-04, RN-05) y realizar los cálculos (RN-01 a RN-03).
  - `Cotizacion.java` — Factory Method `crear(calzado, reparaciones, urgente, strategy)`
  - Constructor privado garantiza estado siempre válido
  - `CotizacionException.java` — excepción de dominio para RN-04

---

- [x] **Tarea 4**: Definir los puertos de entrada (`GenerarCotizacionUseCase`, `ConsultarCatalogoUseCase`) y puertos de salida (`CotizacionRepositoryPort`, `CalzadoRepositoryPort`, `TipoReparacionRepositoryPort`).
  - `GenerarCotizacionUseCase.java` — con record `GenerarCotizacionCommand`
  - `ConsultarCatalogoUseCase.java` — `listarCalzados()`, `listarReparaciones()`
  - `CotizacionRepositoryPort.java` — `guardar`, `buscarPorId`
  - `CalzadoRepositoryPort.java` — `buscarPorId`, `listarTodos`
  - `TipoReparacionRepositoryPort.java` — `buscarPorId`, `buscarPorIds`, `listarTodos`

---

- [x] **Tarea 5**: Implementar el servicio de aplicación `GenerarCotizacionService` inyectando las estrategias y repositorios.
  - `GenerarCotizacionService.java` — implementa `GenerarCotizacionUseCase` y `ConsultarCatalogoUseCase`
  - Inyección por constructor de los 5 colaboradores
  - Selecciona estrategia según flag `urgente`

---

- [x] **Tarea 6**: Implementar los adaptadores de persistencia en memoria (`InMemoryCotizacionRepositoryAdapter`, etc.).
  - `InMemoryCalzadoRepositoryAdapter.java` — 5 calzados precargados (factor 0.8 – 1.8)
  - `InMemoryTipoReparacionRepositoryAdapter.java` — 6 reparaciones precargadas en PEN
  - `InMemoryCotizacionRepositoryAdapter.java` — `ConcurrentHashMap`
  - `CotizadorConfig.java` — registra `NormalPricingStrategy` y `UrgentePricingStrategy` como beans

---

- [x] **Tarea 7**: Crear DTOs (`CotizacionRequest`, `CotizacionResponse`) y mappers de dominio a DTO (`CotizacionMapper`).
  - `CotizacionRequest.java` — `@NotBlank` en `calzadoId`, `@NotEmpty` en `reparacionIds`
  - `CotizacionResponse.java` — con inner class `ReparacionResumen`
  - `CalzadoResponse.java`, `TipoReparacionResponse.java`
  - `CotizacionMapper.java` — convierte dominio → DTO para todas las entidades

---

- [x] **Tarea 8**: Implementar el controlador REST `CotizacionController` exponiendo los endpoints definidos.
  - `CotizacionController.java` — `POST /api/cotizaciones` (201), `GET /api/catalogo/calzados` (200), `GET /api/catalogo/reparaciones` (200)
  - `GlobalExceptionHandler.java` — `CotizacionException` → 400, `MethodArgumentNotValidException` → 400, `Exception` → 500
  - Compilación verificada: **BUILD SUCCESS** (27 fuentes)

---

- [x] **Tarea 9**: Generar el contrato `openapi.yaml` basado en los endpoints implementados.
  - `src/main/resources/openapi.yaml` — OpenAPI 3.0.3
  - Documenta los 3 endpoints con ejemplos REQ-01, REQ-02 y REQ-03
  - Esquemas: `CotizacionRequest`, `CotizacionResponse`, `ReparacionResumen`, `CalzadoResponse`, `TipoReparacionResponse`, `ErrorResponse`

---

- [x] **Tarea 10**: Crear el `Dockerfile` y empaquetar el entregable en ejecutable `.jar`.
  - `Dockerfile` — multi-stage build: `eclipse-temurin:17-jdk-alpine` → `eclipse-temurin:17-jre-alpine`, usuario no-root
  - `.dockerignore` — excluye `target/`, `.git/`, `.kiro/`
  - `target/cotizador-1.0.0.jar` — **25.68 MB**, Spring Boot fat jar ✅

---

## Artefacto final

```
cotizador-backend/
├── Dockerfile
├── .dockerignore
├── README.md
├── pom.xml
├── src/
│   └── main/
│       ├── java/com/tallerdae/cotizador/   (27 clases Java)
│       └── resources/
│           ├── application.properties
│           └── openapi.yaml
└── target/
    └── cotizador-1.0.0.jar
```
