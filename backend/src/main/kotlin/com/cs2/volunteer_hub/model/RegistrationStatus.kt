package com.cs2.volunteer_hub.model

enum class RegistrationStatus {
    PENDING,      // Waiting for organizer approval
    APPROVED,     // Confirmed participant with a spot
    REJECTED,     // Denied by organizer
    CANCELLED,    // User cancelled their registration
    COMPLETED,    // Event finished, user attended
    WAITLISTED    // On waitlist, waiting for an open spot
}