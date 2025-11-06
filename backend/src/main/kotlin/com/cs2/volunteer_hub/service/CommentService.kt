package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.*
import com.cs2.volunteer_hub.mapper.CommentMapper
import com.cs2.volunteer_hub.model.Comment
import com.cs2.volunteer_hub.repository.CommentRepository
import com.cs2.volunteer_hub.repository.PostRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.findByEmailOrThrow
import com.cs2.volunteer_hub.repository.findByIdOrThrow
import com.cs2.volunteer_hub.specification.CommentSpecifications
import org.slf4j.LoggerFactory
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

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

        val parentComment = if (request.parentCommentId != null) {
            val parent = commentRepository.findByIdOrThrow(request.parentCommentId)
            if (parent.post.id != postId) {
                throw IllegalArgumentException("Parent comment does not belong to this post")
            }
            parent
        } else {
            null
        }

        val comment = Comment(
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
                        body = "${author.name} replied to your comment: ${request.content.take(50)}${if (request.content.length > 50) "..." else ""}",
                        link = "/events/${post.event.id}/posts/${post.id}#comment-${savedComment.id}"
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
                        body = "${author.name} commented on your post: ${request.content.take(50)}${if (request.content.length > 50) "..." else ""}",
                        link = "/events/${post.event.id}/posts/${post.id}#comment-${savedComment.id}"
                    )
                } catch (e: Exception) {
                    logger.error("Failed to queue comment notification: ${e.message}", e)
                }
            }
        }

        return commentMapper.toCommentResponse(savedComment)
    }

    @Cacheable(value = ["comments"], key = "#postId")
    @Transactional(readOnly = true)
    fun getCommentsForPost(postId: Long, userEmail: String): List<CommentResponse> {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val post = postRepository.findByIdOrThrow(postId)

        // Use centralized authorization service
        authorizationService.requireEventPostPermission(post.event.id, user.id)

        return commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId)
            .map(commentMapper::toCommentResponse)
    }

    /**
     * Get comments with nested replies structure
     */
    @Transactional(readOnly = true)
    fun getNestedCommentsForPost(postId: Long, userEmail: String): List<CommentResponse> {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val post = postRepository.findByIdOrThrow(postId)

        authorizationService.requireEventPostPermission(post.event.id, user.id)

        val allComments = commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId)
        return commentMapper.toNestedCommentResponseList(allComments)
    }

    /**
     * Get replies for a specific comment
     */
    @Transactional(readOnly = true)
    fun getRepliesForComment(commentId: Long, userEmail: String): List<CommentResponse> {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val comment = commentRepository.findByIdOrThrow(commentId)

        authorizationService.requireEventPostPermission(comment.post.event.id, user.id)

        return comment.replies
            .sortedBy { it.createdAt }
            .map(commentMapper::toCommentResponse)
    }

    /**
     * Get comments by a specific author using CommentSpecifications
     * Useful for user profile pages showing their comment history
     */
    @Transactional(readOnly = true)
    fun getCommentsByAuthor(authorId: Long): List<CommentResponse> {
        val spec = CommentSpecifications.byAuthor(authorId)
        return commentRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
            .map(commentMapper::toCommentResponse)
    }

    /**
     * Search comments by content text using CommentSpecifications
     * Useful for moderation or finding specific discussions
     */
    @Transactional(readOnly = true)
    fun searchComments(searchText: String): List<CommentResponse> {
        val spec = CommentSpecifications.contentContains(searchText)
        return commentRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
            .map(commentMapper::toCommentResponse)
    }

    /**
     * Get recent comments within a date range using CommentSpecifications
     * Useful for activity reports or moderation
     */
    @Transactional(readOnly = true)
    fun getCommentsInDateRange(from: LocalDateTime, to: LocalDateTime): List<CommentResponse> {
        val spec = CommentSpecifications.createdAfter(from)
            .and(CommentSpecifications.createdBefore(to))
        return commentRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
            .map(commentMapper::toCommentResponse)
    }

    /**
     * Get recent comments for a specific post after a certain date
     * Useful for real-time updates or "load more" functionality
     */
    @Transactional(readOnly = true)
    fun getRecentCommentsForPost(postId: Long, since: LocalDateTime, userEmail: String): List<CommentResponse> {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val post = postRepository.findByIdOrThrow(postId)

        // Use centralized authorization service
        authorizationService.requireEventPostPermission(post.event.id, user.id)

        val spec = CommentSpecifications.forPost(postId)
            .and(CommentSpecifications.createdAfter(since))

        return commentRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "createdAt"))
            .map(commentMapper::toCommentResponse)
    }

    /**
     * Search comments within a specific post
     * Useful for finding specific discussions in long comment threads
     */
    @Transactional(readOnly = true)
    fun searchCommentsInPost(postId: Long, searchText: String, userEmail: String): List<CommentResponse> {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val post = postRepository.findByIdOrThrow(postId)

        authorizationService.requireEventPostPermission(post.event.id, user.id)

        val spec = CommentSpecifications.forPost(postId)
            .and(CommentSpecifications.contentContains(searchText))

        return commentRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "createdAt"))
            .map(commentMapper::toCommentResponse)
    }
}