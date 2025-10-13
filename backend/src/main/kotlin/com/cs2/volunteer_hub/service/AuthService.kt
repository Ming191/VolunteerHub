package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.jwt.JwtTokenProvider
import com.cs2.volunteer_hub.dto.LoginRequest
import com.cs2.volunteer_hub.dto.RegisterRequest
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.repository.UserRepository
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService (
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val authenticationManager: AuthenticationManager,
    private val userDetailsService: CustomUserDetailsService
) {
    fun registerUser(request: RegisterRequest) : User {
        if (userRepository.findByEmail(request.email) != null) {
            throw IllegalArgumentException("Email is already in use")
        }

        val hashedPassword = passwordEncoder.encode(request.password)
        val user = User(
            username = request.username,
            email = request.email,
            passwordHash = hashedPassword
        )
        return userRepository.save(user)
    }

    fun loginUser(request: LoginRequest) : String {
        authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(request.email, request.password)
        )

        val userDetails = userDetailsService.loadUserByUsername(request.email)
        return jwtTokenProvider.generateToken(userDetails)    }
}