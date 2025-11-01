package com.cs2.volunteer_hub.config

import com.cs2.volunteer_hub.config.ratelimit.RateLimitProperties
import io.github.bucket4j.distributed.proxy.ProxyManager
import io.github.bucket4j.redis.lettuce.Bucket4jLettuce
import io.lettuce.core.RedisClient
import io.lettuce.core.api.StatefulRedisConnection
import io.lettuce.core.codec.RedisCodec
import io.lettuce.core.codec.StringCodec
import io.lettuce.core.codec.ByteArrayCodec
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RateLimitConfig(
    private val rateLimitProperties: RateLimitProperties
) {

    @Bean(destroyMethod = "shutdown")
    fun redisClient(): RedisClient {
        val connectionString = rateLimitProperties.redis.getConnectionString()
        return RedisClient.create(connectionString)
    }

    @Bean(destroyMethod = "close")
    fun redisConnection(redisClient: RedisClient): StatefulRedisConnection<String, ByteArray> {
        return redisClient.connect(RedisCodec.of(StringCodec.UTF8, ByteArrayCodec.INSTANCE))
    }

    @Bean
    fun proxyManager(connection: StatefulRedisConnection<String, ByteArray>): ProxyManager<String> {
        return Bucket4jLettuce.casBasedBuilder(connection).build()
    }
}