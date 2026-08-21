# Guion de Pruebas Manuales End-to-End (Sección 4.6.1)

Pruebas integrales ejecutadas en el navegador sobre `http://localhost:8080` con las herramientas de desarrollador abiertas (pestaña **Network**) para confirmar que todas las peticiones se realizan hacia `/api/...` (a través de Nginx) y no directamente al puerto del backend.

---

## Matriz de Resultados

| # | Escenario (Anexo C / 3.3.4) | Datos de Entrada / Acción | Resultado Esperado | Resultado Real | Estado |
|:---:|:---|:---|:---|:---|:---:|
| **1** | **Cotización simple sin urgencia** | Calzado: *"Zapato formal"* (1.2)<br>Reparación: *"Cambio de tacón"* ($12, 2 días)<br>Urgente: No | Total: **14.40**<br>Tiempo: **2 días** | Total calculado en $14.40 y 2 días de entrega | **PASA** |
| **2** | **Cotización urgente con recargo** | Calzado: *"Bota de cuero"* (1.5)<br>Reparación: *"Cambio de suela"* ($20, 4 días)<br>Urgente: Sí | Subtotal: **30.00**<br>Total: **39.00** (+30%)<br>Tiempo: **2 días** (reducido a mitad) | Subtotal $30.00, Total $39.00 y 2 días de entrega | **PASA** |
| **3** | **Cotización con múltiples reparaciones** | Calzado: *"Zapatilla deportiva"* (1.0)<br>Reparaciones: *"Cosido de costura"* ($8, 1 día) + *"Limpieza y tinturado"* ($10, 3 días)<br>Urgente: No | Subtotal: **18.00**<br>Total: **18.00**<br>Tiempo: **3 días** (máximo entre reparaciones) | Total $18.00 y 3 días de entrega | **PASA** |
| **4** | **Botón deshabilitado sin selección completa** | Carga inicial de página sin marcar reparaciones | El botón "Cotizar" permanece deshabilitado hasta seleccionar calzado y al menos una reparación | Botón bloqueado mientras no exista selección completa (UI-01) | **PASA** |
| **5** | **Mostrar resultado tras cotizar exitosamente** | Seleccionar calzado + reparación y pulsar "Cotizar" | El panel de resultado aparece con subtotal, total y tiempo estimado devueltos por la API | Panel visible con datos calculados del backend | **PASA** |
| **6** | **Ocultar el resultado anterior al cambiar la selección** | Tras ver un resultado, modificar el calzado o reparación seleccionada | El panel de resultado previo debe ocultarse hasta presionar nuevamente "Cotizar" | Panel se oculta automáticamente al alterar selecciones (UI-04) | **PASA** |
| **7** | **Mostrar error cuando el servidor rechaza la solicitud** | Forzar envío sin reparaciones seleccionadas (vía DevTools / REST) | Se muestra el mensaje de error de la API sin perder la selección previa del usuario | Mensaje de validación 400 visible en línea sin modal (UI-03) | **PASA** |
