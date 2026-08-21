# Sección 1 — Ambiente Local con Docker Compose

Ambiente de desarrollo y pruebas con **MySQL 8** y **Nginx**, levantado con un solo comando.

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Puerto `3306` y `8080` disponibles en tu máquina

---

## Estructura del proyecto

```
seccion-1-vibe-coding/
├── .env                  ← credenciales (NO subir a git)
├── .env.example          ← plantilla para otros desarrolladores
├── .gitignore
├── docker-compose.yml
└── nginx/
    ├── nginx.conf        ← configuración de Nginx
    └── html/
        └── index.html    ← página estática de bienvenida
```

---

## Configuración inicial

Copia el archivo de ejemplo y completa las credenciales:

```bash
cp .env.example .env
```

El `.env` incluye estas variables:

| Variable             | Descripción                        | Valor por defecto  |
|----------------------|------------------------------------|--------------------|
| `MYSQL_ROOT_PASSWORD`| Contraseña del usuario root        | `rootpassword123`  |
| `MYSQL_DATABASE`     | Nombre de la base de datos         | `tallerdae`        |
| `MYSQL_USER`         | Usuario de desarrollo              | `devuser`          |
| `MYSQL_PASSWORD`     | Contraseña del usuario de desarrollo | `devpassword123` |
| `NGINX_PORT`         | Puerto expuesto en el host         | `8080`             |

---

## Levantar el ambiente

```bash
docker compose up -d
```

Esto descarga las imágenes (solo la primera vez), crea la red, el volumen y levanta los contenedores en background.

### Verificar que todo está corriendo

```bash
docker compose ps
```

Deberías ver algo así:

```
NAME              IMAGE          STATUS              PORTS
tallerdae-mysql   mysql:8.0      Up (healthy)        0.0.0.0:3306->3306/tcp
tallerdae-nginx   nginx:alpine   Up                  0.0.0.0:8080->80/tcp
```

### Ver la página de bienvenida

Abre tu navegador en: [http://localhost:8080](http://localhost:8080)

---

## Comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f mysql
docker compose logs -f nginx

# Detener los contenedores (conserva el volumen de datos)
docker compose down

# Detener y eliminar el volumen (borra todos los datos de MySQL)
docker compose down -v

# Reiniciar un servicio
docker compose restart mysql
```

---

## Conectarse a MySQL

### Desde la terminal

```bash
docker exec -it tallerdae-mysql mysql -u devuser -pdevpassword123 tallerdae
```

### Datos de conexión

| Campo    | Valor        |
|----------|--------------|
| Host     | `localhost`  |
| Puerto   | `3306`       |
| Base     | `tallerdae`  |
| Usuario  | `devuser`    |
| Password | `devpassword123` |

---

## Conectarse con DBeaver

### Pasos para crear la conexión

1. Abre DBeaver → **New Database Connection**
2. Selecciona **MySQL** y haz click en **Next**
3. Completa los datos:
   - **Server Host:** `localhost`
   - **Port:** `3306`
   - **Database:** `tallerdae`
   - **Username:** `devuser`
   - **Password:** `devpassword123`

### Solución al error: *Public Key Retrieval is not allowed*

MySQL 8 usa el plugin `caching_sha2_password` por defecto, que requiere intercambiar
la clave pública del servidor. Los clientes JDBC lo bloquean por seguridad hasta que
lo habilitas explícitamente.

**Opción A — Driver properties (recomendada)**

1. En la pantalla de conexión, ve a la pestaña **Driver properties**
2. Localiza `allowPublicKeyRetrieval` → cambia el valor a **`true`**
3. Localiza `useSSL` → cambia el valor a **`false`**
4. Haz click en **Test Connection** y luego **Finish**

**Opción B — URL de conexión manual**

En el campo **URL** usa directamente:

```
jdbc:mysql://localhost:3306/tallerdae?allowPublicKeyRetrieval=true&useSSL=false
```

---

## Agregar un backend (futuro)

El `nginx.conf` ya incluye un bloque de proxy reverso comentado. Cuando tengas
un servicio backend corriendo, descomenta la sección en `nginx/nginx.conf`:

```nginx
location /api/ {
    proxy_pass         http://backend:8000/;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
}
```

Luego agrega el servicio `backend` en el `docker-compose.yml` dentro de la red `tallerdae-net`.

---

## Persistencia de datos

Los datos de MySQL se almacenan en el volumen Docker `tallerdae-mysql-data`.
Este volumen **sobrevive** a `docker compose down` y solo se elimina con `docker compose down -v`.
