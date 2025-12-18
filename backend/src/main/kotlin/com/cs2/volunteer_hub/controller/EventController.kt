package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.CreateEventRequest
import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.PageEventResponse
import com.cs2.volunteer_hub.dto.UpdateEventRequest
import com.cs2.volunteer_hub.model.EventTag
import com.cs2.volunteer_hub.service.EventSearchService
import com.cs2.volunteer_hub.service.EventService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import java.time.LocalDateTime
import org.slf4j.LoggerFactory
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/events")
@Tag(name = "Events", description = "Event management endpoints")
class EventController(
    private val eventService: EventService,
    private val eventSearchService: EventSearchService
) {

    private val logger = LoggerFactory.getLogger(EventController::class.java)

    @Operation(
        summary = "Get all approved events",
        description =
            "Retrieve all events that have been approved by admin. Supports pagination."
    )
    @GetMapping
    fun getAllEvents(
        @Parameter(description = "Page number (0-based)")
        @RequestParam(defaultValue = "0")
        page: Int,
        @Parameter(description = "Page size") @RequestParam(defaultValue = "20") size: Int,
        @Parameter(description = "Sort field")
        @RequestParam(defaultValue = "eventDateTime")
        sort: String,
        @Parameter(description = "Sort direction (asc or desc)")
        @RequestParam(defaultValue = "asc")
        direction: String
    ): ResponseEntity<PageEventResponse> {
        val pageable =
            PageRequest.of(page, size, Sort.Direction.fromString(direction.uppercase()), sort)
        val events = eventService.getAllApprovedEvents(pageable)
        return ResponseEntity.ok(PageEventResponse.from(events))
    }

    /**
     * Search approved events with optional filters Example: GET
     * /api/events/search?q=volunteer&upcoming=true&tags=OUTDOOR,FAMILY_FRIENDLY&location=hanoi&matchAllTags=false
     */
    @Operation(
        summary = "Search events",
        description =
            """Search approved events with multiple filters:
        - Text search (title, description, location)
        - Filter for upcoming events only
        - Filter by specific location
        - Filter by tags (supports multiple tags)
        - Choose AND/OR logic for tag matching
        - Supports pagination and sorting

        Examples:
        - /api/events/search?location=hanoi (events in Hanoi)
        - /api/events/search?location=hanoi&tags=OUTDOOR (outdoor events in Hanoi)
        - /api/events/search?tags=OUTDOOR,VIRTUAL (events with OUTDOOR OR VIRTUAL)
        - /api/events/search?tags=OUTDOOR,FAMILY_FRIENDLY&matchAllTags=true (events with BOTH tags)
        - /api/events/search?q=volunteer&location=community%20center&tags=COMMUNITY_SERVICE&upcoming=true&page=0&size=10
        """
    )
    @GetMapping("/search")
    fun searchEvents(
        @Parameter(description = "Search text (max 100 characters)")
        @RequestParam(required = false)
        q: String?,
        @Parameter(description = "Only return upcoming events")
        @RequestParam(defaultValue = "false")
        upcoming: Boolean,
        @Parameter(
            description =
                "Filter by location (case-insensitive partial match). Example: hanoi, community center"
        )
        @RequestParam(required = false)
        location: String?,
        @Parameter(
            description =
                "Filter by tags (comma-separated). Example: OUTDOOR,FAMILY_FRIENDLY,VIRTUAL"
        )
        @RequestParam(required = false)
        tags: List<String>?,
        @Parameter(
            description =
                "If true, events must have ALL specified tags (AND logic). If false, events can have ANY tag (OR logic)"
        )
        @RequestParam(defaultValue = "false")
        matchAllTags: Boolean,
        @Parameter(description = "Page number (0-based)")
        @RequestParam(defaultValue = "0")
        page: Int,
        @Parameter(description = "Page size") @RequestParam(defaultValue = "20") size: Int,
        @Parameter(description = "Sort field")
        @RequestParam(defaultValue = "eventDateTime")
        sort: String,
        @Parameter(description = "Sort direction (asc or desc)")
        @RequestParam(defaultValue = "asc")
        direction: String
    ): ResponseEntity<PageEventResponse> {
        if (q != null) {
            val trimmed = q.trim()
            if (trimmed.length > 100) {
                return ResponseEntity.badRequest().build()
            }
        }

        if (location != null && location.trim().length > 200) {
            return ResponseEntity.badRequest().build()
        }

        val eventTags =
            tags
                ?.mapNotNull { tagStr ->
                    try {
                        EventTag.valueOf(tagStr.trim().uppercase())
                    } catch (_: IllegalArgumentException) {
                        logger.warn("Invalid tag provided: $tagStr")
                        null
                    }
                }
                ?.toSet()

        val pageable =
            PageRequest.of(page, size, Sort.Direction.fromString(direction.uppercase()), sort)

        val events =
            eventSearchService.searchApprovedEvents(
                searchText = q?.trim()?.takeIf { it.isNotEmpty() },
                onlyUpcoming = upcoming,
                location = location?.trim()?.takeIf { it.isNotEmpty() },
                tags = eventTags,
                matchAllTags = matchAllTags,
                pageable = pageable
            )

        return ResponseEntity.ok(PageEventResponse.from(events))
    }

    @Operation(
        summary = "Get my events",
        description =
            "Get all events created by the current user (requires EVENT_ORGANIZER role). Returns non-cancelled events with pagination and sorting."
    )
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/my-events")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    fun getMyEvents(
        @Parameter(description = "Page number (0-based)")
        @RequestParam(defaultValue = "0")
        page: Int,
        @Parameter(description = "Page size") @RequestParam(defaultValue = "20") size: Int,
        @Parameter(description = "Sort field")
        @RequestParam(defaultValue = "createdAt")
        sort: String,
        @Parameter(description = "Sort direction (asc or desc)")
        @RequestParam(defaultValue = "desc")
        direction: String,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<PageEventResponse> {
        val pageable =
            PageRequest.of(page, size, Sort.Direction.fromString(direction.uppercase()), sort)
        val events = eventService.getEventsByCreator(currentUser.username, pageable)
        return ResponseEntity.ok(PageEventResponse.from(events))
    }

    @Operation(
        summary = "Get event by ID",
        description = "Retrieve detailed information about a specific event"
    )
    @GetMapping("/{id}")
    fun getEventById(
        @Parameter(description = "Event ID", required = true) @PathVariable id: Long
    ): ResponseEntity<EventResponse> {
        val event = eventService.getEventById(id)
        return ResponseEntity.ok(event)
    }

    @Operation(
        summary = "Create event",
        description =
            "Create a new event (requires EVENT_ORGANIZER role). Event will be pending admin approval. Supports image uploads."
    )
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    fun createEvent(
        @Parameter(description = "Event details in JSON format")
        @RequestPart("request")
        @Valid
        request: CreateEventRequest,
        @Parameter(description = "Optional event images")
        @RequestPart("files", required = false)
        files: List<MultipartFile>?,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<EventResponse> {
        val event = eventService.createEvent(request, currentUser.username, files)
        return ResponseEntity.status(HttpStatus.CREATED).body(event)
    }

    @Operation(
        summary = "Create event (Form-friendly)",
        description =
            """Create a new event using form parameters (requires EVENT_ORGANIZER role). 
        This endpoint is more compatible with Swagger UI and form submissions. 
        Event will be pending admin approval. Supports image uploads.
        
        For tags, use comma-separated values like: OUTDOOR,FAMILY_FRIENDLY,COMMUNITY_SERVICE"""
    )
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/form", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    fun createEventForm(
        @Parameter(description = "Event title", required = true) @RequestParam title: String,
        @Parameter(description = "Event description", required = true)
        @RequestParam
        description: String,
        @Parameter(description = "Event location", required = true)
        @RequestParam
        location: String,
        @Parameter(
            description = "Event date and time (format: yyyy-MM-dd'T'HH:mm:ss)",
            required = true
        )
        @RequestParam
        eventDateTime: String,
        @Parameter(
            description = "Event end date and time (format: yyyy-MM-dd'T'HH:mm:ss)",
            required = true
        )
        @RequestParam
        endDateTime: String,
        @Parameter(description = "Registration deadline (format: yyyy-MM-dd'T'HH:mm:ss)")
        @RequestParam(required = false)
        registrationDeadline: String?,
        @Parameter(description = "Maximum participants (null = unlimited)")
        @RequestParam(required = false)
        maxParticipants: Int?,
        @Parameter(description = "Enable waitlist when full")
        @RequestParam(defaultValue = "true")
        waitlistEnabled: Boolean,
        @Parameter(
            description = "Event tags (comma-separated). Example: OUTDOOR,FAMILY_FRIENDLY"
        )
        @RequestParam(required = false)
        tags: String?,
        @Parameter(description = "Optional event images")
        @RequestPart("files", required = false)
        files: List<MultipartFile>?,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<EventResponse> {
        val eventDateTimeParsed =
            try {
                LocalDateTime.parse(eventDateTime)
            } catch (_: Exception) {
                throw IllegalArgumentException(
                    "Invalid eventDateTime format. Use yyyy-MM-dd'T'HH:mm:ss"
                )
            }

        val endDateTimeParsed =
            try {
                LocalDateTime.parse(endDateTime)
            } catch (_: Exception) {
                throw IllegalArgumentException(
                    "Invalid endDateTime format. Use yyyy-MM-dd'T'HH:mm:ss"
                )
            }

        val registrationDeadlineParsed =
            registrationDeadline?.let {
                try {
                    LocalDateTime.parse(it)
                } catch (_: Exception) {
                    throw IllegalArgumentException(
                        "Invalid registrationDeadline format. Use yyyy-MM-dd'T'HH:mm:ss"
                    )
                }
            }

        val eventTags =
            tags?.split(",")
                ?.mapNotNull { tagStr ->
                    try {
                        EventTag.valueOf(tagStr.trim().uppercase())
                    } catch (_: IllegalArgumentException) {
                        logger.warn("Invalid tag provided: $tagStr")
                        null
                    }
                }
                ?.toSet()

        val request =
            CreateEventRequest(
                title = title.trim(),
                description = description.trim(),
                location = location.trim(),
                eventDateTime = eventDateTimeParsed,
                endDateTime = endDateTimeParsed,
                registrationDeadline = registrationDeadlineParsed,
                maxParticipants = maxParticipants,
                waitlistEnabled = waitlistEnabled,
                tags = eventTags
            )

        val event = eventService.createEvent(request, currentUser.username, files)
        return ResponseEntity.status(HttpStatus.CREATED).body(event)
    }

    @Operation(
        summary = "Update event",
        description =
            "Update an existing event (requires EVENT_ORGANIZER role and must be event creator). All fields are optional. Supports image uploads."
    )
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{id}", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    fun updateEvent(
        @Parameter(description = "Event ID", required = true) @PathVariable id: Long,
        @Parameter(description = "Event details in JSON format")
        @RequestPart("request")
        @Valid
        request: UpdateEventRequest,
        @Parameter(description = "Optional event images")
        @RequestPart("files", required = false)
        files: List<MultipartFile>?,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<EventResponse> {
        logger.info("Event ID: $id, User: ${currentUser.username}")
        logger.info("User authorities: ${currentUser.authorities.map { it.authority }}")

        val updatedEvent = eventService.updateEvent(id, request, currentUser.username, files)
        return ResponseEntity.ok(updatedEvent)
    }

    @Operation(
        summary = "Delete event",
        description =
            "Delete an event (requires EVENT_ORGANIZER role and must be event creator)"
    )
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    fun deleteEvent(
        @PathVariable id: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Unit> {
        logger.info("Event ID: $id, User: ${currentUser.username}")
        logger.info("User authorities: ${currentUser.authorities.map { it.authority }}")

        eventService.deleteEvent(id, currentUser.username)
        return ResponseEntity.noContent().build()
    }

    @Operation(
        summary = "Cancel event",
        description =
            "Cancel an event with a reason (requires EVENT_ORGANIZER role and must be event creator). Cancellation reason is required if event has registered participants."
    )
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    fun cancelEvent(
        @Parameter(description = "Event ID", required = true) @PathVariable id: Long,
        @Parameter(description = "Cancellation reason")
        @RequestParam(required = false)
        reason: String?,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<EventResponse> {
        logger.info("Event ID: $id, User: ${currentUser.username}, Reason: $reason")

        val cancelledEvent = eventService.cancelEvent(id, reason, currentUser.username)
        return ResponseEntity.ok(cancelledEvent)
    }
}
