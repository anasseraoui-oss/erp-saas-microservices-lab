# Stage 1: Build the application
FROM maven:3.9.4-eclipse-temurin-17-alpine AS build
LABEL authors="PC_Tarik"

WORKDIR /app

# Copy and build shared libraries
COPY security-core ./security-core
COPY model-Entities-Library ./model-Entities-Library

RUN cd security-core && mvn clean install -DskipTests -q
RUN cd model-Entities-Library && mvn clean install -DskipTests -q

# Now build the Product Service
COPY Product-Service ./Product-Service
WORKDIR /app/Product-Service

RUN mvn dependency:go-offline -B -q || true
RUN mvn clean package -DskipTests -q

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY --from=build /app/Product-Service/target/*.jar app.jar

EXPOSE 8031

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8031/actuator/health || exit 1

CMD ["java", "-jar", "app.jar"]
