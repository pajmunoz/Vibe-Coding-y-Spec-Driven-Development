# Bitácora de Sesión — Vibe Coding con Kiro (Sección 3)

**Proyecto:** Despliegue Integrado del Cotizador de Reparación de Calzados  
**Sección:** 3 — Despliegue integrado con Vibe Coding y pruebas end-to-end  
**Fecha:** 21 de agosto de 2026  

---

## Registro Cronológico de Interacciones

| # | Solicitud / Intención | Acción de Kiro | Ajuste / Justificación Técnica |
|---|---|---|---|
| 1 | Extender el ambiente Docker de la Sección 1 para integrar el backend Spring Boot y el frontend web. | Se definió una arquitectura de 3 contenedores (`db`, `backend`, `web`) orquestados con Docker Compose. | Se separaron responsabilidades manteniendo Nginx como único punto de entrada público. |
| 2 | Configurar la compilación y empaquetado del backend Java sin depender de herramientas instaladas en el host. | Se diseñó un `Dockerfile` multi-etapa (`maven:3.9-eclipse-temurin-17` para el build y `eclipse-temurin:17-jre` para el runtime). | El build multi-etapa reduce el tamaño de la imagen final y garantiza reproducibilidad en cualquier entorno. |
| 3 | Asegurar que el backend no exponga puertos directamente hacia la máquina anfitriona (host). | Se utilizó `expose: "8080"` en lugar de `ports:` en el servicio backend dentro de `docker-compose.yml`. | Cumple con la regla de seguridad y aislamiento: el backend solo debe ser accesible desde la red interna `tallerdae-net`. |
| 4 | Reconfigurar Nginx para actuar como servidor web estático y proxy inverso simultáneamente. | Se configuró `nginx/default.conf` con `location /` hacia los estáticos y `location /api/` con `proxy_pass http://backend:8080/api/`. | Permite que el frontend consuma endpoints usando rutas relativas sin problemas de CORS ni cambios de origen. |
| 5 | Establecer dependencias de arranque entre los servicios para evitar fallos 502 al inicio. | Se configuró `depends_on` en Nginx con condiciones `db: service_healthy` y `backend: service_started`. | Evita que el servidor web acepte peticiones antes de que la base de datos y la API estén inicializadas. |
| 6 | Integrar el volumen persistente de base de datos entre reinicios del ambiente. | Se reutilizó el volumen nombrado `db_data` mapeado a `/var/lib/mysql`. | Garantiza la persistencia de datos relacionales sin acoplarse al ciclo de vida del contenedor. |
| 7 | Validar el levantamiento automático del ambiente completo con un único comando. | Se ejecutó `docker compose up -d --build` y se validó el estado con `docker compose ps`. | Verifica que todos los servicios levanten sin intervención manual fuera del archivo compose. |
| 8 | Comprobar el enrutamiento HTTP a través del proxy inverso de Nginx. | Se realizaron pruebas con `curl -I http://localhost:8080/` y peticiones a los endpoints `/api/`. | Confirma que Nginx responde con código 200 y enruta correctamente las peticiones hacia el contenedor backend. |
| 9 | Ejecutar el guion de pruebas manuales basado en los 7 escenarios de negocio e interfaz (Gherkin). | Se validó cada escenario desde el navegador con las DevTools abiertas en la pestaña Network. | Asegura que la integración satisfaga los criterios de aceptación acordados en la especificación de la Sección 2. |
| 10 | Consolidar los entregables y respuestas a las preguntas de reflexión crítica de la sección. | Se estructuraron los archivos en `Entregables/` cubriendo bitácora, guion de pruebas y análisis conceptual. | Permite contrastar la velocidad del Vibe Coding frente al rigor del Spec-Driven Development para el cierre del taller. |
