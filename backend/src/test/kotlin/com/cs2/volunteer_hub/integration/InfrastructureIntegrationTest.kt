package com.cs2.volunteer_hub.integration

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.config.RedisConfig
import com.cs2.volunteer_hub.dto.VerificationEmailMessage
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.service.EmailQueueService
import com.cs2.volunteer_hub.service.EventCapacityService
import com.cs2.volunteer_hub.service.WaitlistService
import com.cs2.volunteer_hub.service.NotificationService
import com.cs2.volunteer_hub.mapper.RegistrationMapper
import org.mockito.Mockito
import jakarta.persistence.EntityManager
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.amqp.rabbit.core.RabbitAdmin
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.SpringBootConfiguration
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.cache.CacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.containers.RabbitMQContainer
import org.testcontainers.containers.GenericContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset

/**
 * Minimal Spring Boot slice using the application's real JPA entities/repositories,
 * Redis cache configuration, RabbitMQ topology, and email publisher.
 *
 * No cloud credentials, SMTP provider, production volumes or localhost services.
 */
@SpringBootConfiguration
@EnableAutoConfiguration
@EntityScan(basePackages = ["com.cs2.volunteer_hub.model"])
@EnableJpaRepositories(basePackages = ["com.cs2.volunteer_hub.repository"])
@Import(RabbitMQConfig::class, RedisConfig::class, EmailQueueService::class, EventCapacityService::class, WaitlistService::class)
class InfraHarnessApplication {
    @Bean
    fun fixtureClock(): Clock =
        Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC)

    @Bean
    fun notificationService(): NotificationService = Mockito.mock(NotificationService::class.java)

    @Bean
    fun registrationMapper(): RegistrationMapper = RegistrationMapper()
}

@Testcontainers
@SpringBootTest(
    classes = [InfraHarnessApplication::class],
    webEnvironment = SpringBootTest.WebEnvironment.NONE,
    properties = [
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.flyway.enabled=true",
        "spring.flyway.baseline-on-migrate=false",
        "spring.rabbitmq.listener.simple.auto-startup=false",
        "spring.rabbitmq.listener.direct.auto-startup=false",
        "spring.main.banner-mode=off"
    ]
)
class InfrastructureIntegrationTest {
    companion object {
        @Container
        @JvmField
        val postgres = PostgreSQLContainer<Nothing>("postgres:15-alpine").apply {
            withDatabaseName("vh112")
            withUsername("vh112")
            withPassword("local_test_only")
        }

        @Container
        @JvmField
        val redis = GenericContainer<Nothing>("redis:7-alpine").apply {
            withExposedPorts(6379)
        }

        @Container
        @JvmField
        val rabbit = RabbitMQContainer("rabbitmq:3.13-management-alpine")

        @DynamicPropertySource
        @JvmStatic
        fun services(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url") { postgres.jdbcUrl }
            registry.add("spring.datasource.username") { postgres.username }
            registry.add("spring.datasource.password") { postgres.password }
            registry.add("spring.data.redis.host") { redis.host }
            registry.add("spring.data.redis.port") { redis.getMappedPort(6379) }
            registry.add("spring.rabbitmq.host") { rabbit.host }
            registry.add("spring.rabbitmq.port") { rabbit.amqpPort }
            registry.add("spring.rabbitmq.username") { rabbit.adminUsername }
            registry.add("spring.rabbitmq.password") { rabbit.adminPassword }
        }
    }

    @Autowired lateinit var users: UserRepository
    @Autowired lateinit var events: EventRepository
    @Autowired lateinit var registrations: RegistrationRepository
    @Autowired lateinit var waitlistService: WaitlistService
    @Autowired lateinit var eventCapacityService: EventCapacityService
    @Autowired lateinit var jdbc: JdbcTemplate
    @Autowired lateinit var redisTemplate: StringRedisTemplate
    @Autowired lateinit var cacheManager: CacheManager
    @Autowired lateinit var emailQueue: EmailQueueService
    @Autowired lateinit var rabbitTemplate: RabbitTemplate
    @Autowired lateinit var rabbitAdmin: RabbitAdmin
    @Autowired lateinit var clock: Clock

    @BeforeEach
    fun cleanState() {
        // Isolate test fixtures in ephemeral PostgreSQL / Redis / RabbitMQ containers.
        jdbc.execute("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
        redisTemplate.connectionFactory!!.connection.use { it.serverCommands().flushDb() }
        rabbitAdmin.initialize()
        rabbitAdmin.purgeQueue(RabbitMQConfig.EMAIL_QUEUE, true)
        rabbitAdmin.purgeQueue(RabbitMQConfig.EMAIL_DLQ, true)
    }

    private fun newVolunteer(email: String) = User(
        name = "Fixture Volunteer",
        email = email,
        passwordHash = "NOT_A_REAL_HASH",
        role = Role.VOLUNTEER,
        createdAt = LocalDateTime.ofInstant(clock.instant(), clock.zone)
    )

    @Test
    fun `Flyway schema and JPA repository persist a volunteer fixture`() {
        val saved = users.saveAndFlush(newVolunteer("fixture@example.invalid"))
        assertNotNull(saved.id)
        assertEquals(Role.VOLUNTEER, users.findByEmail("fixture@example.invalid")!!.role)
        assertEquals(
            1L,
            jdbc.queryForObject("SELECT COUNT(*) FROM flyway_schema_history WHERE version='1' AND success", Long::class.java)
        )
        assertEquals(
            LocalDateTime.of(2026, 1, 1, 0, 0),
            users.findByEmail("fixture@example.invalid")!!.createdAt
        )
    }

    @Test
    fun `database rejects duplicate volunteer email across separate transactions`() {
        users.saveAndFlush(newVolunteer("same@example.invalid"))
        assertThrows(DataIntegrityViolationException::class.java) {
            users.saveAndFlush(newVolunteer("same@example.invalid"))
        }
        assertEquals(1L, users.count())
    }

    @Test
    fun `Redis cache roundtrip has bounded TTL and honors eviction`() {
        val cache = requireNotNull(cacheManager.getCache("vh112-integration"))
        cache.put("test-key", "hello-redis")
        assertEquals("hello-redis", cache.get("test-key", String::class.java))
        // Verify the actual 10-minute RedisCacheManager TTL without sleeping.
        val ttlSeconds = redisTemplate.getExpire("vh112-integration::test-key", java.util.concurrent.TimeUnit.SECONDS)
        assertNotNull(ttlSeconds)
        assertTrue(ttlSeconds!! in 1..600, "Unexpected Redis cache TTL: $ttlSeconds")
        cache.evict("test-key")
        assertNull(cache.get("test-key"))
    }

    @Test
    fun `RabbitMQ verification email is published to the expected durable queue`() {
        emailQueue.queueVerificationEmail("verify@example.invalid", "Volunteer", "fixture-token")
        val received = rabbitTemplate.receiveAndConvert(RabbitMQConfig.EMAIL_QUEUE, 5000)
        assertTrue(received is VerificationEmailMessage, "Expected typed verification email, got: ${received?.javaClass}")
        received as VerificationEmailMessage
        assertEquals("verify@example.invalid", received.to)
        assertEquals("fixture-token", received.token)
        assertNull(rabbitTemplate.receive(RabbitMQConfig.EMAIL_QUEUE, 100))
    }

    @Test
    fun `waitlist registration query preserves positions and database uniqueness`() {
        val organizer = users.saveAndFlush(newVolunteer("organizer@example.invalid"))
        val first = users.saveAndFlush(newVolunteer("first@example.invalid"))
        val second = users.saveAndFlush(newVolunteer("second@example.invalid"))
        val event = events.saveAndFlush(
            Event(
                title = "Fixture Event",
                description = "Test only",
                location = "Fixture",
                eventDateTime = LocalDateTime.of(2027, 1, 1, 9, 0),
                endDateTime = LocalDateTime.of(2027, 1, 1, 12, 0),
                status = EventStatus.PUBLISHED,
                creator = organizer,
                maxParticipants = 1,
                waitlistEnabled = true
            )
        )
        // Reverse insertion order: repository must order by waitlistPosition, not ID.
        registrations.saveAndFlush(Registration(user = second, event = event, status = RegistrationStatus.WAITLISTED, waitlistPosition = 2))
        registrations.saveAndFlush(Registration(user = first, event = event, status = RegistrationStatus.WAITLISTED, waitlistPosition = 1))
        val ordered = registrations.findWaitlistedRegistrationsByEventIdWithAssociations(event.id)
        assertEquals(listOf(1, 2), ordered.map { it.waitlistPosition })
        assertEquals(2, events.countWaitlistedRegistrations(event.id))
        assertThrows(DataIntegrityViolationException::class.java) {
            registrations.saveAndFlush(Registration(user = first, event = event, status = RegistrationStatus.PENDING))
        }
        assertEquals(2L, registrations.count())
    }

    @Test
    fun `waitlist service promotes first volunteer when capacity becomes available`() {
        val organizer = users.saveAndFlush(newVolunteer("organizer@example.invalid"))
        val approved = users.saveAndFlush(newVolunteer("approved@example.invalid"))
        val first = users.saveAndFlush(newVolunteer("wait-1@example.invalid"))
        val second = users.saveAndFlush(newVolunteer("wait-2@example.invalid"))
        val event = events.saveAndFlush(
            Event(
                title = "Capacity Fixture",
                description = "Test only",
                location = "Fixture",
                eventDateTime = LocalDateTime.of(2027, 2, 1, 9, 0),
                endDateTime = LocalDateTime.of(2027, 2, 1, 11, 0),
                status = EventStatus.PUBLISHED,
                creator = organizer,
                maxParticipants = 1,
                waitlistEnabled = true
            )
        )
        val confirmed = registrations.saveAndFlush(
            Registration(user = approved, event = event, status = RegistrationStatus.APPROVED)
        )
        assertTrue(eventCapacityService.isFull(event.id, 1))
        assertEquals(0, eventCapacityService.getAvailableSpots(event.id, 1))
        val waitingOne = waitlistService.addToWaitlist(Registration(user = first, event = event))
        val waitingTwo = waitlistService.addToWaitlist(Registration(user = second, event = event))
        assertEquals(listOf(1, 2), listOf(waitingOne.waitlistPosition, waitingTwo.waitlistPosition))
        assertNull(waitlistService.promoteFromWaitlist(event.id), "Cannot promote while full")

        registrations.deleteById(confirmed.id)
        assertFalse(eventCapacityService.isFull(event.id, 1))
        val promoted = requireNotNull(waitlistService.promoteFromWaitlist(event.id))
        assertEquals(first.id, promoted.user.id)
        assertEquals(RegistrationStatus.APPROVED, promoted.status)
        assertNull(promoted.waitlistPosition)
        assertEquals(listOf(1), waitlistService.getWaitlistForEvent(event.id).map { it.waitlistPosition })
        assertTrue(eventCapacityService.isFull(event.id, 1))
    }

    @Test
    fun `RabbitMQ rejected email routes to dead letter queue`() {
        emailQueue.queueWelcomeEmail("fail@example.invalid", "Volunteer")
        rabbitTemplate.execute { channel ->
            val delivery = requireNotNull(channel.basicGet(RabbitMQConfig.EMAIL_QUEUE, false))
            channel.basicReject(delivery.envelope.deliveryTag, false)
            null
        }
        val deadLetter = rabbitTemplate.receive(RabbitMQConfig.EMAIL_DLQ, 5000)
        assertNotNull(deadLetter, "Rejected message must reach the real RabbitMQ dead-letter queue")
        assertNull(rabbitTemplate.receive(RabbitMQConfig.EMAIL_QUEUE, 100))
    }
}
