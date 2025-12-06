FROM eclipse-temurin:23-jdk AS build
WORKDIR /workspace/app

COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .
COPY src src

# Fix line endings and permissions
RUN sed -i 's/\r$//' gradlew && \
    chmod +x gradlew

RUN ls -la
RUN sh ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:23-jre-alpine
VOLUME /tmp
COPY --from=build /workspace/app/build/libs/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
