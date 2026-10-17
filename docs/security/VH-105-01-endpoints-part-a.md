# VH-105-01: Authorization inventory, part A

Snapshot main commit: 56106acb2db48e8e30a36555cc374dab36f1588c. Static audit only: declared filter/method rules do not establish object-level authorization or runtime 401/403/404. Method security takes precedence over applicable permitAll filter routes.

Reference: backend config/SecurityConfig.kt. Filter has public /api/auth/**, /api/events/*, /api/posts/*/comments/**, /api/enums/**, /actuator/**. Other routes require authentication. Methods may enforce stricter role or service checks.

## AdminController.kt (9 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| PATCH | `/api/admin/events/{id}/approve` | [`approveEvent`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminController.kt#L24) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| DELETE | `/api/admin/events/{id}` | [`deleteEventAsAdmin`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminController.kt#L30) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| GET | `/api/admin/events/pending` | [`getPendingEvents`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminController.kt#L40) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| GET | `/api/admin/events/search` | [`searchAllEvents`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminController.kt#L54) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| GET | `/api/admin/events/past` | [`getPastEvents`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminController.kt#L76) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| GET | `/api/admin/events/upcoming` | [`getUpcomingEvents`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminController.kt#L90) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| GET | `/api/admin/events/in-progress` | [`getInProgressEvents`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminController.kt#L104) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| GET | `/api/admin/events/accepting-registrations` | [`getEventsAcceptingRegistrations`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminController.kt#L118) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| GET | `/api/admin/users/{userId}/events` | [`getActiveEventsByCreator`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminController.kt#L133) | `hasRole('ADMIN')` | ADMIN role, global administrator |

## AdminMetricsController.kt (1 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| GET | `/api/admin/metrics/system` | [`getSystemMetrics`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminMetricsController.kt#L29) | `hasRole('ADMIN')` | ADMIN role, global administrator |

## AdminPendingMessagesController.kt (2 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| GET | `/api/admin/pending-messages/stats` | [`getPendingMessageStats`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminPendingMessagesController.kt#L25) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| POST | `/api/admin/pending-messages/{messageId}/retry` | [`retryMessage`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminPendingMessagesController.kt#L36) | `hasRole('ADMIN')` | ADMIN role, global administrator |

## AdminReportController.kt (4 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| GET | `/api/admin/reports` | [`getAllReports`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminReportController.kt#L32) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| GET | `/api/admin/reports/target` | [`getReportsForTarget`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminReportController.kt#L46) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| PUT | `/api/admin/reports/{reportId}/review` | [`reviewReport`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminReportController.kt#L63) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| GET | `/api/admin/reports/stats` | [`getReportStats`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminReportController.kt#L77) | `hasRole('ADMIN')` | ADMIN role, global administrator |

## AdminUserController.kt (4 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| GET | `/api/admin/users` | [`getAllUsers`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminUserController.kt#L31) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| GET | `/api/admin/users/search` | [`searchUsers`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminUserController.kt#L64) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| PATCH | `/api/admin/users/{id}/lock` | [`lockUser`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminUserController.kt#L129) | `hasRole('ADMIN')` | ADMIN role, global administrator |
| PATCH | `/api/admin/users/{id}/unlock` | [`unlockUser`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AdminUserController.kt#L140) | `hasRole('ADMIN')` | ADMIN role, global administrator |

## AuthController.kt (7 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| POST | `/api/auth/register` | [`register`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AuthController.kt#L61) | `permitAll at filter` | Public authentication / token flow |
| POST | `/api/auth/login` | [`login`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AuthController.kt#L93) | `permitAll at filter` | Public authentication / token flow |
| POST | `/api/auth/refresh` | [`refreshToken`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AuthController.kt#L128) | `permitAll at filter` | Public authentication / token flow |
| POST | `/api/auth/logout` | [`logout`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AuthController.kt#L157) | `permitAll at filter` | Valid refresh token governs revocation |
| POST | `/api/auth/logout-all` | [`logoutAll`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AuthController.kt#L179) | `permitAll at filter` | Authenticated caller identity required, despite permitAll route |
| GET | `/api/auth/verify-email` | [`verifyEmail`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AuthController.kt#L207) | `permitAll at filter` | Public authentication / token flow |
| POST | `/api/auth/resend-verification` | [`resendVerification`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/AuthController.kt#L237) | `permitAll at filter` | Public authentication / token flow |

## CommentController.kt (6 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| POST | `/api/posts/{postId}/comments` | [`createComment`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/CommentController.kt#L37) | `isAuthenticated()` | Create: approved participant/creator; edit/delete: comment author |
| GET | `/api/posts/{postId}/comments` | [`getCommentsForPost`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/CommentController.kt#L51) | `permitAll at filter` | Parent event readable by caller |
| GET | `/api/posts/{postId}/comments/nested` | [`getNestedCommentsForPost`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/CommentController.kt#L67) | `permitAll at filter` | Parent event readable by caller |
| GET | `/api/posts/{postId}/comments/{commentId}/replies` | [`getRepliesForComment`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/CommentController.kt#L80) | `permitAll at filter` | Parent event readable by caller |
| PUT | `/api/posts/{postId}/comments/{commentId}` | [`updateComment`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/CommentController.kt#L99) | `isAuthenticated()` | Create: approved participant/creator; edit/delete: comment author |
| DELETE | `/api/posts/{postId}/comments/{commentId}` | [`deleteComment`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/CommentController.kt#L120) | `isAuthenticated()` | Create: approved participant/creator; edit/delete: comment author |

## DashboardController.kt (6 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| GET | `/api/dashboard/volunteer` | [`getVolunteerDashboard`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/DashboardController.kt#L25) | `hasRole('VOLUNTEER')` | VOLUNTEER and own data |
| GET | `/api/dashboard/organizer` | [`getOrganizerDashboard`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/DashboardController.kt#L35) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER and own aggregation |
| GET | `/api/dashboard/organizer/analytics` | [`getOrganizerAnalytics`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/DashboardController.kt#L45) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER and own aggregation |
| GET | `/api/dashboard/admin` | [`getAdminDashboard`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/DashboardController.kt#L55) | `hasRole('ADMIN')` | ADMIN |
| GET | `/api/dashboard/events/accepting-registrations` | [`getEventsAcceptingRegistrations`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/DashboardController.kt#L65) | `authenticated at filter` | Authenticated, PUBLISHED events only |
| GET | `/api/dashboard/events/in-progress` | [`getInProgressEvents`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/DashboardController.kt#L75) | `authenticated at filter` | Authenticated, PUBLISHED events only |

## EnumController.kt (6 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| GET | `/api/enums/skills` | [`getSkills`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EnumController.kt#L24) | `permitAll at filter` | Public reference data |
| GET | `/api/enums/interests` | [`getInterests`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EnumController.kt#L44) | `permitAll at filter` | Public reference data |
| GET | `/api/enums/skills/grouped` | [`getSkillsGrouped`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EnumController.kt#L64) | `permitAll at filter` | Public reference data |
| GET | `/api/enums/interests/grouped` | [`getInterestsGrouped`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EnumController.kt#L125) | `permitAll at filter` | Public reference data |
| GET | `/api/enums/event-tags` | [`getEventTags`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EnumController.kt#L178) | `permitAll at filter` | Public reference data |
| GET | `/api/enums/event-tags/grouped` | [`getEventTagsGrouped`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EnumController.kt#L198) | `permitAll at filter` | Public reference data |

## EventController.kt (11 endpoints)

| HTTP | Path | Controller method | Declared guard | Required object scope |
|---|---|---|---|---|
| GET | `/api/events` | [`getAllEvents`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventController.kt#L53) | `authenticated at filter` | PUBLISHED events only |
| GET | `/api/events/search` | [`searchEvents`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventController.kt#L100) | `permitAll at filter` | PUBLISHED events only |
| GET | `/api/events/my-events` | [`getMyEvents`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventController.kt#L188) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER owns returned events |
| GET | `/api/events/{id}` | [`getEventById`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventController.kt#L217) | `permitAll at filter` | PUBLISHED public, otherwise creator/ADMIN |
| GET | `/api/events/{id}/attendees` | [`getEventAttendees`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventController.kt#L232) | `authenticated at filter` | Event owner, approved attendee, or ADMIN; ensure privacy |
| GET | `/api/events/{id}/gallery` | [`getEventGallery`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventController.kt#L245) | `authenticated at filter` | PUBLISHED public, otherwise creator/ADMIN |
| POST | `/api/events` | [`createEvent`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventController.kt#L266) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER plus ownership of target event |
| POST | `/api/events/form` | [`createEventForm`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventController.kt#L292) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER plus ownership of target event |
| PUT | `/api/events/{id}` | [`updateEvent`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventController.kt#L400) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER plus ownership of target event |
| DELETE | `/api/events/{id}` | [`deleteEvent`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventController.kt#L427) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER plus ownership of target event |
| POST | `/api/events/{id}/cancel` | [`cancelEvent`](https://github.com/Ming191/VolunteerHub/blob/56106acb2db48e8e30a36555cc374dab36f1588c/backend/src/main/kotlin/com/cs2/volunteer_hub/controller/EventController.kt#L446) | `hasRole('EVENT_ORGANIZER')` | EVENT_ORGANIZER plus ownership of target event |

Inventory total part A: 56 endpoints. See VH-105-01-endpoints-part-b.md and VH-105-01-findings.md for remaining routes and triage.