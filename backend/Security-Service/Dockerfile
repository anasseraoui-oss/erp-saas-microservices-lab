# Build stage
FROM maven:3.8.5-openjdk-17 AS build
LABEL authors="PC_Tarik"
WORKDIR /build
COPY . .
RUN mvn clean package -DskipTests
RUN ls -la /build/target
# Runtime stage
FROM eclipse-temurin:17.0.7_7-jdk-alpine AS runtime
WORKDIR /app/security
COPY --from=build /build/target/*.jar app.jar
EXPOSE 8081
CMD ["java", "-jar", "app.jar"]
