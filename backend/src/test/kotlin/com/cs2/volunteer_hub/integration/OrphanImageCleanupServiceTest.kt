package com.cs2.volunteer_hub.integration

import com.cs2.volunteer_hub.repository.ImageRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.service.OrphanImageCleanupService
import com.cs2.volunteer_hub.storage.ObjectStoragePort
import com.cs2.volunteer_hub.storage.StoredObjectReference
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import java.time.Instant

class OrphanImageCleanupServiceTest {
    private val storage = Mockito.mock(ObjectStoragePort::class.java)
    private val images = Mockito.mock(ImageRepository::class.java)
    private val users = Mockito.mock(UserRepository::class.java)
    private val now = Instant.parse("2026-10-24T12:00:00Z")

    private val orphan = "images/11111111-1111-4111-8111-111111111111-orphan.png"
    private val claimed = "images/22222222-2222-4222-8222-222222222222-claimed.png"
    private val profile = "images/33333333-3333-4333-8333-333333333333-avatar.png"
    private val fresh = "images/44444444-4444-4444-8444-444444444444-fresh.png"

    private fun setupReferences() {
        Mockito.`when`(images.findReferencedUrls()).thenReturn(listOf("http://localhost:8080/api/media/$claimed"))
        Mockito.`when`(users.findReferencedProfilePictureUrls()).thenReturn(listOf("https://old-host/api/media/$profile"))
        Mockito.`when`(storage.list("images/")).thenReturn(listOf(
            StoredObjectReference(orphan, now.minusSeconds(72 * 3600)),
            StoredObjectReference(claimed, now.minusSeconds(72 * 3600)),
            StoredObjectReference(profile, now.minusSeconds(72 * 3600)),
            StoredObjectReference(fresh, now.minusSeconds(3600)),
            StoredObjectReference("images/manual-asset.png", now.minusSeconds(72 * 3600))
        ))
    }

    @Test
    fun `only old unreferenced randomized objects are deleted`() {
        setupReferences()
        val result = OrphanImageCleanupService(storage, images, users, 48, 100).cleanupAt(now)

        assertEquals(1, result.candidates)
        assertEquals(1, result.deleted)
        assertEquals(0, result.failed)
        Mockito.verify(storage).delete(orphan)
        Mockito.verify(storage, Mockito.never()).delete(claimed)
        Mockito.verify(storage, Mockito.never()).delete(profile)
        Mockito.verify(storage, Mockito.never()).delete(fresh)
    }

    @Test
    fun `failed deletes remain eligible for next pass`() {
        setupReferences()
        Mockito.doThrow(IllegalStateException("temporary S3 error")).doNothing()
            .`when`(storage).delete(orphan)
        val worker = OrphanImageCleanupService(storage, images, users, 48, 100)

        assertEquals(1, worker.cleanupAt(now).failed)
        assertEquals(1, worker.cleanupAt(now).deleted)
        Mockito.verify(storage, Mockito.times(2)).delete(orphan)
    }

    @Test
    fun `database failure aborts without touching storage`() {
        Mockito.`when`(images.findReferencedUrls()).thenThrow(IllegalStateException("database unavailable"))

        assertThrows(IllegalStateException::class.java) {
            OrphanImageCleanupService(storage, images, users, 48, 100).cleanupAt(now)
        }
        Mockito.verify(storage, Mockito.never()).delete(Mockito.anyString())
    }

    @Test
    fun `unsafe retention or unbounded batch is rejected`() {
        assertThrows(IllegalArgumentException::class.java) {
            OrphanImageCleanupService(storage, images, users, 1, 100)
        }
        assertThrows(IllegalArgumentException::class.java) {
            OrphanImageCleanupService(storage, images, users, 48, 10_000)
        }
    }
}
