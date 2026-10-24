# VH-106: Actuator and internal network exposure

The repository's Docker Compose file is a **local-development stack**, not a public deployment. The API, RustFS console and storage proxy, and Grafana bind to `127.0.0.1` on the Docker host. PostgreSQL, Redis, RabbitMQ (including management), Prometheus, Loki, Tempo, and Promtail have **no published ports**. Data and observability are separate `internal: true` Docker networks. A third network provides outbound access for the backend (for example SMTP).

## Required local credentials

Supply the following environment variables before `docker compose up -d --build`. Generate each password independently; do not commit values or reuse the demo passwords from the old Compose file.

| Variable | Service |
| --- | --- |
| `JWT_SECRET` | Backend Base64 JWT signing secret, 32+ random bytes |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL and backend datasource |
| `SPRING_RABBITMQ_PASSWORD` | RabbitMQ and backend client |
| `RATE_LIMIT_REDIS_PASSWORD` | Redis and backend Redis clients |
| `GF_SECURITY_ADMIN_PASSWORD` | Grafana administrator |

Optional: `SPRING_DATASOURCE_USERNAME` and `SPRING_RABBITMQ_USERNAME` default to `vh_local`. Passwords have **no defaults**. For JWT use `openssl rand -base64 32`; for each infrastructure password use `openssl rand -hex 32` and inject it through your local environment or secret manager. The existing PostgreSQL/RabbitMQ volumes may still contain the former credentials; rotate those accounts or provision fresh disposable *local* volumes separately. Do not delete a persisted volume without checking its data.

If port `3001` is already occupied by another local application, set `GRAFANA_HOST_PORT` to a free loopback port before starting Compose. Do not change the `127.0.0.1` host binding.

## Actuator boundary

- Spring management endpoints are on port **8081**, separate from the application port **8080**.
- Outside Compose, the management listener defaults to `127.0.0.1:8081`. Inside Compose it listens on the container interface but port 8081 is not published, and Prometheus scrapes `backend:8081` through the isolated observability network.
- Only `health` and `prometheus` are exposed on the management listener. `health` reveals no component details, and all other Actuator routes are denied by the application security configuration.
- Prometheus is reachable without application JWT authentication *only through the private management network*. Never forward or publish management port 8081, route it through an internet-facing reverse proxy, or attach untrusted containers to the observability bridge. Public API clients cannot reach it on port 8080.
- Grafana requires a user-generated admin password, permits no anonymous access or public dashboards, and is bound to host loopback. Remote administrators should use authenticated SSH tunneling or a separately configured TLS + access-controlled proxy, not publish its port directly.

TLS termination, deployment-specific firewall/ingress policy, and hardened production images belong to VH-301. Nothing in this ticket enables public plaintext admin access.

## Verify bindings and connectivity

From the project root with Docker Compose installed:

```bash
python3 docker/verify-vh106-exposure.py --config-only
docker compose up -d --build
python3 docker/verify-vh106-exposure.py
docker compose exec -T prometheus wget -qO- http://backend:8081/actuator/prometheus
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/actuator/prometheus
```

The first two checks require no Docker daemon and a running stack, respectively. The Prometheus container should be able to scrape an internal metrics response; the public API port should return **404** for `/actuator/prometheus` (never 200). Check `docker compose ps` to confirm only loopback-published ports. From **another machine** on the same reachable network, run:

```bash
python3 docker/verify-vh106-exposure.py --external-host <deployment-host-IP>
```

This TCP scan checks 8080, 8081, 3001, the storage UI ports, and the formerly published DB, MQ, cache, and monitoring ports. Add `--extra-port 13001` if you overrode `GRAFANA_HOST_PORT`. All should reject inbound connections to the host's non-loopback address. If the host already runs unrelated services on these ports, inspect them individually before interpreting the scan. For production, also verify equivalent ingress/firewall rules from outside the trusted network.
