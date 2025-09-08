FROM ubuntu:latest
#LABEL authors="PC_ANASS"
#FROM maven:4.0.0-jdk-21-alim
#COPY src /A/src
#COPY pom.xml /A
#RUN mvn -f /A/ppm.xml
#ENTRYPOINT ["top", "-b"]
# Stage 1: Build the application
FROM maven:3.8.5-openjdk-17 AS build
LABEL authors="PC_Tarik"
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8035
CMD ["java", "-jar", "app.jar"]
