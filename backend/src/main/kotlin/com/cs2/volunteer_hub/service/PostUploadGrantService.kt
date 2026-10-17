package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.exception.UnauthorizedAccessException
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import java.security.MessageDigest
import java.time.Duration

/**
 * Redis-backed one-use upload capability. A URL from another user/event (or forged URL)
 * cannot be attached to a post. TTL also prevents arbitrarily old uploads being linked.
 * Consumed before DB write: if DB write fails the client must request a new upload URL.
 */
@Service
class PostUploadGrantService(
    private val redis: StringRedisTemplate,
    private val imageUploadService: ImageUploadService
) {
    fun register(url: String, userId: Long, eventId: Long, mimeType: String) {
        redis.opsForValue().set(key(url), "$userId:$eventId:$mimeType", Duration.ofMinutes(20))
    }

    fun verifyAndConsume(url: String, userId: Long, eventId: Long) {
        val redisKey = key(url)
        val current = redis.opsForValue().get(redisKey)
            ?: throw UnauthorizedAccessException("Upload capability has expired or is not recognized")
        val pieces = current.split(":", limit = 3)
        if (pieces.size != 3 || pieces[0] != userId.toString() || pieces[1] != eventId.toString()) {
            throw UnauthorizedAccessException("Upload does not belong to this user and event")
        }
        val consumed = redis.opsForValue().getAndDelete(redisKey)
        if (consumed != current) throw BadRequestException("Upload has already been consumed")
        imageUploadService.verifyUploadedObject(url, pieces[2])
    }

    private fun key(url: String): String {
        val hash = MessageDigest.getInstance("SHA-256")
            .digest(url.toByteArray(Charsets.UTF_8))
            .joinToString("") { "%02x".format(it) }
        return "post-upload:$hash"
    }
}
