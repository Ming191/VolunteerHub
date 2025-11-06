package com.cs2.volunteer_hub.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "comments",
    indexes = [
        Index(name = "idx_comments_post_created", columnList = "post_id, created_at"),
        Index(name = "idx_comments_author_id", columnList = "author_id"),
        Index(name = "idx_comments_parent_id", columnList = "parent_comment_id")
    ]
)
data class Comment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(columnDefinition = "TEXT")
    var content: String,

    val createdAt: LocalDateTime = LocalDateTime.now(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    val author: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    val post: Post,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    val parentComment: Comment? = null,

    @OneToMany(mappedBy = "parentComment", cascade = [CascadeType.ALL], orphanRemoval = true)
    val replies: MutableList<Comment> = mutableListOf()
)