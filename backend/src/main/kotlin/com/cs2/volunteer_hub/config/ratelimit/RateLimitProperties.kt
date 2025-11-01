package com.cs2.volunteer_hub.config.ratelimit

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component
import java.time.Duration

@Component
@ConfigurationProperties(prefix = "rate-limit")
data class RateLimitProperties(
    var redis: RedisProperties = RedisProperties(),
    var default: Rule = Rule(),
    var rules: List<Rule> = emptyList()
) {
    data class RedisProperties(
        var host: String = "localhost",
        var port: Int = 6379,
        var password: String = "",
        var database: Int = 0
    ) {
        fun getConnectionString(): String {
            return if (password.isNotEmpty()) {
                "redis://:$password@$host:$port/$database"
            } else {
                "redis://$host:$port/$database"
            }
        }
    }

    data class Rule(
        var path: String? = null,
        var method: String? = null,
        var capacity: Long = 100,
        var refillTokens: Long = 100,
        var refillDuration: String = "1m"
    ) {
        fun getRefillDurationParsed(): Duration {
            return parseDuration(refillDuration)
        }
    }

    companion object {
        fun parseDuration(duration: String): Duration {
            if (duration.length < 2) return Duration.ofMinutes(1)

            val value = duration.dropLast(1).toLongOrNull() ?: 1
            return when (duration.last().lowercaseChar()) {
                's' -> Duration.ofSeconds(value)
                'm' -> Duration.ofMinutes(value)
                'h' -> Duration.ofHours(value)
                'd' -> Duration.ofDays(value)
                else -> Duration.ofMinutes(value)
            }
        }
    }
}