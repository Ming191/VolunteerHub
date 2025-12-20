package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.ChangePasswordRequest
import com.cs2.volunteer_hub.dto.ProfilePictureUploadMessage
import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.dto.UpdateProfileRequest
import com.cs2.volunteer_hub.dto.UserResponse
import com.cs2.volunteer_hub.mapper.RegistrationMapper
import com.cs2.volunteer_hub.mapper.UserMapper
import com.cs2.volunteer_hub.model.FcmToken
import com.cs2.volunteer_hub.repository.FcmTokenRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.findByEmailOrThrow
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
class MeService(
    private val registrationRepository: RegistrationRepository,
    private val registrationMapper: RegistrationMapper,
    private val fcmTokenRepository: FcmTokenRepository,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val rabbitTemplate: RabbitTemplate,
    private val tempFileService: TemporaryFileStorageService,
    private val fileValidationService: FileValidationService,
    private val userMapper: UserMapper,
    private val cacheEvictionService: CacheEvictionService
) {
    private val logger = LoggerFactory.getLogger(MeService::class.java)

    @Cacheable(value = ["userRegistrations"], key = "#userEmail")
    @Transactional(readOnly = true)
    fun getMyRegistrations(userEmail: String, pageable: Pageable): Page<RegistrationResponse> {
        // Get registration IDs first for pagination
        val user = userRepository.findByEmailOrThrow(userEmail)
        val spec = com.cs2.volunteer_hub.specification.RegistrationSpecifications.byUser(user.id)
        val page = registrationRepository.findAll(spec, pageable)
        
        if (page.isEmpty) {
            return Page.empty(pageable)
        }
        
        // Load with associations
        val registrationIds = page.content.map { it.id }
        val registrationsWithAssociations = registrationRepository.findByIdsWithAssociations(registrationIds)
        
        // Maintain order
        val registrationMap = registrationsWithAssociations.associateBy { it.id }
        val orderedRegistrations = registrationIds.mapNotNull { registrationMap[it] }
        
        return org.springframework.data.domain.PageImpl(
            orderedRegistrations.map(registrationMapper::toRegistrationResponse),
            pageable,
            page.totalElements
        )
    }

    @Transactional
    fun saveFcmToken(token: String, userEmail: String) {
        val existingToken = fcmTokenRepository.findByToken(token)
        if (existingToken != null && existingToken.user.email != userEmail) {
            fcmTokenRepository.delete(existingToken)
        }

        val user = userRepository.findByEmailOrThrow(userEmail)
        val userTokens = fcmTokenRepository.findAllByUserId(user.id)
        if (userTokens.none { it.token == token }) {
            val newFcmToken = FcmToken(token = token, user = user)
            fcmTokenRepository.save(newFcmToken)
        }
    }

    @Transactional
    fun deleteFcmTokensForUser(userEmail: String) {
        val user = userRepository.findByEmailOrThrow(userEmail)
        fcmTokenRepository.deleteAllByUserId(user.id)
        logger.info("Deleted all FCM tokens for user: ${user.id}")
    }

    fun getMyProfile(userEmail: String): UserResponse {
        val user = userRepository.findByEmailOrThrow(userEmail)
        return userMapper.toUserResponse(user)
    }

    @Transactional
    @CacheEvict(value = ["userRegistrations"], key = "#userEmail")
    fun updateProfile(userEmail: String, request: UpdateProfileRequest): UserResponse {
        val user = userRepository.findByEmailOrThrow(userEmail)

        request.name?.let { user.name = it }
        request.phoneNumber?.let { user.phoneNumber = it }
        request.bio?.let { user.bio = it }
        request.location?.let { user.location = it }
        request.dateOfBirth?.let { user.dateOfBirth = it }
        request.skills?.let {
            user.skills.clear()
            user.skills.addAll(it)
        }
        request.interests?.let {
            user.interests.clear()
            user.interests.addAll(it)
        }

        val updatedUser = userRepository.save(user)

        // Evict public profile cache using user ID
        cacheEvictionService.evictPublicUserProfile(updatedUser.id)

        return userMapper.toUserResponse(updatedUser)
    }

    @Transactional
    fun changePassword(userEmail: String, request: ChangePasswordRequest) {
        val user = userRepository.findByEmailOrThrow(userEmail)
        if (!passwordEncoder.matches(request.currentPassword, user.passwordHash)) {
            throw IllegalArgumentException("Current password is incorrect")
        }
        user.passwordHash = passwordEncoder.encode(request.newPassword)
        userRepository.save(user)
    }

    @Transactional
    fun uploadProfilePicture(userEmail: String, file: MultipartFile): UserResponse {
        val user = userRepository.findByEmailOrThrow(userEmail)
        fileValidationService.validateFiles(listOf(file), 1)
        val tempFilePath = tempFileService.save(file)
        logger.info("Saved profile picture to temporary storage: $tempFilePath for User ID: ${user.id}")
        val message = ProfilePictureUploadMessage(
            userId = user.id,
            temporaryFilePath = tempFilePath,
            contentType = file.contentType ?: "image/jpeg",
            originalFileName = file.originalFilename ?: "profile-picture.jpg",
            retryCount = 0
        )
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.EXCHANGE_NAME,
            RabbitMQConfig.PROFILE_PICTURE_UPLOAD_ROUTING_KEY,
            message
        )
        logger.info("Queued profile picture upload for User ID: ${user.id}")
        return userMapper.toUserResponse(user)
    }
}
