# VH-105 final: Authorization inventory-to-runtime proof and closure evidence

Date: 2026-10-17. Baseline: `main` commit `ad4f9e1` (#86 audit, #87 repairs, #88 HTTP tests).

## Acceptance scope and evidence

**Controller endpoints:** The frozen VH-105-01 inventory enumerates **112 HTTP method + route handlers / 21 Kotlin controllers**. The checked-in fixture `backend/src/test/resources/vh105-authorization-matrix.csv` contains exactly 112 distinct entries and is compared in CI with actual Spring MVC `RequestMappingHandlerMapping` entries from the **real 21 controllers**. Any unexpected added/removed route, missing controller, or change in declared role-level policy fails the test.

| Declared policy | Endpoint count |
|---|---:|
| ADMIN | 25 |
| EVENT_ORGANIZER | 21 |
| VOLUNTEER | 4 |
| Authenticated (any role) | 45 |
| Public | 17 |
| **Total** | **112** |

**Actual HTTP filter check:** Each of the **95 protected endpoints** receives (1) a no-token request and (2) a malformed-bearer request. Both must return exactly `401`: **190 negative HTTP assertions**. All use the real `SecurityConfig`, JWT filter and `MockMvc`, plus PostgreSQL/Redis/RabbitMQ Testcontainers.

**Role check:** All **50 role-specific endpoints** must retain the exact `@PreAuthorize(hasRole(...))` mapping on their actual runtime handlers. Additionally all **32 role-specific GET endpoints** receive requests by both incorrect roles, and must return exactly `403`: **64 wrong-role HTTP assertions**. Every public GET endpoint (**12**) must remain available without authentication (not 401/403). Other public authentication POST routes are classified as public by runtime handler policy; invalid public payloads are not used as evidence of successful business execution.

**Resource ownership:** The existing VH-105-02/03 integration tests exercise (with actual database/cache and signed JWT): Organizer A vs B registration reads, search and state mutations, cold/warm Redis IDOR, foreign event/post mutations, wrong-comment-author operations, hidden events/posts/comments/gallery/report targets (404), unapproved upload URL guard before signer call, cancelled-event roster, privacy-locked profile and reporter-vs-admin detail. These tests demonstrate specific representative resource paths and side effects, not arbitrary hidden repository state combinations.

## Bugs reproduced from the complete route matrix

1. The previous `SecurityConfig` whitelist `/api/posts/*/comments/**` applied `permitAll` to every HTTP method. Thus anonymous malformed POST returned 400 from argument validation rather than 401 at the security filter. **Fixed by permitting only GET comments and GET legacy post-event reads.** POST/PUT/DELETE must authenticate at the filter, independently of method-security timing.
2. The old `/api/events/*` whitelist included `GET /api/events/my-events` (a role-restricted collection route). Anonymous GET reached `@PreAuthorize` and returned 403 rather than 401. **Fixed by explicitly requiring authentication on GET /api/events/my-events, and constraining the general event wildcard to GET.**

Existing `@PreAuthorize` role checks remain unchanged; both fixes strengthen request-layer protection rather than relaxing policy.

## Reproducibility

From `backend`, with Docker Desktop and compatible Java:

```powershell
.\gradlew.bat test --tests '*AuthorizationHttpIntegrationTest*' --no-daemon --console=plain
.\gradlew.bat test jacocoTestReport --no-daemon --console=plain
```

The first command executes the 12 previous VH-105-03 integration scenarios plus the new runtime inventory/401/403/public contract tests. The second runs the entire backend suite and creates JaCoCo output. Record full-suite pass and GitHub Actions checks on the pull request; tests alone cannot establish deployed environment policy.

## Risk handoffs and closure criteria

The scope of parent **VH-105 is endpoint discovery, deny-by-default RBAC/IDOR remediation of identified critical flows, and regression evidence**, not a claim of proof for every possible authorization data-state permutation or browser scenario.

Four findings were remediated by VH-105-02; the two wildcard filter semantics were corrected here. Remaining specialized risks are separately tracked in **VH-106 (Actuator / metrics exposure), VH-107 (GCS media provenance), VH-213 (report moderation atomicity), VH-225 (Organizer event-scoped report moderation)**, and authentication lifecycle under VH-104. Do **not** silently mark those tickets as resolved.

Close parent VH-105 after this final PR passes local/full CI and merges, unless new critical IDOR evidence is found. Reopen or file a targeted issue if a new endpoint fails the checked-in policy contract. `112` means controller handlers inventoried and contract-checked, **not** 112 x all resource owners x all possible request payloads.
