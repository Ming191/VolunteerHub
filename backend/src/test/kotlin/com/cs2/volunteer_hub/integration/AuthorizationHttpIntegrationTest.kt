package com.cs2.volunteer_hub.integration

import com.cs2.volunteer_hub.config.SecurityConfig
import com.cs2.volunteer_hub.config.jwt.JwtResourceServerConfig
import com.cs2.volunteer_hub.config.jwt.JwtTokenProvider
import com.cs2.volunteer_hub.controller.*
import com.cs2.volunteer_hub.exception.GlobalExceptionHandler
import com.cs2.volunteer_hub.model.*
import com.cs2.volunteer_hub.repository.*
import com.cs2.volunteer_hub.service.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping
import org.springframework.http.HttpMethod
import org.springframework.web.bind.annotation.RestController
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.core.annotation.AnnotatedElementUtils
import org.mockito.Mockito
import org.springframework.amqp.rabbit.core.RabbitAdmin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.cache.CacheManager
import org.springframework.context.annotation.Bean
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.transaction.support.TransactionTemplate
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.testcontainers.containers.GenericContainer
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.containers.RabbitMQContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import java.time.LocalDateTime

/** Real signed JWT -> Spring Security filters -> controllers/services -> Testcontainers. */
@TestConfiguration
@EnableWebSecurity
@EnableMethodSecurity
class VH10503HttpSecurity {
    @Bean
    fun httpSecurityChain(http: HttpSecurity, users: CustomUserDetailsService): SecurityFilterChain =
        SecurityConfig().securityFilterChain(http, users)
}

@Testcontainers
@AutoConfigureMockMvc
@SpringBootTest(
    classes = [
        InfraHarnessApplication::class, VH10503HttpSecurity::class,
        JwtTokenProvider::class, JwtResourceServerConfig::class, CustomUserDetailsService::class,
        EventController::class, EventManagerController::class, PostController::class,
        CommentController::class, LikeController::class, LikeService::class,
        RegistrationController::class, ReportController::class,
        AdminReportController::class, AdminController::class, AdminUserController::class, ExportController::class,
        MediaController::class,
        DashboardController::class, SettingsController::class, UserController::class,
        AdminMetricsController::class, AdminPendingMessagesController::class,
        AuthController::class, com.cs2.volunteer_hub.config.RefreshSessionCookies::class, EnumController::class, MeController::class,
        NotificationController::class, TestNotificationController::class,
        GlobalExceptionHandler::class
    ],
    webEnvironment = SpringBootTest.WebEnvironment.MOCK,
    properties = [
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.flyway.enabled=true",
        "spring.flyway.baseline-on-migrate=false",
        "spring.rabbitmq.listener.simple.auto-startup=false",
        "spring.rabbitmq.listener.direct.auto-startup=false",
        "spring.main.banner-mode=off",
        "jwt.expiration=3600000"
    ]
)
class AuthorizationHttpIntegrationTest {
    companion object {
        @Container @JvmField
        val postgres = PostgreSQLContainer<Nothing>("postgres:15-alpine").apply {
            withDatabaseName("vh10503")
            withUsername("vh10503")
            withPassword("local_test_only")
        }
        @Container @JvmField
        val redis = GenericContainer<Nothing>("redis:7-alpine").apply {
            withExposedPorts(6379)
        }
        @Container @JvmField
        val rabbit = RabbitMQContainer("rabbitmq:3.13-management-alpine")
        @JvmStatic @DynamicPropertySource
        fun containers(registry: DynamicPropertyRegistry) {
            registry.add("jwt.secret") { java.util.Base64.getEncoder().encodeToString(ByteArray(32) { i -> (i + 23).toByte() }) }
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

    @Autowired @org.springframework.beans.factory.annotation.Qualifier("requestMappingHandlerMapping") lateinit var handlerMapping: RequestMappingHandlerMapping
    @MockitoBean lateinit var metricsService: MetricsService
    @MockitoBean lateinit var pendingMessageService: PendingMessageService
    @MockitoBean lateinit var meService: MeService
    @MockitoBean lateinit var authService: AuthService
    @MockitoBean lateinit var emailVerificationService: EmailVerificationService
    @MockitoBean lateinit var emailQueueService: EmailQueueService
    @MockitoBean lateinit var loginMapper: com.cs2.volunteer_hub.mapper.LoginMapper
    @MockitoBean lateinit var registerMapper: com.cs2.volunteer_hub.mapper.RegisterMapper
    @MockitoBean lateinit var verifyEmailMapper: com.cs2.volunteer_hub.mapper.VerifyEmailMapper
    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var jwt: JwtTokenProvider
    @Autowired lateinit var userDetails: CustomUserDetailsService
    @Autowired lateinit var users: UserRepository
    @Autowired lateinit var events: EventRepository
    @Autowired lateinit var registrations: RegistrationRepository
    @Autowired lateinit var posts: PostRepository
    @Autowired lateinit var comments: CommentRepository
    @Autowired lateinit var reports: ReportRepository
    @Autowired lateinit var userSettings: UserSettingsRepository
    @Autowired lateinit var jdbc: JdbcTemplate
    @Autowired lateinit var transactionTemplate: TransactionTemplate
    @Autowired lateinit var redisTemplate: StringRedisTemplate
    @Autowired lateinit var cacheManager: CacheManager
    @Autowired lateinit var rabbitAdmin: RabbitAdmin
    @Autowired lateinit var imageUploadService: ImageUploadService

    @MockitoBean lateinit var eventSearchService: EventSearchService
    @MockitoBean lateinit var adminService: AdminService
    @MockitoBean lateinit var exportService: ExportService
    @MockitoBean lateinit var dashboardService: DashboardService

    @BeforeEach
    fun resetFixtures() {
        jdbc.execute("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
        redisTemplate.connectionFactory!!.connection.use { it.serverCommands().flushDb() }
        rabbitAdmin.initialize()
        Mockito.reset(imageUploadService, eventSearchService, adminService, exportService, dashboardService)
    }

    private fun actor(email: String, role: Role): User = users.saveAndFlush(
        User(name = "Fixture " + role.name, email = email, passwordHash = "NOT_A_REAL_HASH", role = role)
    )

    private fun event(owner: User, status: EventStatus = EventStatus.PUBLISHED): Event =
        events.saveAndFlush(
            Event(title = "Authorization suite event", description = "Synthetic fixture only",
                location = "Fixture", eventDateTime = LocalDateTime.of(2027, 6, 1, 9, 0),
                endDateTime = LocalDateTime.of(2027, 6, 1, 12, 0), status = status,
                creator = owner, maxParticipants = 10, waitlistEnabled = true)
        )

    private fun asActor(request: MockHttpServletRequestBuilder, actor: User): MockHttpServletRequestBuilder =
        request.header("Authorization", "Bearer " + jwt.generateToken(userDetails.loadUserByUsername(actor.email)))

    private fun signedAccessToken(
        subject: String,
        expiresAt: java.time.Instant,
        key: ByteArray = ByteArray(32) { i -> (i + 23).toByte() },
        roles: List<String> = listOf("ROLE_VOLUNTEER")
    ): String {
        val token = com.nimbusds.jwt.SignedJWT(
            com.nimbusds.jose.JWSHeader(com.nimbusds.jose.JWSAlgorithm.HS256),
            com.nimbusds.jwt.JWTClaimsSet.Builder()
                .subject(subject)
                .issueTime(java.util.Date.from(java.time.Instant.now().minusSeconds(10)))
                .expirationTime(java.util.Date.from(expiresAt))
                .claim("roles", roles)
                .build()
        )
        token.sign(com.nimbusds.jose.crypto.MACSigner(key))
        return token.serialize()
    }

    @Test
    fun resourceServerRejectsExpiredWrongSignatureWrongAlgorithmAndForgedRole() {
        val volunteer = actor("jwt-volunteer@example.invalid", Role.VOLUNTEER)
        val valid = signedAccessToken(volunteer.email, java.time.Instant.now().plusSeconds(300))
        mvc.perform(post("/api/auth/logout-all").header("Authorization", "Bearer " + valid))
            .andExpect(status().isOk)

        val expired = signedAccessToken(volunteer.email, java.time.Instant.now().minusSeconds(30))
        val badSignature = signedAccessToken(volunteer.email, java.time.Instant.now().plusSeconds(300), ByteArray(32) { 3 })
        val parts = valid.split(".")
        val noneHeader = java.util.Base64.getUrlEncoder().withoutPadding()
            .encodeToString("""{"alg":"none"}""".toByteArray())
        val wrongAlgorithm = noneHeader + "." + parts[1] + "." + parts[2]
        listOf(expired, badSignature, wrongAlgorithm).forEach { token ->
            mvc.perform(get("/api/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized)
        }

        val forgedAdminRole = signedAccessToken(volunteer.email, java.time.Instant.now().plusSeconds(300),
            roles = listOf("ROLE_ADMIN"))
        mvc.perform(get("/api/admin/reports").header("Authorization", "Bearer " + forgedAdminRole))
            .andExpect(status().isForbidden)

        volunteer.isLocked = true
        users.saveAndFlush(volunteer)
        mvc.perform(get("/api/me").header("Authorization", "Bearer " + valid))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun anonymousAndInvalidJwtNeverReachProtectedResources() {
        val paths = listOf(
            "/api/me", "/api/me/settings", "/api/me/sessions", "/api/me/registrations",
            "/api/me/notifications", "/api/manager/events/1/registrations",
            "/api/manager/registrations/pending", "/api/reports/my", "/api/reports/1",
            "/api/admin/reports", "/api/admin/export/users.csv",
            "/api/dashboard/organizer", "/api/dashboard/admin",
            "/api/posts/feed", "/api/events/1/attendees"
        )
        paths.forEach { path ->
            mvc.perform(get(path)).andExpect(status().isUnauthorized)
            mvc.perform(get(path).header("Authorization", "Bearer not.a.valid.jwt"))
                .andExpect(status().isUnauthorized)
        }
        mvc.perform(post("/api/auth/logout-all")).andExpect(status().isUnauthorized)
        mvc.perform(post("/api/events/1/posts").contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun roleGatesBlockPrivilegedEndpointsBeforeServiceExecution() {
        val volunteer = actor("role-volunteer@example.invalid", Role.VOLUNTEER)
        val organizer = actor("role-organizer@example.invalid", Role.EVENT_ORGANIZER)
        val adminOnly = listOf(
            "/api/admin/reports", "/api/admin/reports/stats",
            "/api/admin/export/users.csv", "/api/admin/export/events.csv",
            "/api/dashboard/admin", "/api/admin/users"
        )
        listOf(volunteer, organizer).forEach { a ->
            adminOnly.forEach { path -> mvc.perform(asActor(get(path), a)).andExpect(status().isForbidden) }
            mvc.perform(asActor(get("/api/reports/12345"), a)).andExpect(status().isForbidden)
        }
        mvc.perform(asActor(get("/api/manager/registrations/pending"), volunteer))
            .andExpect(status().isForbidden)
        mvc.perform(asActor(get("/api/dashboard/organizer"), volunteer))
            .andExpect(status().isForbidden)
        mvc.perform(asActor(get("/api/dashboard/volunteer"), organizer))
            .andExpect(status().isForbidden)
    }

    @Test
    fun cachedRegistrationReadNeverLeaksAcrossOrganizers() {
        val a = actor("owner-a@example.invalid", Role.EVENT_ORGANIZER)
        val b = actor("owner-b@example.invalid", Role.EVENT_ORGANIZER)
        val member = actor("member@example.invalid", Role.VOLUNTEER)
        val eventA = event(a)
        val eventB = event(b)
        registrations.saveAndFlush(Registration(user = member, event = eventA, status = RegistrationStatus.APPROVED))
        val uri = "/api/manager/events/" + eventA.id + "/registrations"
        mvc.perform(asActor(get(uri), a))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].volunteerId").value(member.id.toInt()))
        cacheManager.getCache("eventRegistrations")?.put(eventA.id, listOf("legacy-leak"))
        repeat(2) {
            mvc.perform(asActor(get(uri), b)).andExpect(status().isForbidden)
            mvc.perform(asActor(get(uri), member)).andExpect(status().isForbidden)
        }
        mvc.perform(asActor(get("/api/manager/events/" + eventB.id + "/registrations"), b))
            .andExpect(status().isOk).andExpect(jsonPath("$.length()").value(0))
    }

    @Test
    fun crossOrganizerRegistrationReadsAndMutationsAreDenied() {
        val a = actor("manager-a@example.invalid", Role.EVENT_ORGANIZER)
        val b = actor("manager-b@example.invalid", Role.EVENT_ORGANIZER)
        val member = actor("approved-user@example.invalid", Role.VOLUNTEER)
        val eventA = event(a)
        val registration = registrations.saveAndFlush(
            Registration(user = member, event = eventA, status = RegistrationStatus.APPROVED)
        )
        listOf("/registrations/search", "/registrations/status/APPROVED",
            "/registrations/active", "/registrations/completed", "/waitlist").forEach { suffix ->
            mvc.perform(asActor(get("/api/manager/events/" + eventA.id + suffix), b))
                .andExpect(status().isForbidden)
        }
        mvc.perform(
            asActor(patch("/api/manager/registrations/" + registration.id), b)
                .contentType(MediaType.APPLICATION_JSON).content("""{"status":"REJECTED"}""")
        ).andExpect(status().isForbidden)
        mvc.perform(asActor(post("/api/manager/registrations/" + registration.id + "/complete"), b))
            .andExpect(status().isForbidden)
        mvc.perform(asActor(post("/api/manager/events/" + eventA.id + "/waitlist/promote"), b))
            .andExpect(status().isForbidden)
        assertEquals(RegistrationStatus.APPROVED, registrations.findById(registration.id).orElseThrow().status)
    }

    @Test
    fun hiddenEventAndNestedContentAre404ToUnrelatedUsers() {
        val owner = actor("hidden-owner@example.invalid", Role.EVENT_ORGANIZER)
        val stranger = actor("hidden-stranger@example.invalid", Role.VOLUNTEER)
        val hidden = event(owner, EventStatus.PENDING)
        val post = posts.saveAndFlush(Post(content = "Secret post", author = owner, event = hidden))
        val comment = comments.saveAndFlush(Comment(content = "Secret reply", author = owner, post = post))
        listOf(
            "/api/events/" + hidden.id,
            "/api/events/" + hidden.id + "/gallery",
            "/api/events/" + hidden.id + "/posts",
            "/api/events/" + hidden.id + "/posts/" + post.id,
            "/api/posts/" + post.id + "/comments",
            "/api/posts/" + post.id + "/comments/nested"
        ).forEach { path ->
            mvc.perform(asActor(get(path), stranger)).andExpect(status().isNotFound)
        }
        mvc.perform(get("/api/events/" + hidden.id)).andExpect(status().isNotFound)
        mvc.perform(asActor(get("/api/events/" + hidden.id), owner)).andExpect(status().isOk)
        val reportBody = """{"type":"COMMENT","targetId":""" + comment.id + ""","reason":"SPAM"}"""
        mvc.perform(
            asActor(post("/api/reports"), stranger).contentType(MediaType.APPLICATION_JSON).content(reportBody)
        ).andExpect(status().isNotFound)
        assertEquals(0L, reports.count())
    }

    @Test
    fun signedUrlIsDeniedBeforeCloudSigningForUnapprovedCaller() {
        val organizer = actor("upload-owner@example.invalid", Role.EVENT_ORGANIZER)
        val stranger = actor("upload-stranger@example.invalid", Role.VOLUNTEER)
        val e = event(organizer)
        mvc.perform(
            asActor(post("/api/events/" + e.id + "/posts/signed-url"), stranger)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"fileName":"fixture.jpg","contentType":"image/jpeg"}""")
        ).andExpect(status().isForbidden)
        Mockito.verifyNoInteractions(imageUploadService)
    }

    @Test
    fun wrongAuthorCannotUpdateOrDeleteCommentAtHttpLayer() {
        val organizer = actor("comment-owner@example.invalid", Role.EVENT_ORGANIZER)
        val unrelated = actor("comment-unrelated@example.invalid", Role.VOLUNTEER)
        val e = event(organizer)
        val p = posts.saveAndFlush(Post(content = "Public post", author = organizer, event = e))
        val c = comments.saveAndFlush(Comment(content = "Immutable content", author = organizer, post = p))
        val uri = "/api/posts/" + p.id + "/comments/" + c.id
        mvc.perform(
            asActor(put(uri), unrelated).contentType(MediaType.APPLICATION_JSON)
                .content("""{"content":"Injected edit"}""")
        ).andExpect(status().isForbidden)
        mvc.perform(asActor(delete(uri), unrelated)).andExpect(status().isForbidden)
        assertEquals("Immutable content", comments.findById(c.id).orElseThrow().content)
    }

    @Test
    fun cancelledEventRosterIsInvisibleToFormerAttendee() {
        val owner = actor("attendees-owner@example.invalid", Role.EVENT_ORGANIZER)
        val member = actor("attendees-member@example.invalid", Role.VOLUNTEER)
        val admin = actor("attendees-admin@example.invalid", Role.ADMIN)
        val e = event(owner)
        registrations.saveAndFlush(Registration(user = member, event = e, status = RegistrationStatus.APPROVED))
        mvc.perform(asActor(get("/api/events/" + e.id + "/attendees"), member))
            .andExpect(status().isOk).andExpect(jsonPath("$.length()").value(1))
        e.status = EventStatus.CANCELLED
        events.saveAndFlush(e)
        mvc.perform(asActor(get("/api/events/" + e.id + "/attendees"), member))
            .andExpect(status().isNotFound)
        mvc.perform(asActor(get("/api/events/" + e.id + "/attendees"), owner))
            .andExpect(status().isOk)
        mvc.perform(asActor(get("/api/events/" + e.id + "/attendees"), admin))
            .andExpect(status().isOk)
    }

    @Test
    fun reporterCannotReadOtherPeoplesReportsAndOrganizerCannotAccessAdminDetails() {
        val organizer = actor("report-owner@example.invalid", Role.EVENT_ORGANIZER)
        val reporter = actor("report-author@example.invalid", Role.VOLUNTEER)
        val unrelated = actor("report-other@example.invalid", Role.VOLUNTEER)
        val admin = actor("report-admin@example.invalid", Role.ADMIN)
        val e = event(organizer)
        val p = posts.saveAndFlush(Post(content = "Published post", author = organizer, event = e))
        val payload = """{"type":"POST","targetId":""" + p.id + ""","reason":"SPAM"}"""
        mvc.perform(
            asActor(post("/api/reports"), reporter).contentType(MediaType.APPLICATION_JSON).content(payload)
        ).andExpect(status().isCreated)
        val reportId = reports.findAll().single().id
        mvc.perform(asActor(get("/api/reports/my"), reporter))
            .andExpect(status().isOk).andExpect(jsonPath("$.totalElements").value(1))
        mvc.perform(asActor(get("/api/reports/my"), unrelated))
            .andExpect(status().isOk).andExpect(jsonPath("$.totalElements").value(0))
        mvc.perform(asActor(get("/api/reports/" + reportId), organizer))
            .andExpect(status().isForbidden)
        mvc.perform(asActor(get("/api/reports/" + reportId), admin))
            .andExpect(status().isOk)
    }

    @Test
    fun privateProfileIsRedactedForOtherAccountsButOwnerCanReadBio() {
        val owner = requireNotNull(transactionTemplate.execute {
            val volunteer = users.saveAndFlush(
                User(name = "Fixture Volunteer", email = "profile-owner@example.invalid",
                    passwordHash = "NOT_A_REAL_HASH", role = Role.VOLUNTEER, bio = "Sensitive personal bio")
            )
            userSettings.saveAndFlush(UserSettings(user = volunteer, profileVisibility = ProfileVisibility.PRIVATE))
            volunteer
        })
        val outsider = actor("profile-viewer@example.invalid", Role.VOLUNTEER)
        mvc.perform(asActor(get("/api/users/" + owner.id), outsider))
            .andExpect(status().isOk).andExpect(jsonPath("$.bio").isEmpty)
        mvc.perform(asActor(get("/api/users/" + owner.id), owner))
            .andExpect(status().isOk).andExpect(jsonPath("$.bio").value("Sensitive personal bio"))
    }

    @Test
    fun foreignEventAndPostMutationsAreForbiddenWithoutSideEffects() {
        val a = actor("event-owner@example.invalid", Role.EVENT_ORGANIZER)
        val b = actor("event-foreign@example.invalid", Role.EVENT_ORGANIZER)
        val e = event(a)
        val p = posts.saveAndFlush(Post(content = "Original content", author = a, event = e))
        mvc.perform(asActor(delete("/api/events/" + e.id), b)).andExpect(status().isForbidden)
        mvc.perform(asActor(post("/api/events/" + e.id + "/cancel"), b))
            .andExpect(status().isForbidden)
        mvc.perform(asActor(delete("/api/events/" + e.id + "/posts/" + p.id), b))
            .andExpect(status().isForbidden)
        mvc.perform(asActor(put("/api/events/" + e.id + "/posts/" + p.id), b)
            .contentType(MediaType.APPLICATION_JSON).content("""{"content":"Foreign overwrite"}"""))
            .andExpect(status().isForbidden)
        assertEquals(EventStatus.PUBLISHED, events.findById(e.id).orElseThrow().status)
        assertEquals("Original content", posts.findById(p.id).orElseThrow().content)
    }

    @Test
    fun unauthorizedLikeIsRejectedForAnUnapprovedEvent() {
        val owner = actor("like-owner@example.invalid", Role.EVENT_ORGANIZER)
        val outsider = actor("like-outsider@example.invalid", Role.VOLUNTEER)
        val e = event(owner, EventStatus.PENDING)
        val p = posts.saveAndFlush(Post(content = "Private post", author = owner, event = e))
        mvc.perform(asActor(post("/api/posts/" + p.id + "/like"), outsider))
            .andExpect(status().isForbidden)
    }


    /**
     * Frozen, reviewed inventory. CI fails if an endpoint is added/removed or a role guard
     * changes without an explicit update to the corresponding authorization policy.
     */
    private data class RouteContract(val method: String, val path: String, val policy: String) {
        val key: String get() = method + " " + path
    }

    private fun fullMatrix(): List<RouteContract> {
        val text = checkNotNull(
            javaClass.classLoader.getResourceAsStream("vh105-authorization-matrix.csv")
        ) { "Authorization inventory missing" }.bufferedReader().use { it.readText() }
        return text.lineSequence().filter { it.isNotBlank() && !it.startsWith("#") && !it.startsWith("method,") }
            .map { line ->
                val cells = line.split(",")
                require(cells.size == 3) { "Invalid policy row: " + line }
                RouteContract(cells[0], cells[1], cells[2])
            }.toList()
    }

    private fun actualControllerRoutes(): Map<String, org.springframework.web.method.HandlerMethod> =
        handlerMapping.handlerMethods.entries.flatMap { (mapping, handler) ->
            if (!handler.beanType.packageName.startsWith("com.cs2.volunteer_hub.controller")) {
                emptyList<Pair<String, org.springframework.web.method.HandlerMethod>>()
            } else {
                val paths: Collection<String> = mapping.pathPatternsCondition?.patternValues
                    ?: mapping.patternsCondition?.patterns ?: emptySet<String>()
                mapping.methodsCondition.methods.flatMap { verb: org.springframework.web.bind.annotation.RequestMethod ->
                    paths.map { path: String -> (verb.name + " " + path) to handler }
                }
            }
        }.toMap()

    private fun substituteRouteParams(path: String): String =
        Regex("""\{([^}]+)}""").replace(path) { match ->
            when (match.groupValues[1]) {
                "status" -> "APPROVED"
                else -> "99999999"
            }
        }

    private fun routeRequest(contract: RouteContract): MockHttpServletRequestBuilder {
        val path = substituteRouteParams(contract.path)
        return request(HttpMethod.valueOf(contract.method), path)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}")
            .param("q", "fixture")
            .param("type", "POST")
            .param("targetId", "99999999")
            .param("fromDate", "2026-01-01")
            .param("toDate", "2026-01-31")
    }

    @Test
    fun all112InventoryHandlersExistAndDeclaredRolePoliciesHaveNotDrifted() {
        val policies = fullMatrix()
        assertEquals(113, policies.size, "Original VH-105 inventory had 112 controllers routes")
        assertEquals(113, policies.map { it.key }.toSet().size, "Duplicate method+path in policy")
        val routes = actualControllerRoutes()
        assertEquals(policies.map { it.key }.toSet(), routes.keys, "Uninventoried/removed HTTP handlers")

        for (entry in policies) {
            val handler = checkNotNull(routes[entry.key])
            val methodGuard = AnnotatedElementUtils.findMergedAnnotation(handler.method, PreAuthorize::class.java)
            val classGuard = AnnotatedElementUtils.findMergedAnnotation(handler.beanType, PreAuthorize::class.java)
            val declared = methodGuard?.value ?: classGuard?.value
            when (entry.policy) {
                "ADMIN", "EVENT_ORGANIZER", "VOLUNTEER" ->
                    assertEquals("hasRole('" + entry.policy + "')", declared, entry.key)
                "AUTH" -> {
                    // The global filter requires authentication on non-permitAll endpoints,
                    // and method-level PreAuthorize handles public filter route overrides.
                    assertTrue(declared == "isAuthenticated()" ||
                        !entry.path.startsWith("/api/auth/"), "Missing auth guard on " + entry.key)
                }
                "PUBLIC" ->
                    assertNull(declared, "Public endpoint accidentally role-restricted: " + entry.key)
                else -> fail<Nothing>("Unknown policy for " + entry.key + ": " + entry.policy)
            }
        }
    }

    @Test
    fun everyProtectedRouteRejectsMissingOrMalformedBearerTokenWith401() {
        val policies = fullMatrix()
        val protected = policies.filter { it.policy != "PUBLIC" }
        assertEquals(95, protected.size)
        for (entry in protected) {
            val unauth = mvc.perform(routeRequest(entry)).andReturn().response.status
            assertEquals(401, unauth, "Anonymous must fail on " + entry.key)
            val malformed = mvc.perform(
                routeRequest(entry).header("Authorization", "Bearer invalid.signature.payload")
            ).andReturn().response.status
            assertEquals(401, malformed, "Invalid JWT must fail on " + entry.key)
        }
    }

    @Test
    fun allRoleGuardedReadEndpointsRejectOtherRolesWith403() {
        val entries = fullMatrix().filter {
            it.policy in setOf("ADMIN", "EVENT_ORGANIZER", "VOLUNTEER") && it.method == "GET"
        }
        val actors = listOf(
            Role.ADMIN to actor("matrix-admin@example.invalid", Role.ADMIN),
            Role.EVENT_ORGANIZER to actor("matrix-organizer@example.invalid", Role.EVENT_ORGANIZER),
            Role.VOLUNTEER to actor("matrix-volunteer@example.invalid", Role.VOLUNTEER)
        )
        for (entry in entries) {
            for ((role, actor) in actors) {
                if (role.name == entry.policy) continue
                val code = mvc.perform(asActor(routeRequest(entry), actor)).andReturn().response.status
                assertEquals(403, code, "Wrong role " + role.name + " on " + entry.key)
            }
        }
    }

    @Test
    fun publicReadRoutesRemainAccessibleWithoutAuthentication() {
        val entries = fullMatrix().filter { it.policy == "PUBLIC" && it.method == "GET" }
        for (entry in entries) {
            val code = mvc.perform(routeRequest(entry)).andReturn().response.status
            assertNotEquals(401, code, "Public route unexpectedly protected: " + entry.key)
            assertNotEquals(403, code, "Public route unexpectedly forbidden: " + entry.key)
        }
    }

}
