package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.RegistrationResultResponse
import com.cs2.volunteer_hub.dto.RegistrationStatusResponse
import com.cs2.volunteer_hub.service.RegistrationService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/events/{eventId}/register")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Registrations", description = "Event registration endpoints")
@SecurityRequirement(name = "bearerAuth")
class RegistrationController(private val registrationService: RegistrationService) {

    @Operation(
        summary = "Register for event",
        description = "Register the current user as a volunteer for an event. If event is full, user will be added to waitlist (if enabled)."
    )
    @PostMapping(produces = [MediaType.APPLICATION_JSON_VALUE])
    @PreAuthorize("hasRole('VOLUNTEER')")
    fun registerForEvent(
        @PathVariable eventId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<RegistrationResultResponse> {
        val result = registrationService.registerForEvent(eventId, currentUser.username)
        return ResponseEntity.status(HttpStatus.CREATED).body(result)
    }

    @Operation(
        summary = "Cancel registration",
        description = "Cancel the current user's registration for an event. If on waitlist, will be removed and others will move up."
    )
    @DeleteMapping
    @PreAuthorize("hasRole('VOLUNTEER')")
    fun cancelRegistration(
        @PathVariable eventId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Unit> {
        registrationService.cancelRegistration(eventId, currentUser.username)
        return ResponseEntity.noContent().build()
    }

    @Operation(
        summary = "Get registration status",
        description = "Get the current user's registration status for this event, including waitlist position if applicable"
    )
    @GetMapping
    @PreAuthorize("hasRole('VOLUNTEER')")
    fun getRegistrationStatus(
        @PathVariable eventId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<RegistrationStatusResponse> {
        val status = registrationService.getRegistrationStatus(eventId, currentUser.username)
        return ResponseEntity.ok(status)
    }
}