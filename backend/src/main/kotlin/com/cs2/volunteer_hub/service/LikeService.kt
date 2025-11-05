package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.model.Like
import com.cs2.volunteer_hub.repository.LikeRepository
import com.cs2.volunteer_hub.repository.PostRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.findByEmailOrThrow
import com.cs2.volunteer_hub.repository.findByIdOrThrow
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
        val existingLike = likeRepository.findByUserIdAndPostId(user.id, post.id)

        return if (existingLike.isPresent) {
            likeRepository.delete(existingLike.get())
            false
        } else {
            val newLike = Like(user = user, post = post)
            likeRepository.save(newLike)
            true
        }
    }
}