package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.Comment
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface CommentRepository : JpaRepository<Comment, Long>, JpaSpecificationExecutor<Comment> {
    
    @Query("""
        SELECT c FROM Comment c
        LEFT JOIN FETCH c.author
        LEFT JOIN FETCH c.post
        WHERE c.post.id = :postId
        ORDER BY c.createdAt ASC
    """)
    fun findAllByPostIdWithAssociations(@Param("postId") postId: Long, pageable: Pageable): Page<Comment>
    
    fun findAllByPostIdOrderByCreatedAtAsc(postId: Long): List<Comment>
    
    @Query("""
        SELECT c FROM Comment c
        LEFT JOIN FETCH c.author
        LEFT JOIN FETCH c.post
        WHERE c.parentComment.id = :parentCommentId
        ORDER BY c.createdAt ASC
    """)
    fun findAllByParentCommentIdWithAssociations(@Param("parentCommentId") parentCommentId: Long): List<Comment>
    
    fun findAllByParentCommentIdOrderByCreatedAtAsc(parentCommentId: Long): List<Comment>
}
