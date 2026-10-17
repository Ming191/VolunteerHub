# Local S3-compatible storage for VolunteerHub

VolunteerHub uses **RustFS running in Docker** for local image storage. No GCS account or cloud service is required. Storage survives container restarts in the named `rustfs_data` volume.

## Start storage

From the repository root:

```powershell
$env:JWT_SECRET = "<your existing local JWT secret>"
docker compose up -d rustfs storage-proxy
```

The JWT variable is required by the overall Compose file, even when starting only RustFS. Do not commit credentials.

- Browser-facing S3 endpoint: `http://127.0.0.1:9000` (Nginx, CORS + 10 MiB upload cap)
- Direct RustFS debug endpoint: `http://127.0.0.1:9010` (do not use for browser uploads)
- RustFS console: `http://127.0.0.1:9001`
- Development credentials: `localdevaccess` / `localdevsecret123`. Override `LOCAL_STORAGE_ACCESS_KEY` and `LOCAL_STORAGE_SECRET_KEY` in your environment. Local loopback ports only.
- Bucket: `volunteerhub`, created automatically by the backend on boot.

When the backend runs **on the host**, storage endpoints default to `http://localhost:9000`. When it runs **inside Compose**, the S3 client uses `http://rustfs:9000` while the presigner uses `http://localhost:9000` for the browser. SigV4 includes the Host header, so do not substitute `rustfs` into a browser-facing URL.

FCM is disabled by default in local development (`FCM_ENABLED=false`), so Firebase credentials are not needed to start the app. Notification records remain available.

## Image upload

1. Authenticated caller requests `POST /api/events/{eventId}/posts/signed-url` with `fileName`, `contentType`, and `sizeBytes`.
2. Backend verifies event permission and issues 15-minute S3 signed PUT plus a 20-minute, one-time Redis grant bound to user and event.
3. Browser PUTs the image directly to the signed URL with `Content-Type` and `If-None-Match: *`.
4. On post creation, backend consumes the grant and validates the real private object, MIME, bytes and dimensions.
5. Saved image URL is a public-read backend URL `http://localhost:8080/api/media/images/<random-file-name>`. The S3 bucket remains private. The local Nginx proxy forwards PUT while preserving the signed Host header.

Anonymous media read matches the previous public-image behavior. URLs are not a substitute for a private event permission check.

## Tests

```powershell
cd backend
.\gradlew.bat test --tests '*LocalObjectStorageIntegrationTest*' --no-daemon
.\gradlew.bat test jacocoTestReport --no-daemon
```

The first test uses a disposable RustFS Docker container and performs a real S3 presigned PUT, replay rejection, object validation, read and delete.

## Important limitations

- Historical GCS URLs in the database are **not migrated**. Export or back up those objects before disabling GCS entirely; local storage will not read legacy GCS links.
- Running `docker compose down -v` deletes the RustFS data volume. Back up any important local images first.
- These `localhost` presigned URLs assume browser and Docker run on the same machine. For a second device, use a reachable hostname and configure CORS.
- RustFS here is single-node development storage, not a production availability/durability design. Production ingress size enforcement, orphan object cleanup, access policy and WebP decoding require separate testing.

The browser does not call RustFS directly; local Nginx handles OPTIONS preflight and limits ingress to 10 MiB. Configure a different proxy in production; this is only for local development.
