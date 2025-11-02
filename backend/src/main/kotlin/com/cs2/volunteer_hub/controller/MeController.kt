package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.service.MeService
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
class MeController(
    private val meService: MeService
) {
    @GetMapping("/registrations")
    fun getMyRegistrations(@AuthenticationPrincipal currentUser: UserDetails): ResponseEntity<List<RegistrationResponse>> {
        val myRegistrations = meService.getMyRegistrations(currentUser.username)
        return ResponseEntity.ok(myRegistrations)
    }

    @PostMapping("/fcm-tokens")
    fun addFcmToken(
        @RequestBody tokenRequest: Map<String, String>,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Unit> {
        val token = tokenRequest["token"] ?: throw BadRequestException("Token is required.")
        meService.saveFcmToken(token, currentUser.username)
        return ResponseEntity.ok().build()
    }
}