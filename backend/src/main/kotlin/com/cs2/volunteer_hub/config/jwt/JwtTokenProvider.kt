package com.cs2.volunteer_hub.config.jwt

import java.time.Instant
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.oauth2.jwt.JwtClaimsSet
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.JwtEncoderParameters
import org.springframework.security.oauth2.jwt.JwsHeader
import org.springframework.stereotype.Component

@Component
class JwtTokenProvider(
    private val encoder: JwtEncoder,
    private val hmac: JwtHmacKey,
    private val jwtProperties: JwtProperties
) {
    fun generateToken(userDetails: UserDetails): String {
        val now = Instant.now()
        val claims = JwtClaimsSet.builder()
            .subject(userDetails.username)
            .issuedAt(now)
            .expiresAt(now.plusMillis(jwtProperties.expiration))
            .claim("roles", userDetails.authorities.map { it.authority })
            .build()
        val header = JwsHeader.with(hmac.algorithm).build()
        return encoder.encode(JwtEncoderParameters.from(header, claims)).tokenValue
    }

    fun getExpirationMillis(): Long = jwtProperties.expiration
}
