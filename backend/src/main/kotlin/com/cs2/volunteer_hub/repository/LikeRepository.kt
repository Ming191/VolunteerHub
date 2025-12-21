package com.cs2.volunteer_hub.repository
import com.cs2.volunteer_hub.model.Like
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface LikeRepository : JpaRepository<Like, Long>, JpaSpecificationExecutor<Like> {
    
    /**
     * Get post IDs liked by user - optimized projection query
     */
    @Query("SELECT l.post.id FROM Like l WHERE l.user.id = :userId AND l.post.id IN :postIds")
    fun findLikedPostIdsByUserAndPosts(
        @Param("userId") userId: Long,
        @Param("postIds") postIds: List<Long>
    ): Set<Long>
    
    /**
     * Check if post is liked by user - optimized exists query
     */
    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM Like l WHERE l.user.id = :userId AND l.post.id = :postId")
    fun existsByUserIdAndPostId(
        @Param("userId") userId: Long,
        @Param("postId") postId: Long
    ): Boolean
}