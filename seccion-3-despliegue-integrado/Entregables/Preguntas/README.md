# Preguntas de Reflexión — Sección 3

**Sección:** 3 — Despliegue integrado con Vibe Coding y pruebas end-to-end  
**Documento de referencia:** Guía del Taller (Sección 4.9)

---

### 1. ¿Cuántas iteraciones conversacionales fueron necesarias para que los tres servicios funcionaran juntos? ¿Qué fue lo primero que falló?

Fueron necesarias **3 iteraciones principales**:
1. Generación inicial de la infraestructura Docker y el `Dockerfile` multi-etapa para compilar el backend.
2. Ajuste fino de la configuración de proxy reverso en Nginx (`location /api/` y encabezados `Host` / `X-Real-IP`).
3. Definición explícita de `depends_on` con condiciones de salud (`service_healthy` y `service_started`) para evitar condiciones de carrera en el arranque.

**Lo primero que falló** fue el tiempo de disponibilidad del backend al iniciar simultáneamente con Nginx: al no haber una condición de espera configurada, las primeras solicitudes HTTP generaban un error `502 Bad Gateway` mientras el runtime de Spring Boot terminaba de inicializar su contexto y publicar el puerto en la red interna. Se solucionó agregando la directiva `depends_on` adecuada.

---

### 2. ¿En algún momento tuviste la tentación de ajustar código de negocio o de interfaz de la Sección 2 para que el despliegue “cuadrara”? Si fue así, ¿cómo lo resolviste sin saltarte el gate de la Sección 2?

Sí, existió la tentación típica de modificar las rutas en el código del frontend (cambiar las URLs de fetch a rutas fijas con host/puerto) o alterar los puertos en el backend para hacer pruebas directas. 

Sin embargo, respetando la **regla de oro del taller (límite del ejercicio)**, se mantuvo la disciplina de no alterar el código de negocio ni los contratos fijados en la Sección 2:
* Se adaptó exclusivamente la **capa de infraestructura/despliegue** (la configuración de Nginx para actuar como proxy transparente en `/api/`).
* Esto demostró el beneficio directo de haber diseñado el frontend con rutas relativas y el backend bajo arquitectura hexagonal: los componentes desacoplados no requirieron ningún cambio en su lógica para funcionar dentro de la topología de red de Docker.

---

### 3. Compara esta sección con la Sección 1: ambas son vibe coding, pero una parte de una carpeta vacía y la otra integra piezas ya construidas con disciplina. ¿Cambió tu forma de iterar con Kiro por eso?

**Sí, cambió notablemente el enfoque de iteración:**
* **En la Sección 1:** El Vibe Coding fue puramente exploratorio y de lienzo en blanco; cualquier propuesta generada por Kiro era aceptable siempre que levantara el ambiente, sin restricciones previas de diseño o contratos estrictos.
* **En la Sección 3:** Aunque se utilizó el modo conversacional por agilidad, los prompts estuvieron estrictamente acotados por los **contratos y artefactos inmutables de la Sección 2** (el contrato OpenAPI, los nombres de servicios y los puertos internos). La iteración no consistió en "dejar que la IA invente", sino en guiarla para cablear componentes preexistentes respetando sus especificaciones técnicas.

---

### 4. Si este despliegue integrado tuviera que promoverse a un ambiente compartido por todo un equipo de trabajo, ¿qué de lo hecho en esta sección seguiría siendo válido y qué necesitaría revisarse con más estructura?

* **Lo que sigue siendo válido:**
  * La separación arquitectónica en 3 capas (datos, API, proxy/estáticos).
  * El aislamiento de red (backend no expuesto al host, solo accesible vía proxy).
  * El uso de compilación multi-etapa (`multi-stage build`) en el `Dockerfile` para generar artefactos de ejecución limpios y livianos.

* **Lo que requeriría una especificación formal y mayor estructura (Spec-Driven):**
  * **Gestión de Secretos:** Reemplazar el archivo `.env` en texto plano por un gestor de secretos empresariales (HashiCorp Vault, AWS Secrets Manager o Kubernetes Secrets).
  * **Seguridad y TLS:** Configurar certificados SSL/TLS reales en Nginx para HTTPS y políticas de seguridad estrictas (Content Security Policy, CORS restrictivo, rate limiting).
  * **Orquestación y Alta Disponibilidad:** Migrar de Docker Compose a Kubernetes (Deployments, Services, Ingress Controllers y Horizontal Pod Autoscaling).
  * **Persistencia y Respaldo:** Sustituir el volumen local de MySQL por una base de datos gestionada con alta disponibilidad, replicación y políticas automatizadas de backup.
