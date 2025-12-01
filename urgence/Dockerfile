# ----------------------------------------------------------------------
# Stage 1: Build Stage (Maven + JDK)
# We use a full JDK image to compile the Java code and generate Protobufs.
# ----------------------------------------------------------------------
FROM maven:3.9.5-eclipse-temurin-17 AS build

WORKDIR /app

# Copy the pom.xml first to leverage Docker layer caching for dependencies
COPY pom.xml .

# Download dependencies (this layer will be cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Copy the source code (including .proto files)
COPY src ./src

# Build the application (skipping tests for speed in this context)
RUN mvn clean package -DskipTests

# ----------------------------------------------------------------------
# Stage 2: Runtime Stage (Distroless)
# We use Google's Distroless image for Java 17.
# It contains only the JVM and standard libraries. No shell, no package manager.
# ----------------------------------------------------------------------
FROM gcr.io/distroless/java17-debian12

WORKDIR /app

# Copy the compiled JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the gRPC port
EXPOSE 9090

# Distroless images don't have a shell, so we execute java directly.
ENTRYPOINT ["java", "-jar", "app.jar"]