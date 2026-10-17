package com.cs2.volunteer_hub.dto

data class SignedUrlRequest(val contentType: String, val fileName: String, val sizeBytes: Long = 0L)

data class SignedUrlResponse(val signedUrl: String, val publicUrl: String)
