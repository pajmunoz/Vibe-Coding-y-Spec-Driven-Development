| Patrón | Dónde se aplica | Justificación |
| :--- | :--- | :--- |
| Strategy | Cálculo del recargo por urgencia | Permite agregar nuevos niveles de urgencia (abierto/cerrado) |
| Factory Method | Creación de `Cotizacion` vía método estático | Garantiza no crear cotizaciones en estado inválido (RN-04, RN-05) |
| Repository | `CotizacionRepositoryPort`, etc. | Desacopla el dominio de la persistencia |
| DTO + Mapper | `CotizacionRequest/Response` y `CotizacionMapper` | Evita acoplar el dominio al contrato HTTP |
| Inyección de Dependencias | Servicios de aplicación con sus puertos | Invierte el control entre capas |