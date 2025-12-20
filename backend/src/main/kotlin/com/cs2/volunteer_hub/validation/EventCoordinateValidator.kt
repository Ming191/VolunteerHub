package com.cs2.volunteer_hub.validation

import org.springframework.stereotype.Component

@Component
class EventCoordinateValidator {

    /**
     * Validate coordinates if present
     * - Latitude: -90 to 90
     * - Longitude: -180 to 180
     * - Must provide both or neither
     */
    fun validateCoordinates(latitude: Double?, longitude: Double?) {
        if (latitude == null && longitude == null) {
            return
        }

        if (latitude == null || longitude == null) {
            throw IllegalArgumentException(
                    "Both latitude and longitude must be provided if coordinates are used"
            )
        }

        if (latitude < -90 || latitude > 90) {
            throw IllegalArgumentException("Latitude must be between -90 and 90")
        }

        if (longitude < -180 || longitude > 180) {
            throw IllegalArgumentException("Longitude must be between -180 and 180")
        }
    }

    /**
     * Validate coordinates for update Resolves final coordinates based on current and new values
     */
    fun validateCoordinatesForUpdate(
            newLatitude: Double?,
            currentLatitude: Double?,
            newLongitude: Double?,
            currentLongitude: Double?
    ) {

        val finalLat = newLatitude ?: currentLatitude
        val finalLong = newLongitude ?: currentLongitude

        validateCoordinates(finalLat, finalLong)
    }
}
