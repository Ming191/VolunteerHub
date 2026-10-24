package com.cs2.volunteer_hub.security

import com.cs2.volunteer_hub.config.ProductionSecretsValidator
import com.cs2.volunteer_hub.config.jwt.JwtProperties
import com.cs2.volunteer_hub.config.jwt.JwtResourceServerConfig
import com.cs2.volunteer_hub.config.ratelimit.RateLimitProperties
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.boot.DefaultApplicationArguments
import org.springframework.mock.env.MockEnvironment
import java.util.Base64
import jakarta.validation.Validation

class ProductionSecretsValidatorTest {
    private val args = DefaultApplicationArguments()
    private val required = mapOf(
        "JWT_SECRET" to Base64.getEncoder().encodeToString(ByteArray(32) { 7 }),
        "SPRING_DATASOURCE_URL" to "jdbc:postgresql://db.example.com/app",
        "SPRING_DATASOURCE_USERNAME" to "app",
        "SPRING_DATASOURCE_PASSWORD" to "injected-db-secret",
        "SPRING_RABBITMQ_HOST" to "mq.example.com",
        "SPRING_RABBITMQ_USERNAME" to "app",
        "SPRING_RABBITMQ_PASSWORD" to "injected-mq-secret",
        "SPRING_MAIL_HOST" to "smtp.example.com",
        "SPRING_MAIL_USERNAME" to "user@example.com",
        "SPRING_MAIL_PASSWORD" to "injected-mail-secret",
        "SPRING_DATA_REDIS_HOST" to "redis.example.com",
        "RATE_LIMIT_REDIS_PASSWORD" to "injected-redis-secret",
        "STORAGE_ENDPOINT" to "https://s3.example.com",
        "STORAGE_PRESIGN_ENDPOINT" to "https://s3.example.com",
        "STORAGE_PUBLIC_BASE_URL" to "https://files.example.com",
        "STORAGE_BUCKET" to "app-files",
        "STORAGE_ACCESS_KEY" to "injected-access",
        "STORAGE_SECRET_KEY" to "injected-storage-secret",
        "APP_FRONTEND_URL" to "https://app.example.com",
        "FRONTEND_ALLOWED_ORIGINS" to "https://app.example.com"
    )

    private fun env(overrides: Map<String, String> = emptyMap()) = MockEnvironment().apply {
        setActiveProfiles("prod")
        (required + overrides).forEach { (key, value) -> setProperty(key, value) }
    }

    @Test
    fun `production rejects absent secrets without showing values`() {
        val environment = env(mapOf("SPRING_MAIL_PASSWORD" to "", "STORAGE_SECRET_KEY" to ""))
        val failure = assertThrows(IllegalArgumentException::class.java) {
            ProductionSecretsValidator(environment).run(args)
        }
        assertTrue(failure.message!!.contains("SPRING_MAIL_PASSWORD"))
        assertTrue(failure.message!!.contains("STORAGE_SECRET_KEY"))
        assertFalse(failure.message!!.contains("injected-db-secret"))
    }

    @Test
    fun `production accepts complete injected configuration`() {
        assertDoesNotThrow { ProductionSecretsValidator(env()).run(args) }
    }

    @Test
    fun `production rejects insecure endpoints and origins`() {
        assertThrows(IllegalArgumentException::class.java) {
            ProductionSecretsValidator(env(mapOf("STORAGE_ENDPOINT" to "http://localhost:9000"))).run(args)
        }
        assertThrows(IllegalArgumentException::class.java) {
            ProductionSecretsValidator(env(mapOf("FRONTEND_ALLOWED_ORIGINS" to "http://localhost:5173"))).run(args)
        }
    }

    @Test
    fun `production cannot combine with local profiles`() {
        val environment = env().apply { setActiveProfiles("prod", "dev") }
        assertThrows(IllegalArgumentException::class.java) {
            ProductionSecretsValidator(environment).run(args)
        }
    }

    @Test
    fun `rotating JWT key changes signing material and invalid keys fail`() {
        val config = JwtResourceServerConfig()
        fun properties(bytes: ByteArray) = JwtProperties().apply {
            secret = Base64.getEncoder().encodeToString(bytes)
        }
        val first = config.jwtHmacKey(properties(ByteArray(32) { 1 }))
        val rotated = config.jwtHmacKey(properties(ByteArray(32) { 2 }))
        assertFalse(first.secretKey.encoded.contentEquals(rotated.secretKey.encoded))
        assertThrows(IllegalArgumentException::class.java) {
            config.jwtHmacKey(properties(ByteArray(16)))
        }
        assertThrows(IllegalArgumentException::class.java) {
            config.jwtHmacKey(JwtProperties().apply { secret = "not base64!" })
        }
    }

    @Test
    fun `rate limit rejects malformed duration and unsafe capacity`() {
        Validation.buildDefaultValidatorFactory().use { factory ->
            val validator = factory.validator
            val rateLimit = RateLimitProperties().apply {
                rules = listOf(RateLimitProperties.Rule(capacity = 0, refillDuration = "unexpected"))
            }
            assertTrue(validator.validate(rateLimit).size >= 2)
        }
    }
}
