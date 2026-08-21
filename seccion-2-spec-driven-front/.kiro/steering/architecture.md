# Arquitectura Objetivo del Frontend

Separación en tres responsabilidades dentro de la carpeta `js/` (JavaScript nativo, sin framework ni bundler):

- **index.html + css/estilos.css**: Estructura y estilo visual. Expone elementos con ID estables para que `app.js` los enlace. No contiene lógica.
- **js/state.js**: Mantienen en memoria el estado de la aplicación (catálogo cargado, selección actual del usuario, última cotización recibida). No toca el DOM ni hace `fetch`.
- **js/api.js**: Único módulo que conoce las URLs del backend. Hace `fetch` y traduce las respuestas HTTP a objetos JavaScript simples. No conoce el DOM ni el estado.
- **js/app.js**: Escucha eventos del DOM, coordina `state.js` y `api.js`, y decide qué volver a pintar en pantalla.

## Regla de Dependencia Única
`state.js` y `api.js` no se conocen entre sí ni conocen el DOM. Toda la coordinación pasa exclusivamente a través de `app.js`.