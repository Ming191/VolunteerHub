FROM eclipse-temurin:23-jdk-alpine AS build
WORKDIR /workspace/app

# Copy gradle wrapper and build files first (for better layer caching)
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

# Fix line endings and permissions for gradlew
RUN sed -i 's/\r$//' gradlew && \
    chmod +x gradlew

# Download dependencies (this layer will be cached unless build.gradle.kts changes)
RUN sh ./gradlew dependencies --no-daemon

# Copy source code
COPY src src

# Build application with build cache enabled
RUN --mount=type=cache,target=/root/.gradle \
    sh ./gradlew bootJar -x test --no-daemon --build-cache --parallel

# Production stage with optimized JRE
FROM eclipse-temurin:23-jre-alpine

# Add non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Create temp upload directory with proper permissions
RUN mkdir -p /tmp/temp-uploads && chown spring:spring /tmp/temp-uploads

USER spring:spring

VOLUME /tmp
ARG JAR_FILE=/workspace/app/build/libs/*.jar
COPY --from=build ${JAR_FILE} app.jar

# Use JVM optimization flags for containerized environments
ENTRYPOINT ["java","-XX:+UseContainerSupport","-XX:MaxRAMPercentage=75.0","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]
