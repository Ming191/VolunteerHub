package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.Registration
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository

@Repository
interface RegistrationRepository : JpaRepository<Registration, Long>, JpaSpecificationExecutor<Registration> {
    fun findAllByUserEmailOrderByEventEventDateTimeDesc(email: String): List<Registration>
}