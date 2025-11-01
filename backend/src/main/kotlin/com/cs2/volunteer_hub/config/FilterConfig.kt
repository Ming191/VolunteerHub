package com.cs2.volunteer_hub.config

import com.cs2.volunteer_hub.config.ratelimit.RateLimitingFilter
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.Ordered

@Configuration
class FilterConfig {
    @Bean
    fun rateLimitingFilterRegistration(rateLimitingFilter: RateLimitingFilter): FilterRegistrationBean<RateLimitingFilter> {
        val registration = FilterRegistrationBean<RateLimitingFilter>()
        registration.filter = rateLimitingFilter
        registration.addUrlPatterns("/api/*")
        registration.order = Ordered.HIGHEST_PRECEDENCE

        return registration
    }
}