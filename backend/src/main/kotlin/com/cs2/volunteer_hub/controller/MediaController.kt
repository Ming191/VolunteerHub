package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.service.ImageUploadService
import org.springframework.http.CacheControl
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.TimeUnit

/** Browser-facing read-only gateway. The local S3 bucket itself is private. */
@RestController
@RequestMapping("/api/media")
class MediaController(private val uploads: ImageUploadService) {
    @GetMapping("/images/{fileName}")
    fun getImage(@PathVariable fileName: String): ResponseEntity<ByteArray> {
        val (data, contentType) = uploads.readPublicImage(fileName)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
            .body(data)
    }
}
