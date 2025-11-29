# Multi-stage build for optimized image size

# Stage 1: Build stage
FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /app

# Copy gradle files first for better caching
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle gradle/
COPY gradlew ./
COPY gradlew.bat ./

# Grant execution rights on the gradlew wrapper
RUN chmod +x ./gradlew

# Download dependencies (this layer will be cached if dependencies don't change)
RUN ./gradlew dependencies --no-daemon || true

# Copy source code
COPY src ./src

# Build the application
RUN ./gradlew bootJar --no-daemon -x test

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create a non-root user
RUN addgroup -S spring && adduser -S spring -G spring

# Copy the built jar from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Copy resources if needed (credentials, etc.)
# Note: Ensure these files exist or adjust accordingly. 
# The original Dockerfile copied application.properties from src/main/resources.
# If you use external config, you might mount it as a volume instead.
COPY --from=build /app/src/main/resources/application.properties ./config/application.properties

# Change ownership to the non-root user
RUN chown -R spring:spring /app

# Switch to non-root user
USER spring:spring

# Expose the application port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
