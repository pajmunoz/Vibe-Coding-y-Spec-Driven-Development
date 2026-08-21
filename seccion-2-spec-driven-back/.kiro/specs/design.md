# Diseño Técnico - Cotizador de Reparación de Calzado

## Modelo de Dominio

| Clase | Tipo | Atributos |
|-------|------|-----------|
| `Calzado` | Entidad | `id`, `nombre`, `factorComplejidad` |
| `TipoReparacion` | Entidad | `id`, `nombre`, `precioBase`, `tiempoEstimadoDias` |
| `Cotizacion` | Agregado Raíz | `id`, `calzado`, `reparaciones`, `urgente`, `subtotal`, `recargo`, `total`, `tiempoEstimadoDias`, `fechaCreacion` |
| `Dinero` | Value Object | `monto`, `moneda` — operaciones: `sumar`, `aplicarPorcentaje`, `multiplicar` |
| `NivelUrgencia` | Enum | `NORMAL`, `URGENTE` |

## Arquitectura Hexagonal

```
[Infrastructure: CotizacionController]
         │
         ▼
[Application: GenerarCotizacionUseCase (Port In)]
         │
         ▼
[Application: GenerarCotizacionService] ──► [Domain: UrgencyPricingStrategy (Strategy)]
         │                              ──► [Domain: Cotizacion.crear(...) (Factory Method)]
         ▼
[Application: CotizacionRepositoryPort (Port Out)]
         │
         ▼
[Infrastructure: InMemoryCotizacionRepositoryAdapter]
```

### Dependencias permitidas

```
infrastructure.adapter.in.rest       ──► application.port.in  ──► domain
infrastructure.adapter.out.persistence ──► application.port.out ──► domain
application.service                  ──► domain
```

## Estructura de paquetes implementada

```
com.tallerdae.cotizador/
├── domain/
│   ├── model/       → Calzado, TipoReparacion, Cotizacion, Dinero, NivelUrgencia
│   ├── strategy/    → UrgencyPricingStrategy, NormalPricingStrategy, UrgentePricingStrategy
│   └── exception/   → CotizacionException
├── application/
│   ├── port/in/     → GenerarCotizacionUseCase, ConsultarCatalogoUseCase
│   ├── port/out/    → CotizacionRepositoryPort, CalzadoRepositoryPort, TipoReparacionRepositoryPort
│   └── service/     → GenerarCotizacionService
└── infrastructure/
    ├── adapter/in/rest/            → CotizacionController, GlobalExceptionHandler
    │   ├── dto/                    → CotizacionRequest, CotizacionResponse, CalzadoResponse, TipoReparacionResponse
    │   └── mapper/                 → CotizacionMapper
    ├── adapter/out/persistence/    → InMemoryCotizacionRepositoryAdapter,
    │                                 InMemoryCalzadoRepositoryAdapter,
    │                                 InMemoryTipoReparacionRepositoryAdapter
    └── config/                     → CotizadorConfig
```

## Patrones de diseño aplicados

| Patrón | Dónde se aplica | Justificación |
|--------|----------------|---------------|
| **Strategy** | `UrgencyPricingStrategy` | Permite agregar nuevos niveles de urgencia sin modificar código existente (OCP) |
| **Factory Method** | `Cotizacion.crear(...)` | Garantiza que el agregado nunca exista en estado inválido (RN-04, RN-05) |
| **Repository** | `*RepositoryPort` | Desacopla el dominio de la persistencia |
| **DTO + Mapper** | `CotizacionRequest/Response` + `CotizacionMapper` | Aísla el contrato HTTP del modelo de dominio |
| **Inyección de Dependencias** | `GenerarCotizacionService` | Invierte el control entre capas |

## Endpoints REST definidos

| Método | URL | Descripción | Código éxito |
|--------|-----|-------------|-------------|
| `POST` | `/api/cotizaciones` | Genera una cotización | 201 |
| `GET` | `/api/catalogo/calzados` | Lista tipos de calzado | 200 |
| `GET` | `/api/catalogo/reparaciones` | Lista tipos de reparación | 200 |

## Convenciones de nomenclatura

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Paquete raíz | minúsculas, invertido | `com.tallerdae.cotizador` |
| Entidad / Value Object | PascalCase, sustantivo | `Cotizacion`, `Calzado`, `Dinero` |
| Puerto entrada | PascalCase + UseCase | `GenerarCotizacionUseCase` |
| Puerto salida | PascalCase + RepositoryPort | `CotizacionRepositoryPort` |
| Servicio aplicación | PascalCase + Service | `GenerarCotizacionService` |
| Adaptador REST | PascalCase + Controller | `CotizacionController` |
| Adaptador persistencia | PascalCase + (InMemory\|Jpa)Adapter | `InMemoryCotizacionRepositoryAdapter` |
| DTO | PascalCase + Request / Response | `CotizacionRequest`, `CotizacionResponse` |
| Mapper | PascalCase + Mapper | `CotizacionMapper` |
| Método | camelCase, verbo explicativo | `calcularTotal()`, `generarCotizacion()` |
| Constante | MAYÚSCULAS_CON_UNDERSCORE | `RECARGO_URGENCIA_PORCENTAJE` |

## Estado

✅ Aprobado — diseño implementado completamente en `cotizador-backend/`.
