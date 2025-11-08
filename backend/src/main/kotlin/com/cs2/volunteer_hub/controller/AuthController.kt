package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.*
import com.cs2.volunteer_hub.mapper.LoginMapper
import com.cs2.volunteer_hub.mapper.RegisterMapper
import com.cs2.volunteer_hub.mapper.VerifyEmailMapper
import com.cs2.volunteer_hub.service.AuthService
import com.cs2.volunteer_hub.service.EmailQueueService
import com.cs2.volunteer_hub.service.EmailVerificationService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User registration and login endpoints")
class AuthController (
    private val authService: AuthService,
    private val emailVerificationService: EmailVerificationService,
    private val emailQueueService: EmailQueueService,
    private val loginMapper: LoginMapper,
    private val registerMapper: RegisterMapper,
    private val verifyEmailMapper: VerifyEmailMapper
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
                content = [Content(
                    mediaType = "application/json",
                    examples = [ExampleObject(value = """{"message": "Registration successful. Please check your email to verify your account."}""")],
                    schema = Schema(implementation = RegisterResponse::class)
                    )]
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
    ): ResponseEntity<RegisterResponse> {
        val user = authService.registerUser(request)
        val response = registerMapper.toRegisterResponse(user)
        return ResponseEntity(response, HttpStatus.CREATED)
    }

    @Operation(
        summary = "Login",
        description = "Authenticate user and receive JWT access token and refresh token"
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Login successful",
                content = [Content(
                    mediaType = "application/json",
                    examples = [ExampleObject(value = """{"accessToken": "eyJhbGc...", "refreshToken": "550e8400-e29b-41d4-a716-446655440000", "accessTokenExpiresIn": 900000, "refreshTokenExpiresIn": 2592000000, "tokenType": "Bearer"}""")],
                    schema = Schema(implementation = LoginResponse::class)
                    )]
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
        @Valid @RequestBody request: LoginRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<LoginResponse> {
        val ipAddress = httpRequest.remoteAddr
        val userAgent = httpRequest.getHeader("User-Agent")
        val tokenResponse = authService.loginUser(request, ipAddress, userAgent)
        val user = authService.getUserByEmail(request.email)
        val response = loginMapper.toLoginResponse(user, tokenResponse)
        return ResponseEntity.ok(response)
    }

    @Operation(
        summary = "Refresh access token",
        description = "Use refresh token to obtain a new access token without re-authentication. The refresh token will be rotated (old one invalidated, new one issued) for security."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Token refreshed successfully",
                content = [Content(
                    mediaType = "application/json",
                    examples = [ExampleObject(value = """{"accessToken": "eyJhbGc...", "refreshToken": "650e8400-e29b-41d4-a716-446655440001", "accessTokenExpiresIn": 900000, "refreshTokenExpiresIn": 2592000000, "tokenType": "Bearer"}""")],
                    schema = Schema(implementation = TokenResponse::class)
                    )]
            ),
            ApiResponse(
                responseCode = "401",
                description = "Invalid or expired refresh token",
                content = [Content(mediaType = "application/json", examples = [ExampleObject(value = """{"error": "Invalid refresh token"}""")])]
            )
        ]
    )
    @PostMapping("/refresh")
    fun refreshToken(
        @Valid @RequestBody request: RefreshTokenRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<Any> {
        return try {
            val ipAddress = httpRequest.remoteAddr
            val userAgent = httpRequest.getHeader("User-Agent")
            val tokenResponse = authService.refreshAccessToken(request.refreshToken, ipAddress, userAgent)
            ResponseEntity.ok(tokenResponse)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to (e.message ?: "Invalid refresh token")))
        }
    }

    @Operation(
        summary = "Logout",
        description = "Logout from current device by revoking the refresh token"
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Logged out successfully",
                content = [Content(mediaType = "application/json", examples = [ExampleObject(value = """{"message": "Logged out successfully"}""")])]
            )
        ]
    )
    @PostMapping("/logout")
    fun logout(@RequestBody request: Map<String, String>): ResponseEntity<Map<String, String>> {
        val refreshToken = request["refreshToken"]
        if (refreshToken != null) {
            authService.logout(refreshToken)
        }
        return ResponseEntity.ok(mapOf("message" to "Logged out successfully"))
    }

    @Operation(
        summary = "Logout from all devices",
        description = "Revoke all refresh tokens for the current user (requires authentication)"
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Logged out from all devices",
                content = [Content(mediaType = "application/json", examples = [ExampleObject(value = """{"message": "Logged out from all devices"}""")])]
            )
        ]
    )
    @PostMapping("/logout-all")
    fun logoutAll(@AuthenticationPrincipal currentUser: UserDetails): ResponseEntity<Map<String, String>> {
        authService.logoutAllDevices(currentUser.username)
        return ResponseEntity.ok(mapOf("message" to "Logged out from all devices"))
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
                content = [Content(
                    mediaType = "application/json",
                    examples = [ExampleObject(value = """{"message": "Email verified successfully!"}""")],
                    schema = Schema(implementation = VerifyEmailResponse::class)
                )]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid or expired token",
                content = [Content(mediaType = "application/json", examples = [ExampleObject(value = """{"error": "Invalid verification token"}""")])]
            )
        ]
    )
    @GetMapping("/verify-email")
    fun verifyEmail(@RequestParam token: String): ResponseEntity<VerifyEmailResponse> {
        emailVerificationService.verifyEmail(token)
        val user = emailVerificationService.getUserByToken(token)
            ?: throw IllegalArgumentException("User not found")

        emailQueueService.queueWelcomeEmail(user.email, user.name)

        val response = verifyEmailMapper.toVerifyEmailResponse(user)
        return ResponseEntity.ok(response)
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
