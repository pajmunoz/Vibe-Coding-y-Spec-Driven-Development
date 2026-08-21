---
inclusion: always
---

# Arquitectura del Proyecto: Cotizador de Reparación de Calzados

## Estilo arquitectónico: Hexagonal (Ports & Adapters)

El backend sigue la arquitectura hexagonal. **Las dependencias siempre apuntan hacia el dominio; nunca al revés.** Ninguna clase de `domain` puede importar clases de `application` o `infrastructure`.

## Capas y responsabilidades

### `domain`
- Contiene entidades, objetos de valor (Value Objects) y excepciones de negocio.
- **Sin dependencias** a frameworks, Spring, JPA ni infraestructura.
- Toda la lógica de negocio y las invariantes viven aquí.

### `application`
- **Puertos de entrada** (`port.in`): interfaces que declaran los casos de uso (sufijo `UseCase`).
- **Puertos de salida** (`port.out`): contratos de repositorio que el dominio necesita (sufijo `RepositoryPort`).
- **Servicios** (`service`): implementan los puertos de entrada, orquestan el dominio y dependen únicamente de los puertos de salida (nunca de adaptadores concretos).

### `infrastructure`
- **Adaptadores de entrada** (`adapter.in.rest`): controladores REST, DTOs y mappers. Traducen HTTP → casos de uso.
- **Adaptadores de salida** (`adapter.out.persistence`): implementaciones concretas de los `RepositoryPort` (en memoria o JPA).
- **Configuración** del framework (Spring beans, datasource, etc.).

## Regla de dependencia (resumen)

```
infrastructure.adapter.in.rest
    ──→ application.port.in
        ──→ domain

infrastructure.adapter.out.persistence
    ──→ application.port.out
        ──→ domain

application.service
    (implementa port.in, usa port.out)
    ──→ domain
```

## Estructura de paquetes esperada

```
com.tallerdae.cotizador
├── domain
│   ├── model          # Entidades y Value Objects (Cotizacion, Calzado, Dinero…)
│   └── exception      # Excepciones de negocio
├── application
│   ├── port
│   │   ├── in         # Interfaces UseCase
│   │   └── out        # Interfaces RepositoryPort
│   └── service        # Implementaciones de UseCase
└── infrastructure
    ├── adapter
    │   ├── in
    │   │   └── rest   # Controllers, DTOs (Request/Response), Mappers
    │   └── out
    │       └── persistence  # Adaptadores InMemory / JPA
    └── config         # Configuración de Spring
```

## Reglas a seguir siempre

1. **No cruzar capas hacia afuera.** Un servicio de `application` nunca instancia ni importa una clase de `infrastructure`.
2. **Los DTOs no entran al dominio.** Los `Mapper` en `adapter.in.rest` convierten `Request → dominio` y `dominio → Response` antes de llegar al servicio.
3. **El dominio no conoce Spring.** No usar `@Component`, `@Service`, `@Repository` ni ninguna anotación de framework en clases de `domain`.
4. **Los puertos de salida son interfaces.** La implementación concreta (InMemory, JPA) vive en `infrastructure`; la interfaz vive en `application.port.out`.
5. **Las invariantes se validan en el dominio.** Usar Factory Methods estáticos en las entidades para garantizar objetos siempre válidos (ver `design-patterns.md`).
