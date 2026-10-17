package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.PublicUserResponse
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.repository.UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserService(
    private val userRepository: UserRepository,
    private val privacy: ProfilePrivacyService
) {
    /**
     * Always resolve authorization and visibility for the current request. NEVER cache this
     * response by target user ID: privileged/owner results must not leak to another caller.
     */
    @Transactional(readOnly = true)
    fun getPublicUserProfile(id: Long): PublicUserResponse {
        val user = userRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("User", "id", id) }
        if (user.isDeleted) {
            throw ResourceNotFoundException("User", "id", id)
        }

        val authentication = SecurityContextHolder.getContext().authentication
        val viewer = authentication?.takeIf { it.isAuthenticated && it.name != "anonymousUser" }
            ?.name?.let(userRepository::findByEmail)
        val privileged = viewer != null && !viewer.isDeleted &&
            (viewer.id == id || viewer.role == Role.ADMIN)
        val isPrivate = privacy.isPrivate(user)

        return PublicUserResponse(
            id = user.id,
            name = user.name,
            // Lock detailed profile fields, not the public identity/avatar used in the community.
            profilePictureUrl = user.profilePictureUrl,
            bio = if (isPrivate && !privileged) null else user.bio,
            isPrivate = isPrivate
        )
    }
}
