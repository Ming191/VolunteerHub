package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.model.Comment
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.Post
import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.model.Report
import com.cs2.volunteer_hub.model.User

/**
 * Extension functions for repositories to eliminate duplicate lookup patterns
 * Provides consistent error handling across the application
 */

/**
 * Find user by email or throw ResourceNotFoundException
 * Eliminates 20+ duplicate patterns across services
 */
fun UserRepository.findByEmailOrThrow(email: String): User {
    return findByEmail(email)
        ?: throw ResourceNotFoundException("User", "email", email)
}

/**
 * Find user by ID or throw ResourceNotFoundException
 */
fun UserRepository.findByIdOrThrow(id: Long): User {
    return findById(id).orElseThrow {
        ResourceNotFoundException("User", "id", id)
    }
}

/**
 * Find event by ID or throw ResourceNotFoundException
 * Eliminates 15+ duplicate patterns across services
 */
fun EventRepository.findByIdOrThrow(id: Long): Event {
    return findById(id).orElseThrow {
        ResourceNotFoundException("Event", "id", id)
    }
}

/**
 * Find post by ID or throw ResourceNotFoundException
 */
fun PostRepository.findByIdOrThrow(id: Long): Post {
    return findById(id).orElseThrow {
        ResourceNotFoundException("Post", "id", id)
    }
}

/**
 * Find registration by ID or throw ResourceNotFoundException
 */
fun RegistrationRepository.findByIdOrThrow(id: Long): Registration {
    return findById(id).orElseThrow {
        ResourceNotFoundException("Registration", "id", id)
    }
}

/**
 * Find comment by ID or throw ResourceNotFoundException
 */
fun CommentRepository.findByIdOrThrow(id: Long): Comment {
    return findById(id).orElseThrow {
        ResourceNotFoundException("Comment", "id", id)
    }
}

fun ReportRepository.findByIdOrThrow(id: Long): Report {
    return findById(id).orElseThrow {
        throw NoSuchElementException("Report with id $id not found")
    }
}