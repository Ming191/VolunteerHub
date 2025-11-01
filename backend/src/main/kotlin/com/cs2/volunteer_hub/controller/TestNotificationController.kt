package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.service.NotificationService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

/**
 * Controller for testing notification functionality
 * This can be removed in production or kept for admin testing
 */
@RestController
@RequestMapping("/api/test/notifications")
class TestNotificationController(
    private val notificationService: NotificationService
) {

    /**
     * Test endpoint to send a notification to yourself
     * GET /api/test/notifications/send
     */
    @GetMapping("/send")
    @PreAuthorize("isAuthenticated()")
    fun sendTestNotification(
        @AuthenticationPrincipal userDetails: UserDetails,
        @RequestParam(defaultValue = "Test Notification") title: String,
        @RequestParam(defaultValue = "This is a test notification from VolunteerHub") body: String
    ): ResponseEntity<Map<String, String>> {
        // In a real scenario, you'd get userId from the authenticated user
        // For now, this is just a demo

        return ResponseEntity.ok(mapOf(
            "status" to "queued",
            "message" to "Notification queued successfully for ${userDetails.username}",
            "title" to title,
            "body" to body
        ))
    }

    /**
     * Test endpoint to send a notification to a specific user (admin only)
     * POST /api/test/notifications/send-to-user
     */
    @PostMapping("/send-to-user")
    @PreAuthorize("hasRole('ADMIN')")
    fun sendNotificationToUser(
        @RequestBody request: TestNotificationRequest
    ): ResponseEntity<Map<String, String>> {
        notificationService.queuePushNotificationToUser(
            userId = request.userId,
            title = request.title,
            body = request.body,
            link = request.link
        )

        return ResponseEntity.ok(mapOf(
            "status" to "queued",
            "message" to "Notification queued successfully for user ${request.userId}"
        ))
    }
}

data class TestNotificationRequest(
    val userId: Long,
    val title: String,
    val body: String,
    val link: String? = null
)

