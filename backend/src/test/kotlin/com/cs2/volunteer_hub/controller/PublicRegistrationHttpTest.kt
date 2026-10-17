package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.RegisterRequest
import com.cs2.volunteer_hub.mapper.LoginMapper
import com.cs2.volunteer_hub.mapper.RegisterMapper
import com.cs2.volunteer_hub.mapper.VerifyEmailMapper
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.service.AuthService
import com.cs2.volunteer_hub.service.EmailQueueService
import com.cs2.volunteer_hub.service.EmailVerificationService
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.http.MediaType
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders

/**
 * HTTP contract tests: exercise Spring MVC's real @RequestBody Jackson binding and controller.
 * No database, mail server, RabbitMQ or production credentials are required.
 */
class PublicRegistrationHttpTest {
    private var registrations = 0
    private val authService = Mockito.mock(AuthService::class.java) { invocation ->
        if (invocation.method.name == "registerUser") {
            registrations += 1
            val request = invocation.getArgument<RegisterRequest>(0)
            User(
                id = 42L,
                name = request.username,
                email = request.email,
                gender = request.gender,
                passwordHash = "unused-test-hash",
                role = request.role?.toRole() ?: com.cs2.volunteer_hub.model.Role.VOLUNTEER
            )
        } else {
            Mockito.RETURNS_DEFAULTS.answer(invocation)
        }
    }

    private val mvc: MockMvc = MockMvcBuilders.standaloneSetup(
        AuthController(
            authService,
            Mockito.mock(EmailVerificationService::class.java),
            Mockito.mock(EmailQueueService::class.java),
            LoginMapper(),
            RegisterMapper(),
            VerifyEmailMapper()
        )
    )
        .setMessageConverters(MappingJackson2HttpMessageConverter(jacksonObjectMapper()))
        .build()

    private fun payload(role: String?): String {
        val rolePart = if (role == null) "" else """"role": "$role", """
        return """{"username":"Example User","gender":"OTHER","email":"test@example.invalid",$rolePart"password":"ExamplePassword123!"}"""
    }

    @Test
    fun `admin payload is rejected with HTTP 400 without invoking registration service`() {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(payload("ADMIN")))
            .andExpect(status().isBadRequest)
        assertEquals(0, registrations)
    }

    @Test
    fun `unknown role is rejected with HTTP 400 without registering`() {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(payload("ROOT")))
            .andExpect(status().isBadRequest)
        assertEquals(0, registrations)
    }

    @Test
    fun `volunteer signup returns HTTP 201`() {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(payload("VOLUNTEER")))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.role").value("VOLUNTEER"))
        assertEquals(1, registrations)
    }

    @Test
    fun `organizer signup returns HTTP 201`() {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(payload("EVENT_ORGANIZER")))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.role").value("EVENT_ORGANIZER"))
        assertEquals(1, registrations)
    }

    @Test
    fun `omitted role defaults to volunteer`() {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(payload(null)))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.role").value("VOLUNTEER"))
        assertEquals(1, registrations)
    }
}
