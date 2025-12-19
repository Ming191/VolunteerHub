package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.PostCreationMessage
import com.cs2.volunteer_hub.dto.PostRequest
import com.cs2.volunteer_hub.dto.PostResponse
import com.cs2.volunteer_hub.exception.UnauthorizedAccessException
import com.cs2.volunteer_hub.mapper.PostMapper
import com.cs2.volunteer_hub.model.Post
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.*
import com.cs2.volunteer_hub.specification.LikeSpecifications
import com.cs2.volunteer_hub.specification.PostSpecifications
import com.cs2.volunteer_hub.specification.RegistrationSpecifications
import java.time.LocalDateTime
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Value
import org.springframework.cache.annotation.CacheEvict
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager
import org.springframework.web.multipart.MultipartFile

@Service
class PostService(
        private val postRepository: PostRepository,
        private val userRepository: UserRepository,
        private val registrationRepository: RegistrationRepository,
        private val likeRepository: LikeRepository,
        private val rabbitTemplate: RabbitTemplate,
        private val fileValidationService: FileValidationService,
        private val postMapper: PostMapper,
        private val authorizationService: AuthorizationService,
        private val cacheEvictionService: CacheEvictionService,
        @field:Value($$"${upload.max-files-per-post:5}") private val maxFilesPerPost: Int = 5
) {
    private val logger = LoggerFactory.getLogger(PostService::class.java)

    @CacheEvict(value = ["posts"], key = "#eventId")
    @Transactional
    fun createPost(
            eventId: Long,
            request: PostRequest,
            files: List<MultipartFile>?,
            userEmail: String
    ): PostResponse {
        val author = userRepository.findByEmailOrThrow(userEmail)
        val event = authorizationService.requireEventPostPermission(eventId, author.id)

        files?.let { fileValidationService.validateFiles(it, maxFilesPerPost) }

        val post = Post(content = request.content, author = author, event = event)

        if (!files.isNullOrEmpty()) {
            fileValidationService.processFilesForPost(files, post)
        }

        val savedPost = postRepository.save(post)
        logger.info(
                "Created post ID: ${savedPost.id} with ${savedPost.images.size} images pending upload"
        )

        if (savedPost.images.isNotEmpty()) {
            val message = PostCreationMessage(postId = savedPost.id)

            TransactionSynchronizationManager.registerSynchronization(
                    object : TransactionSynchronization {
                        override fun afterCommit() {
                            rabbitTemplate.convertAndSend(
                                    RabbitMQConfig.EXCHANGE_NAME,
                                    RabbitMQConfig.POST_CREATION_PENDING_ROUTING_KEY,
                                    message
                            )
                            logger.info(
                                    "Sent post creation message to queue for Post ID: ${savedPost.id}"
                            )
                        }
                    }
            )
        }

        return postMapper.toPostResponse(savedPost, false)
    }

    @Transactional(readOnly = true)
    fun getPostsForEvent(
            eventId: Long,
            userEmail: String?,
            pageable: Pageable
    ): Page<PostResponse> {
        val user = userEmail?.let { userRepository.findByEmailOrThrow(it) }
        authorizationService.requireEventReadPermission(eventId, user?.id)

        val spec = PostSpecifications.forEvent(eventId)
        val postPage = postRepository.findAll(spec, pageable)

        if (postPage.isEmpty) {
            return Page.empty(pageable)
        }

        val postIds = postPage.content.map { it.id }
        val likedPostIds = user?.let { getLikedPostIdsByUser(it.id, postIds) } ?: emptySet()

        val postResponses = postMapper.toPostResponseList(postPage.content, likedPostIds)

        return PageImpl(postResponses, pageable, postPage.totalElements)
    }

    @Transactional(readOnly = true)
    internal fun getLikedPostIdsByUser(userId: Long, postIds: List<Long>): Set<Long> {
        val spec = LikeSpecifications.byUserForPosts(userId, postIds)
        return likeRepository.findAll(spec).map { it.post.id }.toSet()
    }

    @Transactional
    fun updatePost(postId: Long, request: PostRequest, userEmail: String): PostResponse {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val post = postRepository.findByIdOrThrow(postId)

        if (post.author.id != user.id) {
            throw UnauthorizedAccessException("You don't have permission to update this post.")
        }

        cacheEvictionService.evictPosts(post.event.id)

        post.content = request.content
        post.updatedAt = LocalDateTime.now()

        val updatedPost = postRepository.save(post)

        val isLiked = isPostLikedByUser(user.id, updatedPost.id)
        return postMapper.toPostResponse(updatedPost, isLiked)
    }

    @Transactional(readOnly = true)
    internal fun isPostLikedByUser(userId: Long, postId: Long): Boolean {
        val spec = LikeSpecifications.byUserAndPost(userId, postId)
        return likeRepository.findAll(spec).isNotEmpty()
    }

    @Transactional
    fun deletePost(postId: Long, userEmail: String) {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val post = postRepository.findByIdOrThrow(postId)

        if (post.author.id != user.id) {
            throw UnauthorizedAccessException("You don't have permission to delete this post.")
        }

        cacheEvictionService.evictPosts(post.event.id)
        postRepository.delete(post)
    }

    @Transactional(readOnly = true)
    fun getRecentPostsForUser(
            userEmail: String,
            daysBack: Long = 7,
            pageable: Pageable
    ): Page<PostResponse> {
        val user = userRepository.findByEmailOrThrow(userEmail)

        val registrationSpec =
                RegistrationSpecifications.byUser(user.id)
                        .and(RegistrationSpecifications.hasStatus(RegistrationStatus.APPROVED))

        val approvedRegistrations = registrationRepository.findAll(registrationSpec)

        if (approvedRegistrations.isEmpty()) {
            return Page.empty(pageable)
        }

        val eventIds = approvedRegistrations.map { it.event.id }

        val postSpec =
                PostSpecifications.forEvents(eventIds)
                        .and(
                                PostSpecifications.createdAfter(
                                        LocalDateTime.now().minusDays(daysBack)
                                )
                        )

        val postPage = postRepository.findAll(postSpec, pageable)

        if (postPage.isEmpty) {
            return Page.empty(pageable)
        }

        val postIds = postPage.content.map { it.id }
        val likedPostIds = getLikedPostIdsByUser(user.id, postIds)

        val postResponses = postMapper.toPostResponseList(postPage.content, likedPostIds)

        return PageImpl(postResponses, pageable, postPage.totalElements)
    }

    @Transactional(readOnly = true)
    fun getPostsByUser(userEmail: String, pageable: Pageable): Page<PostResponse> {
        val user = userRepository.findByEmailOrThrow(userEmail)

        val postSpec = PostSpecifications.byAuthor(user.id)
        val postPage = postRepository.findAll(postSpec, pageable)

        if (postPage.isEmpty) {
            return Page.empty(pageable)
        }

        val postIds = postPage.content.map { it.id }
        val likedPostIds = getLikedPostIdsByUser(user.id, postIds)

        val postResponses = postMapper.toPostResponseList(postPage.content, likedPostIds)

        return PageImpl(postResponses, pageable, postPage.totalElements)
    }
}
