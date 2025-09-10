FROM ubuntu:latest
# Stage 1: Build the application
FROM maven:3.8.5-openjdk-17 AS build
LABEL authors="PC_Tarik"

WORKDIR /app

# Copy project files
COPY . .

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17.0.7_7-jdk-alpine AS runtime

RUN apk add --no-cache curl

WORKDIR /app

# Copy the jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]