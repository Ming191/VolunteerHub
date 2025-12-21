package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.GalleryImageResponse
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.Image
import com.cs2.volunteer_hub.model.ImageStatus
import com.cs2.volunteer_hub.repository.ImageRepository
import com.cs2.volunteer_hub.service.EventCapacityService
import org.springframework.stereotype.Component

@Component
class EventMapper(
        private val eventCapacityService: EventCapacityService,
        private val imageRepository: ImageRepository
) {
        /** Map Event entity to EventResponse DTO */
        fun toEventResponse(event: Event): EventResponse {
                val approvedCount = eventCapacityService.getApprovedCount(event.id)
                val waitlistCount = eventCapacityService.getWaitlistCount(event.id)
                val pendingCount = eventCapacityService.getPendingCount(event.id)
                // Removed massive gallery fetch for performance
                // val galleryImages = buildGalleryImages(event.id)

                return EventResponse(
                        id = event.id,
                        title = event.title,
                        imageUrls = event.images.mapNotNull { it.url },
                        // galleryImageUrls = galleryImages,
                        description = event.description,
                        location = event.location,
                        latitude = event.latitude,
                        longitude = event.longitude,
                        eventDateTime = event.eventDateTime,
                        endDateTime = event.endDateTime,
                        registrationDeadline = event.registrationDeadline,
                        isApproved = event.isApproved,
                        creatorName = event.creator.name,
                        creatorId = event.creator.id,
                        maxParticipants = event.maxParticipants,
                        waitlistEnabled = event.waitlistEnabled,
                        approvedCount = approvedCount,
                        pendingCount = pendingCount,
                        waitlistCount = waitlistCount,
                        availableSpots =
                                eventCapacityService.getAvailableSpots(
                                        event.id,
                                        event.maxParticipants
                                ),
                        isFull = event.maxParticipants?.let { approvedCount >= it } ?: false,
                        isInProgress = event.isInProgress(),
                        tags = event.tags.toSet(),
                        status = event.status,
                        rejectionReason = event.rejectionReason,
                        imagesProcessing = event.images.any { it.status == ImageStatus.PENDING_UPLOAD }
                )
        }

        /**
         * Map list of Event entities to list of EventResponse DTOs OPTIMIZED: Uses batch query to
         * avoid N+1 problem
         */
        fun toEventResponseList(events: List<Event>): List<EventResponse> {
                if (events.isEmpty()) return emptyList()

                // Batch fetch all capacity stats in one query
                val eventIds = events.map { it.id }
                val capacityStatsMap = eventCapacityService.getCapacityStatsForEvents(eventIds)

                return events.map { event ->
                        val stats =
                                capacityStatsMap[event.id]
                                        ?: throw IllegalStateException(
                                                "Missing capacity stats for event ${event.id}"
                                        )

                        // val galleryImages = buildGalleryImages(event.id)

                        EventResponse(
                                id = event.id,
                                title = event.title,
                                imageUrls = event.images.mapNotNull { it.url },
                                // galleryImageUrls = galleryImages,
                                description = event.description,
                                location = event.location,
                                latitude = event.latitude,
                                longitude = event.longitude,
                                eventDateTime = event.eventDateTime,
                                endDateTime = event.endDateTime,
                                registrationDeadline = event.registrationDeadline,
                                isApproved = event.isApproved,
                                creatorName = event.creator.name,
                                creatorId = event.creator.id,
                                maxParticipants = event.maxParticipants,
                                waitlistEnabled = event.waitlistEnabled,
                                approvedCount = stats.approvedCount,
                                pendingCount = stats.pendingCount,
                                waitlistCount = stats.waitlistCount,
                                availableSpots =
                                        event.maxParticipants?.let { it - stats.approvedCount },
                                isFull = event.maxParticipants?.let { stats.approvedCount >= it }
                                                ?: false,
                                isInProgress = event.isInProgress(),
                                tags = event.tags.toSet(),
                                status = event.status,
                                rejectionReason = event.rejectionReason,
                                imagesProcessing = event.images.any { it.status == ImageStatus.PENDING_UPLOAD }
                        )
                }
        }

        fun toGalleryImageResponse(image: Image, eventId: Long): GalleryImageResponse? {
                return image.url?.let { url ->
                        when {
                                image.event?.id == eventId -> {
                                        // Image belongs directly to the event
                                        GalleryImageResponse(
                                                url = url,
                                                source = "event",
                                                authorName = null,
                                                authorId = null,
                                                postId = null
                                        )
                                }
                                image.post?.event?.id == eventId -> {
                                        // Image belongs to a post associated with the event
                                        GalleryImageResponse(
                                                url = url,
                                                source = "post",
                                                authorName = image.post?.author?.name,
                                                authorId = image.post?.author?.id,
                                                postId = image.post?.id
                                        )
                                }
                                else -> null
                        }
                }
        }
}
