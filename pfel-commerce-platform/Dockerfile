FROM maven:3.9.9-eclipse-temurin-17 AS build

ARG MODULE
WORKDIR /workspace
COPY . .
RUN mvn -q -pl backend/${MODULE} -am -DskipTests package

FROM eclipse-temurin:17-jre-alpine

ARG MODULE
WORKDIR /app
COPY --from=build /workspace/backend/${MODULE}/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

