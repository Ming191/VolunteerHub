package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.Image
import com.cs2.volunteer_hub.model.ImageStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface ImageRepository : JpaRepository<Image, Long> {
    
    /**
     * Fetch all uploaded images from an event and its associated posts.
     * Returns images from both event.images and event.posts[*].images where status = UPLOADED.
     * Results are ordered by upload date (newest first).
     * Eagerly fetches related entities to avoid N+1 queries.
     */
    @Query("""
        SELECT DISTINCT i FROM Image i
        LEFT JOIN FETCH i.post p
        LEFT JOIN FETCH i.event e
        LEFT JOIN FETCH p.author
        LEFT JOIN FETCH p.event
        WHERE i.status = :status
        AND (
            i.event.id = :eventId
            OR i.post.event.id = :eventId
        )
        ORDER BY i.id DESC
    """)
    fun findAllByEventIncludingPosts(
        @Param("eventId") eventId: Long,
        @Param("status") status: ImageStatus = ImageStatus.UPLOADED
    ): List<Image>
}