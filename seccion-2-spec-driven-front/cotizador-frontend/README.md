# Cotizador de Reparación de Calzado — Frontend

Interfaz web estática para cotizar reparaciones de calzado. Se comunica con un backend Spring Boot mediante tres endpoints REST.

---

## Estructura del proyecto

```
seccion-2-spec-driven-front/
├── cotizador-frontend/         ← Proyecto frontend
│   ├── index.html              # Pantalla única de la aplicación
│   ├── css/
│   │   └── estilos.css         # Estilos visuales, estados y animaciones
│   ├── js/
│   │   ├── api.js              # Adaptador HTTP (Adapter Pattern)
│   │   ├── state.js            # Estado en memoria + Observer ligero
│   │   └── app.js              # Coordinador DOM, eventos y Factory
│   ├── tests/
│   │   ├── state.test.js       # Tests unitarios del módulo de estado
│   │   ├── api.test.js         # Tests unitarios del adaptador HTTP
│   │   └── ui.test.js          # Tests de comportamiento UI (REQ-UI-01 al 04)
│   ├── package.json            # Dependencias y scripts de pruebas (Vitest)
│   ├── nginx.conf              # Configuración Nginx con proxy reverso a la API
│   ├── Dockerfile              # Imagen Nginx Alpine con los estáticos
│   └── docker-compose.yml      # Orquestación del contenedor front
└── .kiro/
    └── steering/
        ├── design-patterns.md  # Patrones de diseño aplicados
        └── specs/
            ├── requirements.md # Requisitos funcionales (EARS)
            ├── design.md       # Diseño técnico y módulos
            └── tasks.md        # Lista de tareas de implementación
```

---

## Arquitectura de módulos JS

```
index.html
    └── js/app.js           (Coordinador DOM + Factory)
            ├── js/state.js (Module Pattern + Observer)
            └── js/api.js   (Adapter Pattern → REST)
```

| Módulo | Patrón | Responsabilidad |
|---|---|---|
| `state.js` | Module + Observer | Estado en memoria, notifica cambios vía `onCambio()` |
| `api.js` | Adapter | Traduce funciones JS a llamadas `fetch` contra la API |
| `app.js` | Factory + Coordinador | Enlaza eventos DOM, construye el payload y renderiza |

---

## Levantar el ambiente en Docker

### Prerequisitos
- Docker Desktop corriendo
- Backend `cotizador:1.0.0` ya levantado en la red `bridge` (puerto 8080)

### 1. Levantar el backend (si no está corriendo)

```bash
docker run -d --name cotizador-back --network bridge -p 8080:8080 cotizador:1.0.0
```

### 2. Construir y levantar el frontend

```bash
# Desde la carpeta seccion-2-spec-driven-front/
docker compose up --build -d
```

> La primera vez descarga la imagen base de Nginx (~10 MB). Las siguientes ejecuciones usan caché y son instantáneas.

### 3. Verificar que ambos contenedores están activos

```bash
docker ps
```

Deberías ver:

```
NAMES             STATUS    PORTS
cotizador-front   Up ...    0.0.0.0:3001->80/tcp
cotizador-back    Up ...    0.0.0.0:8080->8080/tcp
```

### 4. Abrir la aplicación

```
http://localhost:3001
```

### Detener el ambiente

```bash
docker compose down
```

---

## URLs de los servicios

### Frontend

| Recurso | URL |
|---|---|
| Aplicación web | `http://localhost:3001` |

### API Backend

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `http://localhost:8080/api/catalogo/calzados` | Lista tipos de calzado |
| `GET` | `http://localhost:8080/api/catalogo/reparaciones` | Lista tipos de reparación |
| `POST` | `http://localhost:8080/api/cotizaciones` | Genera una cotización |
| `GET` | `http://localhost:8080/swagger-ui.html` | Documentación Swagger UI |

### Ejemplo de payload para `POST /api/cotizaciones`

```json
{
  "tipoCalzadoId": 1,
  "reparaciones": [2, 3],
  "urgente": false
}
```

---

## Cómo funciona el proxy (sin CORS)

El frontend llama a rutas relativas `/api/...`. Nginx actúa como proxy reverso y reenvía esas peticiones al backend directamente dentro de la red Docker — sin que el navegador haga peticiones cross-origin.

```
Navegador → http://localhost:3001/api/catalogo/calzados
                        ↓
              Nginx (cotizador-front :80)
                        ↓ proxy_pass
              Backend Java (172.17.0.2:8080)
```

---

## Desarrollo local (sin Docker)

Si necesitas iterar rápido sin reconstruir la imagen, puedes servir el front con Python apuntando directamente al backend:

1. Cambia `API_BASE_URL` en `js/api.js` a `http://localhost:8080/api`
2. Ejecuta:

```bash
python -m http.server 3000 --directory .
```

3. Abre `http://localhost:3000`

> El backend debe tener CORS habilitado para `http://localhost:3000` en este modo.

---

## Pruebas

Las pruebas unitarias y de comportamiento usan [Vitest](https://vitest.dev/) y cubren los módulos `state.js`, `api.js` y los criterios de aceptación REQ-UI-01 al 04.

### Instalar dependencias

```bash
npm install
```

### Ejecutar las pruebas (una sola vez)

```bash
npm test
```

### Ejecutar en modo watch (desarrollo)

```bash
npm run test:watch
```

### Resultado esperado

```
Test Files  3 passed (3)
     Tests  60 passed (60)
```

| Archivo de test | Qué verifica |
|---|---|
| `tests/state.test.js` | Estado inicial, setters, Observer, inmutabilidad |
| `tests/api.test.js` | Rutas fetch, payload, manejo de errores 400/red |
| `tests/ui.test.js` | REQ-UI-01 al 04, Factory, inmutabilidad del estado |
