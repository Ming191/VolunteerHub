package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.PublicUserResponse
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserService(
    private val userRepository: UserRepository
) {

    @Transactional(readOnly = true)
    fun getPublicUserProfile(id: Long): PublicUserResponse {
        val user = userRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("User", "id", id) }

        return PublicUserResponse(
            id = user.id,
            name = user.name,
            profilePictureUrl = user.profilePictureUrl,
            bio = user.bio
        )
    }
}
