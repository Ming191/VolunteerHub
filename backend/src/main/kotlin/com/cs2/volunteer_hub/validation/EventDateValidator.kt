package com.cs2.volunteer_hub.validation

import com.cs2.volunteer_hub.exception.BadRequestException
import org.springframework.stereotype.Component
import java.time.LocalDateTime

/**
 * Validator for event date-related business rules
 * Eliminates duplicate date validation logic
 */
@Component
class EventDateValidator {

    /**
     * Validate event dates follow business rules:
     * 1. End time must be after start time
     * 2. Registration deadline must be before or at event start time
     */
    fun validateEventDates(
        startTime: LocalDateTime,
        endTime: LocalDateTime,
        deadline: LocalDateTime? = null
    ) {
        if (endTime.isBefore(startTime)) {
            throw BadRequestException("Event end time must be after start time")
        }

        val finalDeadline = deadline ?: startTime
        if (finalDeadline.isAfter(startTime)) {
            throw BadRequestException("Registration deadline must be before or at event start time")
        }
    }

    /**
     * Validate event dates for update operations
     * Handles optional fields by using current values as defaults
     */
    fun validateEventDatesForUpdate(
        newStartTime: LocalDateTime?,
        currentStartTime: LocalDateTime,
        newEndTime: LocalDateTime?,
        currentEndTime: LocalDateTime,
        newDeadline: LocalDateTime?,
        currentDeadline: LocalDateTime?
    ) {
        val finalStartTime = newStartTime ?: currentStartTime
        val finalEndTime = newEndTime ?: currentEndTime
        val finalDeadline = newDeadline ?: currentDeadline ?: finalStartTime

        validateEventDates(finalStartTime, finalEndTime, finalDeadline)
    }
}

