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
        val hidden = deleted ||
            settingsRepository.findById(user.id).orElse(null)?.profileVisibility != ProfileVisibility.PUBLIC
        return AuthorResponse(
            id = user.id,
            name = if (deleted) "Deleted user" else user.name,
            profilePictureUrl = if (hidden) null else user.profilePictureUrl,
            bio = if (hidden) null else user.bio
        )
    }
}
