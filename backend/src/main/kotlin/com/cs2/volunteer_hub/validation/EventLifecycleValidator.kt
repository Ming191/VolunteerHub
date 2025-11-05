package com.cs2.volunteer_hub.validation

import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.service.EventCapacityService
import org.springframework.stereotype.Component
import java.time.LocalDateTime

/**
 * Validator for event lifecycle state transitions and business rules
 * Ensures events can only change states according to business logic
 */
@Component
class EventLifecycleValidator(
    private val eventCapacityService: EventCapacityService
) {

    /**
     * Validate if status transition is allowed
     */
    fun validateStatusTransition(from: EventStatus, to: EventStatus, event: Event) {
        if (from == to) return // No transition

        when (to) {
            EventStatus.PUBLISHED -> {
                if (from == EventStatus.CANCELLED) {
                    throw BadRequestException("Cannot publish a cancelled event. Create a new event instead.")
                }
                if (from == EventStatus.COMPLETED) {
                    throw BadRequestException("Cannot publish a completed event.")
                }
                if (event.isPast()) {
                    throw BadRequestException("Cannot publish an event that has already ended.")
                }
            }
            EventStatus.CANCELLED -> {
                if (from == EventStatus.COMPLETED) {
                    throw BadRequestException("Cannot cancel a completed event.")
                }
            }
            EventStatus.COMPLETED -> {
                if (!event.isPast()) {
                    throw BadRequestException("Cannot mark event as completed. Event has not ended yet.")
                }
                if (from == EventStatus.CANCELLED) {
                    throw BadRequestException("Cannot mark cancelled event as completed.")
                }
            }
            EventStatus.PENDING -> {
                if (from == EventStatus.PUBLISHED || from == EventStatus.COMPLETED) {
                    throw BadRequestException("Cannot revert $from event back to pending status.")
                }
            }
            EventStatus.DRAFT -> {
                // DRAFT status transitions can be restricted based on your business logic
            }
        }
    }

    /**
     * Validate if event can be updated in its current state
     */
    fun validateUpdateAllowed(event: Event) {
        when (event.status) {
            EventStatus.COMPLETED -> {
                throw BadRequestException("Cannot update completed events.")
            }
            EventStatus.CANCELLED -> {
                throw BadRequestException("Cannot update cancelled events. Create a new event instead.")
            }
            else -> {
                // Updates allowed for DRAFT, PENDING, and PUBLISHED events
            }
        }
    }

    /**
     * Validate if event dates can be changed
     * Considers if event is in progress and has participants
     */
    fun validateDateChangeAllowed(event: Event, newEventDateTime: LocalDateTime?, newEndDateTime: LocalDateTime?) {
        if (newEventDateTime == null && newEndDateTime == null) return

        val approvedCount = eventCapacityService.getApprovedCount(event.id)

        if (event.isInProgress() && approvedCount > 0) {
            throw BadRequestException(
                "Cannot change dates for an in-progress event with $approvedCount registered participants. " +
                "Please cancel the event or wait until it ends."
            )
        }
    }

    /**
     * Validate if event deletion is allowed
     */
    fun validateDeletionAllowed(event: Event) {
        if (event.isInProgress()) {
            throw BadRequestException("Cannot delete an event that is currently in progress.")
        }

        val approvedCount = eventCapacityService.getApprovedCount(event.id)
        if (approvedCount > 0 && event.status == EventStatus.PUBLISHED) {
            throw BadRequestException(
                "Cannot delete a published event with $approvedCount approved registrations. " +
                "Please cancel the event first."
            )
        }
    }

    /**
     * Validate event cancellation
     */
    fun validateCancellationAllowed(event: Event, cancelReason: String?) {
        if (event.status == EventStatus.COMPLETED) {
            throw BadRequestException("Cannot cancel a completed event.")
        }

        if (event.status == EventStatus.CANCELLED) {
            throw BadRequestException("Event is already cancelled.")
        }

        if (cancelReason.isNullOrBlank()) {
            val approvedCount = eventCapacityService.getApprovedCount(event.id)
            if (approvedCount > 0) {
                throw BadRequestException(
                    "Cancellation reason is required when cancelling an event with registered participants."
                )
            }
        }
    }
}
