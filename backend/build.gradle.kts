import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    jacoco
    kotlin("jvm") version "2.4.21"
    kotlin("plugin.spring") version "2.4.21"
	id("org.springframework.boot") version "3.5.16"
	id("io.spring.dependency-management") version "1.1.7"
	kotlin("plugin.jpa") version "2.4.21"
}

group = "com.cs2"
version = "0.0.1-SNAPSHOT"
description = "Demo project for Spring Boot"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(23)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.flywaydb:flyway-core")
    runtimeOnly("org.flywaydb:flyway-database-postgresql")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    // Micrometer Prometheus for metrics
    implementation("io.micrometer:micrometer-registry-prometheus")
    implementation("io.micrometer:micrometer-tracing-bridge-brave")
    implementation("io.zipkin.reporter2:zipkin-reporter-brave")
    // Logstash encoder for structured JSON logging
    implementation("net.logstash.logback:logstash-logback-encoder:9.0")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
	runtimeOnly("org.postgresql:postgresql")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.testcontainers:postgresql")
    testImplementation("org.testcontainers:junit-jupiter")
    testImplementation("org.testcontainers:rabbitmq")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
	testImplementation("org.springframework.security:spring-security-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    // https://mvnrepository.com/artifact/io.jsonwebtoken/jjwt-api
    implementation("io.jsonwebtoken:jjwt-api:0.13.0")
    // https://mvnrepository.com/artifact/io.jsonwebtoken/jjwt-impl
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.13.0")
    // https://mvnrepository.com/artifact/io.jsonwebtoken/jjwt-jackson
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.13.0")

	implementation("org.apache.commons:commons-csv:1.14.1")
    // https://mvnrepository.com/artifact/com.google.cloud/google-cloud-storage
    implementation("software.amazon.awssdk:s3:2.31.0")
    implementation("org.springframework.boot:spring-boot-starter-amqp")

    implementation("org.springframework.boot:spring-boot-starter-cache")
    implementation("org.springframework.boot:spring-boot-starter-data-redis")

    // Bucket4j for rate limiting with Redis support
    implementation("com.bucket4j:bucket4j_jdk17-core:8.21.0")
    implementation("com.bucket4j:bucket4j_jdk17-redis-common:8.21.0")
    implementation("com.bucket4j:bucket4j_jdk17-lettuce:8.21.0")

    // https://mvnrepository.com/artifact/com.google.firebase/firebase-admin
    implementation("com.google.firebase:firebase-admin:9.11.0")
    implementation("org.springframework.boot:spring-boot-starter-aop")

    // Resilience4j for Circuit Breaker pattern
    implementation("io.github.resilience4j:resilience4j-spring-boot3:2.4.0")
    implementation("io.github.resilience4j:resilience4j-circuitbreaker:2.4.0")
    implementation("io.github.resilience4j:resilience4j-timelimiter:2.4.0")
    implementation("io.github.resilience4j:resilience4j-micrometer:2.4.0")

    // https://mvnrepository.com/artifact/org.webjars/swagger-ui
    implementation("org.webjars:swagger-ui:5.33.2")

    // https://mvnrepository.com/artifact/org.springdoc/springdoc-openapi-starter-webmvc-api
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-api:2.9.1")

    // https://mvnrepository.com/artifact/org.springdoc/springdoc-openapi-starter-webmvc-ui
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.9.1")

    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    // https://mvnrepository.com/artifact/io.mailtrap/mailtrap-java
    implementation("io.mailtrap:mailtrap-java:1.9.0")

    // https://mvnrepository.com/artifact/com.google.guava/guava
    implementation("com.google.guava:guava:33.7.2-jre")
}

kotlin {
	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict")
	}
}

allOpen {
	annotation("jakarta.persistence.Entity")
	annotation("jakarta.persistence.MappedSuperclass")
	annotation("jakarta.persistence.Embeddable")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
val compileKotlin: KotlinCompile by tasks
compileKotlin.compilerOptions {
    freeCompilerArgs.set(listOf("-Xannotation-default-target=param-property"))
}

jacoco {
    toolVersion = "0.8.13"
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
    // Business logic coverage only; exclude DTOs, JPA entities and accessors.
    classDirectories.setFrom(files(classDirectories.files.map { output ->
        fileTree(output) {
            include(
                "com/cs2/volunteer_hub/service/**",
                "com/cs2/volunteer_hub/worker/**",
                "com/cs2/volunteer_hub/listener/**"
            )
        }
    }))
}