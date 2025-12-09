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

## Features

- **Authentication & Authorization**: JWT-based auth with secure password hashing.
- **Volunteer Management**: Create and manage volunteer profiles and opportunities.
- **Real-time Notifications**: Firebase Cloud Messaging (FCM) integration for push notifications.
- **Resiliency**: Circuit breakers and time limiters for external services (GCS, RabbitMQ, Prometheus).
- **Rate Limiting**: Intelligent rate limiting using Bucket4j and Redis to prevent abuse.
- **Monitoring**: Comprehensive metrics with Prometheus and Grafana dashboards.
- **File Storage**: Secure image upload to Google Cloud Storage.

## Configuration

The application uses standard Spring Boot configuration. Key environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/volunteerhub` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `myuser` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `mypassword` |
| `SPRING_RABBITMQ_HOST` | RabbitMQ host | `localhost` |
| `SPRING_DATA_REDIS_HOST` | Redis host | `localhost` |
| `JWT_SECRET` | Secret key for JWT signing | (See `application.properties`) |
| `GCS_BUCKET_NAME` | Google Cloud Storage bucket | `volunteerhub-bucket` |

## Getting Started

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop)
- [Node.js](https://nodejs.org/) (for local frontend dev)
- [JDK 23](https://adoptium.net/) (for local backend dev)

### Quick Start (Docker)

The easiest way to run the entire stack is using Docker Compose.

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

## Environment Variables

Check `backend/src/main/resources/application.properties` and `docker-compose.yml` for configuration details (Database credentials, API keys, etc).
