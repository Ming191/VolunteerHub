# VH-112 — Hermetic backend integration tests

## Purpose and boundaries

This suite uses **real disposable PostgreSQL 15, Redis 7 and RabbitMQ 3.13** in Testcontainers on Docker, bootstrapping a minimal Spring Boot application context with production entities, Spring Data repositories, Flyway V1, Redis cache configuration, RabbitMQ routing and the real `EmailQueueService`. It never connects to local developer PostgreSQL/Redis/RabbitMQ ports or real SMTP, GCP, Firebase, or production credentials. Containers start once per class and are stopped by Testcontainers/Ryuk.

Tests use explicit `@DynamicPropertySource` mappings, deterministic fixture timestamps via a fixed `Clock`, and per-test isolation with `TRUNCATE ... CASCADE`, Redis `FLUSHDB` and RabbitMQ queue purges. The fixed clock applies **only to test fixtures**; production services using `LocalDateTime.now()` have not been refactored.

### Covered cases

- Flyway applies the complete schema; JPA persists and queries a volunteer fixture.
- Real PostgreSQL unique index rejects duplicate user email across transactions.
- Waitlist repository returns registrations by **waitlist position**, not insertion order; the database rejects duplicate event-user registration.
- Real `WaitlistService` + `EventCapacityService` enforce capacity and promote the first volunteer after an approved seat is released, then renumber the remaining waitlist. Only the external notification publisher is mocked to prevent outbound side effects.
- Real Redis cache returns cached values, assigns the configured 10-minute TTL and evicts entries.
- `EmailQueueService` publishes a typed verification message via production RabbitMQ exchange, routing key and queue.
- RabbitMQ routes negatively acknowledged email messages to its configured dead-letter queue.
- Existing VH-201 tests cover fresh and legacy Flyway migration, repeatability and data retention.
- Existing MVC tests reject unauthorized `ADMIN` self-registration.

These are integration/regression tests, **not a complete end-to-end application workflow suite**. Email delivery, organizer approval, concurrent registration races, full notification consumers, file uploads and multi-service recovery behavior require separate tickets.

## Running

On a machine with Docker Desktop/Linux Docker daemon running and an available Java 23 toolchain:

```powershell
cd E:\VolunteerHub\backend
.\gradlew.bat test jacocoTestReport --no-daemon
```

For Linux CI:

```sh
cd backend
chmod +x gradlew
./gradlew test jacocoTestReport --no-daemon
```

JUnit XML: `backend/build/test-results/test/`; browsable test report: `backend/build/reports/tests/test/`. JaCoCo XML and HTML: `backend/build/reports/jacoco/test/`; the JaCoCo class filter includes only `service/**`, `worker/**` and `listener/**`, not entity/DTO accessors or controllers. Local baseline (2026-10-17): **19 tests passed**, including 7 infrastructure/business integration tests. Across service/worker/listener classes JaCoCo observed **91 covered of 3,008 lines** (approximately **3.0%**) and 17 of 868 branches. This is an intentionally honest baseline, not a claim of sufficient business coverage or a pass/fail threshold: additional service tests should increase it.

GitHub Actions' `registration-security-tests` runs the whole suite and uploads `backend-test-reports` even if tests fail (14-day retention). No GitHub secret is needed. A PR is blocked if the tests fail because this check is required by `main` branch protection.

## Isolation and resource cautions

- Docker is a hard prerequisite. Do not hide integration tests behind `disabledWithoutDocker=true` or skip the required CI check if Docker is down.
- All fixture emails use `.invalid` domains; no outbound mail leaves the test context.
- The RabbitMQ consumer listener is not included in this narrow context so the test can inspect the messages before a worker consumes them.
- Do not run these tests against a persistent development/production database, even with test-looking credentials.
- The JPA fixtures use fixed timestamps, but existing production code may read wall clock; future time-dependent business services should inject `Clock`.
- Parallel tests are not enabled: `TRUNCATE`, `FLUSHDB` and queue purges operate on the containers shared within the test class.
