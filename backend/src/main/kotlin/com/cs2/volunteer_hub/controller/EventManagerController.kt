package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.service.EventManagerService
import org.apache.coyote.BadRequestException
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/api/manager/events")
@PreAuthorize("hasRole('EVENT_ORGANIZER')")
class EventManagerController(
    private val eventManagerService: EventManagerService
) {
    @GetMapping("/{eventId}/registrations")
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
        @RequestBody statusUpdate: Map<String, String>,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<RegistrationResponse> {
        val newStatusString = statusUpdate["status"]?.uppercase()
            ?: throw BadRequestException("Missing 'status' field.")
        val newStatus = RegistrationStatus.valueOf(newStatusString)
        val updatedRegistration = eventManagerService.updateRegistrationStatus(registrationId, newStatus, currentUser.username)
        return ResponseEntity.ok(updatedRegistration)
    }
}