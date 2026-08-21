# Cotizador de Reparación de Calzado

API REST para cotizar reparaciones de calzado, implementada con **arquitectura hexagonal** y **Spring Boot 3.3.2**.

---

## Tecnologías

| Tecnología | Versión |
|-----------|---------|
| Java | 17 |
| Spring Boot | 3.3.2 |
| Maven | 3.9.x |
| SpringDoc OpenAPI (Swagger) | 2.6.0 |
| Docker | 20.x+ |

---

## Arquitectura

El proyecto sigue el patrón de **arquitectura hexagonal** (Ports & Adapters), organizando el código en tres capas concéntricas donde las dependencias siempre apuntan hacia el dominio:

```
infrastructure  ──►  application  ──►  domain
```

### Estructura de paquetes

```
com.tallerdae.cotizador/
├── domain/
│   ├── model/          # Entidades y Value Objects (sin dependencias a frameworks)
│   │   ├── Calzado.java
│   │   ├── TipoReparacion.java
│   │   ├── Cotizacion.java        ← Agregado raíz (Factory Method)
│   │   ├── Dinero.java            ← Value Object inmutable
│   │   └── NivelUrgencia.java     ← Enum NORMAL / URGENTE
│   ├── strategy/       # Patrón Strategy para urgencia
│   │   ├── UrgencyPricingStrategy.java
│   │   ├── NormalPricingStrategy.java
│   │   └── UrgentePricingStrategy.java
│   └── exception/
│       └── CotizacionException.java
│
├── application/
│   ├── port/in/        # Puertos de entrada (casos de uso)
│   │   ├── GenerarCotizacionUseCase.java
│   │   └── ConsultarCatalogoUseCase.java
│   ├── port/out/       # Puertos de salida (repositorios)
│   │   ├── CotizacionRepositoryPort.java
│   │   ├── CalzadoRepositoryPort.java
│   │   └── TipoReparacionRepositoryPort.java
│   └── service/
│       └── GenerarCotizacionService.java
│
└── infrastructure/
    ├── adapter/in/rest/           # Adaptador de entrada HTTP
    │   ├── CotizacionController.java
    │   ├── GlobalExceptionHandler.java
    │   ├── dto/                   # DTOs de request/response
    │   └── mapper/                # CotizacionMapper
    ├── adapter/out/persistence/   # Adaptadores de salida en memoria
    │   ├── InMemoryCotizacionRepositoryAdapter.java
    │   ├── InMemoryCalzadoRepositoryAdapter.java
    │   └── InMemoryTipoReparacionRepositoryAdapter.java
    └── config/
        └── CotizadorConfig.java   # Registro de beans Spring
```

---

## Patrones de diseño aplicados

| Patrón | Dónde | Propósito |
|--------|-------|-----------|
| **Strategy** | `UrgencyPricingStrategy` | Permite agregar nuevos niveles de urgencia sin modificar código existente (OCP) |
| **Factory Method** | `Cotizacion.crear(...)` | Garantiza que el agregado nunca exista en estado inválido (RN-04, RN-05) |
| **Repository** | `*RepositoryPort` | Desacopla el dominio de la persistencia |
| **DTO + Mapper** | `CotizacionRequest/Response` + `CotizacionMapper` | Aísla el contrato HTTP del modelo de dominio |
| **Inyección de dependencias** | `GenerarCotizacionService` | Invierte el control entre capas |

---

## Reglas de negocio implementadas

| Regla | Descripción |
|-------|-------------|
| **RN-01** | Subtotal = Σ (precioBase × factorComplejidad del calzado) |
| **RN-02** | Si urgente: recargo = 30% del subtotal. Total = subtotal + recargo |
| **RN-03** | Tiempo = max(tiempos de reparaciones). Si urgente: `ceil(tiempo / 2)`, mínimo 1 día |
| **RN-04** | Debe contener al menos una reparación; si no, se rechaza con error 400 |
| **RN-05** | Cada cotización lleva un UUID único y fecha de creación |

---

## Endpoints REST

| Método | URL | Descripción | HTTP |
|--------|-----|-------------|------|
| `POST` | `/api/cotizaciones` | Genera una cotización | 201 / 400 |
| `GET` | `/api/catalogo/calzados` | Lista tipos de calzado disponibles | 200 |
| `GET` | `/api/catalogo/reparaciones` | Lista tipos de reparación disponibles | 200 |
| `GET` | `/swagger-ui.html` | Documentación interactiva Swagger UI | 200 |
| `GET` | `/api-docs` | Especificación OpenAPI JSON | 200 |

---

## Ejemplos de uso

### Cotización estándar (REQ-01)

```http
POST http://localhost:8080/api/cotizaciones
Content-Type: application/json

{
  "calzadoId": "CAL-002",
  "reparacionIds": ["REP-004"],
  "urgente": false
}
```

Respuesta esperada (HTTP 201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "calzadoId": "CAL-002",
  "calzadoNombre": "Zapato de vestir",
  "reparaciones": [
    { "id": "REP-004", "nombre": "Cambio de taco", "precioBase": 12.00 }
  ],
  "urgente": false,
  "subtotal": 14.40,
  "recargo": 0.00,
  "total": 14.40,
  "tiempoEstimadoDias": 2,
  "moneda": "PEN",
  "fechaCreacion": "2026-08-21T10:00:00"
}
```

### Cotización urgente (REQ-02)

```http
POST http://localhost:8080/api/cotizaciones
Content-Type: application/json

{
  "calzadoId": "CAL-003",
  "reparacionIds": ["REP-005"],
  "urgente": true
}
```

Respuesta esperada (HTTP 201):
```json
{
  "subtotal": 30.00,
  "recargo": 9.00,
  "total": 39.00,
  "tiempoEstimadoDias": 2
}
```

### Error — sin reparaciones (REQ-03)

```http
POST http://localhost:8080/api/cotizaciones
Content-Type: application/json

{
  "calzadoId": "CAL-001",
  "reparacionIds": [],
  "urgente": false
}
```

Respuesta (HTTP 400):
```json
{
  "status": 400,
  "mensaje": "Debe seleccionar al menos una reparación para generar la cotización.",
  "errores": null,
  "timestamp": "2026-08-21T10:00:00"
}
```

---

## Catálogo de datos precargados

### Calzados

| ID | Nombre | Factor de complejidad |
|----|--------|-----------------------|
| CAL-001 | Zapatilla deportiva | 1.0 |
| CAL-002 | Zapato de vestir | 1.2 |
| CAL-003 | Bota de trabajo | 1.5 |
| CAL-004 | Sandalia | 0.8 |
| CAL-005 | Bota de cuero | 1.8 |

### Reparaciones

| ID | Nombre | Precio base (PEN) | Tiempo (días) |
|----|--------|-------------------|---------------|
| REP-001 | Cambio de suela | 25.00 | 3 |
| REP-002 | Costura de capellada | 15.00 | 2 |
| REP-003 | Limpieza profunda | 10.00 | 1 |
| REP-004 | Cambio de taco | 12.00 | 2 |
| REP-005 | Pegado de puntera | 20.00 | 4 |
| REP-006 | Tinte y acabado | 18.00 | 3 |

---

## Compilar y empaquetar

Requiere Java 17 y Maven 3.9+ instalados.

```bash
mvn package -DskipTests
```

El artefacto se genera en:
```
target/cotizador-1.0.0.jar
```

---

## Despliegue con Docker

### 1. Construir la imagen

Desde la raíz del proyecto (donde está el `Dockerfile`):

```bash
docker build -t cotizador:1.0.0 .
```

El `Dockerfile` usa **multi-stage build**:
- **Stage 1 (builder):** descarga dependencias y compila con `eclipse-temurin:17-jdk-alpine`
- **Stage 2 (runtime):** copia solo el jar y lo ejecuta con `eclipse-temurin:17-jre-alpine` (imagen más ligera y segura, usuario no-root)

### 2. Iniciar el servicio

```bash
docker run -d \
  --name cotizador \
  -p 8080:8080 \
  cotizador:1.0.0
```

| Opción | Descripción |
|--------|-------------|
| `-d` | Ejecuta el contenedor en segundo plano |
| `--name cotizador` | Nombre del contenedor |
| `-p 8080:8080` | Mapea el puerto 8080 del host al contenedor |

### 3. Verificar que el servicio está corriendo

```bash
docker ps
```

```bash
docker logs -f cotizador
```

Busca en los logs:
```
Started CotizadorApplication in X.XXX seconds
```

### 4. Probar el servicio

```bash
curl http://localhost:8080/api/catalogo/calzados
```

### 5. Detener el servicio

```bash
docker stop cotizador
```

### 6. Eliminar el contenedor

```bash
docker rm cotizador
```

### 7. Eliminar la imagen

```bash
docker rmi cotizador:1.0.0
```

---

## Variables de entorno (opcionales)

Se pueden sobreescribir al iniciar el contenedor:

```bash
docker run -d \
  --name cotizador \
  -p 8080:8080 \
  -e SERVER_PORT=8080 \
  -e SPRING_APPLICATION_NAME=cotizador \
  cotizador:1.0.0
```

---

## Acceso a Swagger UI

Una vez el servicio esté corriendo:

```
http://localhost:8080/swagger-ui.html
```

Especificación OpenAPI en formato JSON:

```
http://localhost:8080/api-docs
```

El archivo `openapi.yaml` estático también está disponible en:

```
src/main/resources/openapi.yaml
```
