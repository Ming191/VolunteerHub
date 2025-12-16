package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.ActiveSessionResponse
import com.cs2.volunteer_hub.dto.DeleteAccountRequest
import com.cs2.volunteer_hub.dto.UpdateUserSettingsRequest
import com.cs2.volunteer_hub.dto.UserSettingsResponse
import com.cs2.volunteer_hub.service.SettingsService
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

@RestController
@RequestMapping("/api/me")
@PreAuthorize("isAuthenticated()")
@Tag(name = "User Settings", description = "User settings and account management endpoints")
@SecurityRequirement(name = "bearerAuth")
class SettingsController(private val settingsService: SettingsService) {

    @Operation(summary = "Get user settings", description = "Get the current user's settings")
    @GetMapping("/settings", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getUserSettings(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<UserSettingsResponse> {
        val settings = settingsService.getUserSettings(currentUser.username)
        return ResponseEntity.ok(settings)
    }

    @Operation(summary = "Update user settings", description = "Update the current user's settings")
    @PutMapping(
        "/settings",
        consumes = [MediaType.APPLICATION_JSON_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun updateUserSettings(
        @Valid @RequestBody request: UpdateUserSettingsRequest,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<UserSettingsResponse> {
        val settings = settingsService.updateUserSettings(currentUser.username, request)
        return ResponseEntity.ok(settings)
    }

    @Operation(
        summary = "Get active sessions",
        description = "Get all active sessions for the current user"
    )
    @GetMapping("/sessions", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getActiveSessions(
        @RequestHeader("Authorization") authorization: String?,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<ActiveSessionResponse>> {
        // Extract current token from Authorization header
        val currentToken = authorization?.takeIf { it.startsWith("Bearer ") }
            ?.removePrefix("Bearer ")?.trim()
        val sessions = settingsService.getActiveSessions(currentUser.username, currentToken)
        return ResponseEntity.ok(sessions)
    }

    @Operation(summary = "Revoke a session", description = "Revoke a specific session by ID")
    @DeleteMapping("/sessions/{sessionId}")
    fun revokeSession(
        @PathVariable sessionId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Map<String, String>> {
        settingsService.revokeSession(currentUser.username, sessionId)
        return ResponseEntity.ok(mapOf("message" to "Session revoked successfully"))
    }

    @Operation(
        summary = "Revoke all other sessions",
        description = "Revoke all sessions except the current one"
    )
    @DeleteMapping("/sessions")
    fun revokeAllOtherSessions(
        @RequestHeader("Authorization") authorization: String,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Map<String, String>> {
        val currentToken = authorization.removePrefix("Bearer ").trim()
        settingsService.revokeAllOtherSessions(currentUser.username, currentToken)
        return ResponseEntity.ok(mapOf("message" to "All other sessions revoked successfully"))
    }

    @Operation(summary = "Delete account", description = "Soft delete the current user's account")
    @DeleteMapping("/account", consumes = [MediaType.APPLICATION_JSON_VALUE])
    fun deleteAccount(
        @Valid @RequestBody request: DeleteAccountRequest,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Map<String, String>> {
        settingsService.deleteAccount(currentUser.username, request)
        return ResponseEntity.ok(mapOf("message" to "Account deleted successfully"))
    }
}
