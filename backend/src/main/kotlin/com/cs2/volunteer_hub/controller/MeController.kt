package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.ChangePasswordRequest
import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.dto.UpdateProfileRequest
import com.cs2.volunteer_hub.dto.UserResponse
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.service.MeService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/me")
@PreAuthorize("isAuthenticated()")
@Tag(name = "User Profile", description = "Current user profile endpoints")
@SecurityRequirement(name = "bearerAuth")
class MeController(
    private val meService: MeService
) {
    @Operation(summary = "Get my profile", description = "Get the current user's profile information")
    @GetMapping(produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getMyProfile(@AuthenticationPrincipal currentUser: UserDetails): ResponseEntity<UserResponse> {
        val profile = meService.getMyProfile(currentUser.username)
        return ResponseEntity.ok(profile)
    }

    @Operation(summary = "Update my profile", description = "Update the current user's profile information")
    @PutMapping(consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun updateMyProfile(
        @Valid @RequestBody request: UpdateProfileRequest,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<UserResponse> {
        val updatedProfile = meService.updateProfile(currentUser.username, request)
        return ResponseEntity.ok(updatedProfile)
    }

    @Operation(summary = "Change password", description = "Change the current user's password")
    @PutMapping("/password", consumes = [MediaType.APPLICATION_JSON_VALUE])
    fun changePassword(
        @Valid @RequestBody request: ChangePasswordRequest,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Map<String, String>> {
        try {
            meService.changePassword(currentUser.username, request)
            return ResponseEntity.ok(mapOf("message" to "Password changed successfully"))
        } catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
        }
    }

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

    @Operation(summary = "Upload profile picture", description = "Upload a new profile picture for the current user")
    @PostMapping("/profile-picture", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun uploadProfilePicture(
        @RequestPart("file") file: MultipartFile,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<UserResponse> {
        val updatedProfile = meService.uploadProfilePicture(currentUser.username, file)
        return ResponseEntity.ok(updatedProfile)
    }
}