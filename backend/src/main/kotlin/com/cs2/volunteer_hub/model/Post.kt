package com.cs2.volunteer_hub.model

import com.fasterxml.jackson.annotation.JsonManagedReference
import jakarta.persistence.*
import org.hibernate.annotations.Formula
import java.time.LocalDateTime

@Entity
@Table(
    name = "posts",
    indexes = [
        Index(name = "idx_posts_event_created", columnList = "event_id, created_at"),
        Index(name = "idx_posts_author_id", columnList = "author_id"),
        Index(name = "idx_posts_created_at", columnList = "created_at")
    ]
)
data class Post(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(columnDefinition = "TEXT")
    var content: String,

    val createdAt: LocalDateTime = LocalDateTime.now(),
    var updatedAt: LocalDateTime? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    val author: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    val event: Event,

    @OneToMany(mappedBy = "post", cascade = [CascadeType.ALL], orphanRemoval = true)
    val comments: MutableList<Comment> = mutableListOf(),

    @OneToMany(mappedBy = "post", cascade = [CascadeType.ALL], orphanRemoval = true)
    val likes: MutableList<Like> = mutableListOf(),

    @Formula("(select count(*) from likes l where l.post_id = id)")
    val totalLikesCount: Int = 0,

    @Formula("(select count(*) from comments c where c.post_id = id)")
    val totalCommentsCount: Int = 0,

    @OneToMany(
        mappedBy = "post",
        cascade = [CascadeType.ALL],
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @JsonManagedReference("post-images")
    val images: MutableList<Image> = mutableListOf(),

    @Version
    var version: Long = 0
)
