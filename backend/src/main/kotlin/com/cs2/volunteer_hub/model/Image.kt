package com.cs2.volunteer_hub.model

import com.fasterxml.jackson.annotation.JsonBackReference
import jakarta.persistence.*

@Entity
@Table(
    name = "images",
    indexes = [
        Index(name = "idx_images_event_id", columnList = "event_id"),
        Index(name = "idx_images_post_id", columnList = "post_id"),
        Index(name = "idx_images_status", columnList = "status")
    ]
)
data class Image(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(length = 512)
    var url: String? = null,

    @Enumerated(EnumType.STRING)
    var status: ImageStatus = ImageStatus.PENDING_UPLOAD,

    @Column(nullable = false)
    var originalFileName: String,

    @Column(nullable = false)
    var contentType: String,

    var temporaryFilePath: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    @JsonBackReference("event-images")
    var event: Event? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    @JsonBackReference("post-images")
    var post: Post? = null
)