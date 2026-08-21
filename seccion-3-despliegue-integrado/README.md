# Sección 3 — Despliegue Integrado con Vibe Coding y Pruebas End-to-End

Este proyecto integra los tres componentes del sistema en un único ambiente Docker orquestado con Docker Compose:

1. **Base de datos (`tallerdae-db`):** MySQL 8 persistente.
2. **Backend (`tallerdae-backend`):** Servicio Spring Boot empaquetado en contenedor con compilación multi-etapa.
3. **Frontend / Proxy (`tallerdae-web`):** Servidor Nginx que actúa como único punto de entrada público, sirviendo el cliente estático y enrutando peticiones `/api/` hacia el backend.

---

## Arquitectura del Despliegue

```
                      Navegador Web (http://localhost:8080)
                                      │
                                      ▼
                       ┌──────────────────────────────┐
                       │     tallerdae-web (Nginx)    │ (Puerto 8080 expuesto)
                       └──────────────┬───────────────┘
                                      │
                     ┌────────────────┴────────────────┐
                     │ / (HTML/CSS/JS)                 │ /api/ (Proxy reverso)
                     ▼                                 ▼
            Archivos Frontend            ┌──────────────────────────────┐
          (cotizador-frontend)           │   tallerdae-backend (Java)   │ (Puerto 8080 interno)
                                         └──────────────┬───────────────┘
                                                        │
                                                        ▼
                                         ┌──────────────────────────────┐
                                         │    tallerdae-db (MySQL 8)    │ (Puerto 3306)
                                         └──────────────────────────────┘
```

---

## Cómo Levantar el Ambiente

Todo el ambiente se construye y levanta con un solo comando:

```bash
docker compose up -d --build
```

---

## Validación de Servicios

1. **Verificar estado de los contenedores:**
   ```bash
   docker compose ps
   ```

2. **Verificar respuesta de Nginx:**
   ```bash
   curl -I http://localhost:8080/
   ```

3. **Verificar respuesta del Backend a través del Proxy:**
   ```bash
   curl -s http://localhost:8080/api/catalogo/calzados
   ```

---

## Entregables

La documentación y evidencias requeridas se encuentran en la carpeta `Entregables/`:
* **Bitácora de Vibe Coding:** `Entregables/Bitacora/README.md`
* **Guion de Pruebas Manuales (7 Escenarios Gherkin):** `Entregables/Guion-Pruebas/README.md`
* **Respuestas a Preguntas de Reflexión (Sección 4.9):** `Entregables/Preguntas/README.md`
