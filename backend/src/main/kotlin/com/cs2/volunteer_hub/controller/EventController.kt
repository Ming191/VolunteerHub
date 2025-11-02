package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.CreateEventRequest
import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.UpdateEventRequest
import com.cs2.volunteer_hub.model.EventCategory
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.service.EventSearchService
import com.cs2.volunteer_hub.service.EventService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
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
import org.springframework.web.bind.annotation.RequestBody
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

    @Operation(summary = "Get all approved events", description = "Retrieve all events that have been approved by admin. Supports pagination.")
    @GetMapping
    fun getAllEvents(
        @Parameter(description = "Page number (0-based)")
        @RequestParam(defaultValue = "0") page: Int,
        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") size: Int,
        @Parameter(description = "Sort field")
        @RequestParam(defaultValue = "eventDateTime") sort: String,
        @Parameter(description = "Sort direction (asc or desc)")
        @RequestParam(defaultValue = "asc") direction: String
    ): ResponseEntity<Page<EventResponse>> {
        val pageable = PageRequest.of(
            page,
            size,
            Sort.Direction.fromString(direction.uppercase()),
            sort
        )
        val events = eventService.getAllApprovedEvents(pageable)
        return ResponseEntity.ok(events)
    }

    /**
     * Search events by text (title, description, or location)
     * Example: GET /api/events/search?q=volunteer&upcoming=true
     */
    @Operation(
        summary = "Search events",
        description = "Search approved events with optional filters. Can search by text (title, description, location) and filter for upcoming events only."
    )
    @GetMapping("/search")
    fun searchEvents(
        @Parameter(description = "Search text (max 100 characters)")
        @RequestParam(required = false) q: String?,
        @Parameter(description = "Only return upcoming events")
        @RequestParam(defaultValue = "false") upcoming: Boolean
    ): ResponseEntity<List<EventResponse>> {
        if (q != null) {
            val trimmed = q.trim()
            if (trimmed.length > 100) {
                return ResponseEntity.badRequest().build()
            }
            if (trimmed.isEmpty()) {
                val events = if (upcoming) {
                    eventSearchService.searchApprovedEvents(onlyUpcoming = true)
                } else {
                    eventService.getAllApprovedEvents()
                }
                return ResponseEntity.ok(events)
            }
        }
        val events = eventSearchService.searchApprovedEvents(searchText = q, onlyUpcoming = upcoming)
        return ResponseEntity.ok(events)
    }

    /**
     * Advanced search with multiple filters
     * Example: GET /api/events/advanced-search?category=ENVIRONMENTAL&upcoming=true&availableSlots=true
     */
    @Operation(
        summary = "Advanced event search",
        description = "Search events with multiple filters: category, status, text search, upcoming only, and availability."
    )
    @GetMapping("/advanced-search")
    fun advancedSearch(
        @Parameter(description = "Search text in title, description, or location")
        @RequestParam(required = false) q: String?,
        @Parameter(description = "Filter by category")
        @RequestParam(required = false) category: EventCategory?,
        @Parameter(description = "Filter by status (defaults to APPROVED)")
        @RequestParam(required = false) status: EventStatus?,
        @Parameter(description = "Only return upcoming events")
        @RequestParam(defaultValue = "false") upcoming: Boolean,
        @Parameter(description = "Only return events with available volunteer slots")
        @RequestParam(defaultValue = "false") availableSlots: Boolean
    ): ResponseEntity<List<EventResponse>> {
        val events = eventSearchService.searchEvents(
            searchText = q,
            category = category,
            status = status,
            onlyUpcoming = upcoming,
            onlyWithAvailableSlots = availableSlots
        )
        return ResponseEntity.ok(events)
    }

    /**
     * Get events by category
     * Example: GET /api/events/category/ENVIRONMENTAL
     */
    @Operation(
        summary = "Get events by category",
        description = "Retrieve all events in a specific category (e.g., ENVIRONMENTAL, EDUCATION, HEALTHCARE)."
    )
    @GetMapping("/category/{category}")
    fun getEventsByCategory(
        @Parameter(description = "Event category", required = true)
        @PathVariable category: EventCategory
    ): ResponseEntity<List<EventResponse>> {
        val events = eventSearchService.findEventsByCategory(category)
        return ResponseEntity.ok(events)
    }

    /**
     * Get events with available volunteer slots
     * Example: GET /api/events/available
     */
    @Operation(
        summary = "Get events with available slots",
        description = "Retrieve events that still have volunteer slots available. Uses efficient database-level capacity checking."
    )
    @GetMapping("/available")
    fun getEventsWithAvailableSlots(
        @Parameter(description = "Only return upcoming events")
        @RequestParam(defaultValue = "true") upcoming: Boolean
    ): ResponseEntity<List<EventResponse>> {
        val events = eventSearchService.findEventsWithAvailableSlots(upcoming)
        return ResponseEntity.ok(events)
    }

    /**
     * Get events that urgently need volunteers
     * Example: GET /api/events/needing-volunteers
     */
    @Operation(
        summary = "Get events needing volunteers",
        description = "Retrieve upcoming events that are below their minimum volunteer requirement and need more registrations."
    )
    @GetMapping("/needing-volunteers")
    fun getEventsNeedingVolunteers(): ResponseEntity<List<EventResponse>> {
        val events = eventSearchService.findEventsNeedingVolunteers()
        return ResponseEntity.ok(events)
    }

    @Operation(summary = "Get event by ID", description = "Retrieve detailed information about a specific event")
    @GetMapping("/{id}")
    fun getEventById(
        @Parameter(description = "Event ID", required = true)
        @PathVariable id: Long
    ): ResponseEntity<EventResponse> {
        val event = eventService.getEventById(id)
        return ResponseEntity.ok(event)
    }

    @Operation(
        summary = "Create event",
        description = "Create a new event (requires EVENT_ORGANIZER role). Event will be pending admin approval. Supports image uploads."
    )
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    fun createEvent(
        @Parameter(description = "Event details in JSON format")
        @RequestPart("request") @Valid request: CreateEventRequest,
        @Parameter(description = "Optional event images")
        @RequestPart("files", required = false) files: List<MultipartFile>?,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<EventResponse> {

        val event = eventService.createEvent(request, currentUser.username, files)
        return ResponseEntity.status(HttpStatus.CREATED).body(event)
    }

    @Operation(
        summary = "Update event",
        description = "Update an existing event (requires EVENT_ORGANIZER role and must be event creator). All fields are optional."
    )
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    fun updateEvent(
        @Parameter(description = "Event ID", required = true)
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateEventRequest,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<EventResponse> {
        logger.info("=== UPDATE EVENT ENDPOINT CALLED ===")
        logger.info("Event ID: $id, User: ${currentUser.username}")
        logger.info("User authorities: ${currentUser.authorities.map { it.authority }}")

        val updatedEvent = eventService.updateEvent(id, request, currentUser.username)
        return ResponseEntity.ok(updatedEvent)
    }

    @Operation(
        summary = "Delete event",
        description = "Delete an event (requires EVENT_ORGANIZER role and must be event creator)"
    )
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    fun deleteEvent(
        @PathVariable id: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Unit> {
        logger.info("=== DELETE EVENT ENDPOINT CALLED ===")
        logger.info("Event ID: $id, User: ${currentUser.username}")
        logger.info("User authorities: ${currentUser.authorities.map { it.authority }}")

        eventService.deleteEvent(id, currentUser.username)
        return ResponseEntity.noContent().build()
    }
}