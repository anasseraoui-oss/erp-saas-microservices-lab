# Stage 1: Build the application
FROM maven:3.8.5-openjdk-17 AS build
LABEL authors="PC_Tarik"

WORKDIR /app

# Copy and build shared libraries
COPY security-core ./security-core
COPY model-Entities-Library ./model-Entities-Library

RUN cd security-core && mvn clean install -DskipTests -q
RUN cd model-Entities-Library && mvn clean install -DskipTests -q

# Build Payment Service
COPY Notification-Service ./Notification-Service
WORKDIR /app/Notification-Service
RUN mvn dependency:go-offline -B -q || true
RUN mvn clean package -DskipTests -q


# Stage 2: Run the application
FROM eclipse-temurin:17.0.7_7-jdk-alpine AS runtime

#RUN apk add --no-cache curl
#RUN curl http://eureka-server:8761/eureka


WORKDIR /app

# Copy the jar from the build stage
COPY --from=build /app/Notification-Service/target/*.jar app.jar

#ENV SPRING_CONFIG_IMPORT=optional:file:/app/eureka.env
# Expose the application port
EXPOSE 9000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8031/actuator/health || exit 1
# Run the application
CMD ["java", "-jar", "app.jar"]