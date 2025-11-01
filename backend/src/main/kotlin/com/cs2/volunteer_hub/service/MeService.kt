package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.model.FcmToken
import com.cs2.volunteer_hub.repository.FcmTokenRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.stream.Collectors

@Service
class MeService(
    private val registrationRepository: RegistrationRepository,
    private val eventManagerService: EventManagerService,
    private val fcmTokenRepository: FcmTokenRepository,
    private val userRepository: UserRepository,
) {
    @Cacheable(value = ["userRegistrations"], key = "#userEmail")
    fun getMyRegistrations(userEmail: String): List<RegistrationResponse> {
        return registrationRepository.findAllByUserEmailOrderByEventEventDateTimeDesc(userEmail)
            .stream()
            .map(eventManagerService::mapToRegistrationResponse)
            .collect(Collectors.toList())
    }

    @Transactional
    fun saveFcmToken(token: String, userEmail: String) {
        val existingToken = fcmTokenRepository.findByToken(token)
        if (existingToken != null && existingToken.user.email != userEmail) {
            fcmTokenRepository.delete(existingToken)
        }

        val user = userRepository.findByEmail(userEmail)!!
        val userTokens = fcmTokenRepository.findAllByUserId(user.id)
        if (userTokens.none { it.token == token }) {
            val newFcmToken = FcmToken(token = token, user = user)
            fcmTokenRepository.save(newFcmToken)
        }
    }
}