# -------------------------------------------------------
# Stage 1: Build — compila y empaqueta con Maven + JDK 17
# -------------------------------------------------------
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copia el descriptor del proyecto primero para aprovechar el cache de capas
COPY pom.xml .

# Descarga dependencias sin compilar el código (cache layer)
RUN apk add --no-cache maven && \
    mvn dependency:go-offline -B

# Copia el código fuente y empaqueta omitiendo tests
COPY src ./src
RUN mvn package -DskipTests -B

# -------------------------------------------------------
# Stage 2: Runtime — imagen ligera solo con JRE 17
# -------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Usuario no-root por seguridad
RUN addgroup -S cotizador && adduser -S cotizador -G cotizador
USER cotizador

# Copia solo el jar generado desde el stage anterior
COPY --from=builder /app/target/cotizador-1.0.0.jar cotizador.jar

# Puerto expuesto (coincide con server.port en application.properties)
EXPOSE 8080

# Punto de entrada
ENTRYPOINT ["java", "-jar", "cotizador.jar"]
