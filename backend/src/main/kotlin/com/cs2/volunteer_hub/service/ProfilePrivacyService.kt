package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.AuthorResponse
import com.cs2.volunteer_hub.model.ProfileVisibility
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.UserSettingsRepository
import org.springframework.stereotype.Service

/**
 * Public projection policy shared by user profiles, posts, comments and attendee lists.
 * Read live visibility/deletion state when producing public DTOs, not a stale entity snapshot.
 */
@Service
class ProfilePrivacyService(
    private val settingsRepository: UserSettingsRepository,
    private val userRepository: UserRepository
) {
    fun isPrivate(user: User): Boolean {
        val deleted = userRepository.findDeletionStatus(user.id) != false
        return deleted ||
            settingsRepository.findById(user.id).orElse(null)?.profileVisibility != ProfileVisibility.PUBLIC
    }

    fun toPublicAuthor(user: User): AuthorResponse {
        val deleted = userRepository.findDeletionStatus(user.id) != false
        val locked = deleted ||
            settingsRepository.findById(user.id).orElse(null)?.profileVisibility != ProfileVisibility.PUBLIC
        // A locked PROFILE does not mean anonymous public participation. Names and avatars
        // remain visible on posts, comments and attendee lists; private bio stays hidden.
        return AuthorResponse(
            id = user.id,
            name = if (deleted) "Deleted user" else user.name,
            profilePictureUrl = if (deleted) null else user.profilePictureUrl,
            bio = if (locked) null else user.bio
        )
    }
}
