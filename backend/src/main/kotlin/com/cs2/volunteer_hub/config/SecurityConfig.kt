package com.cs2.volunteer_hub.config

import com.cs2.volunteer_hub.service.CustomUserDetailsService
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig(
    @Value("\${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174}")
    private val allowedOrigins: String = "http://localhost:5173,http://localhost:5174"
) {
    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    @Bean
    @Throws(Exception::class)
    fun authenticationManager(config: AuthenticationConfiguration): AuthenticationManager {
        return config.authenticationManager
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOrigins = allowedOrigins.split(',').map(String::trim).filter(String::isNotEmpty)
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
        configuration.allowedHeaders = listOf("*")
        configuration.exposedHeaders = listOf("Content-Disposition")
        configuration.allowCredentials = true
        configuration.maxAge = 3600L

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Bean
    fun securityFilterChain(
            http: HttpSecurity,
            userDetailsService: CustomUserDetailsService
    ): SecurityFilterChain {
        http
                // Protected domain APIs require bearer JWTs, never cookie authentication.
                // Cookie-bearing auth endpoints enforce exact Origin + a non-simple custom header.
                .csrf { it.disable() }
                .cors { cors ->
                    cors.configurationSource(corsConfigurationSource())
                } // Enable CORS with explicit configuration
                .exceptionHandling { exceptions ->
                    exceptions.authenticationEntryPoint(
                        org.springframework.security.web.authentication.HttpStatusEntryPoint(
                            org.springframework.http.HttpStatus.UNAUTHORIZED
                        )
                    )
                }
                .sessionManagement { session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                }
                .authorizeHttpRequests { auth ->
                    auth.requestMatchers(org.springframework.http.HttpMethod.POST, "/api/auth/logout-all")
                            .authenticated()
                            .requestMatchers("/api/auth/**")
                            .permitAll()
                            .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/events/my-events")
                            .authenticated()
                            .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/events/*")
                            .permitAll()
                            .requestMatchers(
                                    org.springframework.http.HttpMethod.GET,
                                    "/api/posts/event/**",
                                    "/api/posts/*/comments",
                                    "/api/posts/*/comments/**"
                            )
                            .permitAll()
                            .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/media/images/*")
                            .permitAll()
                            .requestMatchers("/api/enums/**")
                            .permitAll()
                            .requestMatchers(
                                    "/swagger-ui/**",
                                    "/v3/api-docs/**",
                                    "/swagger-ui.html",
                                    "/actuator/**"
                            )
                            .permitAll()
                            .anyRequest()
                            .authenticated()
                }
                .oauth2ResourceServer { resourceServer ->
                    resourceServer.jwt { jwt ->
                        jwt.jwtAuthenticationConverter { token ->
                            // Keep UserDetails principals and current database-backed roles for existing controllers.
                            val user = userDetailsService.loadUserByUsername(token.subject)
                            if (!user.isAccountNonLocked || !user.isEnabled ||
                                !user.isAccountNonExpired || !user.isCredentialsNonExpired) {
                                throw BadCredentialsException("Account is unavailable")
                            }
                            UsernamePasswordAuthenticationToken(user, null, user.authorities)
                        }
                    }
                }

        return http.build()
    }
}
