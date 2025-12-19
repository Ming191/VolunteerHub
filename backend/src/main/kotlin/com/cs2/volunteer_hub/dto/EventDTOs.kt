package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.EventTag
import com.fasterxml.jackson.annotation.JsonFormat
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime
import org.springframework.data.domain.Page

data class CreateEventRequest(
    @field:NotBlank(message = "Title is required")
    @field:Size(max = 100, message = "Title must not exceed 100 characters")
    val title: String,
    @field:NotBlank(message = "Description is required") val description: String,
    @field:NotBlank(message = "Location is required") val location: String,
    val latitude: Double? = null,
    val longitude: Double? = null,
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
    val latitude: Double?,
    val longitude: Double?,
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val eventDateTime: LocalDateTime,
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val endDateTime: LocalDateTime,
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val registrationDeadline: LocalDateTime?,
    val isApproved: Boolean,
    val creatorName: String,
    val creatorId: Long,
    val imageUrls: List<String>,
    val galleryImageUrls: List<GalleryImageResponse>,
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

data class GalleryImageResponse(
    val url: String,
    val source: String,  // "event" or "post"
    val authorName: String? = null,  // Only for post images
    val authorId: Long? = null,  // Only for post images
    val postId: Long? = null  // Only for post images
)

data class UpdateEventRequest(
    @field:Size(max = 100, message = "Title must not exceed 100 characters") val title: String?,
    val description: String?,
    val location: String?,
    val latitude: Double?,
    val longitude: Double?,
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
    val tags: Set<EventTag>?,
    val existingImageUrls: List<String>?
)

@Schema(description = "Paginated response for events with stable JSON structure")
data class PageEventResponse(
    @Schema(description = "List of events in the current page", required = true)
    val content: List<EventResponse>,
    @Schema(description = "Current page number (0-based)", example = "0", required = true)
    val pageNumber: Int,
    @Schema(description = "Number of items per page", example = "20", required = true)
    val pageSize: Int,
    @Schema(
        description = "Total number of events across all pages",
        example = "100",
        required = true
    )
    val totalElements: Long,
    @Schema(description = "Total number of pages", example = "5", required = true)
    val totalPages: Int,
    @Schema(description = "Whether this is the last page", example = "false", required = true)
    val last: Boolean,
    @Schema(description = "Whether this is the first page", example = "true", required = true)
    val first: Boolean,
    @Schema(description = "Whether the page is empty", example = "false", required = true)
    val empty: Boolean
) {
    companion object {
        fun from(page: Page<EventResponse>): PageEventResponse {
            return PageEventResponse(
                content = page.content,
                pageNumber = page.number,
                pageSize = page.size,
                totalElements = page.totalElements,
                totalPages = page.totalPages,
                last = page.isLast,
                first = page.isFirst,
                empty = page.isEmpty
            )
        }
    }
}
