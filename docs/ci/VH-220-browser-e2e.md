# VH-220 — real-browser E2E for locked profiles

Executed 2026-10-17 against main commit `00b06c3` (VH-220 merged): **12/12 PASS** using real React/Vite + Spring Boot + disposable PostgreSQL, Redis and RabbitMQ. Playwright used headless Microsoft Edge.

## What the test verifies

The script `frontend/e2e/profile-lock-live.mjs` creates two users and a disposable event/post/comment via a real backend and an **explicitly isolated** PostgreSQL test container. It verifies that a public profile initially shows its bio/timeline, then the owner switches to PRIVATE using the settings API. Another user sees the lock screen (but still sees name and avatar), cannot list the owner’s profile timeline through its API, and still sees the original post and comment in their public event context with name/avatar preserved and bio redacted. The owner can still view their private bio and timeline. These checks run through HTTP and real browser contexts, not mocked responses.

## Run locally on Windows

Prerequisites: Docker Desktop, Java 23, Node.js, Microsoft Edge, Python and the Python `cryptography` package. Do not run this test against production or an existing developer database. Choose the unused ports shown below.

Start disposable database, Redis, RabbitMQ:

```powershell
docker run -d --rm --name vh220-e2e-pg -e POSTGRES_USER=e2euser -e POSTGRES_PASSWORD=local_test_only -e POSTGRES_DB=vh220_e2e -p 127.0.0.1:15432:5432 postgres:15-alpine
docker run -d --rm --name vh220-e2e-redis -p 127.0.0.1:16379:6379 redis:7-alpine
docker run -d --rm --name vh220-e2e-rabbit -e RABBITMQ_DEFAULT_USER=e2euser -e RABBITMQ_DEFAULT_PASS=local_test_only -p 127.0.0.1:15678:5672 rabbitmq:3.13-management-alpine
python scripts/e2e/create_fake_service_account.py "$env:TEMP\vh220-e2e-fake-gcp.json"
```

Start Spring Boot in **another terminal** with the following environment variables:

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://127.0.0.1:15432/vh220_e2e"
$env:SPRING_DATASOURCE_USERNAME="e2euser"
$env:SPRING_DATASOURCE_PASSWORD="local_test_only"
$env:SPRING_DATA_REDIS_HOST="127.0.0.1"
$env:SPRING_DATA_REDIS_PORT="16379"
$env:SPRING_RABBITMQ_HOST="127.0.0.1"
$env:SPRING_RABBITMQ_PORT="15678"
$env:SPRING_RABBITMQ_USERNAME="e2euser"
$env:SPRING_RABBITMQ_PASSWORD="local_test_only"
$env:SPRING_RABBITMQ_LISTENER_SIMPLE_AUTO_STARTUP="false"
$env:SPRING_RABBITMQ_LISTENER_DIRECT_AUTO_STARTUP="false"
$env:SPRING_MAIL_HOST="127.0.0.1"
$env:MANAGEMENT_HEALTH_MAIL_ENABLED="false"
$env:JWT_SECRET=([guid]::NewGuid().ToString("N")+[guid]::NewGuid().ToString("N"))
$fake=(Join-Path $env:TEMP "vh220-e2e-fake-gcp.json").Replace("\","/")
$env:GCP_CREDENTIALS_PATH="file:///"+$fake
$env:FCM_CREDENTIALS_PATH=$env:GCP_CREDENTIALS_PATH
$env:SERVER_PORT="18080"
$env:APP_FRONTEND_URL="http://localhost:5173"
cd backend
.\gradlew.bat bootRun --no-daemon
```

Start Vite in another terminal. The OpenAPI client is generated rather than checked into the repo:

```powershell
cd frontend
npm ci
npm run generate-api
$env:VITE_API_BASE_URL="http://localhost:18080"
npm run dev -- --host localhost --port 5173 --strictPort
```

Run the E2E test in another terminal:

```powershell
cd frontend
$env:E2E_DISPOSABLE_DB="yes"
$env:E2E_PG_CONTAINER="vh220-e2e-pg"
$env:E2E_PG_DB="vh220_e2e"
$env:E2E_PG_USER="e2euser"
npm run test:e2e:profile-lock
```

The script refuses to seed the DB without explicit test-only flags and a `vh220-e2e-*` container name. It generates unique emails and an ephemeral password. No production cloud key is used. Fake credentials exist only locally and should **never** be committed or used for external cloud APIs.

Stop the Spring Boot/Vite terminals, then clean up:

```powershell
docker rm -f vh220-e2e-pg vh220-e2e-redis vh220-e2e-rabbit
Remove-Item "$env:TEMP\vh220-e2e-fake-gcp.json"
```

This browser E2E does **not** test real GCS uploads or Firebase delivery. It is a local test runner, not yet a GitHub required CI gate.
