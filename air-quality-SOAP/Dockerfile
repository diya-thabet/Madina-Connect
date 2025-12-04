# --- STAGE 1: BUILD (Maven) ---
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app
COPY pom.xml .
COPY src ./src

# This command compiles the code AND generates the sources from XSD
RUN mvn clean package -DskipTests

# --- STAGE 2: RUNTIME (Distroless Java) ---
FROM gcr.io/distroless/java17-debian12

WORKDIR /app
COPY --from=builder /app/target/soap-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["app.jar"]