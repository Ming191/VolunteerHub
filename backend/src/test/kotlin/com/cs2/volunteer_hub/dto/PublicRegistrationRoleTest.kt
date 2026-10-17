package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.Role
import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

class PublicRegistrationRoleTest {
    private val mapper = jacksonObjectMapper()

    private fun registerJson(roleField: String): String = """
        {
          "username": "test volunteer",
          "gender": "OTHER",
          "email": "unit-test@example.invalid",
          "password": "NotARealPassword123!",
          $roleField
          "unused": null
        }
    """.trimIndent()

    @Test
    fun `volunteer remains an accepted public role`() {
        val request = mapper.readValue<RegisterRequest>(
            registerJson("\"role\": \"VOLUNTEER\",")
        )
        assertEquals(PublicRegistrationRole.VOLUNTEER, request.role)
        assertEquals(Role.VOLUNTEER, request.role!!.toRole())
    }

    @Test
    fun `event organizer remains an accepted public role`() {
        val request = mapper.readValue<RegisterRequest>(
            registerJson("\"role\": \"EVENT_ORGANIZER\",")
        )
        assertEquals(PublicRegistrationRole.EVENT_ORGANIZER, request.role)
        assertEquals(Role.EVENT_ORGANIZER, request.role!!.toRole())
    }

    @Test
    fun `omitted role defaults to volunteer in service`() {
        val request = mapper.readValue<RegisterRequest>(registerJson(""))
        assertNull(request.role)
        assertEquals(Role.VOLUNTEER, request.role?.toRole() ?: Role.VOLUNTEER)
    }

    @Test
    fun `admin cannot be deserialized from public registration JSON`() {
        assertThrows(JsonProcessingException::class.java) {
            mapper.readValue<RegisterRequest>(registerJson("\"role\": \"ADMIN\","))
        }
    }

    @Test
    fun `unknown roles cannot be deserialized from public registration JSON`() {
        assertThrows(JsonProcessingException::class.java) {
            mapper.readValue<RegisterRequest>(registerJson("\"role\": \"ROOT\","))
        }
    }
}
