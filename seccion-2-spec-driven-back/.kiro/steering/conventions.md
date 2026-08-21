---
inclusion: always
---

# Convenciones del Proyecto: Cotizador de Reparación de Calzados

Este proyecto es un backend Java/Spring Boot que sigue la arquitectura hexagonal. Las convenciones aquí definidas aplican a **todas** las capas: `domain`, `application`, e `infrastructure`.

---

## Nomenclatura de clases e interfaces

| Elemento | Convención | Ejemplo |
|---|---|---|
| Paquete raíz | minúsculas, dominio invertido | `com.tallerdae.cotizador` |
| Entidad / Value Object de dominio | PascalCase, sustantivo, sin sufijo técnico | `Cotizacion`, `Calzado`, `Dinero` |
| Puerto de entrada (caso de uso) | PascalCase + sufijo `UseCase` | `GenerarCotizacionUseCase` |
| Puerto de salida (repositorio) | PascalCase + sufijo `RepositoryPort` | `CotizacionRepositoryPort` |
| Implementación de caso de uso | PascalCase + sufijo `Service` | `GenerarCotizacionService` |
| Adaptador REST de entrada | PascalCase + sufijo `Controller` | `CotizacionController` |
| Adaptador de persistencia en memoria | PascalCase + prefijo `InMemory` + sufijo `Adapter` | `InMemoryCotizacionRepositoryAdapter` |
| Adaptador de persistencia JPA | PascalCase + prefijo `Jpa` + sufijo `Adapter` | `JpaCotizacionRepositoryAdapter` |
| DTO de request | PascalCase + sufijo `Request` | `CotizacionRequest` |
| DTO de response | PascalCase + sufijo `Response` | `CotizacionResponse` |
| Mapper dominio ⇄ DTO | PascalCase + sufijo `Mapper` | `CotizacionMapper` |
| Estrategia (patrón Strategy) | PascalCase + sufijo `Strategy` | `UrgencyPricingStrategy` |
| Excepción de negocio | PascalCase + sufijo `Exception` | `CotizacionNotFoundException` |

---

## Nomenclatura de métodos, campos y constantes

- **Métodos**: camelCase, verbo que expresa intención clara — `calcularTotal()`, `generarCotizacion()`, `findById()`.
- **Campos de instancia**: camelCase, sustantivo — `precioBase`, `nivelUrgencia`.
- **Constantes**: `MAYÚSCULAS_CON_GUION_BAJO` — `RECARGO_URGENCIA_PORCENTAJE`.
- **Variables locales y parámetros**: camelCase, nombres descriptivos; evitar abreviaturas opacas (`ctiz` → `cotizacion`).

---

## Convenciones por capa

### `domain` (modelo y excepciones)
- Las clases **no** llevan anotaciones de Spring (`@Component`, `@Service`, `@Repository`).
- Los Value Objects deben ser inmutables; usar `final` en campos.
- Las entidades se crean exclusivamente mediante **Factory Methods estáticos** que validan invariantes antes de construir el objeto.
- Las excepciones de negocio extienden `RuntimeException` y viven en `domain.exception`.

### `application` (puertos y servicios)
- Los puertos de entrada (`port.in`) son **interfaces** que declaran un método por caso de uso.
- Los puertos de salida (`port.out`) son **interfaces**; nunca importan clases de `infrastructure`.
- Los servicios (`service`) implementan los puertos de entrada e inyectan los puertos de salida por constructor (no por campo).
- Los servicios **no** referencian DTOs; trabajan exclusivamente con objetos de dominio.

### `infrastructure` (adaptadores y configuración)
- Los `Controller` reciben y devuelven DTOs (`Request` / `Response`), nunca objetos de dominio directamente.
- Los `Mapper` convierten `Request → dominio` y `dominio → Response`; viven junto al controlador en `adapter.in.rest`.
- Los adaptadores de persistencia implementan la interfaz `RepositoryPort` definida en `application.port.out`.
- La configuración de Spring (beans, datasource, etc.) vive exclusivamente en `infrastructure.config`.

---

## Estilo de código general

- **Idioma**: nombres de clases, métodos y variables en **español** salvo términos técnicos consolidados en inglés (`mapper`, `repository`, `request`, `response`, `service`).
- **Inmutabilidad**: preferir `final` en variables locales y campos cuando el valor no cambia.
- **Colecciones vacías**: devolver colecciones vacías en lugar de `null`.
- **Excepciones**: lanzar excepciones de dominio específicas en lugar de excepciones genéricas (`IllegalArgumentException`, `RuntimeException` desnudas).
- **Inyección por constructor**: obligatoria en servicios y adaptadores; no usar inyección por campo (`@Autowired` en campo).
- **Visibilidad mínima**: usar el modificador de acceso más restrictivo posible (`private` > `package-private` > `protected` > `public`).

---

## Reglas de dependencia (resumen rápido)

- `domain` ← no depende de ninguna otra capa.
- `application` ← solo depende de `domain`.
- `infrastructure` ← depende de `application` y `domain`, nunca al revés.
- Un `Service` **nunca** instancia ni importa una clase concreta de `infrastructure`.
