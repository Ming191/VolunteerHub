package com.cs2.volunteer_hub.dto

import java.io.Serializable

data class ProfilePictureUploadMessage(
    val userId: Long,
    val temporaryFilePath: String,
    val contentType: String,
    val originalFileName: String,
    val retryCount: Int = 0
) : Serializable

data class ProfilePictureUploadSuccessMessage(
    val userId: Long,
    val uploadedUrl: String
) : Serializable

data class ProfilePictureUploadFailureMessage(
    val userId: Long,
    val error: String,
    val retryCount: Int = 0
) : Serializable

