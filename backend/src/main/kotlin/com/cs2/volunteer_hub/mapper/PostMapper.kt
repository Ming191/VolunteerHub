package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.AuthorResponse
import com.cs2.volunteer_hub.dto.PostResponse
import com.cs2.volunteer_hub.model.Post
import org.springframework.stereotype.Component

@Component
class PostMapper {
    /**
     * Map Post entity to PostResponse DTO
     * @param post The post entity
     * @param isLikedByCurrentUser Whether the current user has liked this post
     */
    fun toPostResponse(post: Post, isLikedByCurrentUser: Boolean = false): PostResponse {
        return PostResponse(
            id = post.id,
            content = post.content,
            createdAt = post.createdAt,
            updatedAt = post.updatedAt,
            author = AuthorResponse(
              id = post.author.id,
              name = post.author.name,
              profilePictureUrl = post.author.profilePictureUrl,
              bio = post.author.bio),
            totalLikes = post.likes.size,
            totalComments = post.comments.size,
            isLikedByCurrentUser = isLikedByCurrentUser,
            imageUrls = post.images.mapNotNull { it.url }
        )
    }

    /**
     * Map list of posts with their like status
     * @param posts List of post entities
     * @param likedPostIds Set of post IDs that are liked by current user
     */
    fun toPostResponseList(posts: List<Post>, likedPostIds: Set<Long> = emptySet()): List<PostResponse> {
        return posts.map { post ->
            toPostResponse(post, likedPostIds.contains(post.id))
        }
    }
}

