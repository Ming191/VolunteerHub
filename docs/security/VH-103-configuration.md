# VH-103: Environment configuration and secret rotation

Spring profiles are explicit. **Never activate `dev`, `test`, or `docker` in a production deployment.**

| Profile | Intended use | Credential source | Storage |
| --- | --- | --- | --- |
| `dev` | local Gradle/API development | local demo overrides in `application-dev.properties` | RustFS |
| `test` | Gradle/JUnit only | isolated test-only overrides | disposable test stores |
| `docker` | local Compose, includes `dev` group | Compose demo credentials, optional local overrides | RustFS |
| `prod` | deployed backend | external environment/secret injection, no fallback | externally managed HTTPS S3 |

## Startup

- Local Kotlin backend: set `SPRING_PROFILES_ACTIVE=dev` and supply a new `JWT_SECRET`.
- Tests: `cd backend && ./gradlew test`; Gradle selects `test`.
- Docker Compose: set `JWT_SECRET` in the shell before `docker compose up --build`. Compose activates `docker` + `dev` locally.
- Production: `SPRING_PROFILES_ACTIVE=prod` and inject every variable below before deployment. `prod` refuses missing secrets, local profiles, non-HTTPS public/storage endpoints, and HTTP CORS origins.

Generate your own JWT secret, minimum 32 random bytes, Base64 encoded: `openssl rand -base64 32`. Do not commit its output.

## Production environment example

The values below are **placeholders**, not usable credentials:

```dotenv
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<base64-of-32+-cryptographically-random-bytes>
SPRING_DATASOURCE_URL=jdbc:postgresql://db.example.com:5432/volunteerhub
SPRING_DATASOURCE_USERNAME=<db-user>
SPRING_DATASOURCE_PASSWORD=<db-password>
SPRING_RABBITMQ_HOST=mq.example.com
SPRING_RABBITMQ_USERNAME=<mq-user>
SPRING_RABBITMQ_PASSWORD=<mq-password>
SPRING_MAIL_HOST=smtp.example.com
SPRING_MAIL_USERNAME=<sender@example.com>
SPRING_MAIL_PASSWORD=<smtp-password>
SPRING_DATA_REDIS_HOST=redis.example.com
RATE_LIMIT_REDIS_PASSWORD=<redis-password>
STORAGE_ENDPOINT=https://s3.example.com
STORAGE_PRESIGN_ENDPOINT=https://s3.example.com
STORAGE_PUBLIC_BASE_URL=https://files.example.com
STORAGE_BUCKET=<bucket-name>
STORAGE_ACCESS_KEY=<storage-access-key>
STORAGE_SECRET_KEY=<storage-secret-key>
APP_FRONTEND_URL=https://app.example.com
FRONTEND_ALLOWED_ORIGINS=https://app.example.com
```

Use your runtime secret provider's injection facility. No Vault/cloud infrastructure is required for this local milestone. If FCM is enabled, supply `FCM_CREDENTIALS_PATH` as a mounted secret file location; FCM remains disabled by default.

## Rotation and verification

1. Rotate DB, RabbitMQ, SMTP, Redis, storage, and JWT credentials at their providers, then replace injected values; restart the backend. Avoid printing values in logs.
2. A JWT signing-key rotation invalidates previously issued access tokens. Existing refresh-token sessions can be revoked server-side as needed. Schedule a user re-login window.
3. Test `prod` with a required variable absent, with insecure HTTP storage URL, with `prod,dev` together, and with invalid JWT Base64. All must reject startup/config validation.
4. Run `./gradlew test` and a secret scanner against the diff/history before merge.

Production `storage.bootstrap-bucket=false`: bucket ownership, CORS, TLS, and credentials must be provisioned outside this application. The Docker Compose stack is **local-only** and includes intentionally weak demo infrastructure passwords.
