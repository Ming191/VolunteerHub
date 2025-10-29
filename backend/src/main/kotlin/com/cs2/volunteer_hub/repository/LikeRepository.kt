package com.cs2.volunteer_hub.repository
import com.cs2.volunteer_hub.model.Like
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface LikeRepository : JpaRepository<Like, Long> {
    fun findByUserIdAndPostId(userId: Long, postId: Long): Optional<Like>
}