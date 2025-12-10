FROM eclipse-temurin:23-jdk AS build
WORKDIR /workspace/app

COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .
# Fix line endings and permissions for gradlew FIRST
RUN sed -i 's/\r$//' gradlew && \
    chmod +x gradlew

# Download dependencies (this layer will be cached unless build.gradle.kts changes)
RUN sh ./gradlew dependencies --no-daemon

COPY src src

RUN sh ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:23-jre-alpine
VOLUME /tmp
COPY --from=build /workspace/app/build/libs/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
