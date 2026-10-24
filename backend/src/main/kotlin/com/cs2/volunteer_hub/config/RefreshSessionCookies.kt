package com.cs2.volunteer_hub.config

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseCookie
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException
import java.time.Duration

/** Browser refresh sessions are cookie-only; access JWTs remain bearer-header-only. */
@Component
class RefreshSessionCookies(
    @Value("\${auth.refresh-cookie.secure:true}") private val secure: Boolean = true,
    @Value("\${auth.refresh-cookie.same-site:Strict}") private val sameSite: String = "Strict",
    @Value("\${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174}") origins: String = "http://localhost:5173,http://localhost:5174"
) {
    companion object { const val NAME = "vh_refresh" }
    private val allowedOrigins = origins.split(',').map(String::trim).filter(String::isNotEmpty).toSet()

    init {
        require(sameSite in setOf("Strict", "Lax", "None")) { "Invalid refresh cookie SameSite policy" }
        require(sameSite != "None" || secure) { "Cross-site refresh cookies require Secure" }
        require(allowedOrigins.isNotEmpty()) { "Configure at least one permitted frontend origin" }
    }

    /** A custom header plus an exact Origin check prevents browser form-based CSRF. */
    fun requireSameOrigin(request: HttpServletRequest) {
        val origins = request.getHeaders("Origin").toList()
        val markers = request.getHeaders("X-VH-Session").toList()
        if (origins.size != 1 || origins.single() !in allowedOrigins ||
            markers != listOf("1")) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid session request origin")
        }
    }

    fun issue(response: HttpServletResponse, value: String, lifetimeMs: Long) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(value, Duration.ofMillis(lifetimeMs)).toString())
    }

    fun clear(response: HttpServletResponse) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString())
    }

    private fun cookie(value: String, age: Duration): ResponseCookie =
        ResponseCookie.from(NAME, value)
            .httpOnly(true).secure(secure).sameSite(sameSite).path("/api")
            .maxAge(age).build()
}
