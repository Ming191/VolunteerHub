package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.model.Registration
import org.springframework.cache.CacheManager
import org.springframework.stereotype.Service

/**
 * Centralized cache eviction service
 * Provides consistent cache management across the application
 * Eliminates duplicate manual cache eviction patterns
 */
@Service
class CacheEvictionService(
    private val cacheManager: CacheManager
) {
    /**
     * Evict all events from cache
     */
    fun evictAllEvents() {
        cacheManager.getCache("events")?.clear()
    }

    /**
     * Evict a specific event from cache
     */
    fun evictEvent(eventId: Long) {
        cacheManager.getCache("event")?.evict(eventId)
    }

    /**
     * Evict event registrations cache
     */
    fun evictEventRegistrations(eventId: Long) {
        cacheManager.getCache("eventRegistrations")?.evict(eventId)
    }

    /**
     * Evict user registrations cache
     */
    fun evictUserRegistrations(userEmail: String) {
        cacheManager.getCache("userRegistrations")?.evict(userEmail)
    }

    /**
     * Evict posts cache for an event
     */
    fun evictPosts(eventId: Long) {
        cacheManager.getCache("posts")?.evict(eventId)
    }

    /**
     * Evict all caches related to a registration
     * Used when registration status changes
     */
    fun evictRelatedCaches(registration: Registration) {
        evictEventRegistrations(registration.event.id)
        evictUserRegistrations(registration.user.email)
    }

    /**
     * Evict all caches related to an event
     * Used when event is updated or deleted
     */
    fun evictAllEventCaches(eventId: Long) {
        evictEvent(eventId)
        evictAllEvents()
        evictEventRegistrations(eventId)
        evictPosts(eventId)
    }

    /**
     * Evict public user profile cache
     */
    fun evictPublicUserProfile(userId: Long) {
        cacheManager.getCache("publicUserProfiles")?.evict(userId)
    }
}

