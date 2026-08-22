# Taller DAE — Vibe Coding y Spec-Driven Development

> **Desarrollo de Aplicaciones Empresariales · Taller 2**  
> Universidad Politécnica Salesiana

Sistema de cotización de reparación de calzado desarrollado en tres fases progresivas: ambiente de infraestructura local, implementación con metodología Spec-Driven Development y despliegue integrado con Docker Compose.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Arquitectura del sistema](#arquitectura-del-sistema)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Sección 1 — Vibe Coding: Ambiente local](#sección-1--vibe-coding-ambiente-local)
- [Sección 2 — Spec-Driven: Backend](#sección-2--spec-driven-backend)
- [Sección 2 — Spec-Driven: Frontend](#sección-2--spec-driven-frontend)
- [Sección 3 — Despliegue integrado](#sección-3--despliegue-integrado)
- [Referencia de endpoints](#referencia-de-endpoints)
- [Stack tecnológico](#stack-tecnológico)
- [Entregables](#entregables)

---

## Descripción general

El proyecto implementa un **cotizador de reparación de calzado** que permite seleccionar un tipo de calzado, una o varias reparaciones y opcionalmente marcar el servicio como urgente, obteniendo subtotal, recargo y tiempo estimado de entrega.

El desarrollo se organizó en tres secciones que reflejan el ciclo completo de construcción de software empresarial:

| Sección | Metodología | Entregable principal |
|---------|-------------|----------------------|
| 1 | Vibe Coding | Ambiente Docker con MySQL 8 + Nginx |
| 2A | Spec-Driven | API REST con arquitectura hexagonal (Spring Boot) |
| 2B | Spec-Driven | Interfaz web estática (HTML/CSS/JS vanilla) |
| 3 | Vibe Coding | Despliegue integrado de los tres servicios |

---

## Arquitectura del sistema

```
                    Navegador  http://localhost:8080
                                      │
                                      ▼
                       ┌─────────────────────────────┐
                       │    tallerdae-web  (Nginx)   │  :8080 (público)
                       └──────────────┬──────────────┘
                                      │
              ┌───────────────────────┴────────────────────────┐
              │  /  → archivos estáticos                       │  /api/ → proxy_pass
              ▼                                                ▼
     cotizador-frontend                      ┌─────────────────────────────┐
     (HTML · CSS · JS)                       │  tallerdae-backend (Java)  │  :8080 (interno)
                                             └──────────────┬──────────────┘
                                                            │
                                                            ▼
                                             ┌─────────────────────────────┐
                                             │   tallerdae-db  (MySQL 8)  │  :3306
                                             └─────────────────────────────┘
```

El frontend se comunica con el backend exclusivamente a través de rutas relativas `/api/...`. Nginx actúa como proxy reverso, eliminando cualquier problema de CORS y siendo el único punto de entrada público al sistema.

---

## Estructura del repositorio

```
Vibe-Coding-y-Spec-Driven-Development/
│
├── README.md                          ← este archivo
│
├── seccion-1-vibe-coding/             ── Ambiente base (MySQL + Nginx estático)
│   ├── docker-compose.yml
│   ├── .env                           ← credenciales (excluido de git)
│   ├── .env.example                   ← plantilla para nuevos desarrolladores
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── html/index.html
│   └── Entregables/
│       ├── Bitacora/README.md
│       ├── Capturas/
│       └── Preguntas/README.md
│
├── seccion-2-spec-driven-back/        ── Backend Spring Boot
│   └── cotizador-backend/
│       ├── Dockerfile                 ← multi-stage build (JDK → JRE)
│       ├── pom.xml
│       └── src/main/java/com/tallerdae/cotizador/
│           ├── domain/                ← modelo, value objects, estrategias
│           ├── application/           ← puertos de entrada/salida, servicios
│           └── infrastructure/        ← adaptadores REST, persistencia, config
│
├── seccion-2-spec-driven-front/       ── Frontend estático
│   └── cotizador-frontend/
│       ├── index.html
│       ├── css/estilos.css
│       ├── js/
│       │   ├── api.js                 ← Adapter Pattern (fetch → REST)
│       │   ├── state.js               ← Module + Observer
│       │   └── app.js                 ← Factory + coordinador DOM
│       ├── tests/                     ← Vitest (unit + UI)
│       ├── nginx.conf
│       └── Dockerfile
│
└── seccion-3-despliegue-integrado/    ── Stack completo orquestado
    ├── docker-compose.yml             ← db + backend + web
    ├── nginx/default.conf
    └── cotizador-backend/Dockerfile
```

---

## Sección 1 — Vibe Coding: Ambiente local

Ambiente de desarrollo y pruebas generado íntegramente mediante **Vibe Coding** con Kiro. Define la infraestructura base que sirve de referencia para el despliegue integrado.

### Servicios

| Contenedor | Imagen | Puerto | Descripción |
|---|---|---|---|
| `tallerdae-mysql` | `mysql:8.0` | `3306` | Base de datos con healthcheck |
| `tallerdae-nginx` | `nginx:alpine` | `8080` | Página de bienvenida estática |

### Levantar

```bash
cd seccion-1-vibe-coding
docker compose up -d
```

### Variables de entorno (`.env`)

```env
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_DATABASE=tallerdae
MYSQL_USER=devuser
MYSQL_PASSWORD=devpassword123
NGINX_PORT=8080
```

> Copia `.env.example` a `.env` antes de levantar si es la primera vez.

### Accesos

| Recurso | URL |
|---|---|
| Página de bienvenida | http://localhost:8080 |
| MySQL (DBeaver / cliente) | `localhost:3306` · DB: `tallerdae` |

### Nota DBeaver — Public Key Retrieval

MySQL 8 usa `caching_sha2_password` por defecto. En la pestaña **Driver properties** de la conexión, establece:

```
allowPublicKeyRetrieval = true
useSSL                  = false
```

O agrega los parámetros directamente en la URL:
```
jdbc:mysql://localhost:3306/tallerdae?allowPublicKeyRetrieval=true&useSSL=false
```

---

## Sección 2 — Spec-Driven: Backend

API REST implementada con **arquitectura hexagonal** (Ports & Adapters). Todas las dependencias apuntan hacia el dominio; la infraestructura es reemplazable sin tocar las reglas de negocio.

### Stack

| Componente | Versión |
|---|---|
| Java | 17 |
| Spring Boot | 3.3.2 |
| Maven | 3.9.x |
| SpringDoc OpenAPI | 2.6.0 |

### Capas

```
infrastructure  ──►  application  ──►  domain
```

| Capa | Paquete | Contenido |
|---|---|---|
| **Dominio** | `domain/` | Entidades, Value Objects (`Dinero`), enums (`NivelUrgencia`), Strategy de urgencia |
| **Aplicación** | `application/` | Puertos de entrada/salida, `GenerarCotizacionService` |
| **Infraestructura** | `infrastructure/` | Controladores REST, DTOs, mappers, repositorios en memoria, configuración Spring |

### Patrones de diseño

| Patrón | Ubicación | Propósito |
|---|---|---|
| **Strategy** | `UrgencyPricingStrategy` | Extensión de niveles de urgencia sin modificar código existente (OCP) |
| **Factory Method** | `Cotizacion.crear()` | Agregado raíz nunca en estado inválido |
| **Repository** | `*RepositoryPort` | Desacopla dominio de la persistencia |
| **DTO + Mapper** | `CotizacionRequest/Response` | Aísla el contrato HTTP del modelo de dominio |

### Reglas de negocio

| Regla | Descripción |
|---|---|
| RN-01 | `subtotal = Σ (precioBase × factorComplejidad)` |
| RN-02 | Si urgente: `recargo = subtotal × 0.30`, `total = subtotal + recargo` |
| RN-03 | `tiempo = max(tiempos)`. Si urgente: `ceil(tiempo / 2)`, mínimo 1 día |
| RN-04 | Debe haber al menos una reparación; si no, error 400 |
| RN-05 | Cada cotización lleva UUID único y fecha de creación |

### Levantar (standalone con Docker)

```bash
cd seccion-2-spec-driven-back/cotizador-backend

# Construir imagen (multi-stage: JDK → JRE Alpine)
docker build -t cotizador:1.0.0 .

# Iniciar contenedor
docker run -d --name cotizador-back -p 8080:8080 cotizador:1.0.0
```

### Levantar (standalone con Maven)

```bash
mvn package -DskipTests
java -jar target/cotizador-1.0.0.jar
```

### Accesos

| Recurso | URL |
|---|---|
| API REST | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/api-docs |

---

## Sección 2 — Spec-Driven: Frontend

Interfaz web de una sola página (SPA ligera) implementada en **JavaScript vanilla** sin frameworks. Aplica tres patrones de diseño coordinados entre módulos.

### Módulos y patrones

| Archivo | Patrón | Responsabilidad |
|---|---|---|
| `js/api.js` | Adapter | Traduce funciones JS a llamadas `fetch` contra `/api` |
| `js/state.js` | Module + Observer | Estado en memoria; notifica cambios a suscriptores |
| `js/app.js` | Factory + Coordinador | Construye el payload, enlaza eventos DOM, renderiza resultados |

### Levantar (standalone con Docker)

Requiere el backend corriendo en puerto 8080:

```bash
cd seccion-2-spec-driven-front/cotizador-frontend
docker compose up --build -d
```

Acceso: http://localhost:3001

### Pruebas unitarias

```bash
npm install
npm test          # ejecución única (Vitest)
npm run test:watch  # modo watch
```

Cobertura: 3 archivos de test, 60 casos — módulos `state.js`, `api.js` y criterios de aceptación REQ-UI-01 al 04.

### Payload del POST `/api/cotizaciones`

```json
{
  "calzadoId": "CAL-002",
  "reparacionIds": ["REP-004"],
  "urgente": false
}
```

---

## Sección 3 — Despliegue integrado

Orquesta los tres servicios en un único `docker-compose.yml`. Es el ambiente de referencia para pruebas end-to-end.

### Contenedores

| Contenedor | Imagen | Puerto | Notas |
|---|---|---|---|
| `tallerdae-db` | `mysql:8.0` | `3306` | Volumen persistente `db_data`, healthcheck |
| `tallerdae-backend` | build local | interno | Solo accesible dentro de `tallerdae-net` |
| `tallerdae-web` | `nginx:alpine` | `8080` | Único punto público; proxy `/api/` → backend |

### Levantar (un solo comando)

```bash
cd seccion-3-despliegue-integrado
docker compose up -d --build
```

> La primera vez compila el backend con Maven dentro del contenedor (~60-90 s).  
> Las ejecuciones siguientes usan la caché de Docker y son inmediatas.

### Verificar estado

```bash
# Estado de todos los contenedores
docker compose ps

# Logs en tiempo real
docker compose logs -f

# Probar la API a través del proxy
curl -s http://localhost:8080/api/catalogo/calzados

# Probar el POST de cotización
curl -s -X POST http://localhost:8080/api/cotizaciones \
  -H "Content-Type: application/json" \
  -d '{"calzadoId":"CAL-002","reparacionIds":["REP-004"],"urgente":false}'
```

### Detener

```bash
# Detener conservando datos
docker compose down

# Detener y eliminar volumen (borra datos MySQL)
docker compose down -v
```

### Accesos

| Recurso | URL |
|---|---|
| Aplicación web | http://localhost:8080 |
| Catálogo de calzados | http://localhost:8080/api/catalogo/calzados |
| Catálogo de reparaciones | http://localhost:8080/api/catalogo/reparaciones |
| Generar cotización | `POST` http://localhost:8080/api/cotizaciones |
| Swagger UI | http://localhost:8080/swagger-ui.html |

---

## Referencia de endpoints

### Catálogo

| Método | Endpoint | Descripción | Status |
|---|---|---|---|
| `GET` | `/api/catalogo/calzados` | Lista tipos de calzado | 200 |
| `GET` | `/api/catalogo/reparaciones` | Lista tipos de reparación | 200 |

### Cotizaciones

| Método | Endpoint | Descripción | Status |
|---|---|---|---|
| `POST` | `/api/cotizaciones` | Genera una cotización | 201 / 400 |

#### Request — POST `/api/cotizaciones`

```json
{
  "calzadoId": "CAL-002",
  "reparacionIds": ["REP-004"],
  "urgente": false
}
```

#### Response 201

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
  "fechaCreacion": "2026-08-20T10:00:00"
}
```

#### Response 400 — Sin reparaciones

```json
{
  "status": 400,
  "mensaje": "Debe seleccionar al menos una reparación para generar la cotización.",
  "errores": null,
  "timestamp": "2026-08-20T10:00:00"
}
```

### Catálogo de datos precargados

**Calzados**

| ID | Nombre | Factor |
|---|---|---|
| CAL-001 | Zapatilla deportiva | 1.0 |
| CAL-002 | Zapato de vestir | 1.2 |
| CAL-003 | Bota de trabajo | 1.5 |
| CAL-004 | Sandalia | 0.8 |
| CAL-005 | Bota de cuero | 1.8 |

**Reparaciones**

| ID | Nombre | Precio base (PEN) | Tiempo (días) |
|---|---|---|---|
| REP-001 | Cambio de suela | 25.00 | 3 |
| REP-002 | Costura de capellada | 15.00 | 2 |
| REP-003 | Limpieza profunda | 10.00 | 1 |
| REP-004 | Cambio de taco | 12.00 | 2 |
| REP-005 | Pegado de puntera | 20.00 | 4 |
| REP-006 | Tinte y acabado | 18.00 | 3 |

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Base de datos | MySQL | 8.0 |
| Backend | Java + Spring Boot | 17 / 3.3.2 |
| Frontend | HTML5 · CSS3 · JavaScript ES Modules | — |
| Pruebas frontend | Vitest + jsdom | 2.1.9 |
| Servidor web / proxy | Nginx | alpine |
| Orquestación | Docker Compose | v2 |
| Documentación API | SpringDoc OpenAPI (Swagger UI) | 2.6.0 |
| Build tool backend | Maven | 3.9.x |

---

## Entregables

### Sección 1

| Documento | Ruta |
|---|---|
| Bitácora de sesión Vibe Coding | [seccion-1-vibe-coding/Entregables/Bitacora/README.md](seccion-1-vibe-coding/Entregables/Bitacora/README.md) |
| Preguntas de reflexión | [seccion-1-vibe-coding/Entregables/Preguntas/README.md](seccion-1-vibe-coding/Entregables/Preguntas/README.md) |
| Capturas de pantalla | [seccion-1-vibe-coding/Entregables/Capturas/](seccion-1-vibe-coding/Entregables/Capturas/) |

### Sección 3

| Documento | Ruta |
|---|---|
| Bitácora de Vibe Coding | [seccion-3-despliegue-integrado/Entregables/Bitacora/README.md](seccion-3-despliegue-integrado/Entregables/Bitacora/README.md) |
| Guion de pruebas manuales (Gherkin) | [seccion-3-despliegue-integrado/Entregables/Guion-Pruebas/README.md](seccion-3-despliegue-integrado/Entregables/Guion-Pruebas/README.md) |
| Preguntas de reflexión | [seccion-3-despliegue-integrado/Entregables/Preguntas/README.md](seccion-3-despliegue-integrado/Entregables/Preguntas/README.md) |

### Capturas

![Docker — contenedores corriendo](seccion-1-vibe-coding/Entregables/Capturas/01_docker.png)

![DBeaver — conexión exitosa](seccion-1-vibe-coding/Entregables/Capturas/02_dbeaver_successConnection.png)
