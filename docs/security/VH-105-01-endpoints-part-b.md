# VH-105-01: Authorization inventory, part B

Snapshot main commit: 56106acb2db48e8e30a36555cc374dab36f1588c. Static audit only. Effective declared guards do not establish ownership, consistent denial status, or HTTP E2E proof.

Note: normalized route paths join class and method mappings even if the method-level annotation omits its leading slash.

## EventManagerController.kt (13 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| GET | `/api/manager/events/{eventId}/registrations` | [`getRegistrationsForEvent`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventManagerController.kt#L38) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER; each event/registration must be within caller-owned event |
| GET | `/api/manager/events/{eventId}/registrations/search` | [`searchEventRegistrations`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventManagerController.kt#L58) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER; each event/registration must be within caller-owned event |
| GET | `/api/manager/events/{eventId}/registrations/status/{status}` | [`getRegistrationsByStatus`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventManagerController.kt#L109) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER; each event/registration must be within caller-owned event |
| GET | `/api/manager/registrations/pending` | [`getAllPendingRegistrations`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventManagerController.kt#L130) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER; each event/registration must be within caller-owned event |
| GET | `/api/manager/registrations/approved` | [`getAllApprovedRegistrations`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventManagerController.kt#L147) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER; each event/registration must be within caller-owned event |
| PATCH | `/api/manager/registrations/{registrationId}` | [`updateRegistrationStatus`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventManagerController.kt#L160) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER; each event/registration must be within caller-owned event |
| POST | `/api/manager/registrations/{registrationId}/complete` | [`markRegistrationAsCompleted`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventManagerController.kt#L178) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER; each event/registration must be within caller-owned event |
| POST | `/api/manager/registrations/complete-past-events` | [`bulkCompleteRegistrationsForPastEvents`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventManagerController.kt#L198) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER; each event/registration must be within caller-owned event |
| GET | `/api/manager/events/{eventId}/waitlist` | [`getEventWaitlist`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventManagerController.kt#L215) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER; each event/registration must be within caller-owned event |
| POST | `/api/manager/events/{eventId}/waitlist/promote` | [`promoteFromWaitlist`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventManagerController.kt#L234) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER; each event/registration must be within caller-owned event |
| GET | `/api/manager/events/{eventId}/registrations/completed` | [`getCompletedRegistrations`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventManagerController.kt#L253) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER; each event/registration must be within caller-owned event |
| GET | `/api/manager/registrations/completed` | [`getAllCompletedRegistrations`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventManagerController.kt#L273) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER; each event/registration must be within caller-owned event |
| GET | `/api/manager/events/{eventId}/registrations/active` | [`getActiveRegistrations`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventManagerController.kt#L290) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER; each event/registration must be within caller-owned event |

## ExportController.kt (2 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| GET | `/api/admin/export/events.csv` | [`exportEventsToCsv`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/ExportController.kt#L18) | `hasRole('ADMIN')` | ADMIN; export may contain PII |
| GET | `/api/admin/export/users.csv` | [`exportUsersToCsv`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/ExportController.kt#L30) | `hasRole('ADMIN')` | ADMIN; export may contain PII |

## LikeController.kt (1 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| POST | `/api/posts/{postId}/like` | [`toggleLike`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/LikeController.kt#L24) | `isAuthenticated()` | Authenticated; approved participant/creator of parent event |

## MeController.kt (7 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| GET | `/api/me` | [`getMyProfile`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/MeController.kt#L34) | `isAuthenticated()` | Authenticated self only; no cross-account IDs |
| PUT | `/api/me` | [`updateMyProfile`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/MeController.kt#L41) | `isAuthenticated()` | Authenticated self only; no cross-account IDs |
| PUT | `/api/me/password` | [`changePassword`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/MeController.kt#L51) | `isAuthenticated()` | Authenticated self only; no cross-account IDs |
| GET | `/api/me/registrations` | [`getMyRegistrations`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/MeController.kt#L65) | `isAuthenticated()` | Authenticated self only; no cross-account IDs |
| POST | `/api/me/fcm-tokens` | [`addFcmToken`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/MeController.kt#L75) | `isAuthenticated()` | Authenticated self only; no cross-account IDs |
| DELETE | `/api/me/fcm-tokens` | [`deleteFcmTokens`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/MeController.kt#L86) | `isAuthenticated()` | Authenticated self only; no cross-account IDs |
| POST | `/api/me/profile-picture` | [`uploadProfilePicture`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/MeController.kt#L95) | `isAuthenticated()` | Authenticated self only; no cross-account IDs |

## NotificationController.kt (9 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| GET | `/api/me/notifications` | [`getMyNotifications`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/NotificationController.kt#L32) | `isAuthenticated()` | Authenticated recipient only, including mark-read/delete by ID |
| GET | `/api/me/notifications/unread` | [`getUnreadNotifications`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/NotificationController.kt#L50) | `isAuthenticated()` | Authenticated recipient only, including mark-read/delete by ID |
| GET | `/api/me/notifications/recent` | [`getRecentNotifications`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/NotificationController.kt#L68) | `isAuthenticated()` | Authenticated recipient only, including mark-read/delete by ID |
| GET | `/api/me/notifications/search` | [`searchNotifications`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/NotificationController.kt#L88) | `isAuthenticated()` | Authenticated recipient only, including mark-read/delete by ID |
| GET | `/api/me/notifications/date-range` | [`getNotificationsByDateRange`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/NotificationController.kt#L108) | `isAuthenticated()` | Authenticated recipient only, including mark-read/delete by ID |
| PATCH | `/api/me/notifications/{notificationId}/mark-read` | [`markNotificationAsRead`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/NotificationController.kt#L130) | `isAuthenticated()` | Authenticated recipient only, including mark-read/delete by ID |
| PATCH | `/api/me/notifications/mark-all-read` | [`markAllNotificationsAsRead`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/NotificationController.kt#L152) | `isAuthenticated()` | Authenticated recipient only, including mark-read/delete by ID |
| DELETE | `/api/me/notifications/{notificationId}` | [`deleteNotification`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/NotificationController.kt#L172) | `isAuthenticated()` | Authenticated recipient only, including mark-read/delete by ID |
| GET | `/api/me/notifications/unread-count` | [`getUnreadNotificationCount`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/NotificationController.kt#L191) | `isAuthenticated()` | Authenticated recipient only, including mark-read/delete by ID |

## PostController.kt (9 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| POST | `/api/events/{eventId}/posts/signed-url` | [`getSignedUrlForPost`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/PostController.kt#L35) | `isAuthenticated()` | Approved participant or event creator; write scope |
| POST | `/api/events/{eventId}/posts` | [`createPostForEvent`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/PostController.kt#L55) | `isAuthenticated()` | Approved participant or event creator; write scope |
| GET | `/api/events/{eventId}/posts` | [`getPostsForEvent`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/PostController.kt#L69) | `authenticated at filter` | Parent event PUBLISHED or creator/ADMIN |
| GET | `/api/posts/feed` | [`getRecentPostsFeed`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/PostController.kt#L95) | `isAuthenticated()` | Authenticated own/authorized feed and parent event visibility |
| GET | `/api/posts/my-posts` | [`getMyPosts`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/PostController.kt#L121) | `isAuthenticated()` | Authenticated own/authorized feed and parent event visibility |
| PUT | `/api/events/{eventId}/posts/{postId}` | [`updatePost`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/PostController.kt#L146) | `isAuthenticated()` | Post author; post belongs to path event |
| GET | `/api/posts/user/{userId}` | [`getPostsByUserId`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/PostController.kt#L161) | `authenticated at filter` | Privacy lock plus parent event visibility |
| GET | `/api/events/{eventId}/posts/{postId}` | [`getPost`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/PostController.kt#L186) | `isAuthenticated()` | Parent event PUBLISHED or creator/ADMIN |
| DELETE | `/api/events/{eventId}/posts/{postId}` | [`deletePost`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/PostController.kt#L201) | `isAuthenticated()` | Post author; post belongs to path event |

## RegisterController.kt (3 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| POST | `/api/events/{eventId}/register` | [`registerForEvent`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/RegisterController.kt#L35) | `hasRole('VOLUNTEER')` | VOLUNTEER: own registration on eligible event |
| DELETE | `/api/events/{eventId}/register` | [`cancelRegistration`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/RegisterController.kt#L49) | `hasRole('VOLUNTEER')` | VOLUNTEER: own registration on eligible event |
| GET | `/api/events/{eventId}/register` | [`getRegistrationStatus`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/RegisterController.kt#L63) | `hasRole('VOLUNTEER')` | VOLUNTEER: own registration on eligible event |

## ReportController.kt (3 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| POST | `/api/reports` | [`submitReport`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/ReportController.kt#L33) | `isAuthenticated()` | Authenticated; reporter can view POST/COMMENT target; see finding F-01 |
| GET | `/api/reports/my` | [`getMyReports`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/ReportController.kt#L46) | `isAuthenticated()` | Authenticated; own reports only |
| GET | `/api/reports/{reportId}` | [`getReportById`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/ReportController.kt#L64) | `hasRole('ADMIN')` | ADMIN-only temporary; VH-225 event-scoped organizer policy later |

## SettingsController.kt (6 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| GET | `/api/me/settings` | [`getUserSettings`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/SettingsController.kt#L28) | `isAuthenticated()` | Authenticated self; session IDs owned by current user |
| PUT | `/api/me/settings` | [`updateUserSettings`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/SettingsController.kt#L41) | `isAuthenticated()` | Authenticated self; session IDs owned by current user |
| GET | `/api/me/sessions` | [`getActiveSessions`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/SettingsController.kt#L54) | `isAuthenticated()` | Authenticated self; session IDs owned by current user |
| DELETE | `/api/me/sessions/{sessionId}` | [`revokeSession`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/SettingsController.kt#L67) | `isAuthenticated()` | Authenticated self; session IDs owned by current user |
| DELETE | `/api/me/sessions` | [`revokeAllOtherSessions`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/SettingsController.kt#L80) | `isAuthenticated()` | Authenticated self; session IDs owned by current user |
| DELETE | `/api/me/account` | [`deleteAccount`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/SettingsController.kt#L91) | `isAuthenticated()` | Authenticated self; session IDs owned by current user |

## TestNotificationController.kt (2 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| GET | `/api/test/notifications/send` | [`sendTestNotification`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/TestNotificationController.kt#L26) | `isAuthenticated()` | Authenticated; no side effect currently; remove/debug-only in prod |
| POST | `/api/test/notifications/send-to-user` | [`sendNotificationToUser`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/TestNotificationController.kt#L48) | `hasRole('ADMIN')` | ADMIN only, nonproduction debug route |

## UserController.kt (1 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| GET | `/api/users/{id}` | [`getUserById`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/UserController.kt#L22) | `authenticated at filter` | Authenticated (current filter) public-safe projection, respect privacy lock |

Inventory total part B: 56 endpoints. Aggregate: 112 handlers / 21 controllers, excluding infrastructure filter endpoints outside controllers.