package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.RegistrationStatus
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotNull
import java.time.LocalDateTime
import org.springframework.data.domain.Page

data class RegistrationResponse(
        val id: Long,
        val eventId: Long,
        val eventTitle: String,
        val volunteerId: Long,
        val volunteerName: String,
        val status: RegistrationStatus,
        val registeredAt: LocalDateTime,
        val waitlistPosition: Int?
)

data class PublicAttendeeResponse(
        val volunteerId: Long,
        val name: String,
        val profilePictureUrl: String?,
        val bio: String?,
        val joinedAt: LocalDateTime
)

data class UpdateStatusRequest(@field:NotNull val status: RegistrationStatus)

/**
 * Response returned when registering for an event Provides immediate feedback about registration
 * status
 */
data class RegistrationResultResponse(
        val status: RegistrationStatus,
        val message: String,
        val waitlistPosition: Int?,
        val registrationId: Long
)

/** Response for checking user's registration status for an event */
data class RegistrationStatusResponse(
        val registered: Boolean,
        val status: RegistrationStatus?,
        val waitlistPosition: Int?,
        val registeredAt: LocalDateTime?
)

/** Completed event summary for user profile */
data class CompletedEventResponse(
        val eventId: Long,
        val eventTitle: String,
        val eventDateTime: LocalDateTime,
        val location: String,
        val imageUrl: String?,
        val tags: Set<String>
)

@Schema(description = "Paginated response for registrations with stable JSON structure")
data class PageRegistrationResponse(
        @Schema(description = "List of registrations in the current page", required = true)
        val content: List<RegistrationResponse>,
        @Schema(description = "Current page number (0-based)", example = "0", required = true)
        val pageNumber: Int,
        @Schema(description = "Number of items per page", example = "20", required = true)
        val pageSize: Int,
        @Schema(
                description = "Total number of registrations across all pages",
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
        fun from(page: Page<RegistrationResponse>): PageRegistrationResponse {
            return PageRegistrationResponse(
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
