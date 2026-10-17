# VH-105 — Authorization / IDOR matrix (initial remediation)

## Policy

Authentication is distinct from object authorization. A successful JWT is not permission to access arbitrary resources by ID. Never cache a response whose service method first checks ownership under a shared resource-ID-only key: a Redis hit bypasses the method's authorization logic.

| Resource / operation | Anonymous | VOLUNTEER | EVENT_ORGANIZER | ADMIN | Object-level condition |
|---|---|---|---|---|---|
| Public PUBLISHED event detail / gallery | Allow | Allow | Allow | Allow | Event must be PUBLISHED |
| Unpublished event detail / gallery | 404 | 404 | Own only | Allow | Event ownership or database ADMIN role |
| Posts / discussion under PUBLISHED event | Endpoint-specific auth | Endpoint-specific auth | Endpoint-specific auth | Endpoint-specific auth | VH-221 enforces parent event read policy |
| Locked profile | Public name/avatar only | Public name/avatar only | Public name/avatar only | Owner/admin full | Bio/timeline hidden from others (VH-220) |
| GET /api/manager/events/{id}/registrations | 401 | 403 | Own only | Existing controller policy | **Never** skip event ownership on Redis hit |
| POST /api/events/{id}/posts/signed-url | 401 | Approved member only | Event creator or approved member | Same posting policy | Deny before producing write-scoped GCS URL |
| GET /api/reports/{reportId} | 401 | 403 | 403 | Allow | Arbitrary report-by-ID is moderation-sensitive |
| GET /api/reports/my | 401 | Own only | Own only | Own only | Reporter-filtered query |
| Export /api/export/** | 401 | 403 | 403 | Allow | Admin controller role gate |
| Organizer registration approve / reject | 401 | 403 | Own only | Existing controller policy | Event ownership and capacity lock (VH-202) |

401 is for unauthenticated requests at the Spring Security filter; 403 is for authenticated access without role/object permission. Hidden unpublished event reads return 404 to avoid revealing IDs (VH-221). The registration manager's service may also reject cross-owner calls with 403 even if the caller has organizer role.

## Remediated in this change

1. Removed `@Cacheable("eventRegistrations", key="#eventId")` from `EventManagerService.getRegistrationsForEvent`. The authorization check now runs for every call. The legacy Redis entry may persist temporarily but is no longer read by this method. A regression test plants the old cached registration list, then verifies an unrelated organizer and volunteer both receive access denials while the owner still reads the real result.
2. Signed URL generation now accepts event ID and authenticated username and calls `requireEventPostPermission` before invoking cloud signing. Tests assert unauthorized callers produce **zero** signed URL calls and valid owners / approved volunteers can proceed.
3. `ReportController.getReportById` uses `hasRole('ADMIN')` instead of `hasAnyAuthority('ADMIN','EVENT_ORGANIZER')`. No organizer scope existed for arbitrary report IDs; deny organizer access rather than risk cross-account disclosure. Organizer-specific moderation, if needed, requires an ownership-aware design (VH-225).

## Remaining work / limits

This is an initial critical-path remediation and matrix, **not an assertion that every endpoint is proven safe**. Remaining audited surface includes: comments and likes, registration mutation routes, profile update/delete, moderation review/deletion, event image upload and GCS object ACLs, and dashboards/admin export. Obtain end-to-end HTTP 401/403 and real-browser two-account evidence in a dedicated security regression suite before production release. `VH-107` should also validate signed URL media type, size, name, rate limits, storage scope and expiration; `VH-225` must define organizer report ownership. `VH-104` covers standardized resource authorization mechanisms and `VH-203` event lifecycle semantics.

### Reproduction and validation

```powershell
cd E:\VolunteerHub\backend
.\gradlew.bat test jacocoTestReport --no-daemon --console=plain
```

Unit-style permission checks alone are insufficient for cache-priming bugs; use the PostgreSQL 15 / Redis 7 / RabbitMQ 3.13 Testcontainers `InfrastructureIntegrationTest` to verify real persistence and cache behavior. A passing Testcontainers test validates service security; it is **not** a full HTTP/browser E2E proof.
