package com.cs2.volunteer_hub.config

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component
import org.springframework.validation.annotation.Validated

@Component
@Validated
@ConfigurationProperties(prefix = "spring.mail")
class MailSettings {
    @field:NotBlank
    @field:Email
    var username: String = ""

    @field:NotBlank
    var password: String = ""
}
