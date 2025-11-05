package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.EventTag
import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
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

    @field:Future(message = "Event end date and time must be in the future")
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val endDateTime: LocalDateTime,

    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val registrationDeadline: LocalDateTime? = null,

    @field:Min(value = 1, message = "Maximum participants must be at least 1")
    val maxParticipants: Int? = null,

    val waitlistEnabled: Boolean = true,

    @field:Size(max = 15, message = "Maximum 15 tags allowed per event")
    val tags: Set<EventTag>? = null
)

data class EventResponse(
    val id: Long,
    val title: String,
    val description: String,
    val location: String,
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val eventDateTime: LocalDateTime,
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val endDateTime: LocalDateTime,
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val registrationDeadline: LocalDateTime?,
    val isApproved: Boolean,
    val creatorName: String,
    val imageUrls: List<String>,
    val maxParticipants: Int?,
    val waitlistEnabled: Boolean,
    val approvedCount: Int,
    val pendingCount: Int,
    val waitlistCount: Int,
    val availableSpots: Int?,
    val isFull: Boolean,
    val isInProgress: Boolean,
    val tags: Set<EventTag>
)

data class UpdateEventRequest(
    @field:Size(max = 100, message = "Title must not exceed 100 characters")
    val title: String?,

    val description: String?,

    val location: String?,

    @field:Future(message = "Event date and time must be in the future")
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val eventDateTime: LocalDateTime?,

    @field:Future(message = "Event end date and time must be in the future")
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val endDateTime: LocalDateTime?,

    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val registrationDeadline: LocalDateTime?,

    @field:Min(value = 1, message = "Maximum participants must be at least 1")
    val maxParticipants: Int?,

    val waitlistEnabled: Boolean?,

    @field:Size(max = 15, message = "Maximum 15 tags allowed per event")
    val tags: Set<EventTag>?
)