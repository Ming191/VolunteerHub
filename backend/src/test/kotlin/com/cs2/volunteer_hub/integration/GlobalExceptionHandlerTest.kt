package com.cs2.volunteer_hub.integration

import com.cs2.volunteer_hub.exception.GlobalExceptionHandler
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.web.servlet.resource.NoResourceFoundException

class GlobalExceptionHandlerTest {
    @Test
    fun `unmapped static resource returns 404 instead of 500`() {
        val response = GlobalExceptionHandler().handleStaticResourceNotFound(
            NoResourceFoundException(HttpMethod.GET, "actuator/prometheus")
        )

        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        assertEquals("Endpoint not found", response.body?.get("error"))
    }
}
