# Diseño Técnico - Cotizador de Reparación

## Modelo de Dominio
- **Calzado** (Entidad): `id`, `nombre`, `factorComplejidad`
- **TipoReparacion** (Entidad): `id`, `nombre`, `precioBase`, `tiempoEstimadoDias`
- **Cotizacion** (Agregado Raíz): `id`, `calzado`, `reparaciones`, `urgente`, `subtotal`, `total`, `tiempoEstimadoDias`, `fechaCreacion`
- **Dinero** (Value Object): `monto`, `moneda` (operaciones: `sumar`, `aplicarPorcentaje`)
- **NivelUrgencia** (Enum): `NORMAL`, `URGENTE`

## Arquitectura y Componentes
[Infrastructure: CotizacionController]
│
▼
[Application: GenerarCotizacionUseCase (Port)]
│
▼
[Application: GenerarCotizacionService] ────► [Domain: UrgencyPricingStrategy (Strategy Pattern)]
│                                 ────► [Domain: Cotizacion.crear(...) (Factory Method)]
▼
[Application: CotizacionRepositoryPort (Out Port)]
│
▼
[Infrastructure: InMemoryCotizacionRepositoryAdapter]

## Estrategias y Patrones
1. **Strategy (`UrgencyPricingStrategy`)**: Interfaz para calcular el recargo de urgencia (implementaciones: `NormalPricingStrategy` y `UrgentePricingStrategy`).
2. **Factory Method (`Cotizacion.crear(...)`)**: Método de fábrica para validar invariants (`RN-04`) y asignar `ID` UUID junto a `fechaCreacion` (`RN-05`).
3. **Repository (`CotizacionRepositoryPort`)**: Adaptador en memoria sin persistencia real.
4. **DTO + Mapper (`CotizacionRequest`, `CotizacionResponse`, `CotizacionMapper`)**: Aislamiento del contrato REST.