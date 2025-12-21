# VolunteerHub

VolunteerHub is a modern, full-stack application connecting volunteers with opportunities. It features a reactive, high-performance frontend and a resilient, microservices-ready backend.

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) (Vite)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Framer Motion](https://www.framer.com/motion/)
- **State Management:** [TanStack Query](https://tanstack.com/query/latest)
- **Routing:** [React Router 7](https://reactrouter.com/)
- **Form Handling:** React Hook Form + Zod
- **Maps:** Leaflet / React Leaflet
- **Testing:** Vitest, Playwright

### Backend
- **Framework:** [Spring Boot 3.5](https://spring.io/projects/spring-boot) (Kotlin 2.2)
- **Runtime:** JDK 23
- **Database:** PostgreSQL 15
- **Caching & Rate Limiting:** Redis 7, Bucket4j
- **Message Queue:** RabbitMQ 3.13
- **Storage:** Google Cloud Storage, Firebase
- **Documentation:** Swagger UI / OpenAPI 3 (SpringDoc)
- **Resiliency:** Resilience4j (Circuit Breaker, Time Limiter)
- **Security:** Spring Security, JWT

### Infrastructure & Monitoring
- **Containerization:** Docker, Docker Compose
- **Monitoring:** Prometheus, Grafana
- **Logging:** Loki, Promtail (Structured JSON Logs)
- **Tracing:** Grafana Tempo (Distributed Tracing/Zipkin)

## 🚀 Getting Started (Installation)

### Option 1: Full-Stack Docker (Recommended)
This is the easiest way to run the entire application (Frontend + Backend + DBs + Monitoring).

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop)

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd volunteerhub
    ```

2.  **Start the application:**
    ```bash
    docker-compose up -d --build
    ```

3.  **Access the services:**
    - **Frontend:** [`http://localhost:5173`](http://localhost:5173)
    - **Backend API:** [`http://localhost:8080`](http://localhost:8080)
    - **API Documentation:** [`http://localhost:8080/swagger-ui.html`](http://localhost:8080/swagger-ui.html)
    - **Grafana (Monitoring):** [`http://localhost:3001`](http://localhost:3001) (User: `admin`, Pass: `admin`)
    - **Prometheus:** [`http://localhost:9090`](http://localhost:9090)

### Option 2: Local Development
Run services individually for development. You will still need Docker for databases (Postgres, Redis, etc.) or install them locally.

#### 1. Start Infrastructure (Databases & Brokers)
You can use Docker Compose to start just the dependencies:
```bash
docker-compose up -d postgres-db redis rabbitmq
```

#### 2. Backend (Spring Boot)
**Prerequisites:** JDK 23
```bash
cd backend
./gradlew bootRun
```
*The API will start at `http://localhost:8080`*

#### 3. Frontend (React)
**Prerequisites:** Node.js 20+
```bash
cd frontend
npm install
npm run dev
```
*The app will start at `http://localhost:5173`*

## ✨ Features

- **Authentication & Authorization**: Secure JWT-based auth with Spring Security.
- **Volunteer Management**: Comprehensive management of volunteer profiles and events.
- **Real-time Notifications**: Integration with Firebase Cloud Messaging (FCM).
- **Resiliency Patterns**: Circuit breakers and time limiters for external service calls.
- **Advanced Rate Limiting**: Distributed rate limiting using Bucket4j and Redis.
- **Full Observability**:
    - **Metrics**: Prometheus & Grafana dashboards.
    - **Tracing**: Distributed tracing (Frontend → Backend → DB) with Grafana Tempo.
    - **logs**: Centralized structured logging with Loki.
- **File Storage**: Secure image uploads to Google Cloud Storage.
- **Interactive Maps**: Event location visualization using Leaflet.

## 🔧 Configuration

The application uses standard environment variables for configuration. See `docker-compose.yml` and `backend/src/main/resources/application.properties` for all options.

| Variable                 | Description    | Default                                         |
| ------------------------ | -------------- | ----------------------------------------------- |
| `SPRING_DATASOURCE_URL`  | PostgreSQL URL | `jdbc:postgresql://localhost:5432/volunteerhub` |
| `SPRING_RABBITMQ_HOST`   | RabbitMQ Host  | `localhost`                                     |
| `SPRING_DATA_REDIS_HOST` | Redis Host     | `localhost`                                     |
