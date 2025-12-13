package com.cs2.volunteer_hub.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import org.springframework.data.domain.Page
import java.time.LocalDateTime

data class PostRequest(
    @field:NotBlank(message = "Content cannot be blank")
    val content: String
)

data class AuthorResponse(
    val id: Long,
    val name: String,
    val profilePictureUrl: String?,
    val bio: String?
)

data class PostResponse(
    val id: Long,
    val content: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime?,
    val author: AuthorResponse,
    val totalLikes: Int,
    val totalComments: Int,
    val isLikedByCurrentUser: Boolean,
    val imageUrls: List<String>
)

@Schema(description = "Paginated response for posts with stable JSON structure")
data class PagePostResponse(
    @Schema(description = "List of posts in the current page", required = true)
    val content: List<PostResponse>,

    @Schema(description = "Current page number (0-based)", example = "0", required = true)
    val pageNumber: Int,

    @Schema(description = "Number of items per page", example = "20", required = true)
    val pageSize: Int,

    @Schema(description = "Total number of posts across all pages", example = "100", required = true)
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
        fun from(page: Page<PostResponse>): PagePostResponse {
            return PagePostResponse(
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
