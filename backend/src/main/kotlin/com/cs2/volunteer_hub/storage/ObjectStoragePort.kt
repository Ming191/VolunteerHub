package com.cs2.volunteer_hub.storage

import java.time.Duration

/**
 * Provider-neutral boundary for private image objects.
 * Implementations must enforce create-only writes for both direct and signed uploads.
 */
interface ObjectStoragePort {
    fun putIfAbsent(key: String, contentType: String, bytes: ByteArray)
    fun presignPutIfAbsent(key: String, contentType: String, validity: Duration): String
    fun metadata(key: String): StoredObjectMetadata?
    fun read(key: String): ByteArray?
    fun delete(key: String)
}

data class StoredObjectMetadata(val contentLength: Long, val contentType: String)
