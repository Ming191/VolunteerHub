package com.cs2.volunteer_hub.config.jwt

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component
import org.springframework.validation.annotation.Validated

@Component
@Validated
@ConfigurationProperties(prefix = "jwt")
class JwtProperties {
    @field:NotBlank
    var secret: String = ""

    @field:Positive
    var expiration: Long = 900_000

    var refreshToken: RefreshToken = RefreshToken()

    class RefreshToken {
        @field:Positive
        var expiration: Long = 2_592_000_000
    }
}
