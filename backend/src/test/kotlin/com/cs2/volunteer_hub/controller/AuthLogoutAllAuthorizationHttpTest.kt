package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.config.SecurityConfig
import com.cs2.volunteer_hub.config.RefreshSessionCookies
import com.cs2.volunteer_hub.config.ratelimit.RateLimitingFilter
import com.cs2.volunteer_hub.config.ratelimit.RateLimitingInterceptor
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.FilterType
import org.springframework.security.oauth2.jwt.JwtDecoder
import com.cs2.volunteer_hub.mapper.LoginMapper
import com.cs2.volunteer_hub.mapper.RegisterMapper
import com.cs2.volunteer_hub.mapper.VerifyEmailMapper
import com.cs2.volunteer_hub.service.AuthService
import com.cs2.volunteer_hub.service.CustomUserDetailsService
import com.cs2.volunteer_hub.service.EmailQueueService
import com.cs2.volunteer_hub.service.EmailVerificationService
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@WebMvcTest(controllers = [AuthController::class], excludeFilters = [ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = [RateLimitingFilter::class, RateLimitingInterceptor::class])])
@Import(SecurityConfig::class)
class AuthLogoutAllAuthorizationHttpTest {
    @Autowired lateinit var mvc: MockMvc

    @MockitoBean lateinit var authService: AuthService
    @MockitoBean lateinit var refreshCookies: RefreshSessionCookies
    @MockitoBean lateinit var emailVerificationService: EmailVerificationService
    @MockitoBean lateinit var emailQueueService: EmailQueueService
    @MockitoBean lateinit var loginMapper: LoginMapper
    @MockitoBean lateinit var registerMapper: RegisterMapper
    @MockitoBean lateinit var verifyEmailMapper: VerifyEmailMapper
    @MockitoBean lateinit var jwtDecoder: JwtDecoder
    @MockitoBean lateinit var userDetailsService: CustomUserDetailsService

    @Test
    fun anonymousLogoutAllIsRejectedAtFilterRatherThanCrashingController() {
        mvc.perform(post("/api/auth/logout-all"))
            .andExpect(status().isUnauthorized)
        Mockito.verifyNoInteractions(authService)
    }

    @Test
    fun authenticatedLogoutAllRevokesOnlyOwnSessions() {
        mvc.perform(
            post("/api/auth/logout-all")
                .with(user("volunteer@example.invalid").roles("VOLUNTEER"))
        ).andExpect(status().isOk)
        Mockito.verify(authService).logoutAllDevices("volunteer@example.invalid")
    }
}
