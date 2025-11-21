package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.Registration
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface RegistrationRepository : JpaRepository<Registration, Long>, JpaSpecificationExecutor<Registration> {
    
    /**
     * Find registrations with eager loading of user and event associations
     */
    @Query("""
        SELECT DISTINCT r FROM Registration r 
        JOIN FETCH r.user 
        JOIN FETCH r.event 
        WHERE r.user.email = :email 
        ORDER BY r.event.eventDateTime DESC
    """)
    fun findAllByUserEmailOrderByEventEventDateTimeDesc(@Param("email") email: String): List<Registration>
    
    /**
     * Find all registrations matching specification with eager loading
     */
    @Query("""
        SELECT DISTINCT r FROM Registration r 
        JOIN FETCH r.user 
        JOIN FETCH r.event 
        WHERE r.event.id = :eventId
    """)
    fun findAllByEventIdWithAssociations(@Param("eventId") eventId: Long): List<Registration>
    
    /**
     * Find registrations by event and status with eager loading
     */
    @Query("""
        SELECT DISTINCT r FROM Registration r 
        JOIN FETCH r.user 
        JOIN FETCH r.event 
        WHERE r.event.id = :eventId AND r.status = :status
    """)
    fun findAllByEventIdAndStatusWithAssociations(
        @Param("eventId") eventId: Long,
        @Param("status") status: com.cs2.volunteer_hub.model.RegistrationStatus
    ): List<Registration>
    
    /**
     * Find registrations by creator user ID and status with eager loading
     */
    @Query("""
        SELECT DISTINCT r FROM Registration r 
        JOIN FETCH r.user 
        JOIN FETCH r.event e
        WHERE e.creator.id = :creatorId AND r.status = :status
    """)
    fun findAllByEventCreatorIdAndStatusWithAssociations(
        @Param("creatorId") creatorId: Long,
        @Param("status") status: com.cs2.volunteer_hub.model.RegistrationStatus
    ): List<Registration>
    
    /**
     * Find active registrations (APPROVED or WAITLISTED) for an event with eager loading
     */
    @Query("""
        SELECT DISTINCT r FROM Registration r 
        JOIN FETCH r.user 
        JOIN FETCH r.event 
        WHERE r.event.id = :eventId 
        AND r.status IN ('APPROVED', 'WAITLISTED')
    """)
    fun findActiveRegistrationsByEventIdWithAssociations(@Param("eventId") eventId: Long): List<Registration>
    
    /**
     * Find completed registrations for an event with eager loading
     */
    @Query("""
        SELECT DISTINCT r FROM Registration r 
        JOIN FETCH r.user 
        JOIN FETCH r.event 
        WHERE r.event.id = :eventId AND r.status = 'COMPLETED'
    """)
    fun findCompletedRegistrationsByEventIdWithAssociations(@Param("eventId") eventId: Long): List<Registration>
    
    /**
     * Find completed registrations by creator with eager loading
     */
    @Query("""
        SELECT DISTINCT r FROM Registration r 
        JOIN FETCH r.user 
        JOIN FETCH r.event e
        WHERE e.creator.id = :creatorId AND r.status = 'COMPLETED'
    """)
    fun findCompletedRegistrationsByCreatorIdWithAssociations(@Param("creatorId") creatorId: Long): List<Registration>
    
    /**
     * Find waitlisted registrations for an event with eager loading, ordered by position
     */
    @Query("""
        SELECT DISTINCT r FROM Registration r 
        JOIN FETCH r.user 
        JOIN FETCH r.event 
        WHERE r.event.id = :eventId AND r.status = 'WAITLISTED'
        ORDER BY r.waitlistPosition ASC
    """)
    fun findWaitlistedRegistrationsByEventIdWithAssociations(@Param("eventId") eventId: Long): List<Registration>
}