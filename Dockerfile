# =============================================================================
# Dockerfile multi-etapa - hospital-backend (Spring Boot 3.3.4 / Java 21)
# =============================================================================

# ---------- Etapa 1: Compilación con Maven + JDK 21 ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copiar primero el wrapper y el pom para aprovechar la caché de dependencias
COPY mvnw pom.xml ./
COPY .mvn .mvn
# Normalizar fin de línea (CRLF de Windows) y dar permisos de ejecución
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw \
    && ./mvnw dependency:go-offline -B

# Copiar el código fuente y compilar
COPY src src
RUN ./mvnw clean package -DskipTests -B

# ---------- Etapa 2: Ejecución con JRE 21 ligero ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Ejecutar con un usuario sin privilegios
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
