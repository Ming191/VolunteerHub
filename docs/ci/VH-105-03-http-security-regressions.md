# VH-105-03: Signed-JWT HTTP authorization regression suite

Target: PR #87 branch `fix/vh-105-02-authz-regressions` at commit `3a785b8`. The VH-105-03 PR must target that branch **until #87 lands**. Do not merge this test-only branch into `main` without its fixes.

## Test boundaries

`backend/src/test/kotlin/com/cs2/volunteer_hub/integration/AuthorizationHttpIntegrationTest.kt` implements **12 scenario-level HTTP integration tests** (each scenario may issue many requests).

- Spring MVC `MockMvc` invokes the **production `SecurityConfig.securityFilterChain`**, the real `JwtAuthenticationFilter` and `CustomUserDetailsService`.
- Authenticated requests use **signed JWTs** issued by the real `JwtTokenProvider` with a synthetic **test-only** signing key. The filter retrieves actual user authorities from the fixture database. No `@WithMockUser` shortcuts.
- Disposable Testcontainers: PostgreSQL 15, Redis 7, RabbitMQ 3.13. User fixture IDs and caches are reset between scenarios.
- Admin dashboard/export/business dependencies not relevant to these permission checks are mocked, so these particular tests prove **role enforcement**, not correctness of those downstream services.
- No real GCS credentials, external network, production data, actual browser session, or deployment proxy are used. This is HTTP-level integration testing, not an external penetration test or browser E2E.

## Authorization contract matrix

| Scope | Actor pair / fixture | Negative expectation | Positive or side-effect assertion |
|---|---|---|---|
| Protected route entry | Anonymous and malformed JWT, about 15 guarded GET routes plus POST mutations | 401, never 500 | Valid signed JWT exercise below |
| ADMIN endpoints | Volunteer / Organizer | 403 for reports, export, admin dashboard, users | Before admin handler invocation |
| Organizer routes | Volunteer | 403 for manager reads and organizer dashboard | Role enforced by controller |
| Event registrations | Organizer A reads A then Organizer B reads A | 403 for B; also volunteer; cold and warm Redis | Owner A sees own list, B sees own empty list |
| Registration queries/mutations | Organizer B targets A's registration/event | 403 on search, status, active, completed, waitlist, PATCH status, mark complete and promote | Unchanged registration |
| Event/post visibility | Volunteer B targets Organizer A PENDING event | 404 event/gallery/posts/post/comments (flat + nested) | Owner sees own hidden event |
| Report creation | Outsider reports comment from PENDING event | 404 | No report persists |
| Signed GCS upload capability | Unapproved Volunteer attempts to mint URL | 403 | Zero storage signer interactions |
| Comments | Foreign author attempts PUT/DELETE | 403, not 500 | Stored content unchanged |
| Cancelled event attendee roster | Previously approved Volunteer | 404 after cancellation | Previously published roster readable; owner/admin allowed after cancel |
| Report privacy | Another volunteer attempts to view reporter's report | Only reporter sees report in `/my`; Organizer forbidden by arbitrary report ID | ADMIN can fetch by ID |
| Locked user profile | Other volunteer views private user | 200 with bio redacted | Owner can read own bio |
| Event / post mutations | Organizer B deletes or cancels A event; edits or deletes A post | 403 | Event remains PUBLISHED, post content unchanged |
| Likes | Volunteer outside nonpublished event likes owner's post | 403 | Authorization checked through parent event |

Note that positive/negative behavior comes from the endpoint, service and repository layers; source-code reasoning without live HTTP is not counted as a passed test.

## How to run

From `backend` on a machine with Java 23, Docker and a running Docker daemon:

```powershell
.\gradlew.bat test --tests '*AuthorizationHttpIntegrationTest*' --no-daemon --console=plain
.\gradlew.bat test jacocoTestReport --no-daemon --console=plain
```

The second command also runs VH-105-02 regressions and older Testcontainers tests.

## Remaining release gates

This suite exercises **critical representative flows** identified by the VH-105-01 inventory of 112 routes in 21 controller classes, **not all 112 handlers**. The suite does not assert an exact claim that every single endpoint/role permutation passed. Before parent VH-105 can be closed as an exhaustive authorization audit, extend HTTP cases to all critical remaining endpoints, especially admin mutations, member session/token revocation, notification ownership, profile writes, multi-part event/image uploads and dashboard data minimization.

Other tickets remain separate: VH-106 secures Actuator/metrics network exposure; VH-107 validates media object provenance, type and limits; VH-213 enforces atomic report resolution/moderation; VH-225 implements narrowly scoped organizer report moderation with PII redaction. The temporary ADMIN-only report-by-ID rule from PR #85 remains in effect.

## CI status

Verified locally on Windows with Docker Desktop (2026-10-17): targeted HTTP integration suite: **12/12 pass**; entire backend `test jacocoTestReport`: **58/58 tests pass in 6 suites, 0 failures/errors/skips; BUILD SUCCESSFUL**. GitHub Actions checks require independent confirmation.
