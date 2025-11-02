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
        try {
            val authHeader = request.getHeader("Authorization")
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response)
                return
            }
            val jwt = authHeader.substring(7).trim()
            if (jwt.isEmpty()) {
                logger.warn("Empty JWT token after 'Bearer ' prefix")
                filterChain.doFilter(request, response)
                return
            }
            if (jwt.count { it == '.' } != 2) {
                logger.warn("Invalid JWT token format: expected 2 dots, found ${jwt.count { it == '.' }}")
                filterChain.doFilter(request, response)
                return
            }

            val username = jwtTokenProvider.getEmailFromToken(jwt)

            if (SecurityContextHolder.getContext().authentication == null) {
                val userDetails = userDetailsService.loadUserByUsername(username)

                if (jwtTokenProvider.isTokenValid(jwt, userDetails.username)) {
                    val authToken = UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.authorities
                    )
                    authToken.details = WebAuthenticationDetailsSource().buildDetails(request)
                    SecurityContextHolder.getContext().authentication = authToken
                    logger.debug("Successfully authenticated user: $username")
                } else {
                    logger.warn("Token validation failed for user: $username")
                }
            }
        } catch (e: io.jsonwebtoken.MalformedJwtException) {
            logger.error("Malformed JWT token: ${e.message}")
        } catch (e: io.jsonwebtoken.ExpiredJwtException) {
            logger.error("Expired JWT token: ${e.message}")
        } catch (e: io.jsonwebtoken.UnsupportedJwtException) {
            logger.error("Unsupported JWT token: ${e.message}")
        } catch (e: io.jsonwebtoken.security.SignatureException) {
            logger.error("Invalid JWT signature: ${e.message}")
        } catch (e: IllegalArgumentException) {
            logger.error("JWT claims string is empty: ${e.message}")
        } catch (e: Exception) {
            logger.error("JWT authentication failed: ${e.message}", e)
        }

        filterChain.doFilter(request, response)
    }
}