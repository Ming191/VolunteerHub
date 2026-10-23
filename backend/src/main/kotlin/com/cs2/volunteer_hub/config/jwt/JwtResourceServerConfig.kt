package com.cs2.volunteer_hub.config.jwt

import java.time.Duration
import java.util.Base64
import javax.crypto.spec.SecretKeySpec
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.jose.jws.MacAlgorithm
import org.springframework.security.oauth2.jwt.JwtClaimValidator
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtTimestampValidator
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator

@Configuration
class JwtResourceServerConfig {
    @Bean
    fun jwtDecoder(@Value("\${jwt.secret}") encodedSecret: String): JwtDecoder {
        val secret = Base64.getDecoder().decode(encodedSecret)
        require(secret.size >= 32) { "JWT secret must contain at least 32 bytes" }

        // JJWT previously selected the strongest HMAC algorithm for the key size.
        // Match its existing tokens without accepting an algorithm chosen by the caller.
        val algorithm = when {
            secret.size >= 64 -> MacAlgorithm.HS512
            secret.size >= 48 -> MacAlgorithm.HS384
            else -> MacAlgorithm.HS256
        }
        val decoder = NimbusJwtDecoder.withSecretKey(
            SecretKeySpec(secret, "HmacSHA" + algorithm.name.removePrefix("HS"))
        ).macAlgorithm(algorithm).build()
        decoder.setJwtValidator(DelegatingOAuth2TokenValidator(
            JwtTimestampValidator(Duration.ZERO),
            JwtClaimValidator<String>("sub") { !it.isNullOrBlank() }
        ))
        return decoder
    }
}
