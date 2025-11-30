# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run (Distroless)
FROM gcr.io/distroless/java17-debian12
WORKDIR /app
COPY --from=builder /app/target/citizen-service-1.0.0.jar app.jar
EXPOSE 8082
CMD ["app.jar"]