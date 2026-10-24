package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.repository.ImageRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.storage.ObjectStoragePort
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.Instant

/**
 * Reclaims images whose short-lived upload grants expired without a database reference.
 * The delay exceeds the 20-minute grant TTL, so an eligible object cannot still be claimed.
 * Off by default until an operator opts in to deleting historic unreferenced objects.
 */
@Service
@ConditionalOnProperty(prefix = "storage.orphan-cleanup", name = ["enabled"], havingValue = "true")
class OrphanImageCleanupService(
    private val storage: ObjectStoragePort,
    private val images: ImageRepository,
    private val users: UserRepository,
    @Value("\${storage.orphan-cleanup.retention-hours:48}") private val retentionHours: Long,
    @Value("\${storage.orphan-cleanup.max-deletes:100}") private val maxDeletes: Int
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    private val storedKey = Regex("images/[0-9a-fA-F-]{36}-[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$")

    init {
        require(retentionHours >= 24) { "Orphan retention must be at least 24 hours" }
        require(maxDeletes in 1..1000) { "Orphan cleanup batch size must be 1..1000" }
    }

    @Scheduled(cron = "\${storage.orphan-cleanup.cron:0 0 4 * * *}")
    fun runScheduled() {
        val result = cleanupAt(Instant.now())
        logger.info("Orphan image scan: {} candidates, {} removed, {} failed",
            result.candidates, result.deleted, result.failed)
    }

    /** Package-visible test seam: callers never supply an untrusted clock through HTTP. */
    fun cleanupAt(now: Instant): CleanupResult {
        // Read both reference sets *before* any deletion. If the database is unavailable,
        // abort the run rather than mistaking every object for an orphan.
        val referenced = (images.findReferencedUrls() + users.findReferencedProfilePictureUrls())
            .mapNotNull { storedKey.find(it)?.value }.toSet()
        val cutoff = now.minus(Duration.ofHours(retentionHours))
        val stale = storage.list("images/")
            .asSequence()
            .filter { storedKey.matches(it.key) && it.lastModified.isBefore(cutoff) }
            .filterNot { it.key in referenced }
            .sortedBy { it.lastModified }
            .take(maxDeletes)
            .toList()

        var deleted = 0
        var failed = 0
        for (candidate in stale) {
            try {
                storage.delete(candidate.key)
                deleted++
            } catch (e: Exception) {
                failed++
                // A later scheduled pass retries. Never fail open and delete other keys
                // through an unverified fallback path.
                logger.warn("Could not remove orphan image {}; retrying next run", candidate.key, e)
            }
        }
        return CleanupResult(stale.size, deleted, failed)
    }
}

data class CleanupResult(val candidates: Int, val deleted: Int, val failed: Int)
