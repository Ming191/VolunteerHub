package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.LoginRequest
import com.cs2.volunteer_hub.dto.RegisterRequest
import com.cs2.volunteer_hub.service.AuthService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User registration and login endpoints")
class AuthController (private val authService: AuthService) {

    @Operation(
        summary = "Register a new user",
        description = "Create a new user account with VOLUNTEER or EVENT_ORGANIZER role"
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "201",
                description = "User registered successfully",
                content = [Content(mediaType = "text/plain", examples = [ExampleObject(value = "Registration successful")])]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid input or email already exists",
                content = [Content(mediaType = "application/json", examples = [ExampleObject(value = """{"error": "Email already exists"}""")])]
            )
        ]
    )
    @PostMapping("/register")
    fun register(
        @Valid @RequestBody
        request: RegisterRequest
    ): ResponseEntity<Any> {
        return try {
            authService.registerUser(request)
            ResponseEntity("Registration successful", HttpStatus.CREATED)
        } catch (e: IllegalArgumentException) {
            ResponseEntity(mapOf("error" to e.message), HttpStatus.BAD_REQUEST)
        }
    }

    @Operation(
        summary = "Login",
        description = "Authenticate user and receive JWT token"
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Login successful",
                content = [Content(mediaType = "application/json", examples = [ExampleObject(value = """{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}""")])]
            ),
            ApiResponse(
                responseCode = "401",
                description = "Invalid credentials",
                content = [Content(mediaType = "application/json", examples = [ExampleObject(value = """{"error": "Invalid credentials"}""")])]
            )
        ]
    )
    @PostMapping("/login")
    fun login(
        @Valid @RequestBody
        request: LoginRequest
    ): ResponseEntity<Any> {
        val token = authService.loginUser(request)
        return ResponseEntity.ok(mapOf("token" to token))
    }
}