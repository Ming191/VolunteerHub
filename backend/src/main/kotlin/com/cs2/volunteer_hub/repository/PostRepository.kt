package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.Post
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface PostRepository : JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {

    /**
     * Find recent posts with all associations eagerly loaded to prevent N+1 queries
     */
    @Query("""
        SELECT DISTINCT p FROM Post p 
        LEFT JOIN FETCH p.author
        LEFT JOIN FETCH p.event
        LEFT JOIN FETCH p.images
        WHERE p.event.id IN :eventIds 
        ORDER BY p.createdAt DESC
    """)
    fun findRecentPostsInEvents(eventIds: List<Long>, pageable: Pageable): List<Post>

    /**
     * Find posts by event with all associations eagerly loaded
     */
    @Query("""
        SELECT DISTINCT p FROM Post p
        LEFT JOIN FETCH p.author
        LEFT JOIN FETCH p.event
        LEFT JOIN FETCH p.images
        WHERE p.event.id = :eventId
        ORDER BY p.createdAt DESC
    """)
    fun findByEventIdWithAssociations(eventId: Long): List<Post>

    /**
     * Find posts for events with pagination and eager loading
     * Note: Pagination with FETCH JOIN requires using IDs first approach
     */
    @Query("""
        SELECT p.id FROM Post p
        WHERE p.event.id IN :eventIds
        ORDER BY p.createdAt DESC
    """)
    fun findPostIdsByEventIds(eventIds: List<Long>, pageable: Pageable): List<Long>

    /**
     * Load posts by IDs with all associations
     */
    @Query("""
        SELECT DISTINCT p FROM Post p
        LEFT JOIN FETCH p.author
        LEFT JOIN FETCH p.event
        LEFT JOIN FETCH p.images
        WHERE p.id IN :postIds
        ORDER BY p.createdAt DESC
    """)
    fun findByIdsWithAssociations(postIds: List<Long>): List<Post>
}