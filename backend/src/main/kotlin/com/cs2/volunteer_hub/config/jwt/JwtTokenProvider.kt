package com.cs2.volunteer_hub.config.jwt

import io.jsonwebtoken.*
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.*

@Component
class JwtTokenProvider(
    @param:Value($$"${jwt.secret}") private val secret: String,
    @param:Value($$"${jwt.expiration}") private val expiration: Long
) {
    private val secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret))

    fun generateToken(userDetails: UserDetails): String {
        val now: Instant = Instant.now()

        return Jwts.builder()
            .subject(userDetails.username)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusMillis(expiration)))

            .claim("roles", userDetails.authorities.map { it.authority })

            .signWith(secretKey)
            .compact()
    }

    fun getExpirationMillis(): Long = expiration

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
}