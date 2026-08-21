# Diseño Técnico del Frontend

## Estructura de Archivos y Módulos

index.html ◄─── estilos.css
│
▼
js/app.js (Coordinador DOM + Eventos)
├──► js/state.js (Módulo Estado)
└──► js/api.js (Módulo Cliente HTTP)

## Definición de Componentes JS

1. **`js/state.js`**:
   - Variables internas: `tiposCalzado`, `tiposReparacion`, `calzadoSeleccionado`, `reparacionesSeleccionadas`, `urgente`, `cotizacionResultado`.
   - Métodos expuestos: `setCatalogo()`, `seleccionarCalzado()`, `toggleReparacion()`, `setUrgente()`, `setResultado()`, `onCambio(listener)`.

2. **`js/api.js`**:
   - Constante: `API_BASE_URL = 'http://localhost:8080/api'`.
   - Métodos expuestos:
     - `obtenerTiposCalzado()` -> `GET /api/tipos-calzado`
     - `obtenerTiposReparacion()` -> `GET /api/tipos-reparacion`
     - `generarCotizacion(payload)` -> `POST /api/cotizaciones`

3. **`js/app.js`**:
   - Event Listeners sobre elementos con ID `kebab-case`.
   - Función `construirRequestCotizacion(estado)` (Factory Simple).
   - Manipulación limpia del DOM basada en el estado actual (ocultar panel si cambia selección, alternar clases de carga).