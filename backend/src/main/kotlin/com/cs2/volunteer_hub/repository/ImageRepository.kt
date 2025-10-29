package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.Image
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ImageRepository : JpaRepository<Image, Long>