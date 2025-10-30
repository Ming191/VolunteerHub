package com.cs2.volunteer_hub.repository
import com.cs2.volunteer_hub.model.Like
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface LikeRepository : JpaRepository<Like, Long> {
    fun findByUserIdAndPostId(userId: Long, postId: Long): Optional<Like>

    @Query("SELECT l.post.id FROM Like l WHERE l.user.id = :userId AND l.post.id IN :postIds")
    fun findLikedPostIdsByUser(userId: Long, postIds: List<Long>): List<Long>
}