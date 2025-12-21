package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.PublicUserResponse
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.model.ProfileVisibility
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.UserSettingsRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserService(
    private val userRepository: UserRepository,
    private val userSettingsRepository: UserSettingsRepository
) {

    @Cacheable(value = ["publicUserProfiles"], key = "#id")
    @Transactional(readOnly = true)
    fun getPublicUserProfile(id: Long): PublicUserResponse {
        val user = userRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("User", "id", id) }

        // Check if profile is private
        val settings = userSettingsRepository.findById(id).orElse(null)
        val isPrivate = settings?.profileVisibility == ProfileVisibility.PRIVATE

        // Get current user to check permissions
        val currentUserEmail = try {
            SecurityContextHolder.getContext().authentication?.name
        } catch (e: Exception) {
            null
        }
        val currentUser = currentUserEmail?.let { email -> 
            userRepository.findByEmail(email)
        }
        val canViewFullProfile = currentUser?.id == id || currentUser?.role == Role.ADMIN

        // Return limited info for private profiles
        return if (isPrivate && !canViewFullProfile) {
            PublicUserResponse(
                id = user.id,
                name = user.name,
                profilePictureUrl = null,
                bio = null,
                isPrivate = true
            )
        } else {
            PublicUserResponse(
                id = user.id,
                name = user.name,
                profilePictureUrl = user.profilePictureUrl,
                bio = user.bio,
                isPrivate = isPrivate
            )
        }
    }
}
