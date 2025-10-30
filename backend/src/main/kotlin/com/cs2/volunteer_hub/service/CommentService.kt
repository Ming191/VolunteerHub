package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.*
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.model.Comment
import com.cs2.volunteer_hub.repository.CommentRepository
import com.cs2.volunteer_hub.repository.PostRepository
import com.cs2.volunteer_hub.repository.UserRepository
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CommentService(
    private val commentRepository: CommentRepository,
    private val postRepository: PostRepository,
    private val userRepository: UserRepository,
    private val postService: PostService,
    private val cacheManager: CacheManager
) {
    @Transactional
    fun createComment(postId: Long, request: CommentRequest, userEmail: String): CommentResponse {
        val author = userRepository.findByEmail(userEmail)!!
        val post = postRepository.findById(postId)
            .orElseThrow { ResourceNotFoundException("Post", "id", postId) }

        postService.checkPermissionToPost(post.event.id, author.id)

        cacheManager.getCache("comments")?.evict(postId)
        cacheManager.getCache("posts")?.evict(post.event.id)

        val comment = Comment(
            content = request.content,
            author = author,
            post = post
        )
        val savedComment = commentRepository.save(comment)

        return mapToCommentResponse(savedComment)
    }

    @Cacheable(value = ["comments"], key = "#postId")
    @Transactional(readOnly = true)
    fun getCommentsForPost(postId: Long, userEmail: String): List<CommentResponse> {
        val user = userRepository.findByEmail(userEmail)!!
        val post = postRepository.findById(postId)
            .orElseThrow { ResourceNotFoundException("Post", "id", postId) }

        postService.checkPermissionToPost(post.event.id, user.id)

        return commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId)
            .map(this::mapToCommentResponse)
    }


    private fun mapToCommentResponse(comment: Comment): CommentResponse {
        return CommentResponse(
            id = comment.id,
            content = comment.content,
            createdAt = comment.createdAt,
            author = AuthorResponse(id = comment.author.id, name = comment.author.name)
        )
    }
}