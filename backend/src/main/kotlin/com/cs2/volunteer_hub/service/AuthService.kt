package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.jwt.JwtTokenProvider
import com.cs2.volunteer_hub.dto.LoginRequest
import com.cs2.volunteer_hub.dto.RegisterRequest
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class AuthService (
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val authenticationManager: AuthenticationManager,
    private val userDetailsService: CustomUserDetailsService,
    private val emailVerificationService: EmailVerificationService
) {
    private val logger = LoggerFactory.getLogger(AuthService::class.java)

    fun registerUser(request: RegisterRequest) : User {
        logger.info("Registration request received - email: ${request.email}, requested role: ${request.role}")

        if (userRepository.findByEmail(request.email) != null) {
            throw IllegalArgumentException("Email is already in use")
        }

        val hashedPassword = passwordEncoder.encode(request.password)
        val assignedRole = request.role ?: Role.VOLUNTEER
        logger.info("Assigning role: $assignedRole to user: ${request.email}")

        val user = User(
            name = request.username,
            email = request.email,
            passwordHash = hashedPassword,
            role = assignedRole,
            isEmailVerified = false
        )
        val savedUser = userRepository.save(user)
        logger.info("User saved with role: ${savedUser.role}, email verified: ${savedUser.isEmailVerified}")

        val token = emailVerificationService.createVerificationToken(savedUser)
        emailVerificationService.sendVerificationEmail(savedUser, token)

        return savedUser
    }

    fun loginUser(request: LoginRequest) : String {
        authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(request.email, request.password)
        )

        val userDetails = userDetailsService.loadUserByUsername(request.email)

        val user = userRepository.findByEmail(request.email)
        user?.let {
            it.lastLoginAt = LocalDateTime.now()
            userRepository.save(it)
            logger.info("Updated last login for user: ${it.email}")
        }

        return jwtTokenProvider.generateToken(userDetails)
    }
}