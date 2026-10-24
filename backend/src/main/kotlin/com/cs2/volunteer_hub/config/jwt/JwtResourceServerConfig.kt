package com.cs2.volunteer_hub.config.jwt

import com.nimbusds.jose.jwk.source.ImmutableSecret
import com.nimbusds.jose.proc.SecurityContext
import java.time.Duration
import java.util.Base64
import javax.crypto.SecretKey
import javax.crypto.spec.SecretKeySpec
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.jose.jws.MacAlgorithm
import org.springframework.security.oauth2.jwt.JwtClaimValidator
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.JwtTimestampValidator
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder

class JwtHmacKey(val secretKey: SecretKey, val algorithm: MacAlgorithm)

@Configuration
class JwtResourceServerConfig {
    @Bean
    fun jwtHmacKey(properties: JwtProperties): JwtHmacKey {
        val secret = try {
            Base64.getDecoder().decode(properties.secret)
        } catch (ex: IllegalArgumentException) {
            throw IllegalArgumentException("JWT_SECRET must be valid Base64", ex)
        }
        require(secret.size >= 32) { "JWT secret must contain at least 32 bytes" }
        val algorithm = when {
            secret.size >= 64 -> MacAlgorithm.HS512
            secret.size >= 48 -> MacAlgorithm.HS384
            else -> MacAlgorithm.HS256
        }
        return JwtHmacKey(SecretKeySpec(secret, "HmacSHA" + algorithm.name.removePrefix("HS")), algorithm)
    }

    @Bean
    fun jwtDecoder(hmac: JwtHmacKey): JwtDecoder {
        val decoder = NimbusJwtDecoder.withSecretKey(hmac.secretKey).macAlgorithm(hmac.algorithm).build()
        decoder.setJwtValidator(DelegatingOAuth2TokenValidator(
            JwtTimestampValidator(Duration.ZERO),
            JwtClaimValidator<String>("sub") { !it.isNullOrBlank() }
        ))
        return decoder
    }

    @Bean
    fun jwtEncoder(hmac: JwtHmacKey): JwtEncoder =
        NimbusJwtEncoder(ImmutableSecret<SecurityContext>(hmac.secretKey))
}
