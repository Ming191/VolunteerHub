package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.dto.UpdateStatusRequest
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.service.EventManagerService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime


@RestController
@RequestMapping("/api/manager")
@PreAuthorize("hasRole('EVENT_ORGANIZER')")
@Tag(name = "Event Manager", description = "Endpoints for event organizers to manage their events and registrations")
class EventManagerController(
    private val eventManagerService: EventManagerService
) {

    @Operation(
        summary = "Get all registrations for an event",
        description = "Retrieve all registrations for a specific event. Only accessible by the event creator.",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/events/{eventId}/registrations")
    fun getRegistrationsForEvent(
        @Parameter(description = "Event ID", required = true)
        @PathVariable eventId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<RegistrationResponse>> {
        val registrations = eventManagerService.getRegistrationsForEvent(eventId, currentUser.username)
        return ResponseEntity.ok(registrations)
    }

    /**
     * Search and filter registrations within a specific event
     * Supports searching by username, email, phone, status, and date range with pagination
     * Example: GET /api/manager/events/1/registrations/search?q=john&status=APPROVED&page=0&size=20
     */
    @Operation(
        summary = "Search users within event registrations",
        description = "Search and filter registrations for a specific event. Search by user name/email/phone, filter by status and registration date range. Supports pagination.",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/events/{eventId}/registrations/search")
    fun searchEventRegistrations(
        @Parameter(description = "Event ID", required = true)
        @PathVariable eventId: Long,
        @Parameter(description = "Search text (searches name, email, phone)")
        @RequestParam(required = false) q: String?,
        @Parameter(description = "Filter by registration status")
        @RequestParam(required = false) status: RegistrationStatus?,
        @Parameter(description = "Filter registrations after this date (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) registeredAfter: LocalDateTime?,
        @Parameter(description = "Filter registrations before this date (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) registeredBefore: LocalDateTime?,
        @Parameter(description = "Page number (0-based)")
        @RequestParam(defaultValue = "0") page: Int,
        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") size: Int,
        @Parameter(description = "Sort field (e.g., registeredAt, user.name)")
        @RequestParam(defaultValue = "registeredAt") sort: String,
        @Parameter(description = "Sort direction (asc or desc)")
        @RequestParam(defaultValue = "desc") direction: String,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Page<RegistrationResponse>> {
        val pageable = PageRequest.of(
            page,
            size,
            Sort.Direction.fromString(direction.uppercase()),
            sort
        )

        val registrations = eventManagerService.searchEventRegistrations(
            eventId = eventId,
            searchText = q,
            status = status,
            registeredAfter = registeredAfter,
            registeredBefore = registeredBefore,
            pageable = pageable,
            managerEmail = currentUser.username
        )

        return ResponseEntity.ok(registrations)
    }

    /**
     * Get registrations filtered by status for a specific event
     * Example: GET /api/manager/events/1/registrations/status/PENDING
     */
    @Operation(
        summary = "Get registrations by status",
        description = "Retrieve registrations filtered by status for a specific event",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/events/{eventId}/registrations/status/{status}")
    fun getRegistrationsByStatus(
        @Parameter(description = "Event ID", required = true)
        @PathVariable eventId: Long,
        @Parameter(description = "Registration status", required = true)
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
    @Operation(
        summary = "Get all pending registrations",
        description = "Retrieve all pending registrations across all events created by the current manager",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/registrations/pending")
    fun getAllPendingRegistrations(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<RegistrationResponse>> {
        val registrations = eventManagerService.getAllPendingRegistrations(currentUser.username)
        return ResponseEntity.ok(registrations)
    }

    /**
     * Get all approved registrations across all events created by this manager
     * Example: GET /api/manager/registrations/approved
     */
    @Operation(
        summary = "Get all approved registrations",
        description = "Retrieve all approved registrations across all events created by the current manager",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/registrations/approved")
    fun getAllApprovedRegistrations(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<RegistrationResponse>> {
        val registrations = eventManagerService.getAllApprovedRegistrations(currentUser.username)
        return ResponseEntity.ok(registrations)
    }

    @Operation(
        summary = "Update registration status",
        description = "Update the status of a specific registration",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PatchMapping("/registrations/{registrationId}")
    fun updateRegistrationStatus(
        @Parameter(description = "Registration ID", required = true)
        @PathVariable registrationId: Long,
        @Valid @RequestBody statusUpdate: UpdateStatusRequest,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<RegistrationResponse> {
        val newStatus = statusUpdate.status

        val updatedRegistration = eventManagerService.updateRegistrationStatus(registrationId, newStatus, currentUser.username)
        return ResponseEntity.ok(updatedRegistration)
    }

    @Operation(
        summary = "Mark registration as completed",
        description = "Mark a registration as completed (only for approved registrations and past events)",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PostMapping("/registrations/{registrationId}/complete")
    fun markRegistrationAsCompleted(
        @Parameter(description = "Registration ID", required = true)
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
    @Operation(
        summary = "Bulk complete past event registrations",
        description = "Mark all approved registrations for past events as completed",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PostMapping("/registrations/complete-past-events")
    fun bulkCompleteRegistrationsForPastEvents(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Map<String, Int>> {
        val count = eventManagerService.bulkCompleteRegistrationsForPastEvents(currentUser.username)
        return ResponseEntity.ok(mapOf("completedCount" to count))
    }

    /**
     * Get waitlist for a specific event
     * Example: GET /api/manager/events/1/waitlist
     */
    @Operation(
        summary = "Get event waitlist",
        description = "Retrieve all waitlisted registrations for a specific event in order",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/events/{eventId}/waitlist")
    fun getEventWaitlist(
        @Parameter(description = "Event ID", required = true)
        @PathVariable eventId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<RegistrationResponse>> {
        val waitlist = eventManagerService.getEventWaitlist(eventId, currentUser.username)
        return ResponseEntity.ok(waitlist)
    }

    /**
     * Manually promote someone from waitlist to approved
     * Example: POST /api/manager/events/1/waitlist/promote
     */
    @Operation(
        summary = "Promote from waitlist",
        description = "Manually promote the first person from the waitlist (if event has capacity)",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PostMapping("/events/{eventId}/waitlist/promote")
    fun promoteFromWaitlist(
        @Parameter(description = "Event ID", required = true)
        @PathVariable eventId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<RegistrationResponse> {
        val promoted = eventManagerService.promoteFromWaitlist(eventId, currentUser.username)
        return ResponseEntity.ok(promoted)
    }

    /**
     * Get completed registrations for a specific event
     * Example: GET /api/manager/events/1/registrations/completed
     */
    @Operation(
        summary = "Get completed registrations",
        description = "Retrieve all completed registrations for a specific event",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/events/{eventId}/registrations/completed")
    fun getCompletedRegistrations(
        @Parameter(description = "Event ID", required = true)
        @PathVariable eventId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<RegistrationResponse>> {
        val registrations = eventManagerService.getCompletedRegistrations(eventId, currentUser.username)
        return ResponseEntity.ok(registrations)
    }

    /**
     * Get all completed registrations across all manager's events
     * Useful for generating completion reports
     * Example: GET /api/manager/registrations/completed
     */
    @Operation(
        summary = "Get all completed registrations for manager",
        description = "Retrieve all completed registrations across all events created by the current manager",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/registrations/completed")
    fun getAllCompletedRegistrations(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<RegistrationResponse>> {
        val registrations = eventManagerService.getAllCompletedRegistrationsForManager(currentUser.username)
        return ResponseEntity.ok(registrations)
    }

    /**
     * Get active registrations (approved + waitlisted) for an event
     * Example: GET /api/manager/events/1/registrations/active
     */
    @Operation(
        summary = "Get active registrations",
        description = "Retrieve all active registrations (approved + waitlisted) for a specific event",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/events/{eventId}/registrations/active")
    fun getActiveRegistrations(
        @Parameter(description = "Event ID", required = true)
        @PathVariable eventId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<RegistrationResponse>> {
        val registrations = eventManagerService.getActiveRegistrations(eventId, currentUser.username)
        return ResponseEntity.ok(registrations)
    }
}