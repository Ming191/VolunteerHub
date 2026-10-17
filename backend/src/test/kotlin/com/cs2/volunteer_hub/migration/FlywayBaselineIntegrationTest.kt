package com.cs2.volunteer_hub.migration

import org.flywaydb.core.Flyway
import org.flywaydb.core.api.FlywayException
import org.junit.jupiter.api.*
import org.testcontainers.containers.PostgreSQLContainer
import java.sql.DriverManager

/** Verify real PostgreSQL migrations on disposable databases. */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class FlywayBaselineIntegrationTest {
    private val postgres = PostgreSQLContainer<Nothing>("postgres:15-alpine").apply {
        withDatabaseName("vh201_migration_test")
        withUsername("vh201")
        withPassword("local_test_only")
    }

    @BeforeAll fun startDb() { postgres.start() }
    @AfterAll fun stopDb() { postgres.stop() }

    @BeforeEach fun clearSchema() {
        DriverManager.getConnection(postgres.jdbcUrl, postgres.username, postgres.password).use { conn ->
            conn.createStatement().use { stmt ->
                stmt.execute("DROP SCHEMA IF EXISTS public CASCADE")
                stmt.execute("CREATE SCHEMA public")
            }
        }
    }

    private fun migrator(legacy: Boolean = false) = Flyway.configure()
        .dataSource(postgres.jdbcUrl, postgres.username, postgres.password)
        .locations("classpath:db/migration")
        .baselineVersion("1")
        .baselineOnMigrate(legacy)
        .validateOnMigrate(true)
        .load()

    private fun execute(sql: String) {
        DriverManager.getConnection(postgres.jdbcUrl, postgres.username, postgres.password).use { conn ->
            conn.createStatement().use { it.execute(sql) }
        }
    }
    private fun count(sql: String): Long =
        DriverManager.getConnection(postgres.jdbcUrl, postgres.username, postgres.password).use { conn ->
            conn.createStatement().use { stmt ->
                stmt.executeQuery(sql).use { rs -> rs.next(); rs.getLong(1) }
            }
        }

    @Test fun `fresh database migrates exactly once`() {
        val flyway = migrator()
        Assertions.assertEquals(1, flyway.migrate().migrationsExecuted)
        Assertions.assertEquals(17, count("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name <> 'flyway_schema_history'"))
        Assertions.assertEquals(1, count("SELECT COUNT(*) FROM flyway_schema_history WHERE version='1' AND type='SQL' AND success"))
        Assertions.assertTrue(count("SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema='public' AND constraint_type='FOREIGN KEY'") > 0)
        Assertions.assertEquals(0, flyway.migrate().migrationsExecuted)
        Assertions.assertTrue(flyway.validateWithResult().validationSuccessful)
    }

    @Test fun `legacy database requires explicit baseline and preserves rows`() {
        // Simulate a V1-equivalent pre-Flyway schema, including data.
        migrator().migrate()
        execute("DROP TABLE flyway_schema_history")
        execute("INSERT INTO users(name,email,password_hash,role,is_locked,is_email_verified,is_deleted,created_at) VALUES ('Test Legacy','legacy@example.invalid','TEST_ONLY_HASH','VOLUNTEER',false,false,false,now())")
        Assertions.assertThrows(FlywayException::class.java) { migrator().migrate() }
        Assertions.assertEquals(1, count("SELECT COUNT(*) FROM users WHERE email='legacy@example.invalid'"))

        Assertions.assertEquals(0, migrator(legacy = true).migrate().migrationsExecuted)
        Assertions.assertEquals(1, count("SELECT COUNT(*) FROM flyway_schema_history WHERE version='1' AND type='BASELINE' AND success"))
        Assertions.assertEquals(1, count("SELECT COUNT(*) FROM users WHERE email='legacy@example.invalid'"))
        Assertions.assertEquals(0, migrator().migrate().migrationsExecuted)
        Assertions.assertTrue(migrator().validateWithResult().validationSuccessful)
    }
}
