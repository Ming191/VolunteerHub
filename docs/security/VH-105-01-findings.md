# VH-105-01: Authorization audit findings and regression plan

Date: 2026-10-17. Frozen target: [main 56106acb](https://github.com/Ming191/VolunteerHub/commit/56106acb2db48e8e30a36555cc374dab36f1588c).

## Scope / evidence quality

- **112 mapped HTTP endpoints / 21 controller classes**, partitioned into `VH-105-01-endpoints-part-a.md` and `VH-105-01-endpoints-part-b.md`. The inventory includes every `@Get/Post/Put/Patch/DeleteMapping` found in controller source at the frozen commit.
- Traced Spring `SecurityConfig`, selected controller→service→repository/specification paths for event, post, comment, like, registration, attendee list, profile, sessions, notification, dashboard, report, upload and export. Confirmed known prior remediations from PR #85 / VH-220 / VH-221.
- This is a **static code audit**, NOT a passing dynamic security test, a comprehensive proof that all endpoints are safe, or authorization-complete VH-105. Route guards marked `authenticated` are NOT equivalent to object-level authorization. No production requests or sensitive data were used.
- Severity is proposed triage, not validated incident impact. `Static finding` means source path lacks a check or maps an exception visibly; `runtime outcome` needs a two-account HTTP integration test and deployment-specific validation.

## Triage

| ID | Severity | Confidence | Endpoint / flow | Finding | Follow-up owner |
|---|---|---|---|---|---|
| F01 | P1 | Static confirmed; runtime unproven | `POST /api/reports` | Target visibility not checked before report creation; may probe/report hidden post/comment IDs | VH-105-02, VH-225 |
| F02 | P1 | Static confirmed; runtime unproven | `GET /api/events/{id}/attendees` | No event-visibility check after confirming past approved membership; CANCELLED or otherwise hidden event roster may remain readable | VH-105-02, VH-203 |
| F03 | P2 | Source-level strong | `PUT/DELETE /api/posts/{postId}/comments/{commentId}` | Wrong-author denial uses `IllegalAccessException`; global handler falls through to HTTP 500, not 403 | VH-105-02, VH-114 |
| F04 | P2 | Source-level strong | `POST /api/auth/logout-all` | `/api/auth/**` is `permitAll`; this endpoint lacks method-level auth while dereferencing required principal; anonymous failure likely 500 instead of 401 | VH-105-02, VH-104 |
| F05 | P1 | Config confirmed, exposure depends on deployment | `/actuator/**` | Spring Security permits all Actuator paths, and config exposes `health,info,prometheus,metrics`, with Prometheus unrestricted. Restrict metrics/operational endpoints to monitoring network or auth | VH-106 |
| F06 | P1 | Static confirmed; exploitation context-dependent | `POST /api/events/{eventId}/posts` | Pre-uploaded `imageUrls` are trusted as uploaded object URLs without provenance/ownership validation; separate GCS upload/ACL threat model needed | VH-107 |
| F07 | P1 | Static confirmed; test pending | `PUT /api/admin/reports/{reportId}/review` | `reviewReport()` catches content-delete failure and continues persisting RESOLVED, causing moderation state/content drift | VH-213 |
| F08 | P2 | Contract mismatch; intentionality unknown | Public browse/profile routes | Route filter only whitelists `/api/events/*`, not root `/api/events`; likewise `/api/users/{id}` and author timeline need authentication unless overridden. Verify intended anonymous UX | VH-114 |

## Evidence and proposed negative tests

### F01: Report creation on a hidden target

- [service/ReportService.kt#L35](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/service/ReportService.kt#L35): `createReport()` loads reporter then calls `postRepository.existsById(targetId)` or `commentRepository.existsById(targetId)` with no call to `AuthorizationService.requireEventReadPermission` and no parent event visibility check before persisting a report.
- [controller/ReportController.kt#L32](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/ReportController.kt#L32): any authenticated user can submit the request. A public report should only reference a target the caller is allowed to read, unless an explicit abuse-report exception is designed with a non-enumerating response.
- Regression: create PENDING and DRAFT event with post/comment owned by Organizer A; as unrelated Volunteer B submit reports for existing hidden target and nonexistent target. Assert neither leaks existence or creates a report; authorized reader is allowed. Test that notification to admin isn't queued on rejected request.

### F02: Approved attendee may read a now-hidden event roster

- [service/EventService.kt#L163](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/service/EventService.kt#L163): `getPublicAttendees()` checks creator, approved registration or ADMIN but never invokes `requireEventReadPermission()` or checks `event.status == PUBLISHED`.
- [service/EventService.kt#L327](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/service/EventService.kt#L327): cancellation sets event status CANCELLED but does not first remove approved registrations. In principle a previously approved volunteer may still satisfy attendee-read condition after cancellation even though event detail, gallery and posts are hidden.
- Regression: create published event with approved attendees; cancel event; use registered volunteer, unrelated volunteer, organizer and admin on `GET /api/events/{id}/attendees`; assert chosen post-cancellation visibility contract and redacted attendee projection. Align with VH-203 before implementation.
- [mapper/RegistrationMapper.kt#L14](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/mapper/RegistrationMapper.kt#L14) delegates bio/identity masking to `ProfilePrivacyService`, so this finding is about event visibility rather than proven private-bio leakage.

### F03: Wrong-author comment edit/delete returns 500

- [service/CommentService.kt#L151](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/service/CommentService.kt#L151) and [service/CommentService.kt#L181](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/service/CommentService.kt#L181) throw `IllegalAccessException` for non-author mutation.
- [exception/GlobalExceptionHandler.kt#L159](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/exception/GlobalExceptionHandler.kt#L159) has generic `Exception` => HTTP 500, while authorization denial is normally 403. Denial still appears enforced, but incorrect semantics and error monitoring result.
- Regression: two users in same approved event, one owns comment, other attempts both PUT and DELETE. Assert 403, unchanged comment, no internal details or 500. Use `UnauthorizedAccessException` / Spring `AccessDeniedException` consistently.

### F04: `/logout-all` is not explicitly authenticated

- [config/SecurityConfig.kt#L67](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/config/SecurityConfig.kt#L67) whitelists the entire `/api/auth/**` family; [controller/AuthController.kt#L178](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AuthController.kt#L178) consumes a mandatory `@AuthenticationPrincipal` for `/logout-all` without `@PreAuthorize`.
- Regression: anonymous request must fail with 401 (rather than null-principal 500); user A can only revoke own sessions; revoked/current sessions behave per VH-104.

### F05: Operational endpoints anonymously accessible

- [config/SecurityConfig.kt#L80](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/config/SecurityConfig.kt#L80) permits `/actuator/**`. `application.properties` at lines 142-145 exposes `health,info,prometheus,metrics` and explicitly enables unrestricted Prometheus access.
- Confirm exposed metrics on staging from external and monitoring networks separately; document proxy/firewall boundary. Public `/actuator/health` may be retained, but info/metrics/prometheus should require trusted network or admin/monitoring credentials as appropriate.

### F06: Unverified media object references

- [service/PostService.kt#L58](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/service/PostService.kt#L58) and [service/PostService.kt#L79](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/service/PostService.kt#L79) accept caller-provided `request.imageUrls` and create Image entities marked `UPLOADED`, without verifying URL is in expected bucket, signed by this user or bound to this event. The **signed URL minting** route was permission-checked in PR #85, but consumer-side provenance is a separate trust boundary.
- Regression: use external URL, URL from another user's object, malformed URL, and valid uploaded object; ensure only approved owned objects are accepted. Link to VH-107 for object store implementation.

### F07: Report resolution and content deletion may diverge

- [service/ReportService.kt#L118](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/service/ReportService.kt#L118) (`reviewReport`) catches and logs `Exception` from content removal but still saves report status/notes. Separate VH-213 owns atomicity/invariants.
- Regression: inject delete failure, assert report is not marked resolved with content still present; audit and escalation behavior explicit.

### F08: Public-access contract and wildcard matcher

- [config/SecurityConfig.kt#L67](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/config/SecurityConfig.kt#L67) marks `/api/events/*` public but not collection route `/api/events` (which falls through to authenticated). `/api/users/{id}` and `/api/posts/user/{userId}` similarly appear authenticated in filter.
- Verify product intent with anonymous HTTP tests before treating this as defect; changing public access affects privacy and should not bypass VH-220.

## Previously remediated or partially checked, not counted as new findings

- Event detail/gallery/post read paths: VH-221 uses `requireEventReadPermission` and DB-filtered visible author/feed queries. Regression should include hidden event after warm-cache and author profile feed, not just direct GET.
- Organizer registration reads and mutations: `EventManagerService` calls `requireEventOwnership` on per-event flows, and aggregates filter by manager-owned events; PR #85 removed the unsafe event-ID-only cache. Verify two-organizer tests for every read/patch/complete/promote path.
- Post/comment/like writes: services check event membership and/or content authorship; negative tests should confirm no cross-event path-ID confusion, no side effects and expected HTTP denial.
- Session revocation: `SettingsService.revokeSession` checks user owns token; error mapping may be 400 rather than 403. Follow VH-104 for broader token design.
- Report detail `GET /api/reports/{reportId}` is temporarily `ADMIN-only` after PR #85. **Do not broadly restore EVENT_ORGANIZER role here**. VH-225 contains approved event-scoped moderation policy and privacy-safe response requirement.

## VH-105-02 acceptance test matrix

| Caller | Resource | Operation | Expected outcome |
|---|---|---|---|
| Anonymous | Protected /api/me or /api/manager path | Any | 401, never 500 |
| Organizer A | Event B / registration B | List, PATCH, complete, waitlist promote | 403 or privacy-preserving 404; unchanged DB, no emails |
| Organizer A | Own event A | Read / allowed mutation | Success with correct ownership |
| Volunteer B | Hidden event A | Event detail, posts, comments, gallery, report target | 404 and no existence oracle |
| Volunteer B (approved before cancellation) | Cancelled event A | Attendee roster | Follow explicit VH-203 visibility contract; no unintended roster disclosure |
| Volunteer B | Volunteer A comment | PUT / DELETE | 403, not 500; content unchanged |
| Volunteer B | Signed URL for unjoined event A | POST | 403 and 0 GCS signer calls |
| Volunteer B | Another user's notification/session/profile | Read, mark, delete/revoke | Deny and no side effects |
| Organizer | Global moderation / export | GET / MUTATE | 403 except event-scoped moderation later implemented in VH-225 |
| Admin | Admin moderation/export | Allowed operation | Success with audit trail |
| All roles | Warm vs cold Redis cache | Sensitive read | Same authorization decision |

## Exit / ownership

- **105-01 scope:** Inventory, identify code-level authorization gaps, attach source references, triage and explicit test plan. Complete when this documentation PR merges, not when the entire parent VH-105 closes.
- **105-02 scope:** Fix F01-F04 (and further reproduced authorization issues) with tests; route F05→VH-106, F06→VH-107, F07→VH-213, F08→VH-114. Keep tightly scoped PRs.
- **105-03 scope:** Build repeatable real HTTP 401/403/404 suites with PostgreSQL/Redis/RabbitMQ Testcontainers, two accounts, warm-cache tests and event lifecycle cases. Existing 41 passing backend tests reported in PR #85 do not cover all 112 endpoints.
- **Parent VH-105 stays In Progress** until verified controller/role/resource matrix, negative HTTP tests and no open unmitigated critical/high authorization flaw. Do not confuse static inventory with complete penetration testing.