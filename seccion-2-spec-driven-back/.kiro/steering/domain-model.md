---
inclusion: always
---

# Modelo de Dominio: Cotizador de Reparación de Calzados

Este documento describe las entidades, objetos de valor, enumeraciones y sus relaciones en el núcleo del dominio. Toda implementación debe respetar estas definiciones sin introducir dependencias a Spring, JPA u otros frameworks.

---

## Entidades y objetos de valor

| Tipo | Nombre | Atributos principales |
|---|---|---|
| Entidad | `Calzado` | `id`, `nombre`, `factorComplejidad` |
| Entidad | `TipoReparacion` | `id`, `nombre`, `precioBase`, `tiempoEstimadoDias` |
| Agregado raíz | `Cotizacion` | `id`, `calzado`, `reparaciones`, `urgente`, `subtotal`, `total`, `tiempoEstimadoDias`, `fechaCreacion` |
| Value Object | `Dinero` | `monto`, `moneda` |
| Enum | `NivelUrgencia` | `NORMAL`, `URGENTE` |

---

## Descripción de cada elemento

### `Calzado`
Representa el artículo que ingresa al taller para reparación. `factorComplejidad` es un multiplicador numérico (mayor que cero) que pondera el precio base según el tipo de calzado.

### `TipoReparacion`
Catálogo de operaciones de reparación disponibles. `precioBase` es de tipo `Dinero`. `tiempoEstimadoDias` es un entero positivo que contribuye al plazo total de la cotización.

### `Cotizacion` (agregado raíz)
Entidad central del sistema. Agrupa un `Calzado` con una o más `TipoReparacion`, aplica el nivel de urgencia y calcula `subtotal` y `total` (ambos de tipo `Dinero`). `tiempoEstimadoDias` es la suma de los tiempos individuales de cada reparación, ajustada por urgencia si aplica.

- Se crea exclusivamente mediante un **Factory Method estático** (`Cotizacion.crear(...)`) que valida todas las invariantes antes de construir el objeto.
- El constructor debe ser privado.
- Cualquier violación de invariante lanza una excepción de dominio específica (paquete `domain.exception`), nunca retorna `null`.

### `Dinero` (Value Object)
Representa un valor monetario con su moneda. Es **inmutable**: todos sus campos son `final`. Expone operaciones funcionales — `sumar(Dinero otro)` y `aplicarPorcentaje(BigDecimal porcentaje)` — que devuelven una nueva instancia en lugar de mutar el estado.

- `monto` debe usar `BigDecimal` (no `double` ni `float`) para precisión decimal.
- `moneda` sigue el estándar ISO 4217 (e.g., `"USD"`, `"EUR"`).

### `NivelUrgencia`
Enum con dos valores: `NORMAL` y `URGENTE`. Controla qué implementación de `UrgencyPricingStrategy` se aplica al calcular el recargo. **No** se usa `if/else` ni `switch` sobre este enum para calcular precios; la selección de estrategia se delega al patrón Strategy (ver `design-patterns.md`).

---

## Relaciones e invariantes clave

- Una `Cotizacion` debe contener **al menos una** `TipoReparacion`; crear una cotización vacía es inválido.
- `Cotizacion.total` = `subtotal` multiplicado por el factor de urgencia definido en la estrategia activa.
- `Cotizacion.subtotal` = suma de (`TipoReparacion.precioBase` × `Calzado.factorComplejidad`) para cada reparación.
- `Cotizacion.tiempoEstimadoDias` = suma de los `tiempoEstimadoDias` de cada `TipoReparacion` incluida.
- `Dinero` no puede tener `monto` negativo; validar en el constructor.
- `factorComplejidad` y `precioBase` deben ser estrictamente mayores que cero.

---

## Reglas de implementación

1. **Sin frameworks en el dominio.** Ninguna clase de `domain.model` puede importar `org.springframework.*`, `javax.persistence.*` ni similares.
2. **Value Objects inmutables.** `Dinero` y cualquier futuro Value Object deben declarar todos sus campos como `final` y no exponer setters.
3. **Factory Methods obligatorios.** Las entidades (`Calzado`, `TipoReparacion`, `Cotizacion`) se instancian solo a través de métodos estáticos de fábrica que garantizan invariantes.
4. **Excepciones de dominio.** Ante datos inválidos, lanzar subclases de `RuntimeException` ubicadas en `domain.exception` (e.g., `CotizacionInvalidaException`).
5. **Colecciones nunca nulas.** Devolver listas vacías (`List.of()`) en lugar de `null` cuando corresponda.
