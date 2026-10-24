package com.cs2.volunteer_hub.config.ratelimit

import io.lettuce.core.RedisURI
import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component
import org.springframework.validation.annotation.Validated
import java.time.Duration

@Component
@Validated
@ConfigurationProperties(prefix = "rate-limit")
data class RateLimitProperties(
    @field:Valid var redis: RedisProperties = RedisProperties(),
    @field:Valid var default: Rule = Rule(),
    @field:Valid var rules: List<Rule> = emptyList()
) {
    data class RedisProperties(
        @field:NotBlank var host: String = "localhost",
        @field:Min(1) @field:Max(65535) var port: Int = 6379,
        var password: String = "",
        @field:Min(0) var database: Int = 0
    ) {
        fun getRedisUri(): RedisURI = RedisURI.Builder.redis(host, port).apply {
            withDatabase(database)
            if (password.isNotEmpty()) withPassword(password.toCharArray())
        }.build()
    }

    data class Rule(
        var path: String? = null,
        var method: String? = null,
        @field:Min(1) var capacity: Long = 100,
        @field:Min(1) var refillTokens: Long = 100,
        @field:Pattern(regexp = "[1-9][0-9]*[smhd]") var refillDuration: String = "1m"
    ) {
        fun getRefillDurationParsed(): Duration = parseDuration(refillDuration)
    }

    companion object {
        fun parseDuration(duration: String): Duration {
            require(duration.matches(Regex("[1-9][0-9]*[smhd]"))) {
                "Invalid rate-limit duration"
            }
            val value = duration.dropLast(1).toLong()
            return when (duration.last()) {
                's' -> Duration.ofSeconds(value)
                'm' -> Duration.ofMinutes(value)
                'h' -> Duration.ofHours(value)
                'd' -> Duration.ofDays(value)
                else -> error("Invalid rate-limit duration")
            }
        }
    }
}
