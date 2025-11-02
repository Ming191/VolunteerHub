package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.service.MeService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/me")
@PreAuthorize("isAuthenticated()")
@Tag(name = "User Profile", description = "Current user profile endpoints")
@SecurityRequirement(name = "bearerAuth")
class MeController(
    private val meService: MeService
) {
    @Operation(summary = "Get my registrations", description = "Get all event registrations for the current user")
    @GetMapping("/registrations", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getMyRegistrations(@AuthenticationPrincipal currentUser: UserDetails): ResponseEntity<List<RegistrationResponse>> {
        val myRegistrations = meService.getMyRegistrations(currentUser.username)
        return ResponseEntity.ok(myRegistrations)
    }

    @Operation(summary = "Save FCM token", description = "Save Firebase Cloud Messaging token for push notifications")
    @PostMapping("/fcm-tokens", consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun addFcmToken(
        @RequestBody tokenRequest: Map<String, String>,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Unit> {
        val token = tokenRequest["token"] ?: throw BadRequestException("Token is required.")
        meService.saveFcmToken(token, currentUser.username)
        return ResponseEntity.ok().build()
    }
}