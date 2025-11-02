package com.cs2.volunteer_hub.model

import jakarta.persistence.*

@Entity
@Table(
    name = "post_likes",
    uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "post_id"])],
    indexes = [
        Index(name = "idx_likes_post_id", columnList = "post_id"),
        Index(name = "idx_likes_post_user", columnList = "post_id, user_id")
    ]
)
data class Like(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    val post: Post
)