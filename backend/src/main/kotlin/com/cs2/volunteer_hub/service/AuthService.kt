package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.jwt.JwtTokenProvider
import com.cs2.volunteer_hub.dto.LoginRequest
import com.cs2.volunteer_hub.dto.RegisterRequest
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.repository.UserRepository
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService (
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {
    fun registerUser(request: RegisterRequest) : User {
        if (userRepository.findByEmail(request.email) != null) {
            throw IllegalArgumentException("Email is already in use")
        }

        val hashedPassword = passwordEncoder.encode(request.password)
        val user = User(
            username = request.name,
            email = request.email,
            passwordHash = hashedPassword
        )
        return userRepository.save(user)
    }

    fun loginUser(request: LoginRequest) : String {
        val user = userRepository.findByEmail(request.email)
            ?: throw BadCredentialsException("Invalid email or password")

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw BadCredentialsException("Invalid email or password")
        }

        return jwtTokenProvider.generateToken(user)
    }
}