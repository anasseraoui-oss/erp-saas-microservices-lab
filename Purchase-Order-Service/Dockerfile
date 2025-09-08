FROM ubuntu:latest
FROM maven:3.8.5-openjdk-17 AS build
LABEL authors="PC_Tarik"
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests
FROM eclipse-temurin:17.0.7_7-jdk-alpine AS runtime
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8033
CMD ["java", "-jar", "app.jar"]
