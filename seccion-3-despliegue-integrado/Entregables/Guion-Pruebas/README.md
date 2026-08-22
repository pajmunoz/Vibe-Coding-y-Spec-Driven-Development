# Guion de Pruebas Manuales End-to-End (Sección 4.6.1)

Los siete escenarios del Anexo C y de la sección 3.3.4 ejecutados en el navegador sobre `http://localhost:8080`, con la pestaña **Network** abierta para confirmar que cada petición sale hacia `/api/...` a través de Nginx y no hacia un puerto del backend.

Los valores de la columna **Resultado real** son los que quedaron escritos en pantalla.

---

## Matriz de Resultados

| # | Escenario (Anexo C / 3.3.4) | Datos de entrada / acción | Resultado esperado | Resultado real | Estado |
|:---:|:---|:---|:---|:---|:---:|
| **1** | **Cotización simple sin urgencia** | Calzado: *Zapato de vestir* (factor 1.2)<br>Reparación: *Cambio de taco* (12.00, 2 días)<br>Urgente: No | Total 14.40 · 2 días | Subtotal $14.40 · Recargo $0.00 · **Total $14.40** · **2 día(s)** | **Pasa** |
| **2** | **Cotización urgente con recargo** | Calzado: *Bota de trabajo* (factor 1.5)<br>Reparación: *Pegado de puntera* (20.00, 4 días)<br>Urgente: Sí | Subtotal 30.00 · Total 39.00 (+30%) · 2 días (tiempo a la mitad) | **Subtotal $30.00** · Recargo $9.00 · **Total $39.00** · **2 día(s)** | **Pasa** |
| **3** | **Cotización con múltiples reparaciones** | Calzado: *Zapatilla deportiva* (factor 1.0)<br>Reparaciones: *Limpieza profunda* (10.00, 1 día) + *Tinte y acabado* (18.00, 3 días)<br>Urgente: No | Suma de precios por el factor · tiempo igual al máximo entre reparaciones | Subtotal $28.00 · **Total $28.00** · **3 día(s)** (máximo entre 1 y 3) | **Pasa** |
| **4** | **Botón deshabilitado sin selección completa** | Carga inicial de la página sin marcar reparaciones | El botón "Cotizar" permanece deshabilitado | El botón queda **inhabilitado** y no responde al clic mientras no haya reparaciones marcadas | **Pasa** |
| **5** | **Mostrar resultado tras cotizar exitosamente** | Seleccionar calzado y al menos una reparación, pulsar "Cotizar" | Aparece el panel con subtotal, total y tiempo estimado devueltos por la API | El panel *Resultado de la Cotización* **aparece** con subtotal, recargo, total y tiempo estimado | **Pasa** |
| **6** | **Ocultar el resultado anterior al cambiar la selección** | Con un resultado visible, cambiar el tipo de calzado | El panel del resultado previo se oculta hasta la siguiente cotización | Al cambiar el calzado el panel **desaparece** hasta pulsar "Cotizar" otra vez | **Pasa** |
| **7** | **Mostrar error cuando el servidor rechaza la solicitud** | Forzar el envío sin reparaciones quitando desde DevTools el atributo que inhabilita el botón | Se muestra el mensaje de error real de la API (400) sin perder las selecciones previas | Se muestra **"La solicitud contiene datos inválidos"**, el mensaje literal de la API, y el calzado seleccionado **se mantiene** | **Pasa** |

---

## Tráfico observado durante las pruebas

Peticiones registradas mientras se ejecutaban los siete escenarios. Todas salieron hacia `localhost:8080`, es decir hacia Nginx; ninguna apuntó a un puerto del backend.

```
[GET]  http://localhost:8080/api/catalogo/calzados      => 200
[GET]  http://localhost:8080/api/catalogo/reparaciones  => 200
[POST] http://localhost:8080/api/cotizaciones           => 201   (escenario 1)
[POST] http://localhost:8080/api/cotizaciones           => 201   (escenario 2)
[POST] http://localhost:8080/api/cotizaciones           => 201   (escenario 3)
[POST] http://localhost:8080/api/cotizaciones           => 400   (escenario 7)
```

---

## Notas sobre los datos de prueba

**Sobre el escenario 3.** El catálogo del backend no contiene una reparación de 8.00 con 1 día, así que el total de 18.00 que enuncia el Anexo C no es reproducible con los datos reales del sistema. Se validó la misma regla de negocio (suma de precios por el factor de complejidad, y tiempo de entrega igual al máximo entre las reparaciones) con la combinación disponible más cercana. Ajustar el catálogo para forzar el número del anexo habría significado modificar código de la Sección 2, que es justamente lo que el límite del ejercicio prohíbe.

**Sobre la moneda.** La interfaz formatea los montos con el símbolo `$`, mientras que la API devuelve el campo `moneda` con el valor `PEN`.

---

## Evidencias

| Escenario | Captura |
|:---|:---|
| 1 y 5 | [03_escenario1_cotizacion_simple.png](../Capturas/03_escenario1_cotizacion_simple.png) |
| 2 | [04_escenario2_urgente_recargo.png](../Capturas/04_escenario2_urgente_recargo.png) |
| 3 | [05_escenario3_multiples_reparaciones.png](../Capturas/05_escenario3_multiples_reparaciones.png) |
| 4 | [06_escenario4_boton_deshabilitado.png](../Capturas/06_escenario4_boton_deshabilitado.png) |
| 6 | [07_escenario6_resultado_oculto.png](../Capturas/07_escenario6_resultado_oculto.png) |
| 7 | [08_escenario7_error_400.png](../Capturas/08_escenario7_error_400.png) |
