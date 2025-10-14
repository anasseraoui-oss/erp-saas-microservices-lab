# Dockerfile for security-core library
FROM maven:3.9.4-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copy security-core source
COPY security-core/ ./

# Build and install the library
RUN mvn clean install -DskipTests

# Create a lightweight image with just the built artifacts
FROM alpine:latest

WORKDIR /maven-repo

# Copy the local maven repository containing our built library
COPY --from=build /root/.m2/repository /maven-repo

# This container will serve as a volume for other services
VOLUME ["/maven-repo"]

# Keep container running
CMD ["tail", "-f", "/dev/null"]