package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.dto.UpdateStatusRequest
import com.cs2.volunteer_hub.service.EventManagerService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/api/manager")
@PreAuthorize("hasRole('EVENT_ORGANIZER')")
class EventManagerController(
    private val eventManagerService: EventManagerService
) {

    @GetMapping("/events/{eventId}/registrations")
    fun getRegistrationsForEvent(
        @PathVariable eventId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<RegistrationResponse>> {
        val registrations = eventManagerService.getRegistrationsForEvent(eventId, currentUser.username)
        return ResponseEntity.ok(registrations)
    }

    @PatchMapping("/registrations/{registrationId}")
    fun updateRegistrationStatus(
        @PathVariable registrationId: Long,
        @Valid @RequestBody statusUpdate: UpdateStatusRequest,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<RegistrationResponse> {
        val newStatus = statusUpdate.status

        val updatedRegistration = eventManagerService.updateRegistrationStatus(registrationId, newStatus, currentUser.username)
        return ResponseEntity.ok(updatedRegistration)
    }

    @PostMapping("/registrations/{registrationId}/complete")
    fun markRegistrationAsCompleted(
        @PathVariable registrationId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<RegistrationResponse> {
        val updatedRegistration = eventManagerService.markRegistrationAsCompleted(registrationId, currentUser.username)
        return ResponseEntity.ok(updatedRegistration)
    }
}