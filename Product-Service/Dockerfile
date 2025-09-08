# Stage 1: Build the application
FROM maven:3.8.5-openjdk-17 AS build
LABEL authors="PC_Tarik"

WORKDIR /app

# Copy Maven project files
COPY . .

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy the jar from the build stage
COPY --from=build /app/target/*.jar app.jar

#COPY ../env/eureka.env /app/env/eureka.env

# Expose the port the app runs on
EXPOSE 8031

# Run the application
CMD ["java", "-jar", "app.jar"]
