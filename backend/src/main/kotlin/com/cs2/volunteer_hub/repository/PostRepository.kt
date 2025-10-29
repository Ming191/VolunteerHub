package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.Post
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PostRepository : JpaRepository<Post, Long> {
    fun findAllByEventIdOrderByCreatedAtDesc(eventId: Long): List<Post>
}