package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.repository.UserRepository
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository,
) : UserDetailsService {
    override fun loadUserByUsername(username: String?): UserDetails {
        val user = userRepository.findByEmail(username ?: "")
            ?: throw UsernameNotFoundException("User not found $username")

        val userDetails = User.builder()
            .username(user.email)
            .password(user.passwordHash)
            .roles(user.role.name)
            .accountLocked(user.isLocked)
            .build()
        return userDetails
    }

}