package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.*
import com.cs2.volunteer_hub.mapper.CommentMapper
import com.cs2.volunteer_hub.model.Comment
import com.cs2.volunteer_hub.repository.CommentRepository
import com.cs2.volunteer_hub.repository.PostRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.findByEmailOrThrow
import com.cs2.volunteer_hub.repository.findByIdOrThrow
import org.slf4j.LoggerFactory
import org.springframework.cache.CacheManager
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CommentService(
        private val commentRepository: CommentRepository,
        private val postRepository: PostRepository,
        private val userRepository: UserRepository,
        private val authorizationService: AuthorizationService,
        private val cacheEvictionService: CacheEvictionService,
        private val cacheManager: CacheManager,
        private val notificationService: NotificationService,
        private val commentMapper: CommentMapper
) {
    private val logger = LoggerFactory.getLogger(CommentService::class.java)

    @Transactional
    fun createComment(postId: Long, request: CommentRequest, userEmail: String): CommentResponse {
        val author = userRepository.findByEmailOrThrow(userEmail)
        val post = postRepository.findByIdOrThrow(postId)

        authorizationService.requireEventPostPermission(post.event.id, author.id)

        cacheEvictionService.evictPosts(post.event.id)
        cacheManager.getCache("comments")?.evict(postId)

        val parentComment =
                if (request.parentCommentId != null) {
                    val parent = commentRepository.findByIdOrThrow(request.parentCommentId)
                    if (parent.post.id != postId) {
                        throw IllegalArgumentException(
                                "Parent comment does not belong to this post"
                        )
                    }
                    parent
                } else {
                    null
                }

        val comment =
                Comment(
                        content = request.content,
                        author = author,
                        post = post,
                        parentComment = parentComment
                )
        val savedComment = commentRepository.save(comment)

        if (parentComment != null) {
            if (parentComment.author.id != author.id) {
                try {
                    notificationService.queuePushNotificationToUser(
                            userId = parentComment.author.id,
                            title = "New Reply",
                            body =
                                    "${author.name} replied to your comment: ${request.content.take(50)}${if (request.content.length > 50) "..." else ""}",
                            link =
                                    "/events/${post.event.id}/posts/${post.id}#comment-${savedComment.id}"
                    )
                } catch (e: Exception) {
                    logger.error("Failed to queue reply notification: ${e.message}", e)
                }
            }
        } else {
            if (post.author.id != author.id) {
                try {
                    notificationService.queuePushNotificationToUser(
                            userId = post.author.id,
                            title = "New Comment",
                            body =
                                    "${author.name} commented on your post: ${request.content.take(50)}${if (request.content.length > 50) "..." else ""}",
                            link =
                                    "/events/${post.event.id}/posts/${post.id}#comment-${savedComment.id}"
                    )
                } catch (e: Exception) {
                    logger.error("Failed to queue comment notification: ${e.message}", e)
                }
            }
        }

        return commentMapper.toCommentResponse(savedComment)
    }

    // Removed Cacheable to prevent unauthenticated users from bypassing permission checks for
    // unapproved events via cache hits
    @Transactional(readOnly = true)
    fun getCommentsForPost(postId: Long, userEmail: String?): List<CommentResponse> {
        val user = userEmail?.let { userRepository.findByEmailOrThrow(it) }
        val post = postRepository.findByIdOrThrow(postId)

        authorizationService.requireEventReadPermission(post.event.id, user?.id)

        return commentRepository
                .findAllByPostIdOrderByCreatedAtAsc(postId)
                .map(commentMapper::toCommentResponse)
    }

    /** Get comments with nested replies structure */
    @Transactional(readOnly = true)
    fun getNestedCommentsForPost(postId: Long, userEmail: String?): List<CommentResponse> {
        val user = userEmail?.let { userRepository.findByEmailOrThrow(it) }
        val post = postRepository.findByIdOrThrow(postId)

        authorizationService.requireEventReadPermission(post.event.id, user?.id)

        val allComments = commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId)
        return commentMapper.toNestedCommentResponseList(allComments)
    }

    /** Get replies for a specific comment */
    @Transactional(readOnly = true)
    fun getRepliesForComment(commentId: Long, userEmail: String?): List<CommentResponse> {
        val user = userEmail?.let { userRepository.findByEmailOrThrow(it) }
        val comment = commentRepository.findByIdOrThrow(commentId)

        authorizationService.requireEventReadPermission(comment.post.event.id, user?.id)

        return comment.replies.sortedBy { it.createdAt }.map(commentMapper::toCommentResponse)
    }

    @Transactional
    fun updateComment(
            postId: Long,
            commentId: Long,
            newContent: String,
            userEmail: String
    ): CommentResponse {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val comment = commentRepository.findByIdOrThrow(commentId)

        // Verify the comment belongs to the post
        if (comment.post.id != postId) {
            throw IllegalArgumentException("Comment does not belong to the specified post")
        }

        // Verify the user is the author of the comment
        if (comment.author.id != user.id) {
            throw IllegalAccessException("You are not authorized to update this comment")
        }

        comment.content = newContent
        val updatedComment = commentRepository.save(comment)

        // Evict cache for the post
        cacheManager.getCache("comments")?.evict(comment.post.id)
        cacheEvictionService.evictPosts(comment.post.event.id)

        return commentMapper.toCommentResponse(updatedComment)
    }

    @Transactional
    fun deleteComment(postId: Long, commentId: Long, userEmail: String) {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val comment = commentRepository.findByIdOrThrow(commentId)

        // Verify the comment belongs to the post
        if (comment.post.id != postId) {
            throw IllegalArgumentException("Comment does not belong to the specified post")
        }

        // Verify the user is the author of the comment
        if (comment.author.id != user.id) {
            throw IllegalAccessException("You are not authorized to delete this comment")
        }

        // Evict cache for the post
        cacheManager.getCache("comments")?.evict(comment.post.id)
        cacheEvictionService.evictPosts(comment.post.event.id)

        commentRepository.delete(comment)
    }
}
