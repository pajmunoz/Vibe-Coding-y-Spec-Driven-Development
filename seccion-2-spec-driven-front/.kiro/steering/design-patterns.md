# Patrones de Diseño del Frontend

| Patrón | Dónde se aplica | Justificación |
| :--- | :--- | :--- |
| **Module Pattern (ES Modules)** | `api.js` y `state.js` exportan únicamente funciones públicas con `export`. | Oculta detalles internos sin necesidad de clases ni frameworks. |
| **Adapter** | `api.js` traduce el contrato OpenAPI a funciones JS simples (`obtenerTiposCalzado()`, `generarCotizacion()`). | Si el contrato HTTP cambia, solo se ajusta este archivo sin afectar la UI. |
| **Factory Simple** | Función `construirRequestCotizacion(estado)` que arma el body del POST `/api/cotizaciones`. | Evita construir ese objeto en múltiples lugares del código. |
| **Observer Ligero** | `state.js` expone `onCambio(callback)` para notificar a `app.js`. | Evita acordarse de llamar a `render()` manualmente tras cada cambio de estado. |