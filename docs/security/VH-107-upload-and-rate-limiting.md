# VH-107: Upload and rate limiting threat model / regression

## Implemented

- `ClientIpResolver`: default ignores untrusted X-Forwarded-For, using socket peer IP. Operator may set `RATE_LIMIT_TRUSTED_PROXIES` to exact immediate proxy IPs; resolver walks forwarded chain right-to-left to avoid a spoofed first hop. Trusted proxies must APPEND the socket peer they observed and block direct-to-app access.
- Per-IP quotas for login, register, refresh, resend verification, signed image URL, post creation and profile upload. Redis-backed Bucket4j remains the enforcement store. Empty trusted proxy list is fail-closed against IP spoofing, but a large reverse-proxy NAT requires explicit proxy configuration before release.
- `FileValidationService` checks count, size, allowed declared type, original filename safety, image magic and pixel bounds; ImageIO checks JPEG/PNG dimensions and encoded structure. WebP VP8X header is structurally inspected (this is NOT a full WebP decode; use a security-reviewed decoder before accepting untrusted WebP in production).
- Signed URL requires authenticated event posting access, filename/type allowlist and client-declared `sizeBytes` 1..10MB. GCS signed PUT includes `x-goog-if-generation-match: 0` to prevent overwriting objects; frontend sends the same request header.
- Signed URLs and resulting public URLs are not interchangeable trust proofs: Redis `PostUploadGrantService` binds a public URL to the creator user ID and event ID, expires after 20 minutes and requires one-use atomic consumption. The post creation path rejects forged, replayed and cross-event URLs. At consumption GCS metadata and actual bytes are checked against MIME, maximum bytes and image bounds. No post record is created on a grant check failure.

## Local verification

- `UploadAndProxySecurityTest`: malformed/spoofed client forwarding, forged image bytes, MIME mismatch, filename traversal, size limit, valid PNG.
- `InfrastructureIntegrationTest.vh107*`: real Redis Testcontainers validates grant owner/event, cross-event denial and single-use behavior.
- Existing authorization suite must continue passing. Full backend Gradle tests with Testcontainers and JaCoCo, plus frontend checks, required before merging.

## Deployment configuration / remaining gates

1. Configure trusted reverse-proxy IPs from the actual deployment network, not from client-provided headers. Block direct access to the origin. Verify 429 under spoofed headers via deployed proxy and two distinct clients.
2. GCS bucket CORS must allow PUT and request headers `Content-Type` plus `x-goog-if-generation-match`; browser upload/GET must be exercised on staging.
3. The pre-sign `sizeBytes` is caller-declared; although backend rejects oversized stored blobs before accepting a post, **the current GCS signed PUT does not cryptographically bind Content-Length**. An attacker could upload an oversized orphan object and incur storage/ingress cost. To satisfy the storage-ingress quota release gate, use a signed content length or an upload proxy/policy and verify its behavior with real GCS.
4. Attach a GCS lifecycle cleanup policy for unclaimed objects; the Redis grant TTL does not delete blob data. Confirm an expired grant rejects post binding and orphan objects are eventually purged.
5. Full WebP decoder validation should be added or WebP uploads disabled at deployment policy. Magic signature checks are not a replacement for decoding.
6. Rate limits are per IP as implemented before authentication. For networks behind a common NAT, tune quota and documented proxy trust appropriately; do not blindly trust forwarded headers.

Release disposition: code-level hardening can merge with passing tests; VH-107 as a full P0 release gate remains pending actual storage ingress controls, GCS lifecycle/CORS and deployed proxy verification. No production secrets are included.

## Local-first follow-up after RustFS migration

The GCS-only gates above are historical. PRs #92 and #103 moved local uploads to
RustFS and verified the actual Nginx 10 MiB limit, CORS preflight, and signed
PUT create-only semantics with Testcontainers. Production cloud deployment remains
deferred. Local persistence and abandoned object retention are separate concerns.

### Orphan image retention (opt-in)

`OrphanImageCleanupService` lists only randomized `images/` keys older than 48
hours, cross-checks persisted event/post image URLs and user profile-picture URLs,
and removes at most 100 *unreferenced* objects per daily pass. Failed deletions
are retried on the next run. It aborts without deleting anything if the database
reference query fails. The delay is longer than the 20-minute one-use upload
grant, so an object eligible for removal can no longer be attached to a post.

This deletion job is **disabled by default** to protect pre-existing local data:

```bash
STORAGE_ORPHAN_CLEANUP_ENABLED=true docker compose up -d
```

Enable it only after taking a storage backup, inspecting historic object
references, and confirming that existing objects use the `images/` naming
convention. Operators can set `storage.orphan-cleanup.retention-hours` (minimum
24) and `storage.orphan-cleanup.max-deletes` (1..1000). The scheduler is at 04:00
server time by default, overridable through `storage.orphan-cleanup.cron`.
Signed PUTs abandoned before post creation cannot be reclaimed instantly because
their Redis grant may still be valid. This policy provides bounded eventual
cleanup without deleting referenced images.

### Remaining evidence

- Verify an uploaded object persists after a real `docker compose restart rustfs`
  while its named `rustfs_data` volume is retained, then verify it disappears
  only after explicit deletion. Never use `down -v` on persistent user data.
- Verify the opt-in cleanup job against a **disposable** RustFS bucket with an old
  orphan, a referenced image, a referenced profile picture, and a simulated
  deletion failure; verify retry on the next scheduled/manual run.
- Multi-process message-worker crash recovery is tracked in VH-205 rather than
  being silently claimed here.
