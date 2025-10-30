package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.service.RegistrationService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/events/{eventId}/register")
@PreAuthorize("isAuthenticated()")
class RegistrationController(private val registrationService: RegistrationService) {
    @PostMapping
    @PreAuthorize("hasRole('VOLUNTEER')")
    fun registerForEvent(
        @PathVariable eventId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Unit> {
        registrationService.registerForEvent(eventId, currentUser.username)
        return ResponseEntity.status(HttpStatus.CREATED).build()
    }

    @DeleteMapping
    @PreAuthorize("hasRole('VOLUNTEER')")
    fun cancelRegistration(
        @PathVariable eventId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Unit> {
        registrationService.cancelRegistration(eventId, currentUser.username)
        return ResponseEntity.noContent().build()
    }
}