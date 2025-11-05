package com.cs2.volunteer_hub.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.info.License
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import io.swagger.v3.oas.models.servers.Server
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    @Bean
    fun customOpenAPI(): OpenAPI {
        val securitySchemeName = "bearerAuth"

        return OpenAPI()
            .info(
                Info()
                    .title("VolunteerHub API")
                    .version("1.0.0")
                    .description("""
                        # VolunteerHub API Documentation
                        
                        This is the REST API documentation for VolunteerHub - a platform connecting volunteers with community events.
                        
                        ## Features
                        - User authentication and authorization
                        - Event management (create, search, approve)
                        - Volunteer registration workflow
                        - Social features (posts, comments, likes)
                        - Real-time notifications
                        - Role-based dashboards (Volunteer, Organizer, Admin)
                        
                        ## Authentication
                        Most endpoints require JWT authentication. To use authenticated endpoints:
                        1. Register or login via `/api/auth/register` or `/api/auth/login`
                        2. Copy the JWT token from the response
                        3. Click the "Authorize" button at the top of this page
                        4. Enter: `Bearer <your-token>`
                        5. Click "Authorize"
                        
                        ## User Roles
                        - **VOLUNTEER**: Can register for events, create posts/comments
                        - **EVENT_ORGANIZER**: Can create events, manage registrations
                        - **ADMIN**: Full access to all features
                        
                        ## Date Format
                        All dates use ISO 8601 format: `yyyy-MM-dd'T'HH:mm:ss`
                        
                        ## File Uploads
                        Endpoints that accept files use `multipart/form-data` content type.
                    """.trimIndent())
                    .contact(
                        Contact()
                            .name("VolunteerHub Team")
                            .email("support@volunteerhub.com")
                    )
                    .license(
                        License()
                            .name("MIT License")
                            .url("https://opensource.org/licenses/MIT")
                    )
            )
            .servers(
                listOf(
                    Server()
                        .url("http://localhost:8080")
                        .description("Development Server"),
                    Server()
                        .url("https://api.volunteerhub.com")
                        .description("Production Server")
                )
            )
            .addSecurityItem(SecurityRequirement().addList(securitySchemeName))
            .components(
                Components()
                    .addSecuritySchemes(
                        securitySchemeName,
                        SecurityScheme()
                            .name(securitySchemeName)
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")
                            .description("Enter JWT token obtained from /api/auth/login endpoint")
                    )
            )
    }
}

