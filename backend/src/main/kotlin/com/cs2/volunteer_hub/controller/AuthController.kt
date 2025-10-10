package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.LoginRequest
import com.cs2.volunteer_hub.dto.RegisterRequest
import com.cs2.volunteer_hub.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/api/auth")
class AuthController (private val authService: AuthService) {

    @PostMapping("/register")
    fun register(
        @Valid @RequestBody
        request: RegisterRequest
    ): ResponseEntity<Any> {
        authService.registerUser(request)
        return ResponseEntity("Registration successful", HttpStatus.CREATED)
    }

    @PostMapping("/login")
    fun login(
        @Valid @RequestBody
        request: LoginRequest
    ): ResponseEntity<Any> {
        val token = authService.loginUser(request)
        return ResponseEntity.ok(mapOf("token" to token))
    }
}