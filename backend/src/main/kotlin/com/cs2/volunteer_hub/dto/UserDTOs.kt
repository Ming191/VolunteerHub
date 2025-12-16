package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.Gender
import com.cs2.volunteer_hub.model.Interest
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.model.Skill
import io.swagger.v3.oas.annotations.media.Schema
import org.springframework.data.domain.Page
import java.time.LocalDate
import java.time.LocalDateTime

data class UserResponse(
    val id: Long,
    val name: String,
    val gender: Gender?,
    val email: String,
    val role: Role,
    val isLocked: Boolean,
    val isEmailVerified: Boolean,
    val createdAt: LocalDateTime,
    val lastLoginAt: LocalDateTime?,
    val phoneNumber: String?,
    val bio: String?,
    val location: String?,
    val profilePictureUrl: String?,
    val dateOfBirth: LocalDate?,
    val skills: Set<Skill>,
    val interests: Set<Interest>,
    val updatedAt: LocalDateTime
)

@Schema(description = "Paginated response for users with stable JSON structure")
data class PageUserResponse(
    @Schema(description = "List of users in the current page", required = true)
    val content: List<UserResponse>,

    @Schema(description = "Current page number (0-based)", example = "0", required = true)
    val pageNumber: Int,

    @Schema(description = "Number of items per page", example = "20", required = true)
    val pageSize: Int,

    @Schema(description = "Total number of users across all pages", example = "100", required = true)
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
        fun from(page: Page<UserResponse>): PageUserResponse {
            return PageUserResponse(
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

data class PublicUserResponse(
    val id: Long,
    val name: String,
    val profilePictureUrl: String?,
    val bio: String?
)
