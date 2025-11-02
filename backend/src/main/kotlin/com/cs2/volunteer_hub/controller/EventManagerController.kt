package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.dto.UpdateStatusRequest
import com.cs2.volunteer_hub.model.RegistrationStatus
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

    /**
     * Get registrations filtered by status for a specific event
     * Example: GET /api/manager/events/1/registrations/status/PENDING
     */
    @GetMapping("/events/{eventId}/registrations/status/{status}")
    fun getRegistrationsByStatus(
        @PathVariable eventId: Long,
        @PathVariable status: RegistrationStatus,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<RegistrationResponse>> {
        val registrations = eventManagerService.getRegistrationsByStatus(eventId, status, currentUser.username)
        return ResponseEntity.ok(registrations)
    }

    /**
     * Get all pending registrations across all events created by this manager
     * Example: GET /api/manager/registrations/pending
     */
    @GetMapping("/registrations/pending")
    fun getAllPendingRegistrations(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<RegistrationResponse>> {
        val registrations = eventManagerService.getAllPendingRegistrations(currentUser.username)
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

    /**
     * Bulk complete all approved registrations for past events
     * Example: POST /api/manager/registrations/complete-past-events
     * Returns the count of registrations marked as completed
     */
    @PostMapping("/registrations/complete-past-events")
    fun bulkCompleteRegistrationsForPastEvents(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Map<String, Int>> {
        val count = eventManagerService.bulkCompleteRegistrationsForPastEvents(currentUser.username)
        return ResponseEntity.ok(mapOf("completedCount" to count))
    }
}