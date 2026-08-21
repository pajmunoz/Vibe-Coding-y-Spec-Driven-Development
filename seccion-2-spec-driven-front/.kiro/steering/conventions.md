# Convenciones de Nomenclatura del Frontend

| Elemento | Convención | Ejemplo |
| :--- | :--- | :--- |
| Archivos JavaScript | camelCase, sustantivo descriptivo | `api.js`, `app.js`, `state.js` |
| IDs de elementos HTML | kebab-case, descriptivo del control | `tipo-calzado-select`, `boton-cotizar`, `resultado-cotizacion` |
| Clases CSS | kebab-case, BEM ligero | `cotizador__resultado`, `cotizador__resultado--urgente` |
| Funciones | camelCase, verbo que expresa intención | `obtenerTiposCalzado()`, `renderizarResultado()`, `construirRequestCotizacion()` |
| Variables de estado | camelCase, sustantivo | `cotizacionActual`, `tiposCalzadoDisponibles`, `servicioEsUrgente` |
| Constantes de configuración | MAYÚSCULAS_CON_UNDERSCORE | `API_BASE_URL` |
| Eventos personalizados | kebab-case con prefijo del módulo | `cotizador:resultado-listo` |