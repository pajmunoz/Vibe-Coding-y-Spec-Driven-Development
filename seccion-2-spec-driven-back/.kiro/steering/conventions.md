| Elemento | Convención | Ejemplo |
| :--- | :--- | :--- |
| Paquete raíz | minúsculas, invertido | `com.tallerdae.cotizador` |
| Entidad / Value Object | PascalCase, sustantivo | `Cotizacion`, `Calzado`, `Dinero` |
| Puerto entrada | PascalCase + UseCase | `GenerarCotizacionUseCase` |
| Puerto salida | PascalCase + RepositoryPort | `CotizacionRepositoryPort` |
| Servicio aplicación | PascalCase + Service | `GenerarCotizacionService` |
| Adaptador REST | PascalCase + Controller | `CotizacionController` |
| Adaptador persistencia| PascalCase + (InMemory\|Jpa)Adapter | `InMemoryCotizacionRepositoryAdapter` |
| DTO | PascalCase + Request / Response | `CotizacionRequest`, `CotizacionResponse` |
| Mapper | PascalCase + Mapper | `CotizacionMapper` |
| Método | camelCase, verbo explicativo | `calcularTotal()`, `generarCotizacion()` |
| Constante | MAYÚSCULAS_CON_UNDERSCORE | `RECARGO_URGENCIA_PORCENTAJE` |