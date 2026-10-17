# VH-202: Registration, organizer approval, and FIFO waitlist concurrency

## Capacity contract

- **Only APPROVED registrations occupy a confirmed seat.** PENDING is an application awaiting organizer approval, and does **not** reserve capacity. Consequently a capped event may temporarily have more pending applicants than available seats. Organizer approval must reject (HTTP 409) after confirmed capacity is exhausted.
- A newly registering volunteer becomes PENDING if confirmed seats remain and there is no existing waitlist. When the event is full (or a FIFO waitlist already exists), a new volunteer becomes WAITLISTED if waitlist is enabled, or receives a domain error if disabled.
- All changes that may affect confirmed seats or FIFO positions acquire the **same PostgreSQL PESSIMISTIC_WRITE lock on the parent events row** inside a transaction. This includes volunteer registration/cancellation, organizer approvals/rejections, waitlist add/promote/reorder and completion, as well as organizer capacity edits, event deletion and cancellation. Lock the event **before** loading mutable registration state; do not lock registration rows before the event.
- PostgreSQL's existing unique (event_id,user_id) DB constraint remains the final duplicate guard; duplicate attempts return a conflict from the service while under the event lock.
- A PENDING registration may become APPROVED (while the event is published, unstarted and confirmed capacity exists) or REJECTED. APPROVED and WAITLISTED may become REJECTED; WAITLISTED cannot bypass FIFO through direct organizer approval. REJECTED/CANCELLED/COMPLETED are terminal; identical status repeats are idempotent.
- Promotion is allowed only while registrations are open and a confirmed seat is available. Cancelling or rejecting an APPROVED registration flushes the mutation before attempting promotion. Cancelling a waitlisted registration deletes/flushed first, then compacts remaining queue positions; no ghost position remains.
- API conflict responses use the existing `ConflictException` (409) for invalid transitions and full organizer approvals.

## Regression evidence

`InfrastructureIntegrationTest` uses actual PostgreSQL 15 Testcontainers and service transactions. It tests 24 concurrent organizer approvals competing for 3 slots (exactly 3 succeed), 20 simultaneous duplicate submissions (one row), 20 simultaneous waitlist joins (distinct FIFO positions), waitlist cancellation compaction (positions 1..19), a cancellation/promote race, organizer rejection that triggers FIFO promotion, cancelled-event approval denial, and invalid/terminal transitions. The existing WaitlistService / EventCapacityService, RabbitMQ, Redis, Flyway, and unique-constraint regression tests continue to run.

```powershell
cd E:\VolunteerHub\backend
.\gradlew.bat test jacocoTestReport --no-daemon
```

No production database or queue is accessed. The test fixtures use reserved `.invalid` addresses and a disposable broker.

## Limitations / follow-ups

- A parent-row lock serializes writers within these service paths. **Other write paths**, including changes to event maximum capacity and future jobs, must follow the same event-first lock discipline. Their own business/lifecycle validations belong in VH-203/VH-207.
- This ticket deliberately does not add a partial unique index for waitlist positions to existing databases; legacy data may contain duplicates. Audit/repair legacy queue data before introducing a new DB-level unique constraint under Flyway.
- Sending notifications during the database transaction is not guaranteed atomic with commit. Reliable after-commit delivery needs VH-204 transactional outbox; it is not falsely claimed here.
- Cancellation still removes the registration row as in the current product contract; durable cancellation/audit history is tracked by VH-210.
