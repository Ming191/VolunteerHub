# VolunteerHub

VolunteerHub is a modern application connecting volunteers with opportunities. It features a reactive frontend and a resilient microservices-ready backend.

## Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4, Radix UI, Framer Motion
- **State Management:** TanStack Query
- **Routing:** React Router 7
- **Form Handling:** React Hook Form + Zod

### Backend
- **Framework:** Spring Boot 3.5.6 (Kotlin)
- **Database:** PostgreSQL
- **Caching & Rate Limiting:** Redis, Bucket4j
- **Message Queue:** RabbitMQ
- **Storage:** Google Cloud Storage, Firebase
- **Documentation:** Swagger UI / OpenAPI 3
- **Resiliency:** Resilience4j (Circuit Breaker, Time Limiter)

### Infrastructure & Monitoring
- **Containerization:** Docker, Docker Compose
- **Monitoring:** Prometheus, Grafana
- **Logging:** Loki, Promtail (JSON Structured Logs)
- **Tracing:** Grafana Tempo (Distributed Tracing)

## Features

- **Authentication & Authorization**: JWT-based auth with secure password hashing.
- **Volunteer Management**: Create and manage volunteer profiles and opportunities.
- **Real-time Notifications**: Firebase Cloud Messaging (FCM) integration for push notifications.
- **Resiliency**: Circuit breakers and time limiters for external services (object storage, RabbitMQ, Prometheus).
- **Rate Limiting**: Intelligent rate limiting using Bucket4j and Redis to prevent abuse.
- **Monitoring**: Comprehensive metrics with Prometheus and Grafana dashboards.
- **Distributed Tracing**: Full request tracing (Frontend -> Backend -> DB) with Grafana Tempo.
- **Centralized Logging**: Structured logs with Loki and Promtail.
- **File Storage**: Secure image uploads through an S3-compatible adapter (RustFS for local development).

## Configuration

The application uses standard Spring Boot configuration. Key environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/volunteerhub` |
| `SPRING_DATASOURCE_USERNAME` | Database username | Demo only in `dev/test` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | Required in `prod` |
| `SPRING_RABBITMQ_HOST` | RabbitMQ host | Localhost only outside `prod` |
| `SPRING_RABBITMQ_PASSWORD` | RabbitMQ password | Required in `prod` |
| `SPRING_MAIL_PASSWORD` | SMTP password | Required in `prod` |
| `SPRING_DATA_REDIS_HOST`, `RATE_LIMIT_REDIS_PASSWORD` | Redis endpoint and password | Required in `prod` |
| `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY` | S3-compatible storage credentials | Required in `prod` |
| `JWT_SECRET` | Base64 HMAC key, at least 32 random bytes | Required in all profiles |

Choose `SPRING_PROFILES_ACTIVE=dev` for a locally started backend, `docker` for the local Compose stack, or `prod` for deployment. See [VH-103 environment matrix and rotation instructions](docs/security/VH-103-configuration.md). Do not use local demo credentials or Docker Compose in production.

## Getting Started

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop)
- [Node.js](https://nodejs.org/) (for local frontend dev)
- [JDK 23](https://adoptium.net/) (for local backend dev)

### Quick Start (Docker)

The easiest way to run the entire stack is using Docker Compose. **Before starting, provision JWT_SECRET via a secure secret store or your local shell**, for example `export JWT_SECRET=$(openssl rand -base64 32)` for local development only. Never add this value to Git. Rotating the key invalidates existing access JWTs. Refer to `docs/security/VH-102-incident-response.md` for exposed-credential response.

```bash
docker-compose up -d --build
```
This will start:
- Backend API (`http://localhost:8080`)
- Frontend is not currently in docker-compose, run locally (see below)
- PostgreSQL
- RabbitMQ
- Redis
- Prometheus (`http://localhost:9090`)
- Grafana (`http://localhost:3001` - user/pass: admin/admin)
- Loki (Logs) & Tempo (Traces) - Integrated into Grafana
- Promtail (Log Shipper)

### Local Development

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
Access at `http://localhost:5173`.

#### Backend
```bash
export JWT_SECRET=$(openssl rand -base64 32)
cd backend
./gradlew bootRun
```
Access API docs at `http://localhost:8080/swagger-ui.html`.

### Testing

#### Backend Tests
Run unit and integration tests using Gradle:
```bash
cd backend
./gradlew test
```



## Project Structure

- `backend/` - Spring Boot application
- `frontend/` - React application
- `monitoring/` - Prometheus & Grafana configuration
- `docker-compose.yml` - Container orchestration

## Database migrations

Flyway manages PostgreSQL schema changes; Hibernate runs with `ddl-auto=validate` and does not create/alter tables. Fresh databases migrate automatically. Existing Hibernate-managed databases require a reviewed one-time baseline: see [VH-201 migration guide](docs/database/VH-201-flyway.md). Never set `VH_FLYWAY_BASELINE_ON_MIGRATE=true` permanently.

## Environment Variables

Check `backend/src/main/resources/application.properties` and `docker-compose.yml` for configuration details (Database credentials, API keys, etc).
