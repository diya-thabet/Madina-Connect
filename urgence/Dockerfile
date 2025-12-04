# Stage 1: Build the JAR
# FIX: Changed from 'alpine' to 'jammy' (Ubuntu/Debian based).
# This provides the 'glibc' library required to run the gRPC generator (protoc).
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .

# Ensure the wrapper is executable
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Stage 2: Distroless Runtime (Minimal & Secure)
# We keep this part exactly the same!
FROM gcr.io/distroless/java21-debian12

COPY --from=build /app/target/*.jar /app/app.jar

# Expose ports
EXPOSE 9090 8081

ENTRYPOINT ["java", "-jar", "/app/app.jar"]