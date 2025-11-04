package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.NotificationResponse
import com.cs2.volunteer_hub.service.NotificationService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/me/notifications")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Notifications", description = "User notification management endpoints")
class NotificationController(private val notificationService: NotificationService) {

    @Operation(
        summary = "Get my notifications",
        description = "Retrieve all notifications for the current user",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping
    fun getMyNotifications(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<NotificationResponse>> {
        val notifications = notificationService.getNotificationsForUser(currentUser.username)
        return ResponseEntity.ok(notifications)
    }

    /**
     * Get unread notifications only
     * Example: GET /api/me/notifications/unread
     */
    @Operation(
        summary = "Get unread notifications",
        description = "Retrieve only unread notifications for the current user",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/unread")
    fun getUnreadNotifications(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<NotificationResponse>> {
        val notifications = notificationService.getUnreadNotificationsForUser(currentUser.username)
        return ResponseEntity.ok(notifications)
    }

    /**
     * Get recent notifications from the last N days
     * Example: GET /api/me/notifications/recent?days=7
     */
    @Operation(
        summary = "Get recent notifications",
        description = "Retrieve notifications from the last N days (default 7 days)",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/recent")
    fun getRecentNotifications(
        @Parameter(description = "Number of days to look back")
        @RequestParam(defaultValue = "7") days: Int,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<NotificationResponse>> {
        val notifications = notificationService.getRecentNotifications(currentUser.username, days)
        return ResponseEntity.ok(notifications)
    }

    /**
     * Search notifications by content text
     * Example: GET /api/me/notifications/search?q=event
     */
    @Operation(
        summary = "Search notifications",
        description = "Search notifications by content text",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/search")
    fun searchNotifications(
        @Parameter(description = "Search text")
        @RequestParam q: String,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<NotificationResponse>> {
        val notifications = notificationService.searchNotifications(currentUser.username, q)
        return ResponseEntity.ok(notifications)
    }

    /**
     * Get notifications within a date range
     * Example: GET /api/me/notifications/date-range?from=2024-01-01T00:00:00&to=2024-12-31T23:59:59
     */
    @Operation(
        summary = "Get notifications by date range",
        description = "Retrieve notifications within a specific date range",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/date-range")
    fun getNotificationsByDateRange(
        @Parameter(description = "Start date (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) from: LocalDateTime,
        @Parameter(description = "End date (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) to: LocalDateTime,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<NotificationResponse>> {
        val notifications = notificationService.getNotificationsByDateRange(currentUser.username, from, to)
        return ResponseEntity.ok(notifications)
    }

    /**
     * Mark a specific notification as read
     * PATCH /api/me/notifications/{notificationId}/mark-read
     */
    @Operation(
        summary = "Mark notification as read",
        description = "Mark a specific notification as read",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PatchMapping("/{notificationId}/mark-read")
    fun markNotificationAsRead(
        @Parameter(description = "Notification ID", required = true)
        @PathVariable notificationId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Map<String, String>> {
        notificationService.markNotificationAsRead(notificationId, currentUser.username)
        return ResponseEntity.ok(mapOf(
            "status" to "success",
            "message" to "Notification marked as read"
        ))
    }

    /**
     * Mark all notifications as read
     * PATCH /api/me/notifications/mark-all-read
     */
    @Operation(
        summary = "Mark all notifications as read",
        description = "Mark all user notifications as read",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PatchMapping("/mark-all-read")
    fun markAllNotificationsAsRead(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Map<String, String>> {
        notificationService.markAllNotificationsAsRead(currentUser.username)
        return ResponseEntity.ok(mapOf(
            "status" to "success",
            "message" to "All notifications marked as read"
        ))
    }

    /**
     * Delete a notification
     * DELETE /api/me/notifications/{notificationId}
     */
    @Operation(
        summary = "Delete notification",
        description = "Delete a specific notification",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @DeleteMapping("/{notificationId}")
    fun deleteNotification(
        @Parameter(description = "Notification ID", required = true)
        @PathVariable notificationId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Unit> {
        notificationService.deleteNotification(notificationId, currentUser.username)
        return ResponseEntity.noContent().build()
    }

    /**
     * Get unread notification count
     * GET /api/me/notifications/unread-count
     */
    @Operation(
        summary = "Get unread notification count",
        description = "Get the count of unread notifications for badge display",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/unread-count")
    fun getUnreadNotificationCount(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Map<String, Long>> {
        val count = notificationService.getUnreadNotificationCount(currentUser.username)
        return ResponseEntity.ok(mapOf("count" to count))
    }
}