#FROM ubuntu:latest
# Stage 1: Build the application
FROM maven:3.8.5-openjdk-17 AS build
LABEL authors="PC_Tarik"

WORKDIR /app

# Copy and build shared libraries
COPY security-core ./security-core
RUN cd security-core && mvn clean install -DskipTests -q

# Copy project files
COPY Sales-Order-Service ./Sales-Order-Service
WORKDIR /app/Sales-Order-Service
RUN mvn dependency:go-offline -B -q || true
# Build the application
RUN mvn clean package -DskipTests
# Stage 2: Run the application
FROM eclipse-temurin:17.0.7_7-jdk-alpine AS runtime

WORKDIR /app

# Copy the jar from the build stage
COPY --from=build /app/Sales-Order-Service/target/*.jar app.jar

# Expose the application port
EXPOSE 8032

# Run the application
CMD ["java", "-jar", "app.jar"]
