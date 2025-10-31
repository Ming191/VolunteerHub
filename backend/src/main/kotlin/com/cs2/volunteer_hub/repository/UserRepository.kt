package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findByEmail(email: String): User?

    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    fun countUsersByRole(): List<Array<Any>>
}