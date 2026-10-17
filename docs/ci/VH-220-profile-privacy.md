# VH-220 — Locked profile, not anonymous participation

## Product rule

`PRIVATE` means **lock my profile page**, similar to Facebook's locked-profile behavior. It does **not** mean that my posts or comments become anonymous, and it does not override the permissions of the event/discussion in which I participate.

| Context | When profile is PRIVATE |
| --- | --- |
| Public avatar and display name | Remain visible |
| Bio/profile details on another person's profile page | Hidden; page displays "Locked profile" |
| User's aggregated profile timeline | Hidden from non-owner/non-admin; API rejects listing |
| Posts/comments inside an event or conversation already accessible to the viewer | Remain visible with author name/avatar and content |
| Bio in public author and attendee DTOs | Hidden; avoid republishing profile-only information |
| Own profile or explicitly authorized admin access | Full detail according to existing policy |
| Soft-deleted accounts | Public profile 404, embedded author becomes "Deleted user" with null avatar/bio |

Only content already authorized for the event/conversation is visible. Locking a profile never grants access to private events/posts; their access control is tracked separately under VH-221.

## Security implementation

Previously `UserService.getPublicUserProfile(id)` cached a viewer-dependent full/private response under only the target user ID, risking privileged-to-anonymous disclosure. It now resolves viewer authorization and profile visibility on every call, with **no shared viewer-dependent cache**; missing settings fail closed. Profile avatar/name are public identity even if the page is locked, while bio is visible only to authorized users.

`ProfilePrivacyService` builds embedded author projections across posts, comments, nested replies and attendee lists. It leaves name/avatar visible for active users regardless of profile lock, redacts private bio, and anonymizes soft-deleted users using a fresh DB deletion check. A locked user's **aggregated user timeline** is restricted at both frontend and `PostService.getPostsByUserId` API (403 for unrelated viewers); `PostService.getPostsForEvent` remains governed by event read permission rather than profile visibility.

The profile UI displays a lock marker and explanatory notice without exposing the target's bio/posts list. The account owner still gets their full profile and own posts, including when navigating via their user ID. Settings explain that public discussions are unaffected.

Legacy `publicUserProfiles` Redis entries are invalidated on privacy change, account soft deletion and avatar update, but eviction is not the authorization boundary.

## Regression tests and verification

PostgreSQL/Redis Testcontainers tests cover owner/admin vs anonymous/stranger views after a full legacy response has been planted in Redis; PUBLIC-to-PRIVATE transition with cache invalidation; retained name/avatar in public post/comment/attendee DTOs and hidden bio; a locked aggregated timeline returning forbidden while the same author's public event post still renders; and deletion anonymization despite a stale in-memory entity.

Run `cd backend && ./gradlew test jacocoTestReport --no-daemon` (Windows `gradlew.bat`) and frontend `npm run build && npm run lint`. Required GitHub checks must pass before merging.

## Limits

Public name/avatar are deliberately not secret, even on a locked profile. Admin access remains a privileged exception. Large feeds may need batch visibility lookups to avoid N+1 SQL queries. Media stored in external URLs is not retroactively made private by locking the profile. Full event/post visibility authorization is VH-221.
