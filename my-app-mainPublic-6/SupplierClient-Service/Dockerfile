#FROM ubuntu:latest
# Stage 1: Build the application
FROM maven:3.8.5-openjdk-17 AS build
LABEL authors="PC_Tarik"

WORKDIR /app

# Copy project files
COPY security-core ./security-core
RUN cd security-core && mvn clean install -DskipTests -q

# Build Payment Service
COPY SupplierClient-Service ./SupplierClient-Service
WORKDIR /app/SupplierClient-Service
RUN mvn dependency:go-offline -B -q || true
RUN mvn clean package -DskipTests -q

# Stage 2: Run the application
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy the jar from the build stage
COPY --from=build /app/SupplierClient-Service/target/*.jar app.jar

# Expose the application port
EXPOSE 8034
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8031/actuator/health || exit 1
# Run the application
CMD ["java", "-jar", "app.jar"]
