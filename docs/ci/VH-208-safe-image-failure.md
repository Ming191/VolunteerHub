# VH-208 — Safe event media upload failure handling

## Problem and invariant

Previously `EventStatusUpdater.handleUploadFailure` unconditionally invoked
`eventRepository.deleteById(eventId)`. Failed media from an **update** to a
PUBLISHED event could therefore cascade-delete the event, its approved/pending/
waitlisted registrations and gallery images.

**Invariant:** failure of an asynchronous media upload can change only the
affected image rows. It MUST NEVER delete an Event or its registrations.
This also applies to initial PENDING event creation, repeated RabbitMQ delivery,
out-of-order success/failure notifications and old queued messages.

## Resolution

- Each queued `EventCreationMessage` carries an image-ID snapshot; old messages
  without IDs remain readable for compatibility. A late retry only sees its batch,
  not newly staged uploads from a subsequent edit.
- `ImageUploadWorker` locks the event row and chooses **only pending images from
  the message's batch**. Uploaded images are saved as UPLOADED (retaining their
  URL); failures keep PENDING_UPLOAD and the temporary file through retry
  attempts. After exhausting `MAX_RETRY_COUNT`, only unsuccessful image rows
  become UPLOAD_FAILED. Temp files are removed after transaction commit.
- The worker publishes RabbitMQ status/retry messages after database commit.
  A process-local Guava duplicate cache has been removed in favor of idempotent
  database status checks; duplicate success/failure messages do not downgrade
  completed uploads or delete previous files.
- `EventStatusUpdater` records successes and targeted failures by image ID.
  A legacy failure message with no image IDs only marks pending entries whose
  temporary file is already missing. It NEVER deletes a parent event, registrations
  or other successful images, nor does it roll back a different batch.
- `EventService.updateEvent` drops failed placeholder entries on a subsequent
  upload or when `existingImageUrls` is supplied, allowing organizers to replace
  failed media through the **existing update endpoint**. Failed placeholder images
  are excluded from the image quota for replacement.
- `EventResponse.failedImageCount` exposes terminal failures so the frontend
  can show a retry/re-upload indicator. UPLOAD_FAILED is terminal for that original
  image; a replacement upload stages a new image row.

## Verification

`backend/src/test/.../InfrastructureIntegrationTest.kt` includes real PostgreSQL
and RabbitMQ regression tests for:
1. Published event with approved and waitlisted attendees: uploaded existing image
   survives a failed new image, including repeated/late success/failure messages.
2. Initial PENDING event remains in database on terminal upload failure.
3. Image-upload worker preserves temporary file during retry, later succeeds,
   and cannot consume an unrelated image batch.
4. Terminal failure updates only its target image, clears its temp file and
   leaves other batches untouched.

Run `cd backend && ./gradlew test jacocoTestReport --no-daemon`; on Windows use
`gradlew.bat`. CI enforces `registration-security-tests`.

## Known limitations

- Delayed outbox delivery on a RabbitMQ outage is not guaranteed yet: although
  messages are sent only after DB commit, a process crash between commit and
  publish can lose a retry signal. This belongs to VH-204 transactional outbox.
- Holding the event row lock while calling the external image service is
  correctness-first but can block event updates temporarily. Future VH-205
  should claim image jobs with a short transaction/lease plus idempotency token.
- Successful objects uploaded to GCS before DB commit are not automatically
  rolled back if the DB transaction aborts. Garbage collection for orphaned
  uploads and cross-service exactly-once semantics need dedicated work.
- There is no one-click replay of an UPLOAD_FAILED original whose temp bytes have
  been purged; organizers re-upload a new file via Update Event. The retained
  failed count can power an explicit UI retry action later.
