# VH-220 — Private profile authorization and DTO redaction

## Threat model and fix

Before VH-220, `UserService.getPublicUserProfile(id)` cached a request-dependent `PublicUserResponse` under the **target user's ID only**. A logged-in owner/admin could populate that shared Redis cache with the full private profile, and anonymous/unrelated viewers could receive the same cached object without rechecking authorization. `PostMapper`, `CommentMapper` and `RegistrationMapper` also copied avatar/bio directly from entities, irrespective of `UserSettings.profileVisibility`.

The full public-profile endpoint now **does not use a shared cache at all**. It resolves current authentication and target visibility on **every call**. Owner/admin can see their permitted full private profile; anonymous/other viewers receive only ID and name with null bio/avatar and `isPrivate=true`. Soft-deleted users return 404. Missing user-settings records are treated as PRIVATE (fail closed).

`ProfilePrivacyService` supplies a central **public-only author projection** used in posts, comments (including replies), and public attendee DTOs. Private accounts have null bio/avatar; soft-deleted accounts are anonymized as "Deleted user" with null bio/avatar. Embedded authors are always public-safe even when a privileged viewer reads them; privileged private access is only on the explicitly authorized profile endpoint.

Settings privacy transitions (including PUBLIC→PRIVATE), soft account deletion and completed avatar updates also evict the retired `publicUserProfiles` cache key. Profile updates already evicted this key in `MeService`. This protects against legacy entries while the cache is phased out; **cache eviction alone is not the authorization boundary**.

## Verified / reproduction

The Testcontainers backend suite now contains regression cases against real PostgreSQL and Redis:

- Private owner views full bio/avatar, a stale full response is planted into Redis under the old vulnerable key, but subsequent anonymous and unrelated viewers still receive redacted profiles, irrespective of order. Admin still receives privileged response.
- A PUBLIC profile is read via user endpoint, post author, comment author (including nested replies), and public attendee mapping; the settings service flips PUBLIC→PRIVATE, removes the old Redis cache entry, and all public DTOs immediately redact bio/avatar.
- Soft deletion through `SettingsService.deleteAccount` evicts the retired profile cache key; deleted users are not retrievable from the public endpoint and display as anonymized authors.

Run: `cd backend && ./gradlew test jacocoTestReport --no-daemon` (Windows: `.\gradlew.bat`). The same suite is required in CI under `registration-security-tests`.

## Security boundaries and follow-ups

- Display names and stable user IDs remain visible for PRIVATE profiles, matching the existing public profile contract; a future stricter policy requires a product/privacy decision.
- These mappers consult persisted settings for each mapped author (fail closed on missing settings). Large feed pages may incur N+1 lookups. An optimized batch public-visibility projection belongs in the performance backlog, but must never cache privileged DTOs across viewers.
- Admin `UserResponse` and authenticated `/me` APIs are deliberately full-detail privileged responses, not safe for anonymous use. Access to their controllers is managed by existing security rules; broader endpoint authorization audit remains VH-221.
- This ticket does **not** change event/posts read authorization (VH-221) or introduce global token/session invalidation after deletion. It addresses profile-field disclosure and cached view mixing.
