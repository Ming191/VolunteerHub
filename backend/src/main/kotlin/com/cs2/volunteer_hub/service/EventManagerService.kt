package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.exception.UnauthorizedAccessException
import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import org.apache.coyote.BadRequestException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class EventManagerService(
    private val registrationRepository: RegistrationRepository,
    private val eventRepository: EventRepository
) {
    // Hàm helper để kiểm tra Event Manager có sở hữu sự kiện không
    private fun checkEventOwnership(eventId: Long, managerEmail: String) {
        val event = eventRepository.findById(eventId)
            .orElseThrow { ResourceNotFoundException("Event", "id", eventId) }
        if (event.creator.email != managerEmail) {
            throw UnauthorizedAccessException("Bạn không có quyền quản lý sự kiện này.")
        }
    }

    @Transactional(readOnly = true)
    fun getRegistrationsForEvent(eventId: Long, managerEmail: String): List<RegistrationResponse> {
        checkEventOwnership(eventId, managerEmail)
        return registrationRepository.findAllByEventId(eventId).map(this::mapToRegistrationResponse)
    }

    @Transactional
    fun updateRegistrationStatus(
        registrationId: Long,
        newStatus: RegistrationStatus,
        managerEmail: String
    ): RegistrationResponse {
        val registration = registrationRepository.findById(registrationId)
            .orElseThrow { ResourceNotFoundException("Đăng ký", "id", registrationId) }

        // Kiểm tra quyền sở hữu gián tiếp qua sự kiện
        checkEventOwnership(registration.event.id, managerEmail)

        // Logic nghiệp vụ: không cho phép đổi status tùy tiện
        if (newStatus !in listOf(RegistrationStatus.APPROVED, RegistrationStatus.REJECTED)) {
            throw BadRequestException("Trạng thái không hợp lệ.")
        }

        registration.status = newStatus
        val savedRegistration = registrationRepository.save(registration)
        return mapToRegistrationResponse(savedRegistration)
    }

    private fun mapToRegistrationResponse(registration: Registration): RegistrationResponse {
        return RegistrationResponse(
            id = registration.id,
            eventId = registration.event.id,
            eventTitle = registration.event.title,
            volunteerId = registration.user.id,
            volunteerName = registration.user.username,
            status = registration.status,
            registeredAt = registration.registeredAt
        )
    }
}