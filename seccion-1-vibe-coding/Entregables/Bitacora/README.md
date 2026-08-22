# Bitácora de Vibe Coding — Sección 1

**Proyecto:** Ambiente local de desarrollo con Docker Compose  
**Metodología:** Vibe Coding asistido por Kiro  
**Fecha:** 20 de agosto de 2026

---

## ¿Qué es Vibe Coding?

Vibe Coding es una metodología de desarrollo en la que el usuario describe objetivos en lenguaje natural y el agente de IA (Kiro) toma las decisiones técnicas de forma autónoma: elige herramientas, genera código, detecta errores y los corrige sin que el usuario escriba una sola línea de código manualmente.

---

## Registro cronológico

| # | Momento | Qué se pidió | Qué hizo Kiro | Por qué se tomó esa decisión |
|---|---|---|---|---|
| 1 | Inicio | Crear un ambiente local con Docker Compose: MySQL 8, Nginx y persistencia, levantable con un solo comando | Planificó el trabajo en 5 tareas ordenadas usando una lista de tareas interna | Organizar el trabajo en pasos discretos garantiza trazabilidad y permite detectar errores por etapa |
| 2 | Tarea 1 | — | Creó la estructura de carpetas `seccion-1-vibe-coding/nginx/html/` | Separar la config de Nginx de los archivos HTML servidos es una convención estándar y facilita montar volúmenes independientes |
| 3 | Tarea 2 | Credenciales en archivo `.env` | Generó `.env` con todas las variables y adicionalmente un `.env.example` como plantilla segura | El `.env.example` es una buena práctica para que otros desarrolladores sepan qué variables existen sin exponer valores reales en el repositorio |
| 4 | Tarea 3 | Configuración de Nginx para página estática y soporte futuro de proxy | Creó `nginx.conf` con bloque `location /api/` comentado listo para activar | El bloque se dejó comentado porque el backend aún no existía en esta sección; prepararlo evita reescribir la configuración cuando llegue la sección 3 |
| 5 | Tarea 3 | Página HTML de bienvenida | Generó `index.html` con diseño moderno que muestra el estado visual de los servicios (MySQL, Nginx, Backend pendiente) | Una página funcional y descriptiva confirma visualmente que el ambiente levantó correctamente, más útil que una página en blanco |
| 6 | Tarea 4 | `docker-compose.yml` con MySQL y Nginx | Definió healthcheck en MySQL y `depends_on: condition: service_healthy` en Nginx; creó red bridge interna y volumen nombrado | El healthcheck garantiza que Nginx no inicie hasta que MySQL ya acepte conexiones, evitando errores de inicio en cadena típicos en entornos de desarrollo |
| 7 | Tarea 4 | `.gitignore` | Lo creó automáticamente excluyendo `.env` y datos de MySQL | Proteger credenciales del control de versiones es una práctica de seguridad no negociable, aunque el usuario no lo solicitó explícitamente |
| 8 | Tarea 5 | Levantar el ambiente | Detectó que Docker Desktop no estaba corriendo; abrió `/Applications/Docker.app` automáticamente y esperó al daemon antes de ejecutar `docker compose up -d` | En lugar de fallar y reportar el error, Kiro resolvió la causa raíz (daemon apagado) sin interrumpir al usuario |
| 9 | Post-levantamiento | Error en DBeaver: *Public Key Retrieval is not allowed* | Explicó que MySQL 8 usa `caching_sha2_password` por defecto y dio dos soluciones: habilitar `allowPublicKeyRetrieval=true` en Driver properties, o usar la URL JDBC con los parámetros | Se optó por el ajuste en el cliente porque es menos invasivo que cambiar el plugin de autenticación del servidor; se documentó ambas opciones para cubrir diferentes contextos |
| 10 | Documentación | README técnico con instrucciones de levantamiento | Generó `seccion-1-vibe-coding/README.md` con secciones de requisitos, variables, comandos, conexión MySQL y guía de DBeaver | Documentar en el mismo repositorio garantiza que cualquier desarrollador pueda replicar el ambiente sin asistencia adicional |
| 11 | Documentación | README raíz del proyecto con bitácora, capturas y preguntas | Actualizó el `README.md` raíz con tres secciones enlazadas y las capturas incrustadas como imágenes Markdown | El README raíz es el punto de entrada del repositorio; necesita vincular todos los artefactos del taller en un único índice navegable |
| 12 | Corrección | Inconsistencia entre el payload del frontend y los campos que espera la API backend | Identificó que `tipoCalzadoId` debía ser `calzadoId`, `reparaciones` debía ser `reparacionIds`, y `tiempoEstimado` debía ser `tiempoEstimadoDias`; corrigió los tres en `api.js` y `app.js` | El README del frontend fue generado con nombres de campo distintos a los implementados en el backend; Kiro detectó la discrepancia leyendo ambos lados y la corrigió en el adaptador HTTP sin tocar el backend |

---

## Reflexión sobre el proceso

### Lo que Vibe Coding hizo bien

- **Autonomía completa:** ninguna de las 12 interacciones requirió que el usuario escribiera código, comandos o configuración.
- **Resolución proactiva:** cuando el daemon de Docker estaba apagado, Kiro no esperó instrucciones — lo abrió y continuó.
- **Decisiones no solicitadas de calidad:** el `.gitignore`, el `.env.example`, el healthcheck y el bloque de proxy comentado no fueron pedidos; Kiro los agregó porque son buenas prácticas estándar.
- **Diagnóstico preciso:** el error de DBeaver y la inconsistencia de campos entre frontend y backend fueron identificados leyendo el código fuente real, no por suposición.

### Limitaciones observadas

- El agente generó documentación (README del frontend) con nombres de campo que no coincidían con la implementación real del backend, lo que causó el error en el POST. Esto muestra que la coherencia entre documentación y código requiere verificación cruzada.
- La metodología depende de que el usuario describa el objetivo con suficiente claridad; ambigüedades en el prompt inicial pueden derivar en iteraciones adicionales.

### Conclusión

El flujo de trabajo de Vibe Coding demostró ser efectivo para tareas de infraestructura y configuración donde el espacio de soluciones es bien definido. Kiro actuó como un desarrollador senior que toma decisiones fundamentadas, documenta su trabajo y maneja errores en tiempo real — permitiendo al usuario enfocarse en el objetivo de negocio en lugar de en los detalles de implementación.
