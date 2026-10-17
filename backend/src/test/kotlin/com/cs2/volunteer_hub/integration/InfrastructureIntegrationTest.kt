package com.cs2.volunteer_hub.integration

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.config.RedisConfig
import com.cs2.volunteer_hub.dto.VerificationEmailMessage
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.model.Image
import com.cs2.volunteer_hub.model.ImageStatus
import com.cs2.volunteer_hub.dto.EventCreationMessage
import com.cs2.volunteer_hub.dto.UpdateEventRequest
import com.cs2.volunteer_hub.dto.ImageUploadSuccessMessage
import com.cs2.volunteer_hub.dto.ImageUploadFailureMessage
import com.cs2.volunteer_hub.worker.EventStatusUpdater
import com.cs2.volunteer_hub.worker.ImageUploadWorker
import com.cs2.volunteer_hub.service.TemporaryFileStorageService
import java.util.concurrent.CompletableFuture
import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.model.UserSettings
import com.cs2.volunteer_hub.model.ProfileVisibility
import com.cs2.volunteer_hub.model.Post
import com.cs2.volunteer_hub.model.Comment
import com.cs2.volunteer_hub.repository.UserSettingsRepository
import com.cs2.volunteer_hub.repository.PostRepository
import com.cs2.volunteer_hub.exception.UnauthorizedAccessException
import org.springframework.data.domain.PageRequest
import com.cs2.volunteer_hub.service.ProfilePrivacyService
import com.cs2.volunteer_hub.service.UserService
import com.cs2.volunteer_hub.service.SettingsService
import com.cs2.volunteer_hub.service.PostService
import com.cs2.volunteer_hub.service.EventService
import com.cs2.volunteer_hub.service.EventQueueService
import com.cs2.volunteer_hub.mapper.EventMapper
import com.cs2.volunteer_hub.validation.EventCoordinateValidator
import com.cs2.volunteer_hub.validation.EventDateValidator
import com.cs2.volunteer_hub.validation.EventLifecycleValidator
import com.cs2.volunteer_hub.repository.ImageRepository
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.service.FileValidationService
import com.cs2.volunteer_hub.service.ImageUploadService
import com.cs2.volunteer_hub.mapper.PostMapper
import com.cs2.volunteer_hub.mapper.CommentMapper
import com.cs2.volunteer_hub.mapper.SettingsMapper
import com.cs2.volunteer_hub.dto.PublicUserResponse
import com.cs2.volunteer_hub.dto.UpdateUserSettingsRequest
import com.cs2.volunteer_hub.dto.DeleteAccountRequest
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.transaction.support.TransactionTemplate
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.service.EmailQueueService
import com.cs2.volunteer_hub.service.EventCapacityService
import com.cs2.volunteer_hub.service.WaitlistService
import com.cs2.volunteer_hub.service.RegistrationService
import com.cs2.volunteer_hub.service.EventManagerService
import com.cs2.volunteer_hub.service.AuthorizationService
import com.cs2.volunteer_hub.service.CacheEvictionService
import com.cs2.volunteer_hub.exception.ConflictException
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
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
@Import(RabbitMQConfig::class, RedisConfig::class, EmailQueueService::class, EventCapacityService::class, WaitlistService::class, RegistrationService::class, EventManagerService::class, ProfilePrivacyService::class, UserService::class, SettingsService::class, PostService::class, EventService::class, EventMapper::class, ImageUploadWorker::class, EventStatusUpdater::class, PostMapper::class, CommentMapper::class, SettingsMapper::class)
class InfraHarnessApplication {
    @Bean
    fun fixtureClock(): Clock =
        Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC)

    @Bean
    fun notificationService(): NotificationService = Mockito.mock(NotificationService::class.java)

    @Bean
    fun registrationMapper(privacy: ProfilePrivacyService): RegistrationMapper = RegistrationMapper(privacy)

    @Bean
    fun authorizationService(events: EventRepository, registrations: RegistrationRepository, users: UserRepository): AuthorizationService =
        AuthorizationService(events, registrations, users)

    @Bean
    fun eventDateValidator(): EventDateValidator = Mockito.mock(EventDateValidator::class.java)

    @Bean
    fun eventLifecycleValidator(): EventLifecycleValidator = Mockito.mock(EventLifecycleValidator::class.java)

    @Bean
    fun eventCoordinateValidator(): EventCoordinateValidator = Mockito.mock(EventCoordinateValidator::class.java)

    @Bean
    fun eventQueueService(): EventQueueService = Mockito.mock(EventQueueService::class.java)

    @Bean
    fun cacheEvictionService(manager: CacheManager): CacheEvictionService = CacheEvictionService(manager)

    @Bean
    fun passwordEncoder(): PasswordEncoder = Mockito.mock(PasswordEncoder::class.java)

    @Bean
    fun fileValidationService(): FileValidationService = Mockito.mock(FileValidationService::class.java)

    @Bean
    fun imageUploadService(): ImageUploadService = Mockito.mock(ImageUploadService::class.java)

    @Bean
    fun temporaryFileStorageService(): TemporaryFileStorageService = Mockito.mock(TemporaryFileStorageService::class.java)
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
    @Autowired lateinit var userSettings: UserSettingsRepository
    @Autowired lateinit var transactionTemplate: TransactionTemplate
    @Autowired lateinit var userService: UserService
    @Autowired lateinit var settingsService: SettingsService
    @Autowired lateinit var passwordEncoder: PasswordEncoder
    @Autowired lateinit var postMapper: PostMapper
    @Autowired lateinit var postService: PostService
    @Autowired lateinit var eventService: EventService
    @Autowired lateinit var eventStatusUpdater: EventStatusUpdater
    @Autowired lateinit var imageUploadWorker: ImageUploadWorker
    @Autowired lateinit var imageUploadService: ImageUploadService
    @Autowired lateinit var temporaryFiles: TemporaryFileStorageService
    @Autowired lateinit var authorizationService: AuthorizationService
    @Autowired lateinit var posts: PostRepository
    @Autowired lateinit var commentMapper: CommentMapper
    @Autowired lateinit var registrationMapper: RegistrationMapper
    @Autowired lateinit var events: EventRepository
    @Autowired lateinit var registrations: RegistrationRepository
    @Autowired lateinit var waitlistService: WaitlistService
    @Autowired lateinit var registrationService: RegistrationService
    @Autowired lateinit var managerService: EventManagerService
    @Autowired lateinit var eventCapacityService: EventCapacityService
    @Autowired lateinit var jdbc: JdbcTemplate
    @Autowired lateinit var redisTemplate: StringRedisTemplate
    @Autowired lateinit var cacheManager: CacheManager
    @Autowired lateinit var emailQueue: EmailQueueService
    @Autowired lateinit var rabbitTemplate: RabbitTemplate
    @Autowired lateinit var rabbitAdmin: RabbitAdmin
    @Autowired lateinit var clock: Clock

    @org.junit.jupiter.api.AfterEach
    fun clearPrincipal() = SecurityContextHolder.clearContext()

    @BeforeEach
    fun cleanState() {
        SecurityContextHolder.clearContext()
        // Isolate test fixtures in ephemeral PostgreSQL / Redis / RabbitMQ containers.
        jdbc.execute("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
        redisTemplate.connectionFactory!!.connection.use { it.serverCommands().flushDb() }
        rabbitAdmin.initialize()
        rabbitAdmin.purgeQueue(RabbitMQConfig.EMAIL_QUEUE, true)
        rabbitAdmin.purgeQueue(RabbitMQConfig.EMAIL_DLQ, true)
        rabbitAdmin.purgeQueue(RabbitMQConfig.EVENT_CREATION_PENDING_QUEUE, true)
        rabbitAdmin.purgeQueue(RabbitMQConfig.IMAGE_UPLOAD_SUCCEEDED_QUEUE, true)
        rabbitAdmin.purgeQueue(RabbitMQConfig.IMAGE_UPLOAD_FAILED_QUEUE, true)
        Mockito.reset(imageUploadService, temporaryFiles)
    }

    private fun newVolunteer(email: String) = User(
        name = "Fixture Volunteer",
        email = email,
        passwordHash = "NOT_A_REAL_HASH",
        role = Role.VOLUNTEER,
        createdAt = LocalDateTime.ofInstant(clock.instant(), clock.zone)
    )


    private fun authenticate(email: String) {
        SecurityContextHolder.getContext().authentication = UsernamePasswordAuthenticationToken(
            email, "test-only", listOf(org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"))
        )
    }

    private fun visibleFixture(email: String, visibility: ProfileVisibility): User =
        requireNotNull(transactionTemplate.execute {
            val volunteer = users.saveAndFlush(
                newVolunteer(email).copy(
                    bio = "PRIVATE BIO",
                    profilePictureUrl = "https://invalid.example/avatar.png"
                )
            )
            userSettings.saveAndFlush(UserSettings(user = volunteer, profileVisibility = visibility))
            volunteer
        })

    @Test
    fun `private owner profile never leaks through Redis cache to anonymous other user or admin order`() {
        val owner = visibleFixture("private@example.invalid", ProfileVisibility.PRIVATE)
        val stranger = users.saveAndFlush(newVolunteer("other@example.invalid"))
        val admin = users.saveAndFlush(newVolunteer("admin@example.invalid").copy(role = Role.ADMIN))
        val cache = requireNotNull(cacheManager.getCache("publicUserProfiles"))

        authenticate(owner.email)
        val privileged = userService.getPublicUserProfile(owner.id)
        assertEquals("PRIVATE BIO", privileged.bio)
        assertNotNull(privileged.profilePictureUrl)

        // Simulate a full old-style entry from the vulnerable deployment.
        cache.put(owner.id, privileged)
        SecurityContextHolder.clearContext()
        val anonymous = userService.getPublicUserProfile(owner.id)
        assertTrue(anonymous.isPrivate)
        assertNull(anonymous.bio)
        assertEquals(owner.profilePictureUrl, anonymous.profilePictureUrl)

        authenticate(stranger.email)
        assertNull(userService.getPublicUserProfile(owner.id).bio)
        authenticate(admin.email)
        assertEquals("PRIVATE BIO", userService.getPublicUserProfile(owner.id).bio)
        SecurityContextHolder.clearContext()
        assertEquals(owner.profilePictureUrl, userService.getPublicUserProfile(owner.id).profilePictureUrl)
    }

    @Test
    fun `locking a profile hides bio while public posts comments and attendees keep avatar`() {
        val owner = visibleFixture("toggle@example.invalid", ProfileVisibility.PUBLIC)
        val organizer = users.saveAndFlush(newVolunteer("organizer@example.invalid"))
        val event = capacityEvent(organizer, 3)
        val post = Post(content = "Public post", author = owner, event = event)
        val comment = Comment(content = "Reply", author = owner, post = post)
        val attendee = Registration(user = owner, event = event, status = RegistrationStatus.APPROVED)
        val cache = requireNotNull(cacheManager.getCache("publicUserProfiles"))

        assertNotNull(userService.getPublicUserProfile(owner.id).bio)
        assertNotNull(postMapper.toPostResponse(post).author.bio)
        assertNotNull(commentMapper.toCommentResponse(comment).author.profilePictureUrl)
        assertNotNull(registrationMapper.toPublicAttendeeResponse(attendee).bio)

        cache.put(owner.id, userService.getPublicUserProfile(owner.id))
        assertNotNull(cache.get(owner.id))
        settingsService.updateUserSettings(owner.email, UpdateUserSettingsRequest(profileVisibility = ProfileVisibility.PRIVATE))
        assertNull(cache.get(owner.id), "Privacy update must evict old user-ID cache entries")

        assertNull(userService.getPublicUserProfile(owner.id).bio)
        assertEquals(owner.name, postMapper.toPostResponse(post).author.name)
        assertEquals(owner.profilePictureUrl, postMapper.toPostResponse(post).author.profilePictureUrl)
        assertNull(postMapper.toPostResponse(post).author.bio)
        assertEquals(owner.profilePictureUrl, commentMapper.toCommentResponse(comment).author.profilePictureUrl)
        assertNull(commentMapper.toCommentResponse(comment).author.bio)
        assertEquals(owner.profilePictureUrl, commentMapper.toCommentResponseWithReplies(comment).author.profilePictureUrl)
        assertNull(commentMapper.toCommentResponseWithReplies(comment).author.bio)
        assertNull(registrationMapper.toPublicAttendeeResponse(attendee).bio)
        assertEquals(owner.profilePictureUrl, registrationMapper.toPublicAttendeeResponse(attendee).profilePictureUrl)

        authenticate(owner.email)
        assertEquals("PRIVATE BIO", userService.getPublicUserProfile(owner.id).bio)
        SecurityContextHolder.clearContext()
        assertNull(userService.getPublicUserProfile(owner.id).bio)
    }

    @Test
    fun `locked timeline is denied while public event posts retain author name and avatar`() {
        val owner = visibleFixture("locked-author@example.invalid", ProfileVisibility.PRIVATE)
        val organizer = users.saveAndFlush(newVolunteer("organizer@example.invalid"))
        val event = capacityEvent(organizer, 3)
        posts.saveAndFlush(Post(content = "Public event discussion", author = owner, event = event))
        val page = PageRequest.of(0, 10)

        assertThrows(UnauthorizedAccessException::class.java) {
            postService.getPostsByUserId(owner.id, null, page)
        }
        val eventPosts = postService.getPostsForEvent(event.id, null, page).content
        assertEquals(1, eventPosts.size)
        assertEquals("Public event discussion", eventPosts.single().content)
        assertEquals(owner.name, eventPosts.single().author.name)
        assertEquals(owner.profilePictureUrl, eventPosts.single().author.profilePictureUrl)
        assertNull(eventPosts.single().author.bio)

        assertEquals(1L, postService.getPostsByUserId(owner.id, owner.email, page).totalElements)
    }

    @Test
    fun `deleted profiles disappear from public endpoint and author projections are anonymized`() {
        val owner = visibleFixture("deleted@example.invalid", ProfileVisibility.PUBLIC)
        val organizer = users.saveAndFlush(newVolunteer("organizer@example.invalid"))
        val event = capacityEvent(organizer, 1)
        val authorPost = Post(content = "historical", author = owner, event = event)
        val cache = requireNotNull(cacheManager.getCache("publicUserProfiles"))
        cache.put(owner.id, userService.getPublicUserProfile(owner.id))
        Mockito.`when`(passwordEncoder.matches("delete-me", owner.passwordHash)).thenReturn(true)
        settingsService.deleteAccount(owner.email, DeleteAccountRequest("delete-me", "DELETE"))
        assertNull(cache.get(owner.id), "Soft deletion must evict obsolete public profile entries")

        assertThrows(com.cs2.volunteer_hub.exception.ResourceNotFoundException::class.java) {
            userService.getPublicUserProfile(owner.id)
        }
        val projection = postMapper.toPostResponse(authorPost).author
        assertEquals("Deleted user", projection.name)
        assertNull(projection.bio)
        assertNull(projection.profilePictureUrl)
    }


    @Test
    fun `unpublished event details and gallery deny strangers despite warmed cache`() {
        val organizer = users.saveAndFlush(newVolunteer("organizer@example.invalid").copy(role = Role.EVENT_ORGANIZER))
        val visitor = users.saveAndFlush(newVolunteer("visitor@example.invalid"))
        val admin = users.saveAndFlush(newVolunteer("admin@example.invalid").copy(role = Role.ADMIN))
        val hidden = capacityEvent(organizer, 5)
        val publicEvent = capacityEvent(organizer, 5)
        publicEvent.title = "Public event"
        events.saveAndFlush(publicEvent)
        assertEquals(EventStatus.PUBLISHED, eventService.getEventById(publicEvent.id).status)

        val cached = requireNotNull(cacheManager.getCache("events"))
        for (status in listOf(EventStatus.DRAFT, EventStatus.PENDING, EventStatus.REJECTED, EventStatus.CANCELLED)) {
            val current = events.findById(hidden.id).orElseThrow()
            current.status = status
            events.saveAndFlush(current)
            // Reproduce a legacy cache entry populated by an authorized viewer.
            cached.put(hidden.id, eventService.getEventById(hidden.id, organizer.email))

            assertThrows(ResourceNotFoundException::class.java) { eventService.getEventById(hidden.id) }
            assertThrows(ResourceNotFoundException::class.java) { eventService.getEventById(hidden.id, visitor.email) }
            assertThrows(ResourceNotFoundException::class.java) {
                eventService.getEventGallery(hidden.id, PageRequest.of(0, 10), visitor.email)
            }
            assertEquals(status, eventService.getEventById(hidden.id, organizer.email).status)
            assertEquals(status, eventService.getEventById(hidden.id, admin.email).status)
            assertEquals(0, eventService.getEventGallery(hidden.id, PageRequest.of(0, 10), admin.email).content.size)
        }
    }

    @Test
    fun `post by ID cannot bypass event visibility while public event posts remain accessible`() {
        val organizer = users.saveAndFlush(newVolunteer("organizer@example.invalid").copy(role = Role.EVENT_ORGANIZER))
        val visitor = users.saveAndFlush(newVolunteer("visitor@example.invalid"))
        val admin = users.saveAndFlush(newVolunteer("admin@example.invalid").copy(role = Role.ADMIN))
        val hidden = capacityEvent(organizer, 2)
        hidden.status = EventStatus.DRAFT
        events.saveAndFlush(hidden)
        val published = capacityEvent(organizer, 2)
        val draftPost = posts.saveAndFlush(Post(content = "Unpublished details", author = organizer, event = hidden))
        val publicPost = posts.saveAndFlush(Post(content = "Public discussion", author = organizer, event = published))

        assertThrows(ResourceNotFoundException::class.java) {
            postService.getPost(hidden.id, draftPost.id, visitor.email)
        }
        assertEquals(draftPost.id, postService.getPost(hidden.id, draftPost.id, organizer.email).id)
        assertEquals(draftPost.id, postService.getPost(hidden.id, draftPost.id, admin.email).id)
        assertEquals(publicPost.id, postService.getPost(published.id, publicPost.id, visitor.email).id)
        assertThrows(ResourceNotFoundException::class.java) {
            postService.getPostsForEvent(hidden.id, visitor.email, PageRequest.of(0, 10))
        }
        assertEquals(1, postService.getPostsForEvent(published.id, visitor.email, PageRequest.of(0, 10)).totalElements)
    }

    @Test
    fun `author feed excludes hidden event posts before pagination and totals`() {
        val organizer = visibleFixture("organizer@example.invalid", ProfileVisibility.PUBLIC)
        val visitor = users.saveAndFlush(newVolunteer("visitor@example.invalid"))
        val admin = users.saveAndFlush(newVolunteer("admin@example.invalid").copy(role = Role.ADMIN))
        val hidden = capacityEvent(organizer, 2)
        hidden.status = EventStatus.PENDING
        events.saveAndFlush(hidden)
        val publicEvent = capacityEvent(organizer, 2)
        posts.saveAndFlush(Post(content = "Secret draft", author = organizer, event = hidden))
        posts.saveAndFlush(Post(content = "Published content", author = organizer, event = publicEvent))

        val visitorFeed = postService.getPostsByUserId(organizer.id, visitor.email, PageRequest.of(0, 10))
        assertEquals(1L, visitorFeed.totalElements)
        assertEquals(listOf("Published content"), visitorFeed.content.map { it.content })
        assertEquals(1L, postService.getPostsByUserId(organizer.id, null, PageRequest.of(0, 10)).totalElements)
        assertEquals(2L, postService.getPostsByUserId(organizer.id, organizer.email, PageRequest.of(0, 10)).totalElements)
        assertEquals(2L, postService.getPostsByUserId(organizer.id, admin.email, PageRequest.of(0, 10)).totalElements)
    }


    private fun loadedEvent(eventId: Long): Event = requireNotNull(transactionTemplate.execute {
        events.findById(eventId).orElseThrow().also { it.images.size }
    })

    private fun stagedImage(eventId: Long, path: String): Long =
        requireNotNull(transactionTemplate.execute {
            val event = events.findById(eventId).orElseThrow()
            event.images.add(Image(
                event = event,
                originalFileName = "fixture.png",
                contentType = "image/png",
                temporaryFilePath = path
            ))
            events.saveAndFlush(event).images.last().id
        })

    @Test
    fun `failed update image never deletes a published event or its registrations`() {
        val organizer = users.saveAndFlush(newVolunteer("organizer@example.invalid"))
        val attendee = users.saveAndFlush(newVolunteer("attendee@example.invalid"))
        val waitlisted = users.saveAndFlush(newVolunteer("waiting@example.invalid"))
        val event = capacityEvent(organizer, 2)
        val confirmed = registrations.saveAndFlush(
            Registration(user = attendee, event = event, status = RegistrationStatus.APPROVED)
        )
        registrations.saveAndFlush(
            Registration(user = waitlisted, event = event, status = RegistrationStatus.WAITLISTED, waitlistPosition = 1)
        )
        val oldImageId = stagedImage(event.id, "old-upload")
        eventStatusUpdater.handleUploadSuccess(ImageUploadSuccessMessage(
            event.id, mapOf(oldImageId to "https://example.invalid/original.png")
        ))
        val newImageId = stagedImage(event.id, "new-upload")
        val failure = ImageUploadFailureMessage(
            eventId = event.id,
            uploadedUrls = emptyMap(),
            error = "deliberate failure",
            retryCount = RabbitMQConfig.MAX_RETRY_COUNT,
            failedImageIds = listOf(newImageId)
        )
        eventStatusUpdater.handleUploadFailure(failure)
        eventStatusUpdater.handleUploadFailure(failure) // at least once delivery
        val saved = loadedEvent(event.id)
        assertEquals(EventStatus.PUBLISHED, saved.status)
        assertEquals("VH-202 concurrency fixture", saved.title)
        assertTrue(registrations.existsById(confirmed.id))
        assertEquals(2, registrations.count())
        assertEquals(ImageStatus.UPLOADED, saved.images.single { it.id == oldImageId }.status)
        assertEquals("https://example.invalid/original.png", saved.images.single { it.id == oldImageId }.url)
        assertEquals(ImageStatus.UPLOAD_FAILED, saved.images.single { it.id == newImageId }.status)
        assertNull(saved.images.single { it.id == newImageId }.url)
        // Delayed duplicate success/failure must not alter a completed result.
        eventStatusUpdater.handleUploadSuccess(ImageUploadSuccessMessage(
            event.id, mapOf(oldImageId to "https://example.invalid/stale.png")
        ))
        eventStatusUpdater.handleUploadFailure(failure)
        assertEquals("https://example.invalid/original.png",
            loadedEvent(event.id).images.single { it.id == oldImageId }.url)
    }

    @Test
    fun `initial creation upload failure preserves the draft event for retry`() {
        val organizer = users.saveAndFlush(newVolunteer("organizer@example.invalid"))
        val event = capacityEvent(organizer, 1)
        event.status = EventStatus.PENDING
        events.saveAndFlush(event)
        val imageId = stagedImage(event.id, "initial-staged-file")
        eventStatusUpdater.handleUploadFailure(ImageUploadFailureMessage(
            event.id, emptyMap(), "initial failed", RabbitMQConfig.MAX_RETRY_COUNT, listOf(imageId)
        ))
        assertEquals(EventStatus.PENDING, loadedEvent(event.id).status)
        assertEquals(ImageStatus.UPLOAD_FAILED,
            loadedEvent(event.id).images.single { it.id == imageId }.status)
        assertEquals(1L, events.count())
    }

    @Test
    fun `upload worker preserves temp file for retry and updates only requested images`() {
        val organizer = users.saveAndFlush(newVolunteer("organizer@example.invalid"))
        val event = capacityEvent(organizer, 1)
        val imageId = stagedImage(event.id, "retry-path")
        val otherImageId = stagedImage(event.id, "unrelated-path")
        val bytes = byteArrayOf(1, 2, 3)
        Mockito.`when`(temporaryFiles.read("retry-path")).thenReturn(bytes)
        Mockito.`when`(imageUploadService.uploadImageFromBytes(
            bytes, "image/png", "fixture.png"
        )).thenReturn(CompletableFuture.failedFuture(RuntimeException("temporary GCS failure")))
        imageUploadWorker.handleEventCreation(EventCreationMessage(event.id, imageIds = listOf(imageId)))
        val afterFirst = loadedEvent(event.id)
        assertEquals(ImageStatus.PENDING_UPLOAD, afterFirst.images.single { it.id == imageId }.status)
        assertEquals("retry-path", afterFirst.images.single { it.id == imageId }.temporaryFilePath)
        assertEquals("unrelated-path", afterFirst.images.single { it.id == otherImageId }.temporaryFilePath)
        Mockito.verify(temporaryFiles, Mockito.never()).delete("retry-path")

        Mockito.`when`(imageUploadService.uploadImageFromBytes(
            bytes, "image/png", "fixture.png"
        )).thenReturn(CompletableFuture.completedFuture("https://example.invalid/retried.png"))
        imageUploadWorker.handleEventCreation(EventCreationMessage(event.id, retryCount = 1, imageIds = listOf(imageId)))
        val saved = loadedEvent(event.id)
        assertEquals(ImageStatus.UPLOADED, saved.images.single { it.id == imageId }.status)
        assertEquals("https://example.invalid/retried.png", saved.images.single { it.id == imageId }.url)
        assertNull(saved.images.single { it.id == imageId }.temporaryFilePath)
        assertEquals(ImageStatus.PENDING_UPLOAD, saved.images.single { it.id == otherImageId }.status)
        Mockito.verify(temporaryFiles, Mockito.times(1)).delete("retry-path")
        imageUploadWorker.handleEventCreation(EventCreationMessage(event.id, retryCount = 1, imageIds = listOf(imageId)))
        // One read per actual attempt (initial failure + successful retry); duplicate is ignored.
        Mockito.verify(temporaryFiles, Mockito.times(2)).read("retry-path")
    }

    @Test
    fun `terminal upload failure marks only failed image and offers replacement on update`() {
        val organizer = users.saveAndFlush(newVolunteer("organizer@example.invalid"))
        val event = capacityEvent(organizer, 1)
        val failedId = stagedImage(event.id, "terminal-path")
        val unrelatedId = stagedImage(event.id, "another-batch")
        val bytes = byteArrayOf(8)
        Mockito.`when`(temporaryFiles.read("terminal-path")).thenReturn(bytes)
        Mockito.`when`(imageUploadService.uploadImageFromBytes(
            bytes, "image/png", "fixture.png"
        )).thenReturn(CompletableFuture.failedFuture(RuntimeException("permanent GCS failure")))
        imageUploadWorker.handleEventCreation(EventCreationMessage(
            event.id, retryCount = RabbitMQConfig.MAX_RETRY_COUNT, imageIds = listOf(failedId)
        ))
        val reloaded = loadedEvent(event.id)
        assertEquals(EventStatus.PUBLISHED, reloaded.status)
        assertEquals(ImageStatus.UPLOAD_FAILED, reloaded.images.single { it.id == failedId }.status)
        assertEquals(ImageStatus.PENDING_UPLOAD, reloaded.images.single { it.id == unrelatedId }.status)
        assertNull(reloaded.images.single { it.id == failedId }.temporaryFilePath)
        Mockito.verify(temporaryFiles).delete("terminal-path")
    }


    @Test
    fun `organizer can remove failed media placeholder without deleting the event`() {
        val organizer = users.saveAndFlush(newVolunteer("organizer@example.invalid"))
        val attendee = users.saveAndFlush(newVolunteer("attendee@example.invalid"))
        val event = capacityEvent(organizer, 1)
        registrations.saveAndFlush(Registration(user = attendee, event = event, status = RegistrationStatus.APPROVED))
        val failedId = stagedImage(event.id, "replaceable-file")
        eventStatusUpdater.handleUploadFailure(ImageUploadFailureMessage(
            event.id, emptyMap(), "failed", RabbitMQConfig.MAX_RETRY_COUNT, listOf(failedId)
        ))
        val updated = eventService.updateEvent(
            event.id,
            UpdateEventRequest(
                title = null, description = null, location = null, latitude = null,
                longitude = null, eventDateTime = null, endDateTime = null,
                registrationDeadline = null, maxParticipants = null, waitlistEnabled = null,
                tags = null, existingImageUrls = emptyList()
            ),
            organizer.email,
            null
        )
        assertEquals(event.id, updated.id)
        assertEquals(0, loadedEvent(event.id).images.size)
        assertEquals(1, registrations.count())
        assertEquals(EventStatus.PUBLISHED, loadedEvent(event.id).status)
    }

    @Test
    fun `organizer registrations stay protected after the owner warms the legacy Redis cache`() {
        val owner = users.saveAndFlush(newVolunteer("owner@example.invalid").copy(role = Role.EVENT_ORGANIZER))
        val stranger = users.saveAndFlush(newVolunteer("intruder@example.invalid").copy(role = Role.EVENT_ORGANIZER))
        val volunteer = users.saveAndFlush(newVolunteer("member@example.invalid"))
        val event = capacityEvent(owner, 3)
        registrations.saveAndFlush(Registration(user = volunteer, event = event, status = RegistrationStatus.APPROVED))

        val ownerList = managerService.getRegistrationsForEvent(event.id, owner.email)
        assertEquals(1, ownerList.size)
        assertEquals(volunteer.id, ownerList.single().volunteerId)

        // Reproduce the vulnerable event-ID-only cache entry. Authorized/unauthorized calls
        // must still pass the service-level ownership check, even if that key exists.
        val cache = requireNotNull(cacheManager.getCache("eventRegistrations"))
        cache.put(event.id, ownerList)
        assertNotNull(cache.get(event.id))
        assertThrows(UnauthorizedAccessException::class.java) {
            managerService.getRegistrationsForEvent(event.id, stranger.email)
        }
        assertThrows(UnauthorizedAccessException::class.java) {
            managerService.getRegistrationsForEvent(event.id, volunteer.email)
        }
        assertEquals(1, managerService.getRegistrationsForEvent(event.id, owner.email).size)
    }

    @Test
    fun `signed upload URLs require the same event permission as creating posts`() {
        val organizer = users.saveAndFlush(newVolunteer("owner@example.invalid").copy(role = Role.EVENT_ORGANIZER))
        val intruder = users.saveAndFlush(newVolunteer("intruder@example.invalid"))
        val approvedMember = users.saveAndFlush(newVolunteer("member@example.invalid"))
        val event = capacityEvent(organizer, 3)

        assertThrows(UnauthorizedAccessException::class.java) {
            postService.generateSignedUrl(event.id, intruder.email, "image/png", "no-access.png")
        }
        Mockito.verify(imageUploadService, Mockito.never()).generateSignedUrl(
            Mockito.anyString(), Mockito.anyString()
        )

        Mockito.`when`(imageUploadService.generateSignedUrl("image/png", "valid.png"))
            .thenReturn(Pair("https://example.invalid/signed-put", "https://example.invalid/public"))
        assertEquals(
            "https://example.invalid/signed-put",
            postService.generateSignedUrl(event.id, organizer.email, "image/png", "valid.png").first
        )

        registrations.saveAndFlush(
            Registration(user = approvedMember, event = event, status = RegistrationStatus.APPROVED)
        )
        assertEquals(
            "https://example.invalid/signed-put",
            postService.generateSignedUrl(event.id, approvedMember.email, "image/png", "valid.png").first
        )
        assertThrows(UnauthorizedAccessException::class.java) {
            postService.generateSignedUrl(event.id, intruder.email, "image/png", "valid.png")
        }
        Mockito.verify(imageUploadService, Mockito.times(2))
            .generateSignedUrl("image/png", "valid.png")
    }

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


    /** Run actual concurrent transactions against PostgreSQL, not a mocked in-memory repository. */
    private fun concurrentRequests(count: Int, operation: (Int) -> Boolean): List<Boolean> {
        val pool = Executors.newFixedThreadPool(count)
        val start = CountDownLatch(1)
        return try {
            val tasks = (0 until count).map { index ->
                pool.submit<Boolean> {
                    start.await()
                    operation(index)
                }
            }
            start.countDown()
            tasks.map { it.get(90, TimeUnit.SECONDS) }
        } finally {
            pool.shutdownNow()
        }
    }

    private fun capacityEvent(organizer: User, cap: Int): Event =
        events.saveAndFlush(
            Event(
                title = "VH-202 concurrency fixture",
                description = "Isolated PostgreSQL test",
                location = "Fixture",
                eventDateTime = LocalDateTime.of(2027, 6, 1, 9, 0),
                endDateTime = LocalDateTime.of(2027, 6, 1, 12, 0),
                status = EventStatus.PUBLISHED,
                creator = organizer,
                maxParticipants = cap,
                waitlistEnabled = true
            )
        )

    @Test
    fun `24 parallel organizer approvals cannot overbook three confirmed seats`() {
        val organizer = users.saveAndFlush(newVolunteer("owner@example.invalid"))
        val event = capacityEvent(organizer, 3)
        val ids = (0 until 24).map { index ->
            val user = users.saveAndFlush(newVolunteer("pending-$index@example.invalid"))
            registrations.saveAndFlush(Registration(user = user, event = event)).id
        }
        val results = concurrentRequests(24) { index ->
            try {
                managerService.updateRegistrationStatus(ids[index], RegistrationStatus.APPROVED, organizer.email)
                true
            } catch (_: ConflictException) {
                false
            }
        }
        assertEquals(3, results.count { it }, "Exactly three organizer approvals should succeed")
        assertEquals(3, registrations.countByEventIdAndStatus(event.id, RegistrationStatus.APPROVED))
        assertEquals(21, registrations.countByEventIdAndStatus(event.id, RegistrationStatus.PENDING))
    }

    @Test
    fun `20 concurrent identical registrations create only one row`() {
        val organizer = users.saveAndFlush(newVolunteer("owner@example.invalid"))
        val volunteer = users.saveAndFlush(newVolunteer("duplicate@example.invalid"))
        val event = capacityEvent(organizer, 2)
        val results = concurrentRequests(20) {
            try {
                registrationService.registerForEvent(event.id, volunteer.email)
                true
            } catch (_: ConflictException) {
                false
            }
        }
        assertEquals(1, results.count { it })
        assertEquals(1, registrations.count())
        assertEquals(1, registrations.countByEventIdAndStatus(event.id, RegistrationStatus.PENDING))
    }


    @Test
    fun `20 concurrent waitlist joins get unique FIFO positions and cancellation closes the gap`() {
        val organizer = users.saveAndFlush(newVolunteer("owner@example.invalid"))
        val confirmed = users.saveAndFlush(newVolunteer("confirmed@example.invalid"))
        val event = capacityEvent(organizer, 1)
        registrations.saveAndFlush(Registration(user = confirmed, event = event, status = RegistrationStatus.APPROVED))
        val applicants = (0 until 20).map { i ->
            users.saveAndFlush(newVolunteer("queue-$i@example.invalid"))
        }
        val accepted = concurrentRequests(20) { i ->
            registrationService.registerForEvent(event.id, applicants[i].email)
            true
        }
        assertEquals(20, accepted.count { it })
        assertEquals(1, registrations.countByEventIdAndStatus(event.id, RegistrationStatus.APPROVED))
        val ordered = waitlistService.getWaitlistForEvent(event.id)
        assertEquals((1..20).toList(), ordered.map { it.waitlistPosition })
        val firstEmail = ordered.first().user.email
        registrationService.cancelRegistration(event.id, firstEmail)
        assertEquals((1..19).toList(), waitlistService.getWaitlistForEvent(event.id).map { it.waitlistPosition })
        assertEquals(19, registrations.countByEventIdAndStatus(event.id, RegistrationStatus.WAITLISTED))
    }

    @Test
    fun `cancellation racing organizer promotion keeps FIFO and capacity`() {
        val organizer = users.saveAndFlush(newVolunteer("owner@example.invalid"))
        val approved = users.saveAndFlush(newVolunteer("approved@example.invalid"))
        val first = users.saveAndFlush(newVolunteer("first@example.invalid"))
        val second = users.saveAndFlush(newVolunteer("second@example.invalid"))
        val event = capacityEvent(organizer, 1)
        registrations.saveAndFlush(Registration(user = approved, event = event, status = RegistrationStatus.APPROVED))
        waitlistService.addToWaitlist(Registration(user = first, event = event))
        waitlistService.addToWaitlist(Registration(user = second, event = event))
        concurrentRequests(2) { index ->
            if (index == 0) registrationService.cancelRegistration(event.id, approved.email)
            else waitlistService.promoteFromWaitlist(event.id)
            true
        }
        assertEquals(1, registrations.countByEventIdAndStatus(event.id, RegistrationStatus.APPROVED))
        val firstRegistration = registrations.findWaitlistedRegistrationsByEventIdWithAssociations(event.id)
        assertEquals(1, firstRegistration.size)
        assertEquals(second.id, firstRegistration.single().user.id)
        assertEquals(1, firstRegistration.single().waitlistPosition)
        assertEquals(RegistrationStatus.APPROVED, registrations.findAllByEventIdWithAssociations(event.id).single { it.user.id == first.id }.status)
    }



    @Test
    fun `disabling waitlist cannot let new applicants skip existing queue`() {
        val organizer = users.saveAndFlush(newVolunteer("owner@example.invalid"))
        val waiting = users.saveAndFlush(newVolunteer("waiting@example.invalid"))
        val newcomer = users.saveAndFlush(newVolunteer("newcomer@example.invalid"))
        val event = capacityEvent(organizer, 2)
        registrations.saveAndFlush(
            Registration(user = waiting, event = event, status = RegistrationStatus.WAITLISTED, waitlistPosition = 1)
        )
        event.waitlistEnabled = false
        events.saveAndFlush(event)
        org.junit.jupiter.api.Assertions.assertThrows(
            com.cs2.volunteer_hub.exception.BadRequestException::class.java
        ) {
            registrationService.registerForEvent(event.id, newcomer.email)
        }
        assertEquals(0, registrations.countByEventIdAndStatus(event.id, RegistrationStatus.PENDING))
        assertEquals(1, registrations.countByEventIdAndStatus(event.id, RegistrationStatus.WAITLISTED))
    }

    @Test
    fun `organizer rejection of an approved volunteer promotes first waiter`() {
        val organizer = users.saveAndFlush(newVolunteer("owner@example.invalid"))
        val approved = users.saveAndFlush(newVolunteer("approved@example.invalid"))
        val first = users.saveAndFlush(newVolunteer("first@example.invalid"))
        val second = users.saveAndFlush(newVolunteer("second@example.invalid"))
        val event = capacityEvent(organizer, 1)
        val approvedRow = registrations.saveAndFlush(
            Registration(user = approved, event = event, status = RegistrationStatus.APPROVED)
        )
        waitlistService.addToWaitlist(Registration(user = first, event = event))
        waitlistService.addToWaitlist(Registration(user = second, event = event))
        managerService.updateRegistrationStatus(approvedRow.id, RegistrationStatus.REJECTED, organizer.email)
        assertEquals(RegistrationStatus.REJECTED, registrations.findById(approvedRow.id).get().status)
        assertEquals(1, registrations.countByEventIdAndStatus(event.id, RegistrationStatus.APPROVED))
        assertEquals(first.id, registrations.findAllByEventIdWithAssociations(event.id)
            .single { it.status == RegistrationStatus.APPROVED }.user.id)
        assertEquals(listOf(1), waitlistService.getWaitlistForEvent(event.id).map { it.waitlistPosition })
    }

    @Test
    fun `cancelled event blocks both organizer approval and manual waitlist promotion`() {
        val organizer = users.saveAndFlush(newVolunteer("owner@example.invalid"))
        val pending = users.saveAndFlush(newVolunteer("pending@example.invalid"))
        val event = capacityEvent(organizer, 1)
        val pendingRow = registrations.saveAndFlush(Registration(user = pending, event = event))
        event.status = EventStatus.CANCELLED
        events.saveAndFlush(event)
        assertThrows(ConflictException::class.java) {
            managerService.updateRegistrationStatus(pendingRow.id, RegistrationStatus.APPROVED, organizer.email)
        }
        assertNull(waitlistService.promoteFromWaitlist(event.id))
    }

    @Test
    fun `waitlisted and terminal registrations cannot bypass organizer transition policy`() {
        val organizer = users.saveAndFlush(newVolunteer("owner@example.invalid"))
        val pending = users.saveAndFlush(newVolunteer("pending@example.invalid"))
        val waiting = users.saveAndFlush(newVolunteer("waiting@example.invalid"))
        val event = capacityEvent(organizer, 1)
        val pendingRow = registrations.saveAndFlush(Registration(user = pending, event = event))
        val waitingRow = registrations.saveAndFlush(Registration(user = waiting, event = event, status = RegistrationStatus.WAITLISTED, waitlistPosition = 1))
        assertThrows(ConflictException::class.java) {
            managerService.updateRegistrationStatus(waitingRow.id, RegistrationStatus.APPROVED, organizer.email)
        }
        managerService.updateRegistrationStatus(pendingRow.id, RegistrationStatus.REJECTED, organizer.email)
        assertThrows(ConflictException::class.java) {
            managerService.updateRegistrationStatus(pendingRow.id, RegistrationStatus.APPROVED, organizer.email)
        }
        assertEquals(0, registrations.countByEventIdAndStatus(event.id, RegistrationStatus.APPROVED))
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
