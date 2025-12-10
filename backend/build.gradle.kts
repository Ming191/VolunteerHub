import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "2.2.0"
    kotlin("plugin.spring") version "1.9.25"
	id("org.springframework.boot") version "3.5.6"
	id("io.spring.dependency-management") version "1.1.7"
	kotlin("plugin.jpa") version "1.9.25"
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
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    // Micrometer Prometheus for metrics
    implementation("io.micrometer:micrometer-registry-prometheus")
    implementation("io.micrometer:micrometer-tracing-bridge-brave")
    // Logstash encoder for structured JSON logging
    implementation("net.logstash.logback:logstash-logback-encoder:8.0")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
	runtimeOnly("org.postgresql:postgresql")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
	testImplementation("org.springframework.security:spring-security-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    // https://mvnrepository.com/artifact/io.jsonwebtoken/jjwt-api
    implementation("io.jsonwebtoken:jjwt-api:0.13.0")
    // https://mvnrepository.com/artifact/io.jsonwebtoken/jjwt-impl
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.13.0")
    // https://mvnrepository.com/artifact/io.jsonwebtoken/jjwt-jackson
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.13.0")

	implementation("org.apache.commons:commons-csv:1.10.0")
    // https://mvnrepository.com/artifact/com.google.cloud/google-cloud-storage
    implementation("com.google.cloud:google-cloud-storage:2.59.0")
    implementation("org.springframework.boot:spring-boot-starter-amqp")

    implementation("org.springframework.boot:spring-boot-starter-cache")
    implementation("org.springframework.boot:spring-boot-starter-data-redis")

    // Bucket4j for rate limiting with Redis support
    implementation("com.bucket4j:bucket4j_jdk17-core:8.15.0")
    implementation("com.bucket4j:bucket4j_jdk17-redis-common:8.15.0")
    implementation("com.bucket4j:bucket4j_jdk17-lettuce:8.15.0")

    // https://mvnrepository.com/artifact/com.google.firebase/firebase-admin
    implementation("com.google.firebase:firebase-admin:9.7.0")
    implementation("org.springframework.boot:spring-boot-starter-aop")

    // Resilience4j for Circuit Breaker pattern
    implementation("io.github.resilience4j:resilience4j-spring-boot3:2.3.0")
    implementation("io.github.resilience4j:resilience4j-circuitbreaker:2.3.0")
    implementation("io.github.resilience4j:resilience4j-timelimiter:2.3.0")
    implementation("io.github.resilience4j:resilience4j-micrometer:2.3.0")

    // https://mvnrepository.com/artifact/org.webjars/swagger-ui
    implementation("org.webjars:swagger-ui:5.30.1")

    // https://mvnrepository.com/artifact/org.springdoc/springdoc-openapi-starter-webmvc-api
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-api:2.8.13")

    // https://mvnrepository.com/artifact/org.springdoc/springdoc-openapi-starter-webmvc-ui
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.13")

    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    // https://mvnrepository.com/artifact/io.mailtrap/mailtrap-java
    implementation("io.mailtrap:mailtrap-java:1.1.0")
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