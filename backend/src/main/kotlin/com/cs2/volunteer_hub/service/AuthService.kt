package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.jwt.JwtTokenProvider
import com.cs2.volunteer_hub.dto.LoginRequest
import com.cs2.volunteer_hub.dto.RegisterRequest
import com.cs2.volunteer_hub.dto.TokenResponse
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.model.UserSettings
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.UserSettingsRepository
import java.time.LocalDateTime
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
        private val userRepository: UserRepository,
        private val userSettingsRepository: UserSettingsRepository,
        private val passwordEncoder: PasswordEncoder,
        private val jwtTokenProvider: JwtTokenProvider,
        private val authenticationManager: AuthenticationManager,
        private val userDetailsService: CustomUserDetailsService,
        private val emailVerificationService: EmailVerificationService,
        private val refreshTokenService: RefreshTokenService,
        @Value("\${jwt.refresh-token.expiration:2592000000}") // Default: 30 days
        private val refreshTokenExpiration: Long
) {
    private val logger = LoggerFactory.getLogger(AuthService::class.java)

    @Transactional
    fun registerUser(request: RegisterRequest): User {
        logger.info(
                "Registration request received - email: ${request.email}, requested role: ${request.role}"
        )

        if (userRepository.findByEmail(request.email) != null) {
            throw IllegalArgumentException("Email is already in use")
        }

        val hashedPassword = passwordEncoder.encode(request.password)
        val assignedRole = request.role ?: Role.VOLUNTEER
        logger.info("Assigning role: $assignedRole to user: ${request.email}")

        val user =
                User(
                        name = request.username,
                        gender = request.gender,
                        email = request.email,
                        passwordHash = hashedPassword,
                        role = assignedRole,
                        isEmailVerified = false
                )
        val savedUser = userRepository.save(user)
        logger.info(
                "User saved with role: ${savedUser.role}, email verified: ${savedUser.isEmailVerified}"
        )

        // Create user settings eagerly to prevent race conditions
        val userSettings = UserSettings(userId = savedUser.id, user = savedUser)
        userSettingsRepository.save(userSettings)
        logger.info("Created default settings for user: ${savedUser.id}")

        val token = emailVerificationService.createVerificationToken(savedUser)
        emailVerificationService.sendVerificationEmail(savedUser, token)

        return savedUser
    }

    fun loginUser(
            request: LoginRequest,
            ipAddress: String? = null,
            userAgent: String? = null
    ): TokenResponse {
        authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken(request.email, request.password)
        )

        val userDetails = userDetailsService.loadUserByUsername(request.email)

        val user =
                userRepository.findByEmail(request.email)
                        ?: throw IllegalArgumentException("User not found")

        user.lastLoginAt = LocalDateTime.now()
        userRepository.save(user)
        logger.info("Updated last login for user: ${user.email}")

        // Generate access token
        val accessToken = jwtTokenProvider.generateToken(userDetails)

        // Generate refresh token
        val refreshToken = refreshTokenService.createRefreshToken(user, ipAddress, userAgent)

        return TokenResponse(
                accessToken = accessToken,
                refreshToken = refreshToken.token,
                accessTokenExpiresIn = jwtTokenProvider.getExpirationMillis(),
                refreshTokenExpiresIn = refreshTokenExpiration
        )
    }

    fun refreshAccessToken(
            refreshToken: String,
            ipAddress: String? = null,
            userAgent: String? = null
    ): TokenResponse {
        // Rotate the refresh token (security best practice)
        val newRefreshToken =
                refreshTokenService.rotateRefreshToken(refreshToken, ipAddress, userAgent)

        // Generate new access token
        val userDetails = userDetailsService.loadUserByUsername(newRefreshToken.user.email)
        val accessToken = jwtTokenProvider.generateToken(userDetails)

        return TokenResponse(
                accessToken = accessToken,
                refreshToken = newRefreshToken.token,
                accessTokenExpiresIn = jwtTokenProvider.getExpirationMillis(),
                refreshTokenExpiresIn = refreshTokenExpiration
        )
    }

    fun logout(refreshToken: String) {
        refreshTokenService.revokeToken(refreshToken)
    }

    fun logoutAllDevices(userEmail: String) {
        val user =
                userRepository.findByEmail(userEmail)
                        ?: throw IllegalArgumentException("User not found")
        refreshTokenService.revokeAllUserTokens(user)
    }

    fun getUserByEmail(email: String): User {
        return userRepository.findByEmail(email) ?: throw IllegalArgumentException("User not found")
    }
}
