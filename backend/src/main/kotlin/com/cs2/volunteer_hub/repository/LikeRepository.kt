package com.cs2.volunteer_hub.repository
import com.cs2.volunteer_hub.model.Like
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository

@Repository
interface LikeRepository : JpaRepository<Like, Long>, JpaSpecificationExecutor<Like>