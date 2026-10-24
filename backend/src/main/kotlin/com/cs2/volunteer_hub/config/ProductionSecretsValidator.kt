package com.cs2.volunteer_hub.config

import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Profile
import org.springframework.core.env.Environment
import org.springframework.stereotype.Component
import java.net.URI

/**
 * Deployment preflight: do not accept the local demo configuration in production.
 * Only validate presence/shape, never log values.
 */
@Component
@Profile("prod")
class ProductionSecretsValidator(private val environment: Environment) : ApplicationRunner {
    override fun run(args: ApplicationArguments) {
        require(!environment.acceptsProfiles(org.springframework.core.env.Profiles.of("dev", "test", "docker"))) {
            "Production profile cannot be combined with a local profile"
        }

        val required = listOf(
            "JWT_SECRET", "SPRING_DATASOURCE_URL", "SPRING_DATASOURCE_USERNAME",
            "SPRING_DATASOURCE_PASSWORD", "SPRING_RABBITMQ_HOST",
            "SPRING_RABBITMQ_USERNAME", "SPRING_RABBITMQ_PASSWORD",
            "SPRING_MAIL_HOST", "SPRING_MAIL_USERNAME", "SPRING_MAIL_PASSWORD",
            "SPRING_DATA_REDIS_HOST", "RATE_LIMIT_REDIS_PASSWORD",
            "STORAGE_ENDPOINT", "STORAGE_PRESIGN_ENDPOINT", "STORAGE_PUBLIC_BASE_URL",
            "STORAGE_BUCKET", "STORAGE_ACCESS_KEY", "STORAGE_SECRET_KEY",
            "APP_FRONTEND_URL", "FRONTEND_ALLOWED_ORIGINS"
        )
        val absent = required.filter { environment.getProperty(it).isNullOrBlank() }
        require(absent.isEmpty()) { "Missing production configuration: ${absent.joinToString(", ")}" }

        listOf("STORAGE_ENDPOINT", "STORAGE_PRESIGN_ENDPOINT", "STORAGE_PUBLIC_BASE_URL", "APP_FRONTEND_URL").forEach {
            val uri = URI.create(environment.getRequiredProperty(it))
            require(uri.scheme == "https" && !uri.host.isNullOrBlank()) {
                "$it must be a valid HTTPS URL in production"
            }
        }
        require(environment.getRequiredProperty("FRONTEND_ALLOWED_ORIGINS").split(",")
            .all { it.trim().startsWith("https://") }) {
            "FRONTEND_ALLOWED_ORIGINS must contain only HTTPS origins in production"
        }
        require(environment.getRequiredProperty("SPRING_DATASOURCE_URL").startsWith("jdbc:postgresql://")) {
            "SPRING_DATASOURCE_URL must be a PostgreSQL JDBC URL"
        }
    }
}
