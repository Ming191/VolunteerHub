package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.repository.RegistrationRepository
import org.springframework.stereotype.Service
import java.util.stream.Collectors

@Service
class MeService(
    private val registrationRepository: RegistrationRepository,
    private val eventManagerService: EventManagerService
) {
    fun getMyRegistrations(userEmail: String): List<RegistrationResponse> {
        return registrationRepository.findAllByUserEmailOrderByEventEventDateTimeDesc(userEmail)
            .stream()
            .map(eventManagerService::mapToRegistrationResponse)
            .collect(Collectors.toList())
    }
}