# Requisitos Funcionales - Cotizador de Reparación de Calzado

## Historias de Usuario
- **HU-01**: Como cliente, quiero seleccionar un tipo de calzado y una o más reparaciones para obtener una cotización estimada del costo total.
- **HU-02**: Como cliente, quiero marcar el servicio como urgente para conocer el recargo aplicable y el nuevo tiempo estimado de entrega.
- **HU-03**: Como cliente, quiero consultar los tipos de calzado y reparaciones disponibles antes de generar la cotización.

## Reglas de Negocio
- **RN-01**: Subtotal = Σ (precio base de reparación × factor de complejidad del calzado).
- **RN-02**: Si es urgente, recargo del 30% sobre el subtotal. Total = subtotal + recargo.
- **RN-03**: Tiempo estimado = Máximo entre los tiempos de las reparaciones. Si es urgente: `ceil(tiempo / 2)`, mínimo 1 día.
- **RN-04**: Debe contener al menos una reparación seleccionada; caso contrario se rechaza.
- **RN-05**: Debe incluir identificador único y fecha de creación.

## Criterios de Aceptación (Sintaxis EARS)

### Requerimientos del Backend
- **REQ-01**: CUANDO el cliente solicite una cotización estándar DADO un calzado de factor 1.2 y una reparación de precio 12.00 (2 días), EL SISTEMA DEBERÁ generar un total de 14.40 y tiempo de 2 días.
- **REQ-02**: CUANDO el cliente solicite una cotización urgente DADO un calzado de factor 1.5 y una reparación de precio 20.00 (4 días), EL SISTEMA DEBERÁ calcular un subtotal de 30.00, un recargo de 9.00 (Total 39.00) y un tiempo de 2 días.
- **REQ-03**: SI el cliente envía una solicitud sin reparaciones, EL SISTEMA DEBERÁ rechazar la solicitud retornando un error de validación.

### Requerimientos de Interfaz (Frontend)
- **REQ-UI-01**: SI la lista de reparaciones seleccionadas está vacía, EL SISTEMA DEBERÁ mantener el botón "Cotizar" deshabilitado.
- **REQ-UI-02**: MIENTRAS la respuesta de la cotización se encuentre en proceso (estado UI-E3), EL SISTEMA DEBERÁ deshabilitar el botón para evitar clics duplicados.
- **REQ-UI-03**: SI la API responde con error 400, EL SISTEMA DEBERÁ desplegar el mensaje devuelto por la API manteniendo las selecciones del usuario.
- **REQ-UI-04**: SI el usuario modifica el tipo de calzado o las reparaciones tras visualizar un resultado, EL SISTEMA DEBERÁ ocultar el panel de resultado.