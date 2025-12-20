package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.AuthorResponse
import com.cs2.volunteer_hub.dto.PostResponse
import com.cs2.volunteer_hub.model.Post
import org.springframework.stereotype.Component

@Component
class PostMapper {

    fun toPostResponse(post: Post, isLikedByCurrentUser: Boolean = false): PostResponse {
        return PostResponse(
                id = post.id,
                content = post.content,
                createdAt = post.createdAt,
                updatedAt = post.updatedAt,
                author =
                        AuthorResponse(
                                id = post.author.id,
                                name = post.author.name,
                                profilePictureUrl = post.author.profilePictureUrl,
                                bio = post.author.bio
                        ),
                totalLikes = post.totalLikesCount,
                totalComments = post.totalCommentsCount,
                isLikedByCurrentUser = isLikedByCurrentUser,
                imageUrls = post.images.mapNotNull { it.url },
                eventId = post.event.id,
                eventTitle = post.event.title
        )
    }

    fun toPostResponseList(
            posts: List<Post>,
            likedPostIds: Set<Long> = emptySet()
    ): List<PostResponse> {
        return posts.map { post -> toPostResponse(post, likedPostIds.contains(post.id)) }
    }
}
