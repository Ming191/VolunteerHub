package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.PostRequest
import com.cs2.volunteer_hub.dto.PostResponse
import com.cs2.volunteer_hub.dto.AuthorResponse
import com.cs2.volunteer_hub.dto.PostCreationMessage
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.exception.UnauthorizedAccessException
import com.cs2.volunteer_hub.model.Image
import com.cs2.volunteer_hub.model.Post
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.*
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
class PostService(
    private val postRepository: PostRepository,
    private val eventRepository: EventRepository,
    private val userRepository: UserRepository,
    private val registrationRepository: RegistrationRepository,
    private val likeRepository: LikeRepository,
    private val temporaryFileStorageService: TemporaryFileStorageService,
    private val rabbitTemplate: RabbitTemplate,
    @Value("\${upload.max-file-size:10485760}") private val maxFileSize: Long = 10 * 1024 * 1024, // 10MB
    @Value("\${upload.max-files-per-post:5}") private val maxFilesPerPost: Int = 5
) {
    private val logger = LoggerFactory.getLogger(PostService::class.java)
    private val ALLOWED_CONTENT_TYPES = setOf("image/jpeg", "image/png", "image/webp", "image/jpg")

    private fun checkPermissionToPost(eventId: Long, userId: Long) {
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

    @Transactional
    fun createPost(eventId: Long, request: PostRequest, files: List<MultipartFile>?, userEmail: String): PostResponse {
        val author = userRepository.findByEmail(userEmail)
            ?: throw ResourceNotFoundException("User", "email", userEmail)
        val event = eventRepository.findById(eventId)
            .orElseThrow { ResourceNotFoundException("Event", "id", eventId) }

        checkPermissionToPost(eventId, author.id)

        // Validate files
        files?.let { validateFiles(it) }

        val post = Post(
            content = request.content,
            author = author,
            event = event
        )

        // Save files temporarily if present
        if (!files.isNullOrEmpty()) {
            files.forEach { file ->
                val tempPath = temporaryFileStorageService.save(file)
                val image = Image(
                    post = post,
                    originalFileName = file.originalFilename ?: "unknown",
                    contentType = file.contentType ?: "application/octet-stream",
                    temporaryFilePath = tempPath
                )
                post.images.add(image)
            }
        }

        val savedPost = postRepository.save(post)
        logger.info("Created post ID: ${savedPost.id} with ${savedPost.images.size} images pending upload")

        // Send message to queue for async processing
        if (savedPost.images.isNotEmpty()) {
            val message = PostCreationMessage(postId = savedPost.id)
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.POST_CREATION_PENDING_ROUTING_KEY,
                message
            )
            logger.info("Sent post creation message to queue for Post ID: ${savedPost.id}")
        }

        return mapToPostResponse(savedPost, author.id)
    }

    private fun validateFiles(files: List<MultipartFile>) {
        if (files.size > maxFilesPerPost) {
            throw BadRequestException("Too many files. Maximum allowed: $maxFilesPerPost, provided: ${files.size}")
        }

        files.forEach { file ->
            // Check file size
            if (file.size > maxFileSize) {
                throw BadRequestException(
                    "File '${file.originalFilename}' exceeds maximum size of ${maxFileSize / 1024 / 1024}MB. " +
                    "Actual size: ${file.size / 1024 / 1024}MB"
                )
            }

            // Check content type
            if (file.contentType !in ALLOWED_CONTENT_TYPES) {
                throw BadRequestException(
                    "Unsupported file type: ${file.contentType}. " +
                    "Allowed types: ${ALLOWED_CONTENT_TYPES.joinToString(", ")}"
                )
            }

            // Check file is not empty
            if (file.isEmpty) {
                throw BadRequestException("File '${file.originalFilename}' is empty")
            }
        }
    }

    @Transactional(readOnly = true)
    fun getPostsForEvent(eventId: Long, userEmail: String): List<PostResponse> {
        val user = userRepository.findByEmail(userEmail)
            ?: throw ResourceNotFoundException("User", "email", userEmail)

        checkPermissionToPost(eventId, user.id)

        val posts = postRepository.findAllByEventIdOrderByCreatedAtDesc(eventId)
        return posts.map { mapToPostResponse(it, user.id) }
    }

    private fun mapToPostResponse(post: Post, currentUserId: Long): PostResponse {
        val isLiked = likeRepository.findByUserIdAndPostId(currentUserId, post.id).isPresent

        return PostResponse(
            id = post.id,
            content = post.content,
            createdAt = post.createdAt,
            updatedAt = post.updatedAt,
            author = AuthorResponse(id = post.author.id, name = post.author.name),
            totalLikes = post.likes.size,
            totalComments = post.comments.size,
            isLikedByCurrentUser = isLiked,
            imageUrls = post.images.mapNotNull { it.url }
        )
    }
}