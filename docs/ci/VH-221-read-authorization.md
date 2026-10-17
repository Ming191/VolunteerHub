# VH-221 — Event and community-resource read authorization

## Visibility contract

- **Only PUBLISHED events are public** through event detail, gallery and event-discussion reads. DRAFT/PENDING/REJECTED/CANCELLED/COMPLETED are hidden from anonymous viewers and unrelated users. Their **organizer and admin** can inspect them. A future product decision may allow public historical COMPLETED events; that is not assumed here.
- Unpublished event IDs return **404** to unrelated viewers, rather than disclosing whether a hidden resource exists. Truly missing IDs also return 404.
- A published event can be viewed by an anonymous user, and a published event's posts can be viewed inside existing event/discussion endpoints according to the endpoint's authentication requirements.
- A profile lock (VH-220) **does not suppress public interactions**. It only blocks the user's aggregate profile timeline for outsiders. This ticket additionally removes **unpublished-event posts** from all aggregate author/recent feeds, *before* pagination and count queries.
- A user's ability to **write** a post remains governed by registration/creator rules; this ticket addresses READ authorization.

## Enforcement and cache safety

- Central `AuthorizationService.requireEventReadPermission` now checks event status, creator identity and real DB-backed admin role. This service is invoked for event detail, event gallery, event-specific posts, individual post reads and comment reads.
- `EventController` passes the optional authenticated viewer for public detail/gallery endpoints. `EventService.getEventById` **no longer caches response by event ID**: a privileged first read cannot poison a shared Redis cache for an unrelated viewer.
- `PostSpecifications.visibleInEventsTo` restricts post queries to PUBLISHED events, events created by the viewer, or all events for admins. Filtering happens in the database **before pagination and total counts**.
- The existing `getAllApprovedEvents` and event search use a PUBLISHED filter and remain unchanged.

## Verification

Real PostgreSQL 15 + Redis 7 Testcontainers in `InfrastructureIntegrationTest` assert:
- Anonymous/stranger cannot read DRAFT/PENDING/REJECTED/CANCELLED event details or gallery by ID, despite a deliberately planted legacy Redis cache entry. Creator/admin retain access.
- Individual hidden-event post ID and event collection are denied, but published event posts remain readable.
- Author feed excludes hidden-event posts for anonymous and unrelated users (count and content); creator/admin can read both. Existing locked-profile authorization remains in force.
- Existing 30+ infrastructure/registration/privacy/migration regressions still pass.

Run `cd backend && ./gradlew test jacocoTestReport --no-daemon` (Windows: `.\gradlew.bat`). Required GitHub check `registration-security-tests` must pass before merge.

## Scope and follow-ups

- `COMPLETED` / `CANCELLED` history visibility and role taxonomy should be settled in VH-203 and lifecycle policy tickets.
- Some image URLs are public object URLs once a user has legitimately obtained them. This application-level read guard **does not revoke already-shared externally accessible object URLs**; signed URL and storage ACL hardening is tracked in VH-107.
- Broader audit of direct admin endpoints and object storage responses is separate work. No migration or production data change is introduced here.
