package com.cs2.volunteer_hub.config.jwt

import com.cs2.volunteer_hub.service.CustomUserDetailsService
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter


@Component
class JwtAuthenticationFilter(
    private val jwtTokenProvider: JwtTokenProvider,
    private val userDetailsService: CustomUserDetailsService
) : OncePerRequestFilter() {

    private val logger = LoggerFactory.getLogger(JwtAuthenticationFilter::class.java)

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        logger.info("Processing request: ${request.method} ${request.requestURI}")

        val authHeader = request.getHeader("Authorization")
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("No valid Authorization header found")
            filterChain.doFilter(request, response)
            return
        }

        val jwt = authHeader.substring(7)
        logger.info("JWT token extracted: ${jwt.take(20)}...")

        val username = jwtTokenProvider.getEmailFromToken(jwt)
        logger.info("Username from token: $username")

        if (SecurityContextHolder.getContext().authentication == null) {
            val userDetails = userDetailsService.loadUserByUsername(username)
            logger.info("UserDetails loaded for: ${userDetails.username}")
            logger.info("Authorities: ${userDetails.authorities.map { it.authority }}")

            if (jwtTokenProvider.isTokenValid(jwt, userDetails.username)) {
                logger.info("Token is valid")
                val authToken = UsernamePasswordAuthenticationToken(
                    userDetails,
                    null, // credentials
                    userDetails.authorities
                )
                authToken.details = WebAuthenticationDetailsSource().buildDetails(request)
                SecurityContextHolder.getContext().authentication = authToken
                logger.info("Authentication set in SecurityContext")
            } else {
                logger.warn("Token validation failed")
            }
        } else {
            logger.info("Authentication already exists in SecurityContext")
        }
        filterChain.doFilter(request, response)
    }
}