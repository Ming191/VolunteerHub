package com.cs2.volunteer_hub.config.ratelimit

import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.net.InetAddress

/** Disregard spoofable forwarded headers unless the immediately connected peer is trusted. */
@Component
class ClientIpResolver(
    @Value("\${rate-limit.trusted-proxies:}") configuredProxies: String = ""
) {
    private val trusted = configuredProxies.split(",").map(String::trim).filter(String::isNotEmpty).toSet()

    fun resolve(request: HttpServletRequest): String {
        val peer = request.remoteAddr ?: return "unknown"
        if (peer !in trusted) return peer
        val forwardedHeaders = request.getHeaders("X-Forwarded-For").toList()
        // Ambiguous repeated headers can be interpreted differently by upstream proxies.
        if (forwardedHeaders.size != 1) return peer
        val hops = forwardedHeaders.single().split(",").map(String::trim)
        if (hops.isEmpty() || hops.size > 16 || hops.any { !numericAddress(it) }) return peer
        // Read right-to-left: only an explicitly trusted reverse proxy may append the client IP.
        return hops.asReversed().firstOrNull { it !in trusted } ?: hops.first()
    }

    private fun numericAddress(value: String): Boolean {
        if (value.length !in 2..45) return false
        if (value.contains(":")) {
            if (!value.matches(Regex("[0-9a-fA-F:]+"))) return false
            return try { InetAddress.getByName(value).address.size == 16 } catch (_: Exception) { false }
        }
        val parts = value.split(".")
        return parts.size == 4 && parts.all {
            it.isNotEmpty() && it.length <= 3 && it.all(Char::isDigit) &&
                it.toIntOrNull()?.let { n -> n in 0..255 } == true
        }
    }
}
