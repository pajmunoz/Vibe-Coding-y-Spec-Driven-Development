# Preguntas de reflexión

## 1. ¿Cuánto tiempo tomó desde el primer prompt hasta tener el ambiente funcionando? ¿Cuántas iteraciones conversacionales fueron necesarias?

     Me tomó 10 minutos desde que pasé el primer promt hasta que logre levantar Docker y tambien acceder a la base de datos, tuve un error con Dbeaver pero lo solucioné con un promt mostrando el log del error, y para que se solvente por mis compañeros cree un Readme explicando el error y como solucionar.

     Fueron necesarios 2 Promts para levantar toda la sección. 
---
## 2. ¿Revisaste línea por línea el docker-compose.yml generado, o confiaste en que “funcionaba”? ¿Qué riesgo implica esa decisión?

    Revisé especialmente los puertos para asegurame que coincidan con la respuesta de Kiro y el .env con las variables de ambiente.
---
## 3. Si este mismo ambiente tuviera que promoverse a un entorno de staging compartido por todo el equipo, ¿qué cambiaría en tu forma de trabajar? Relaciona tu respuesta con la matriz de decisión de la sesión teórica.
    Me aseguraria de no tener nada expuesto por ejemplo las variables de ambiente deben estar en un secret dentro del ambiente de despliegue mas no expuestas en un repositorio dentro de un .env,

    Es importante documentar como levantar los ambientes y que dependencias se estan usando para que sea facilmente utilizable por otros miembros del equipo.
---
## 4. ¿Qué credenciales o configuraciones sensibles quedaron expuestas durante el ejercicio? ¿Cómo las gobernarías en un contexto empresarial real?
    Como expuse anteriormente no se deberia dejar las claves de acceso expuestas en el repositorio, por lo que es mejor configurarlas en el ambiente de deployment.
    