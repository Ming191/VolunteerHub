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
}