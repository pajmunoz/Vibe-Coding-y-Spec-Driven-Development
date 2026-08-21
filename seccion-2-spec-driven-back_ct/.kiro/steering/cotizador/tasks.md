# Lista de Tareas de Implementación

- [ ] **Tarea 1**: Crear las entidades de dominio `Calzado`, `TipoReparacion` y el Value Object `Dinero`.
- [ ] **Tarea 2**: Implementar la interfaz `UrgencyPricingStrategy` con sus variantes `NormalPricingStrategy` y `UrgentePricingStrategy`.
- [ ] **Tarea 3**: Implementar la entidad agregada `Cotizacion` con el Factory Method para validar invariants (RN-04, RN-05) y realizar los cálculos (RN-01 a RN-03).
- [ ] **Tarea 4**: Definir los puertos de entrada (`GenerarCotizacionUseCase`, `ConsultarCatalogoUseCase`) y puertos de salida (`CotizacionRepositoryPort`, `CalzadoRepositoryPort`, `TipoReparacionRepositoryPort`).
- [ ] **Tarea 5**: Implementar el servicio de aplicación `GenerarCotizacionService` inyectando las estrategias y repositorios.
- [ ] **Tarea 6**: Implementar los adaptadores de persistencia en memoria (`InMemoryCotizacionRepositoryAdapter`, etc.).
- [ ] **Tarea 7**: Crear DTOs (`CotizacionRequest`, `CotizacionResponse`) y mappers de dominio a DTO (`CotizacionMapper`).
- [ ] **Tarea 8**: Implementar el controlador REST `CotizacionController` exponiendo los endpoints definidos.
- [ ] **Tarea 9**: Generar el contrato `openapi.yaml` basado en los endpoints implementados.
- [ ] **Tarea 10**: Crear el `Dockerfile` y empaquetar el entregable en ejecutable `.jar`.