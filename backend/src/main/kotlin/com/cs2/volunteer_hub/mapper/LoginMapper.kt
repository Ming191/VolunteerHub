package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.LoginResponse
import com.cs2.volunteer_hub.dto.RegisterResponse
import com.cs2.volunteer_hub.dto.TokenResponse
import com.cs2.volunteer_hub.model.User
import org.springframework.stereotype.Component

@Component
class LoginMapper {

    /**
     * Map User entity and TokenResponse to LoginResponse DTO
     */
    fun toLoginResponse(user: User, tokenResponse: TokenResponse): LoginResponse {
        return LoginResponse(
            userId = user.id,
            email = user.email,
            name = user.name,
            role = user.role,
            isEmailVerified = user.isEmailVerified,
            accessToken = tokenResponse.accessToken,
            refreshToken = tokenResponse.refreshToken,
            accessTokenExpiresIn = tokenResponse.accessTokenExpiresIn,
            refreshTokenExpiresIn = tokenResponse.refreshTokenExpiresIn,
            tokenType = tokenResponse.tokenType
        )
    }
}

@Component
class RegisterMapper {

    /**
     * Map User entity to RegisterResponse DTO
     */
    fun toRegisterResponse(user: User, message: String = "Registration successful. Please check your email to verify your account."): RegisterResponse {
        return RegisterResponse(
            userId = user.id,
            email = user.email,
            name = user.name,
            role = user.role,
            message = message
        )
    }
}