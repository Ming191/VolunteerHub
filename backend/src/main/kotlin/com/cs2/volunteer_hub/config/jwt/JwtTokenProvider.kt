package com.cs2.volunteer_hub.config.jwt

import com.cs2.volunteer_hub.model.User
import io.jsonwebtoken.Claims
import io.jsonwebtoken.ExpiredJwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.MalformedJwtException
import io.jsonwebtoken.UnsupportedJwtException
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.Date

@Component
class JwtTokenProvider(
    @Value("\${jwt.secret}") private val secret: String,
    @Value("\${jwt.expiration}") private val expiration: Long
) {
    private val logger = LoggerFactory.getLogger(JwtTokenProvider::class.java)
    private val secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret))

    fun generateToken(user: User): String {
        val now: Instant = Instant.now()

        return Jwts.builder()
            .subject(user.email)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusMillis(expiration)))

            .claim("id", user.id)
            .claim("role", "USER")

            .signWith(secretKey)
            .compact()
    }

    private fun getAllClaimsFromToken(token: String): Claims {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .payload
    }

    private fun <T> getClaimFromToken(token: String, claimsResolver: (Claims) -> T): T {
        val claims = getAllClaimsFromToken(token)
        return claimsResolver(claims)
    }


    fun getEmailFromToken(token: String): String {
        return getClaimFromToken(token) { it.subject }
    }

    fun isTokenValid(token: String, userEmail: String): Boolean {
        val email = getEmailFromToken(token)
        return email == userEmail && !isTokenExpired(token)
    }

    private fun isTokenExpired(token: String): Boolean {
        val expiration = getClaimFromToken(token) { it.expiration }
        return expiration.before(Date())
    }

    fun validateToken(token: String): Boolean {
        try {
            getAllClaimsFromToken(token)
            return true
        } catch (ex: MalformedJwtException) {
            logger.error("Invalid JWT token: {}", ex.message)
        } catch (ex: ExpiredJwtException) {
            logger.error("JWT token is expired: {}", ex.message)
        } catch (ex: UnsupportedJwtException) {
            logger.error("JWT token is unsupported: {}", ex.message)
        } catch (ex: IllegalArgumentException) {
            logger.error("JWT claims string is empty: {}", ex.message)
        }
        return false
    }
}