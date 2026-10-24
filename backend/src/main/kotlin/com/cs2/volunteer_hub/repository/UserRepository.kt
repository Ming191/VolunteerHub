package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    @Query("SELECT u.profilePictureUrl FROM User u WHERE u.profilePictureUrl IS NOT NULL")
    fun findReferencedProfilePictureUrls(): List<String>
    fun findByEmail(email: String): User?

    /** Scalar query avoids reading stale deletion state from an already-loaded User entity. */
    @Query("SELECT u.isDeleted FROM User u WHERE u.id = :userId")
    fun findDeletionStatus(@org.springframework.data.repository.query.Param("userId") userId: Long): Boolean?

    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    fun countUsersByRole(): List<Array<Any>>
}
