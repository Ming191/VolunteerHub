package com.cs2.volunteer_hub.security

import com.cs2.volunteer_hub.config.RefreshSessionCookies
import com.cs2.volunteer_hub.dto.TokenResponse
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.web.server.ResponseStatusException

class RefreshSessionCookiesTest {
    private val cookies = RefreshSessionCookies(false, "Strict", "http://localhost:5173")

    @Test fun refreshCookieIsHttpOnlyAndNeverExposedInJson() {
        val response = MockHttpServletResponse()
        cookies.issue(response, "synthetic-secret", 60_000)
        val cookie = requireNotNull(response.getHeader("Set-Cookie"))
        assertTrue(cookie.contains("HttpOnly"))
        assertTrue(cookie.contains("SameSite=Strict"))
        assertTrue(cookie.contains("Path=/api"))

        val json = jacksonObjectMapper().writeValueAsString(
            TokenResponse("access", "synthetic-secret", 900_000, 60_000))
        assertFalse(json.contains("synthetic-secret"))
        assertFalse(json.contains("refreshToken"))
        val cleared = MockHttpServletResponse()
        cookies.clear(cleared)
        assertTrue(requireNotNull(cleared.getHeader("Set-Cookie")).contains("Max-Age=0"))
    }

    @Test fun sessionMutationRequiresExactOriginAndCustomHeader() {
        val valid = MockHttpServletRequest().apply {
            addHeader("Origin", "http://localhost:5173")
            addHeader("X-VH-Session", "1")
        }
        cookies.requireSameOrigin(valid)
        val foreign = MockHttpServletRequest().apply {
            addHeader("Origin", "https://attacker.example")
            addHeader("X-VH-Session", "1")
        }
        assertThrows(ResponseStatusException::class.java) { cookies.requireSameOrigin(foreign) }
        val simpleForm = MockHttpServletRequest().apply {
            addHeader("Origin", "http://localhost:5173")
        }
        assertThrows(ResponseStatusException::class.java) { cookies.requireSameOrigin(simpleForm) }
        val multipleOrigins = MockHttpServletRequest().apply {
            addHeader("Origin", "http://localhost:5173")
            addHeader("Origin", "https://attacker.example")
            addHeader("X-VH-Session", "1")
        }
        assertThrows(ResponseStatusException::class.java) { cookies.requireSameOrigin(multipleOrigins) }
    }
}
