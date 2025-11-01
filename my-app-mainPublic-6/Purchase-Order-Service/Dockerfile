FROM ubuntu:latest
FROM maven:3.8.5-openjdk-17 AS build
LABEL authors="PC_Tarik"
WORKDIR /app

# Copy and build shared libraries
COPY security-core ./security-core
RUN cd security-core && mvn clean install -DskipTests -q

COPY Purchase-Order-Service ./Purchase-Order-Service
WORKDIR /app/Purchase-Order-Service
RUN mvn dependency:go-offline -B -q || true
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17.0.7_7-jdk-alpine AS runtime
WORKDIR /app
COPY --from=build /app/Purchase-Order-Service/target/*.jar app.jar
EXPOSE 8033
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8031/actuator/health || exit 1
CMD ["java", "-jar", "app.jar"]
