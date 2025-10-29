package com.cs2.volunteer_hub.dto

import java.io.Serializable

data class EventCreationMessage(
    val eventId: Long,
    val retryCount: Int = 0
) : Serializable

data class ImageUploadSuccessMessage(
    val eventId: Long,
    val uploadedUrls: Map<Long, String>
) : Serializable

data class ImageUploadFailureMessage(
    val eventId: Long,
    val uploadedUrls: Map<Long, String>,
    val error: String,
    val retryCount: Int = 0
) : Serializable

// Post-related messages
data class PostCreationMessage(
    val postId: Long,
    val retryCount: Int = 0
) : Serializable

data class PostImageUploadSuccessMessage(
    val postId: Long,
    val uploadedUrls: Map<Long, String>
) : Serializable

data class PostImageUploadFailureMessage(
    val postId: Long,
    val uploadedUrls: Map<Long, String>,
    val error: String,
    val retryCount: Int = 0
) : Serializable
