package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.Post
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface PostRepository : JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {
    fun findAllByEventIdOrderByCreatedAtDesc(eventId: Long): List<Post>

    @Query("""
        SELECT p FROM Post p 
        WHERE p.event.id IN :eventIds 
        ORDER BY p.createdAt DESC
    """)
    fun findRecentPostsInEvents(eventIds: List<Long>, pageable: Pageable): List<Post>
}