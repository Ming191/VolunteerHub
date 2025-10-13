package com.cs2.volunteer_hub.dto

import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class CreateEventRequest(
    @field:NotBlank(message = "Title can't be blank")
    @field:Size(max = 100, message = "Title must not exceed 100 characters")
    val title: String,

    @field:NotBlank(message = "Description can't be blank")
    val description: String,

    @field:NotBlank(message = "Location can't be blank")
    val location: String,

    @field:Future(message = "Event date and time must be in the future")
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy'T'HH:mm:ss")
    val eventDateTime: LocalDateTime
)

data class EventResponse(
    val id: Long,
    val title: String,
    val description: String,
    val location: String,
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy'T'HH:mm:ss")
    val eventDateTime: LocalDateTime,
    val isApproved: Boolean,
    val creatorName: String
)

data class UpdateEventRequest(
    @field:Size(max = 100, message = "Title must not exceed 100 characters")
    val title: String?,

    val description: String?,

    val location: String?,

    @field:Future(message = "Event date and time must be in the future")
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy'T'HH:mm:ss")
    val eventDateTime: LocalDateTime?
)