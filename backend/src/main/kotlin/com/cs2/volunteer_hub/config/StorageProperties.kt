package com.cs2.volunteer_hub.config

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.validation.annotation.Validated

// Registered only for the S3 provider. Other storage adapters need no S3 credentials.
@Validated
@ConfigurationProperties(prefix = "storage")
class StorageProperties {
    @field:NotBlank
    @field:Pattern(regexp = "https?://.+")
    var endpoint: String = ""

    @field:NotBlank
    @field:Pattern(regexp = "https?://.+")
    var presignEndpoint: String = ""

    @field:NotBlank
    var bucket: String = ""

    @field:NotBlank
    var accessKey: String = ""

    @field:NotBlank
    var secretKey: String = ""
}
