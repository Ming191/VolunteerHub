package com.cs2.volunteer_hub.specification

import com.cs2.volunteer_hub.model.Like
import com.cs2.volunteer_hub.model.Post
import com.cs2.volunteer_hub.model.User
import org.springframework.data.jpa.domain.Specification

object LikeSpecifications {

    fun byUser(userId: Long): Specification<Like> {
        return Specification { root, _, criteriaBuilder ->
            val userJoin = root.join<Like, User>("user")
            criteriaBuilder.equal(userJoin.get<Long>("id"), userId)
        }
    }

    fun forPost(postId: Long): Specification<Like> {
        return Specification { root, _, criteriaBuilder ->
            val postJoin = root.join<Like, Post>("post")
            criteriaBuilder.equal(postJoin.get<Long>("id"), postId)
        }
    }

    fun byUserAndPost(userId: Long, postId: Long): Specification<Like> {
        return byUser(userId).and(forPost(postId))
    }

    fun forPosts(postIds: List<Long>): Specification<Like> {
        return Specification { root, _, _ ->
            val postJoin = root.join<Like, Post>("post")
            postJoin.get<Long>("id").`in`(postIds)
        }
    }

    fun byUserForPosts(userId: Long, postIds: List<Long>): Specification<Like> {
        return byUser(userId).and(forPosts(postIds))
    }
}

