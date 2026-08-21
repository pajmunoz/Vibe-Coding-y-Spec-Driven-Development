---
inclusion: always
---

# Contrato de API: Cotizador de Reparación de Calzados

Este documento es la **fuente de verdad** para todos los endpoints REST del backend. Ningún endpoint debe implementarse, modificarse ni eliminarse sin reflejarse aquí primero.

---

## Reglas generales de la API

- **Prefijo base**: todos los endpoints comienzan con `/api`.
- **Formato**: JSON exclusivamente (`Content-Type: application/json`).
- **Idioma de campos**: español para nombres de negocio (`tipoCalzadoId`, `urgente`); inglés para términos técnicos consolidados (`id`, `timestamp`).
- **Colecciones vacías**: devolver `[]`, nunca `null`.
- **Errores**: responder siempre con un cuerpo JSON estructurado (ver sección "Formato de error").
- **Controladores**: los `Controller` reciben y devuelven DTOs (`*Request` / `*Response`). Nunca exponen objetos de dominio directamente (ver `conventions.md` y `design-patterns.md`).
- **Validación de entrada**: el `Controller` valida el formato/estructura del request (Bean Validation). Las invariantes de negocio se validan en el dominio, lanzando excepciones de `domain.exception` que el controlador traduce a `400 Bad Request`.

---

## Endpoints

### `GET /api/tipos-calzado`

Lista todos los tipos de calzado disponibles en el catálogo.

**Respuesta `200 OK`**

```json
[
  {
    "id": "string (UUID)",
    "nombre": "string",
    "factorComplejidad": "number (decimal > 0)"
  }
]
```

- Devuelve lista vacía `[]` si no hay registros; nunca `null`.
- `factorComplejidad` es un multiplicador decimal estrictamente mayor que cero (ver `domain-model.md`).

---

### `GET /api/tipos-reparacion`

Lista todos los tipos de reparación disponibles en el catálogo.

**Respuesta `200 OK`**

```json
[
  {
    "id": "string (UUID)",
    "nombre": "string",
    "precioBase": {
      "monto": "number (decimal ≥ 0, usa BigDecimal internamente)",
      "moneda": "string (ISO 4217, e.g. 'USD')"
    },
    "tiempoEstimadoDias": "integer > 0"
  }
]
```

- Devuelve lista vacía `[]` si no hay registros.
- `precioBase.monto` corresponde al Value Object `Dinero` del dominio; nunca usar `double`/`float` en la capa de persistencia o cálculo.

---

### `POST /api/cotizaciones`

Genera una cotización estimada para un calzado con uno o más tipos de reparación.

**Request body**

```json
{
  "tipoCalzadoId": "string (UUID, requerido)",
  "tipoReparacionIds": ["string (UUID)", "..."],
  "urgente": "boolean (opcional, default: false)"
}
```

Restricciones:
- `tipoCalzadoId`: requerido, no vacío.
- `tipoReparacionIds`: requerido, mínimo 1 elemento; lista vacía es inválida (invariante de dominio en `Cotizacion.crear(...)`).
- `urgente`: opcional; si se omite, se trata como `false` (`NivelUrgencia.NORMAL`).

**Respuesta `201 Created`**

```json
{
  "id": "string (UUID)",
  "calzado": {
    "id": "string",
    "nombre": "string"
  },
  "reparaciones": [
    {
      "id": "string",
      "nombre": "string",
      "precioBase": {
        "monto": "number",
        "moneda": "string"
      }
    }
  ],
  "urgente": "boolean",
  "subtotal": {
    "monto": "number",
    "moneda": "string"
  },
  "total": {
    "monto": "number",
    "moneda": "string"
  },
  "tiempoEstimadoDias": "integer",
  "fechaCreacion": "string (ISO 8601)"
}
```

Campos clave del response:
- `subtotal`: suma de (`precioBase` × `factorComplejidad`) por cada reparación.
- `total`: `subtotal` con el recargo de urgencia aplicado vía `UrgencyPricingStrategy` (patrón Strategy, ver `design-patterns.md`).
- `tiempoEstimadoDias`: suma de los tiempos de cada `TipoReparacion` incluida.

**Respuesta `400 Bad Request`**

```json
{
  "error": "string (código de error de dominio)",
  "mensaje": "string (descripción legible)"
}
```

Causas comunes:
- `tipoReparacionIds` vacío o ausente.
- `tipoCalzadoId` no encontrado en el catálogo.
- Cualquier invariante de dominio no cumplida (lanzada desde `domain.exception`).

---

## Formato de error estándar

Todos los errores deben responder con el siguiente cuerpo JSON:

```json
{
  "error": "string (código identificador del error)",
  "mensaje": "string (descripción del problema en español)"
}
```

| Código HTTP | Cuándo usarlo |
|---|---|
| `400` | Validación fallida, invariante de dominio violada, datos de entrada inválidos |
| `404` | Recurso no encontrado (e.g., `tipoCalzadoId` inexistente) |
| `500` | Error interno inesperado |

---

## Relación con la arquitectura hexagonal

- Los `Controller` (en `infrastructure.adapter.in.rest`) implementan este contrato. Reciben `*Request`, invocan el caso de uso (`*UseCase` en `application.port.in`) y devuelven `*Response`.
- Los `Mapper` (en `infrastructure.adapter.in.rest`) traducen `Request → dominio` y `dominio → Response`. Nunca exponer objetos de dominio en el response HTTP.
- Las excepciones de `domain.exception` se capturan en el `Controller` (o en un `@ControllerAdvice`) y se traducen al formato de error estándar con el código HTTP apropiado.
- Ver `architecture.md` para la estructura de paquetes y reglas de dependencia.
