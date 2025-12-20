package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.Comment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository

@Repository
interface CommentRepository : JpaRepository<Comment, Long>, JpaSpecificationExecutor<Comment> {
    fun findAllByPostIdOrderByCreatedAtAsc(postId: Long): List<Comment>
    fun findAllByParentCommentIdOrderByCreatedAtAsc(parentCommentId: Long): List<Comment>
}
