package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.model.Like
import com.cs2.volunteer_hub.repository.*
import com.cs2.volunteer_hub.specification.LikeSpecifications
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class LikeService(
    private val likeRepository: LikeRepository,
    val postRepository: PostRepository,
    private val userRepository: UserRepository,
    private val authorizationService: AuthorizationService,
    private val cacheEvictionService: CacheEvictionService
) {
    @Transactional
    fun toggleLike(postId: Long, userEmail: String): Boolean {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val post = postRepository.findByIdOrThrow(postId)
        authorizationService.requireEventPostPermission(post.event.id, user.id)
        cacheEvictionService.evictPosts(post.event.id)

        val spec = LikeSpecifications.byUserAndPost(user.id, post.id)
        val existingLike = likeRepository.findAll(spec).firstOrNull()

        return if (existingLike != null) {
            likeRepository.delete(existingLike)
            false
        } else {
            val newLike = Like(user = user, post = post)
            likeRepository.save(newLike)
            true
        }
    }
}