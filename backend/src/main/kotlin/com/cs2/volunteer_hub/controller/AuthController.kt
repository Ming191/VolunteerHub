package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.LoginRequest
import com.cs2.volunteer_hub.dto.RegisterRequest
import com.cs2.volunteer_hub.service.AuthService
import com.cs2.volunteer_hub.service.EmailVerificationService
import com.cs2.volunteer_hub.service.EmailService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User registration and login endpoints")
class AuthController (
    private val authService: AuthService,
    private val emailVerificationService: EmailVerificationService,
    private val emailService: EmailService
) {

    @Operation(
        summary = "Register a new user",
        description = "Create a new user account with VOLUNTEER or EVENT_ORGANIZER role. A verification email will be sent."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "201",
                description = "User registered successfully, verification email sent",
                content = [Content(mediaType = "application/json", examples = [ExampleObject(value = """{"message": "Registration successful. Please check your email to verify your account."}""")])]
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
            ResponseEntity(
                mapOf("message" to "Registration successful. Please check your email to verify your account."),
                HttpStatus.CREATED
            )
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

    @Operation(
        summary = "Verify email",
        description = "Verify user email address using the token sent via email"
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Email verified successfully",
                content = [Content(mediaType = "application/json", examples = [ExampleObject(value = """{"message": "Email verified successfully!"}""")])]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid or expired token",
                content = [Content(mediaType = "application/json", examples = [ExampleObject(value = """{"error": "Invalid verification token"}""")])]
            )
        ]
    )
    @GetMapping("/verify-email")
    fun verifyEmail(@RequestParam token: String): ResponseEntity<Any> {
        return try {
            emailVerificationService.verifyEmail(token)

            // Send welcome email after successful verification
            val user = emailVerificationService.getUserByToken(token)
            user?.let { emailService.sendWelcomeEmail(it.email, it.name) }

            ResponseEntity.ok(mapOf("message" to "Email verified successfully!"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity(mapOf("error" to e.message), HttpStatus.BAD_REQUEST)
        }
    }

    @Operation(
        summary = "Resend verification email",
        description = "Resend verification email to the specified email address"
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Verification email sent",
                content = [Content(mediaType = "application/json", examples = [ExampleObject(value = """{"message": "Verification email sent successfully"}""")])]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid email or already verified",
                content = [Content(mediaType = "application/json", examples = [ExampleObject(value = """{"error": "Email is already verified"}""")])]
            )
        ]
    )
    @PostMapping("/resend-verification")
    fun resendVerification(@RequestBody request: Map<String, String>): ResponseEntity<Any> {
        return try {
            val email = request["email"] ?: throw IllegalArgumentException("Email is required")
            emailVerificationService.resendVerificationEmail(email)
            ResponseEntity.ok(mapOf("message" to "Verification email sent successfully"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity(mapOf("error" to e.message), HttpStatus.BAD_REQUEST)
        }
    }
}