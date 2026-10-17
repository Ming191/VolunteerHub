# VH-105-02: Object-level authorization remediation

Baseline: `main` at `56106ac` after PR #85. Implementation branch: `fix/vh-105-02-authz-regressions`.

## Scope

- F01: `POST /api/reports` now resolves the target POST/COMMENT and verifies visibility of its parent event **before** saving the report or notifying administrators. A missing or hidden target is a 404; authorized readers can report.
- F02: `GET /api/events/{id}/attendees` applies the event-read policy before the attendee-specific permission. Former approved participants cannot view a roster after event cancellation; event creator/admin may still view according to established hidden-event policy.
- F03: wrong-author comment PUT/DELETE throws `UnauthorizedAccessException` (mapped by `GlobalExceptionHandler` to 403), not `IllegalAccessException` (previously generic 500).
- F04: `POST /api/auth/logout-all` explicitly requires authentication in both security matcher order and `@PreAuthorize`. Anonymous requests get 401 with an explicit authentication entrypoint; logged-in users can revoke their own sessions.

## Reproduce old behavior (RED)

From the unmodified production code (before fixes) with new regression tests in `InfrastructureIntegrationTest`:

```
./gradlew.bat test --tests '*InfrastructureIntegrationTest.vh10502*' --no-daemon --console=plain
3 tests completed, 3 failed
```

Failures reproduced: (1) creation of reports on hidden post/comment, (2) former approved attendee reading cancelled-event roster, and (3) wrong-author comment edit/delete throwing `IllegalAccessException`.

## Confirm the fixes (GREEN)

Run identical Testcontainers tests after fixes:

```
./gradlew.bat test --tests '*InfrastructureIntegrationTest.vh10502*' --no-daemon --console=plain
BUILD SUCCESSFUL
```

Real PostgreSQL 15, Redis 7 and RabbitMQ 3.13 Testcontainers; no production credentials or datasets.

`AuthLogoutAllAuthorizationHttpTest` additionally covers anonymous 401 and authenticated 200 using Spring Security and MockMvc. Before configuring the authentication entrypoint, the isolated HTTP security test observed 403 instead of the required 401. After updating SecurityConfig, both tests pass.

## Regression and remaining boundaries

- The tests exercise the service/database permission checks and Spring Security MVC authentication for F04. They do **not** constitute the comprehensive endpoint matrix/browser E2E required by VH-105-03.
- Admin-only `GET /api/reports/{id}` remains untouched. Organizer-scoped moderation/PII redaction is specified separately in VH-225.
- Actuator exposure VH-106, media object provenance VH-107, report review atomicity VH-213, and product-route public/anonymous contract VH-114 are not silently changed in this PR.
- Parent VH-105 remains In Progress until VH-105-03 completes the 401/403/404 two-account HTTP regression matrix.

## Full backend validation

- Windows Docker Desktop: `gradlew.bat test jacocoTestReport --no-daemon --console=plain`.
- Result: **BUILD SUCCESSFUL**, 46 tests in 5 suites, 0 failures, 0 errors, 0 skipped. JaCoCo report generated.
- Verified locally on 2026-10-17, with disposable Testcontainers; no production services accessed.
