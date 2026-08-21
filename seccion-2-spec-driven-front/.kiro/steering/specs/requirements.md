# Requisitos Funcionales y de Interfaz - Frontend Cotizador

## Especificación de Pantalla Única (index.html)
- **Componentes**:
  - Selector de tipo de calzado (`<select>`) -> Datos desde `GET /api/tipos-calzado`.
  - Lista de reparaciones (`<input type="checkbox">`) -> Datos desde `GET /api/tipos-reparacion`.
  - Checkbox Servicio Urgente -> Estado local.
  - Botón "Cotizar" -> Dispara `POST /api/cotizaciones`.
  - Panel de Resultado -> Muestra subtotal, recargo, total y tiempo estimado devueltos por la API.
  - Mensaje de Error -> Alerta en línea sin modal para errores de validación o red.

## Criterios de Aceptación de Interfaz (Sintaxis EARS)

### Estados de Pantalla
- **REQ-UI-E1 (Cargando Catálogo)**: MIENSTRAS se resuelven las peticiones GET iniciales, EL SISTEMA DEBERÁ mostrar el selector y casillas deshabilitados con un indicador de carga.
- **REQ-UI-E2 (Lista para Cotizar)**: CUANDO el catálogo se cargue con éxito, EL SISTEMA DEBERÁ habilitar el formulario para permitir selecciones del usuario.
- **REQ-UI-E3 (Cotizando)**: MIENTRAS se procesa la petición `POST /api/cotizaciones`, EL SISTEMA DEBERÁ deshabilitar el botón "Cotizar" y mostrar un indicador de carga para evitar peticiones duplicadas.
- **REQ-UI-E4 (Resultado Mostrado)**: CUANDO la API retorne una respuesta exitosa (201), EL SISTEMA DEBERÁ desplegar en el panel de resultado el subtotal, recargo, total y tiempo estimado devueltos por la API.
- **REQ-UI-E5 (Error)**: SI la API responde con un error 400 o falla la red, EL SISTEMA DEBERÁ mostrar el mensaje de error correspondiente recibido de la API, manteniendo la selección actual del usuario intacta.

### Reglas de Interacción
- **REQ-UI-01**: SI el usuario no ha seleccionado un tipo de calzado O no ha marcado al menos una reparación, EL SISTEMA DEBERÁ mantener deshabilitado el botón "Cotizar".
- **REQ-UI-02**: MIENTRAS el estado sea UI-E3 (cotizando), EL SISTEMA DEBERÁ bloquear nuevos clics sobre el botón "Cotizar".
- **REQ-UI-03**: SI ocurre un error 400 de validación, EL SISTEMA DEBERÁ mostrar el mensaje exacto de la API y preservar los datos seleccionados en los controles.
- **REQ-UI-04**: SI el usuario modifica cualquier opción seleccionada después de haber obtenido un resultado (UI-E4), EL SISTEMA DEBERÁ ocultar el panel de resultado hasta que se presione "Cotizar" nuevamente.