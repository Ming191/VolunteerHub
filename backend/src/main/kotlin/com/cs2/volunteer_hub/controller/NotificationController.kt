package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.NotificationResponse // Sẽ tạo DTO này
import com.cs2.volunteer_hub.service.NotificationService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/me/notifications")
@PreAuthorize("isAuthenticated()")
class NotificationController(private val notificationService: NotificationService) {

    @GetMapping
    fun getMyNotifications(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<NotificationResponse>> {
        val notifications = notificationService.getNotificationsForUser(currentUser.username)
        return ResponseEntity.ok(notifications)
    }

    /**
     * Mark a specific notification as read
     * PATCH /api/me/notifications/{notificationId}/mark-read
     */
    @PatchMapping("/{notificationId}/mark-read")
    fun markNotificationAsRead(
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
    @DeleteMapping("/{notificationId}")
    fun deleteNotification(
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
    @GetMapping("/unread-count")
    fun getUnreadNotificationCount(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Map<String, Long>> {
        val count = notificationService.getUnreadNotificationCount(currentUser.username)
        return ResponseEntity.ok(mapOf("count" to count))
    }
}