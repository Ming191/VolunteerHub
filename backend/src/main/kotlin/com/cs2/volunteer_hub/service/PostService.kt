package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.PostCreationMessage
import com.cs2.volunteer_hub.dto.PostRequest
import com.cs2.volunteer_hub.dto.PostResponse
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.exception.UnauthorizedAccessException
import com.cs2.volunteer_hub.mapper.PostMapper
import com.cs2.volunteer_hub.model.Post
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.*
import com.cs2.volunteer_hub.specification.PostSpecifications
import com.cs2.volunteer_hub.specification.RegistrationSpecifications
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
import java.time.LocalDateTime

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
        private val imageUploadService: ImageUploadService,
        private val postUploadGrantService: PostUploadGrantService,
        private val profilePrivacyService: ProfilePrivacyService,
        @Value("\${upload.max-files-per-post:5}") private val maxFilesPerPost: Int
) {
    private val logger = LoggerFactory.getLogger(PostService::class.java)

    @Transactional(readOnly = true)
    fun generateSignedUrl(eventId: Long, userEmail: String, contentType: String, fileName: String, sizeBytes: Long = 0L): Pair<String, String> {
        // A signed PUT URL is write access to object storage. Enforce the same
        // object-level permission as creating a post BEFORE issuing that capability.
        val user = userRepository.findByEmailOrThrow(userEmail)
        authorizationService.requireEventPostPermission(eventId, user.id)
        if (sizeBytes !in 1L..10_485_760L) throw BadRequestException("Upload exceeds allowed 10MB size or has no size")
        val urls = imageUploadService.generateSignedUrl(contentType, fileName)
        postUploadGrantService.register(urls.second, user.id, eventId, contentType)
        return urls
    }

    @CacheEvict(value = ["posts"], key = "#eventId")
    @Transactional
    fun createPost(
            eventId: Long,
            request: PostRequest,
            userEmail: String
    ): PostResponse {
        val author = userRepository.findByEmailOrThrow(userEmail)
        val event = authorizationService.requireEventPostPermission(eventId, author.id)

        if (request.content.isBlank() && request.imageUrls.isNullOrEmpty()) {
            throw BadRequestException(
                "Post must contain either text content or an image."
            )
        }

        request.imageUrls?.let {
            if (it.size > maxFilesPerPost) {
                 throw BadRequestException("Cannot upload more than $maxFilesPerPost images.")
            }
        }

        // Verify each issued upload capability and the actual GCS object before saving.
        // Do not trust arbitrary caller-supplied public image URLs.
        request.imageUrls?.forEach { url ->
            postUploadGrantService.verifyAndConsume(url, author.id, eventId)
        }
        val post = Post(content = request.content, author = author, event = event)

        val savedPost = postRepository.save(post)
        
        // Handle pre-uploaded images
        if (!request.imageUrls.isNullOrEmpty()) {
             request.imageUrls.forEachIndexed { index, url ->
                 val image = com.cs2.volunteer_hub.model.Image(
                     url = url,
                     post = savedPost,
                     originalFileName = "direct-upload-$index.jpg",
                     contentType = "image/jpeg",
                     status = com.cs2.volunteer_hub.model.ImageStatus.UPLOADED
                 )
                 savedPost.images.add(image)
             }
             postRepository.save(savedPost)
        }
        
        logger.info(
                "Created post ID: ${savedPost.id} with ${savedPost.images.size} images (pre-uploaded)"
        )

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

        // Load posts with all associations in single query
        val postIds = postPage.content.map { it.id }
        val postsWithAssociations = postRepository.findByIdsWithAssociations(postIds)
        
        // Maintain original order from pagination
        val postMap = postsWithAssociations.associateBy { it.id }
        val orderedPosts = postIds.mapNotNull { postMap[it] }

        val likedPostIds = user?.let { getLikedPostIdsByUser(it.id, postIds) } ?: emptySet()
        val postResponses = postMapper.toPostResponseList(orderedPosts, likedPostIds)

        return PageImpl(postResponses, pageable, postPage.totalElements)
    }

    @Transactional(readOnly = true)
    internal fun getLikedPostIdsByUser(userId: Long, postIds: List<Long>): Set<Long> {
        return likeRepository.findLikedPostIdsByUserAndPosts(userId, postIds)
    }

    @Transactional
    fun updatePost(
            eventId: Long,
            postId: Long,
            request: PostRequest,
            userEmail: String
    ): PostResponse {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val post = postRepository.findByIdOrThrow(postId)

        if (post.event.id != eventId) {
            throw BadRequestException(
                    "Post does not belong to the specified event."
            )
        }

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
    fun getPost(eventId: Long, postId: Long, userEmail: String): PostResponse {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val post = postRepository.findByIdOrThrow(postId)

        if (post.event.id != eventId) {
            throw BadRequestException(
                    "Post does not belong to the specified event."
            )
        }
        authorizationService.requireEventReadPermission(eventId, user.id)

        val isLiked = isPostLikedByUser(user.id, post.id)
        return postMapper.toPostResponse(post, isLiked)
    }

    @Transactional(readOnly = true)
    internal fun isPostLikedByUser(userId: Long, postId: Long): Boolean {
        return likeRepository.existsByUserIdAndPostId(userId, postId)
    }

    @Transactional
    fun deletePost(eventId: Long, postId: Long, userEmail: String) {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val post = postRepository.findByIdOrThrow(postId)

        if (post.event.id != eventId) {
            throw BadRequestException(
                    "Post does not belong to the specified event."
            )
        }

        if (post.author.id != user.id) {
            throw UnauthorizedAccessException("You don't have permission to delete this post.")
        }

        cacheEvictionService.evictPosts(post.event.id)
        postRepository.delete(post)
    }

    @Transactional
    fun adminDeletePost(postId: Long) {
        val post = postRepository.findByIdOrThrow(postId)
        cacheEvictionService.evictPosts(post.event.id)
        postRepository.delete(post)
        logger.info("Admin deleted post ID: $postId")
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
                        .and(PostSpecifications.visibleInEventsTo(user.id, user.role == com.cs2.volunteer_hub.model.Role.ADMIN))
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
            .and(PostSpecifications.visibleInEventsTo(user.id, user.role == com.cs2.volunteer_hub.model.Role.ADMIN))
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
    fun getPostsByUserId(userId: Long, requestingUserEmail: String?, pageable: Pageable): Page<PostResponse> {
        // This endpoint builds a person's profile timeline, not an event discussion.
        // A locked profile must be enforced by the API, not merely hidden in the UI.
        // Posts remain visible individually in events where the caller has read access.
        val author = userRepository.findByIdOrThrow(userId)
        if (userRepository.findDeletionStatus(userId) != false) {
            throw ResourceNotFoundException("User", "id", userId)
        }
        val viewer = requestingUserEmail?.let(userRepository::findByEmail)
        val allowed = viewer != null && !viewer.isDeleted &&
            (viewer.id == userId || viewer.role == com.cs2.volunteer_hub.model.Role.ADMIN)
        if (profilePrivacyService.isPrivate(author) && !allowed) {
            throw UnauthorizedAccessException("This profile is locked.")
        }

        val postSpec = PostSpecifications.byAuthor(userId)
            .and(PostSpecifications.visibleInEventsTo(viewer?.id, viewer?.role == com.cs2.volunteer_hub.model.Role.ADMIN))
        val postPage = postRepository.findAll(postSpec, pageable)

        if (postPage.isEmpty) {
            return Page.empty(pageable)
        }

        val postIds = postPage.content.map { it.id }

        // Get liked post IDs for the requesting user (if authenticated)
        val likedPostIds = viewer?.let { getLikedPostIdsByUser(it.id, postIds) } ?: emptySet()

        val postResponses = postMapper.toPostResponseList(postPage.content, likedPostIds)

        return PageImpl(postResponses, pageable, postPage.totalElements)
    }
}
