# VH-201: PostgreSQL migrations with Flyway

## Contract

`V1__initial_schema.sql` captures the **17-table legacy Hibernate schema** from a clean, disposable PostgreSQL 16 database. The snapshot includes identity sequences, indexes, uniqueness, check constraints and foreign keys. It contains no real data or credentials. Always append V2, V3, etc. for future changes; never edit an already-applied version.

- `spring.jpa.hibernate.ddl-auto=validate`: Hibernate validates mapping and **never modifies** the schema.
- Flyway applies schema updates before Hibernate starts, with `validate-on-migrate=true`.
- `spring.flyway.baseline-on-migrate=${VH_FLYWAY_BASELINE_ON_MIGRATE:false}` defaults to false. Never keep the switch enabled for routine deployments.
- `spring.flyway.baseline-version=1` allows adopting a legacy V1-equivalent database without replaying CREATE statements over its tables.

## Fresh installation

Point the application at an **empty** PostgreSQL database using `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD`. Configure `JWT_SECRET` and the existing RabbitMQ, Redis, FCM and GCS integrations. Start the backend normally. Flyway creates all tables plus `flyway_schema_history` and Hibernate validates them.

Check:

```sql
SELECT installed_rank, version, description, type, success
FROM flyway_schema_history ORDER BY installed_rank;
```

Expect version 1, type `SQL`, success `true`. Normal subsequent boot must not reapply it.

## Existing legacy database (one-time adoption)

1. Stop writers, take and test an external PostgreSQL backup. **Never** point test scripts at personal/prod volumes.
2. Inspect the current schema against V1: all tables, columns, enum CHECKs, identities, unique indexes, FKs. Hibernate `ddl-auto=update` may have left a schema different from V1; reconcile differences explicitly before proceeding.
3. The default first start correctly **refuses** any populated schema that has no Flyway history. For a verified V1-equivalent schema only, set `VH_FLYWAY_BASELINE_ON_MIGRATE=true` for *one startup*, with the usual application environment variables.
4. Flyway records a `BASELINE` at version 1 (and intentionally does not run V1). Hibernate validates. Verify a representative sample of existing records and compare row counts to the backup.
5. Remove the opt-in and restart normally; Flyway should report V1 current with no pending migrations.

Never permanently enable baseline-on-migrate or bypass mismatches with `ddl-auto=update` / `flyway repair`. For future model changes: implement a reviewed `V2__*.sql`, test on an empty database and a restored legacy copy, then deploy.

## Verification

- Local test DBs: fresh Flyway V1 + Hibernate validation; nonempty legacy DB defaults to migration refusal; explicitly baselined schema with an existing row is accepted without deleting data; subsequent restart works.
- CI includes JUnit/Testcontainers PostgreSQL tests of fresh schema migration, guardrails, legacy baseline, and repeatability.
- Rollback of destructive schema changes is **not** automatic; use forward-compatible expand/contract migrations and a tested backup/restore plan.

The existing PostgreSQL Docker Compose service uses v15. The migration DDL was extracted from PostgreSQL v16; its JUnit/Testcontainers suite **passed on PostgreSQL 15**, and both fresh and legacy application startups were verified locally on PostgreSQL 16. Still rehearse on a restored copy of the actual deployment DB before deploying.
