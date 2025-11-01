package com.cs2.volunteer_hub.config.ratelimit

import io.github.bucket4j.Bandwidth
import io.github.bucket4j.BucketConfiguration
import io.github.bucket4j.distributed.proxy.ProxyManager
import jakarta.servlet.Filter
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.util.AntPathMatcher
import java.util.concurrent.TimeUnit

@Component
class RateLimitingFilter(
    private val proxyManager: ProxyManager<String>,
    private val rateLimitProperties: RateLimitProperties
) : Filter {

    private val pathMatcher = AntPathMatcher()

    override fun doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain) {
        val httpRequest = request as HttpServletRequest
        val httpResponse = response as HttpServletResponse

        if (!httpRequest.requestURI.startsWith("/api/")) {
            chain.doFilter(request, response)
            return
        }

        val clientId = getClientIdentifier(httpRequest)
        val rule = findMatchingRule(httpRequest.requestURI, httpRequest.method)

        val bucketKey = "${clientId}:${rule.method ?: "ANY"}:${rule.path ?: "default"}"
        val bucketConfiguration = createBucketConfig(rule)

        val bucket = proxyManager.builder().build(bucketKey) { bucketConfiguration }

        val probe = bucket.tryConsumeAndReturnRemaining(1)

        httpResponse.addHeader("X-Rate-Limit-Limit", rule.capacity.toString())

        if (probe.isConsumed) {
            httpResponse.addHeader("X-Rate-Limit-Remaining", probe.remainingTokens.toString())
            chain.doFilter(request, response)
        } else {
            val secondsToWait = TimeUnit.NANOSECONDS.toSeconds(probe.nanosToWaitForRefill)
            httpResponse.addHeader("X-Rate-Limit-Retry-After-Seconds", secondsToWait.toString())
            httpResponse.status = HttpStatus.TOO_MANY_REQUESTS.value()
            httpResponse.writer.write("You have exhausted your API Request Quota")
        }
    }

    private fun findMatchingRule(requestPath: String, requestMethod: String): RateLimitProperties.Rule {
        return rateLimitProperties.rules.find { rule ->
            val pathMatches = rule.path?.let { pathMatcher.match(it, requestPath) } ?: false
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