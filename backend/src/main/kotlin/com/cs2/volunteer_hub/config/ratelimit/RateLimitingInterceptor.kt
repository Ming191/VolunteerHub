package com.cs2.volunteer_hub.config.ratelimit

import io.github.bucket4j.Bandwidth
import io.github.bucket4j.BucketConfiguration
import io.github.bucket4j.distributed.proxy.ProxyManager
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.util.AntPathMatcher
import org.springframework.web.servlet.HandlerInterceptor
import java.util.concurrent.TimeUnit

@Component
class RateLimitingInterceptor(
    private val proxyManager: ProxyManager<String>,
    private val rateLimitProperties: RateLimitProperties
) : HandlerInterceptor {

    private val pathMatcher = AntPathMatcher()

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        val clientId = getClientIdentifier(request)

        val rule = findMatchingRule(request.requestURI, request.method)
        val bucketKey = "${clientId}:${request.method}:${request.requestURI}"

        val bucket = proxyManager.builder().build(bucketKey) {
            createBucketConfig(rule)
        }

        val probe = bucket.tryConsumeAndReturnRemaining(1)

        response.addHeader("X-Rate-Limit-Limit", rule.capacity.toString())

        return if (probe.isConsumed) {
            response.addHeader("X-Rate-Limit-Remaining", probe.remainingTokens.toString())
            true
        } else {
            val secondsToWait = TimeUnit.NANOSECONDS.toSeconds(probe.nanosToWaitForRefill)
            response.addHeader("X-Rate-Limit-Retry-After-Seconds", secondsToWait.toString())
            response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(), "You have exhausted your API Request Quota")
            false
        }
    }

    private fun findMatchingRule(requestPath: String, requestMethod: String): RateLimitProperties.Rule {
        return rateLimitProperties.rules.find { rule ->
            val pathMatches = pathMatcher.match(rule.path!!, requestPath)
            val methodMatches = rule.method == null || rule.method.equals(requestMethod, ignoreCase = true)
            pathMatches && methodMatches
        } ?: rateLimitProperties.default
    }

    private fun createBucketConfig(rule: RateLimitProperties.Rule): BucketConfiguration {
        val duration = rule.getRefillDurationParsed()
        return BucketConfiguration.builder()
            .addLimit(
                Bandwidth.builder()
                    .capacity(rule.capacity)
                    .refillIntervally(rule.refillTokens, duration)
                    .build()
            )
            .build()
    }

    private fun getClientIdentifier(request: HttpServletRequest): String {
        return request.userPrincipal?.name ?: request.getHeader("X-Forwarded-For") ?: request.remoteAddr
    }
}