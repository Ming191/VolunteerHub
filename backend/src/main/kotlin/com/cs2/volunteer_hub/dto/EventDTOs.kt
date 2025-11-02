package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.EventCategory
import com.cs2.volunteer_hub.model.EventStatus
import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Min
import java.time.LocalDateTime

data class CreateEventRequest(
    @field:NotBlank(message = "Title is required")
    @field:Size(max = 100, message = "Title must not exceed 100 characters")
    val title: String,

    @field:NotBlank(message = "Description is required")
    val description: String,

    @field:NotBlank(message = "Location is required")
    val location: String,

    @field:Future(message = "Event date and time must be in the future")
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val eventDateTime: LocalDateTime,

    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val eventEndDateTime: LocalDateTime? = null,

    val category: EventCategory = EventCategory.OTHER,

    @field:Positive(message = "Maximum volunteers must be a positive number")
    val maxVolunteers: Int? = null,

    @field:Min(value = 1, message = "Minimum volunteers must be at least 1")
    val minVolunteers: Int? = null,

    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val registrationDeadline: LocalDateTime? = null,

    @field:Size(max = 500, message = "Requirements must not exceed 500 characters")
    val requirements: String? = null,

    @field:Size(max = 500, message = "Benefits must not exceed 500 characters")
    val benefits: String? = null
)

data class EventResponse(
    val id: Long,
    val title: String,
    val description: String,
    val location: String,
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val eventDateTime: LocalDateTime,
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val eventEndDateTime: LocalDateTime?,
    val status: EventStatus,
    val category: EventCategory,
    val maxVolunteers: Int?,
    val minVolunteers: Int?,
    val currentVolunteers: Int,
    val availableSlots: Int?, // null = unlimited
    val isRegistrationOpen: Boolean,
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val registrationDeadline: LocalDateTime?,
    val requirements: String?,
    val benefits: String?,
    val creatorName: String,
    val creatorEmail: String,  // From creator's User profile
    val creatorPhone: String?, // From creator's User profile
    val imageUrls: List<String>
)

data class UpdateEventRequest(
    @field:Size(max = 100, message = "Title must not exceed 100 characters")
    val title: String?,

    val description: String?,

    val location: String?,

    @field:Future(message = "Event date and time must be in the future")
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val eventDateTime: LocalDateTime?,

    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val eventEndDateTime: LocalDateTime?,

    val category: EventCategory?,

    @field:Positive(message = "Maximum volunteers must be a positive number")
    val maxVolunteers: Int?,

    @field:Min(value = 1, message = "Minimum volunteers must be at least 1")
    val minVolunteers: Int?,

    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val registrationDeadline: LocalDateTime?,


    @field:Size(max = 500, message = "Requirements must not exceed 500 characters")
    val requirements: String?,

    @field:Size(max = 500, message = "Benefits must not exceed 500 characters")
    val benefits: String?
)