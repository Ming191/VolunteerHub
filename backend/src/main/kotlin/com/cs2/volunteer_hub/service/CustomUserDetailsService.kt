package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository,
) : UserDetailsService {

    private val logger = LoggerFactory.getLogger(CustomUserDetailsService::class.java)

    override fun loadUserByUsername(username: String?): UserDetails {
        logger.info("Loading user by username: $username")

        val user = userRepository.findByEmail(username ?: "")
            ?: throw UsernameNotFoundException("User not found $username")

        logger.info("User found: email=${user.email}, role=${user.role.name}")

        val userDetails = User.builder()
            .username(user.email)
            .password(user.passwordHash)
            .roles(user.role.name)
            .accountLocked(user.isLocked)
            .build()

        logger.info("UserDetails created with authorities: ${userDetails.authorities.map { it.authority }}")

        return userDetails
    }

}