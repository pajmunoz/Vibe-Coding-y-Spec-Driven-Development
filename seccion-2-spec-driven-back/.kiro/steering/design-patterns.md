---
inclusion: always
---

# Patrones de Diseño: Cotizador de Reparación de Calzados

Este proyecto aplica los siguientes patrones de diseño de forma explícita. Al generar o modificar código, respetar el patrón asignado a cada responsabilidad.

---

## Patrones aplicados

### Strategy — Cálculo de recargo por urgencia

- **Dónde**: capa `domain`, interfaz `UrgencyPricingStrategy` con implementaciones por nivel (e.g., `NormalPricingStrategy`, `ExpressPricingStrategy`).
- **Regla**: para agregar un nuevo nivel de urgencia, crear una nueva implementación de `UrgencyPricingStrategy`. **No** modificar la lógica existente (principio abierto/cerrado).
- **Nunca** codificar el recargo con `if/else` o `switch` sobre el nivel de urgencia; delegar siempre a la estrategia correspondiente.

### Factory Method — Creación de entidades con invariantes válidas

- **Dónde**: clases de entidad en `domain.model` (e.g., `Cotizacion`).
- **Regla**: las entidades **solo** se instancian mediante métodos estáticos de fábrica (`crear(...)`, `of(...)`). El constructor privado impide la creación directa.
- **Responsabilidad del factory**: validar todas las invariantes de negocio (RN-04, RN-05) antes de construir el objeto. Un objeto que salga del factory siempre es válido.
- Lanzar excepciones de dominio específicas (`domain.exception`) cuando las invariantes no se cumplan; nunca retornar `null`.

### Repository (Port/Adapter) — Acceso a persistencia

- **Puertos de salida** (interfaces) en `application.port.out`: `CotizacionRepositoryPort`, `CalzadoRepositoryPort`, `ReparacionRepositoryPort`.
- **Adaptadores** (implementaciones) en `infrastructure.adapter.out.persistence`: `InMemory*Adapter` o `Jpa*Adapter`.
- **Regla**: los servicios de `application` solo dependen de la interfaz `RepositoryPort`; **nunca** de una implementación concreta de `infrastructure`.
- Métodos de repositorio devuelven `Optional<T>` para resultados únicos y `List<T>` vacío (nunca `null`) para colecciones.

### DTO + Mapper — Contrato HTTP desacoplado del dominio

- **DTOs** (`*Request` / `*Response`) viven en `infrastructure.adapter.in.rest`.
- **Mappers** (`*Mapper`) viven junto al controlador en `infrastructure.adapter.in.rest` y realizan la conversión `Request → dominio` y `dominio → Response`.
- **Regla**: los objetos de dominio **nunca** atraviesan la frontera HTTP directamente. El mapper es el único punto de conversión.
- Los servicios de `application` reciben y devuelven objetos de dominio, no DTOs.

### Inyección de dependencias por constructor — Inversión de control

- **Dónde**: todos los servicios de `application.service` y adaptadores de `infrastructure`.
- **Regla**: declarar dependencias como `private final` e inyectarlas por constructor (no por campo ni setter).
- Esto garantiza la regla de dependencia hexagonal: `application` depende de interfaces (`port.out`), no de clases concretas de `infrastructure`.
- En Spring Boot, usar `@RequiredArgsConstructor` (Lombok) o constructor explícito; **nunca** `@Autowired` en campo.

---

## Resumen rápido de responsabilidades

| Patrón | Clase / Interfaz clave | Capa |
|---|---|---|
| Strategy | `UrgencyPricingStrategy` + implementaciones | `domain` |
| Factory Method | Método estático en `Cotizacion` (y otras entidades) | `domain.model` |
| Repository | `*RepositoryPort` (interfaz) / `InMemory*Adapter` (impl) | `application.port.out` / `infrastructure` |
| DTO + Mapper | `*Request`, `*Response`, `*Mapper` | `infrastructure.adapter.in.rest` |
| Inyección por constructor | `*Service`, `*Adapter`, `*Controller` | `application`, `infrastructure` |
