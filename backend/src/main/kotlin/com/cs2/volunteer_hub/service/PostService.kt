package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.AuthorResponse
import com.cs2.volunteer_hub.dto.PostCreationMessage
import com.cs2.volunteer_hub.dto.PostRequest
import com.cs2.volunteer_hub.dto.PostResponse
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.exception.UnauthorizedAccessException
import com.cs2.volunteer_hub.model.Post
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.*
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Value
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDateTime

@Service
class PostService(
    private val postRepository: PostRepository,
    private val eventRepository: EventRepository,
    private val userRepository: UserRepository,
    private val registrationRepository: RegistrationRepository,
    private val likeRepository: LikeRepository,
    private val rabbitTemplate: RabbitTemplate,
    private val fileValidationService: FileValidationService,
    private val cacheManager: CacheManager,
    @field:Value("\${upload.max-files-per-post:5}") private val maxFilesPerPost: Int = 5
) {
    private val logger = LoggerFactory.getLogger(PostService::class.java)


    fun checkPermissionToPost(eventId: Long, userId: Long) {
        val event = eventRepository.findById(eventId)
            .orElseThrow { ResourceNotFoundException("Event", "id", eventId) }

        if (!event.isApproved) {
            throw UnauthorizedAccessException("Cannot interact with unapproved events.")
        }

        val registration = registrationRepository.findByEventIdAndUserId(eventId, userId)
        if (!registration.isPresent || registration.get().status != RegistrationStatus.APPROVED) {
            throw UnauthorizedAccessException("You must be an approved member of the event to post.")
        }
    }

    @CacheEvict(value = ["posts"], key = "#eventId")
    @Transactional
    fun createPost(eventId: Long, request: PostRequest, files: List<MultipartFile>?, userEmail: String): PostResponse {
        val author = userRepository.findByEmail(userEmail)
            ?: throw ResourceNotFoundException("User", "email", userEmail)
        val event = eventRepository.findById(eventId)
            .orElseThrow { ResourceNotFoundException("Event", "id", eventId) }

        checkPermissionToPost(eventId, author.id)

        files?.let { fileValidationService.validateFiles(it, maxFilesPerPost) }

        val post = Post(
            content = request.content,
            author = author,
            event = event
        )

        if (!files.isNullOrEmpty()) {
            fileValidationService.processFilesForPost(files, post)
        }

        val savedPost = postRepository.save(post)
        logger.info("Created post ID: ${savedPost.id} with ${savedPost.images.size} images pending upload")

        if (savedPost.images.isNotEmpty()) {
            val message = PostCreationMessage(postId = savedPost.id)
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.POST_CREATION_PENDING_ROUTING_KEY,
                message
            )
            logger.info("Sent post creation message to queue for Post ID: ${savedPost.id}")
        }

        return mapToPostResponse(savedPost, false)
    }

    @Transactional(readOnly = true)
    fun getPostsForEvent(eventId: Long, userEmail: String): List<PostResponse> {
        val user = userRepository.findByEmail(userEmail)
            ?: throw ResourceNotFoundException("User", "email", userEmail)

        checkPermissionToPost(eventId, user.id)

        val posts = getCachedPostsForEvent(eventId)
        if (posts.isEmpty()) {
            return emptyList()
        }

        val postIds = posts.map { it.id }
        val likedPostIds = likeRepository.findLikedPostIdsByUser(user.id, postIds).toSet()

        return posts.map { post ->
            val isLiked = likedPostIds.contains(post.id)
            mapToPostResponse(post, isLiked)
        }
    }


    @Cacheable(value = ["posts"], key = "#eventId")
    internal fun getCachedPostsForEvent(eventId: Long): List<Post> {
        logger.info("--- DATABASE HIT: Fetching post list for event $eventId ---")
        return postRepository.findAllByEventIdOrderByCreatedAtDesc(eventId)
    }

    @Transactional
    fun updatePost(postId: Long, request: PostRequest, userEmail: String): PostResponse {
        val user = userRepository.findByEmail(userEmail)!!
        val post = postRepository.findById(postId)
            .orElseThrow { ResourceNotFoundException("Post", "id", postId) }

        if (post.author.id != user.id) {
            throw UnauthorizedAccessException("You don't have permission to update this post.")
        }

        cacheManager.getCache("posts")?.evict(post.event.id)

        post.content = request.content
        post.updatedAt = LocalDateTime.now()

        val updatedPost = postRepository.save(post)

        val isLiked = likeRepository.findByUserIdAndPostId(user.id, updatedPost.id).isPresent
        return mapToPostResponse(updatedPost, isLiked)
    }

    @Transactional
    fun deletePost(postId: Long, userEmail: String) {
        val user = userRepository.findByEmail(userEmail)!!
        val post = postRepository.findById(postId)
            .orElseThrow { ResourceNotFoundException("Post", "id", postId) }

        if (post.author.id != user.id) {
            throw UnauthorizedAccessException("You don't have permission to delete this post.")
        }

        cacheManager.getCache("posts")?.evict(post.event.id)

        postRepository.delete(post)
    }

    private fun mapToPostResponse(post: Post, isLikedByCurrentUser: Boolean): PostResponse {
        return PostResponse(
            id = post.id,
            content = post.content,
            createdAt = post.createdAt,
            updatedAt = post.updatedAt,
            author = AuthorResponse(id = post.author.id, name = post.author.name),
            totalLikes = post.likes.size,
            totalComments = post.comments.size,
            isLikedByCurrentUser = isLikedByCurrentUser,
            imageUrls = post.images.mapNotNull { it.url }
        )
    }
}