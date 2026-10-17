# VH-102 | Security exposure containment and history-remediation runbook

Status: containment in progress. This document does not claim that production credentials have been rotated.

## Evidence and scope

A PostgreSQL export was committed as `backend/backup_utf8.sql` and contains account-associated rows and authentication artifacts (including refresh tokens and verification tokens). A literal JWT signing key was also included in `backend/src/main/resources/application.properties`. Both have existed in the public Git history. Assume any copied token or secret is exposed unless the operator establishes otherwise.

Do not paste secret values, raw dumps, personal data, or unredacted logs into Trello, issues, PR comments, or other public systems.

## Immediate containment (operator actions, outside Git)

1. Assign incident owner, log the event time, preserve necessary evidence in a restricted evidence store, and identify whether the SQL dump is seeded demo data or contains real people's records.
2. Restrict public exposure while remediation is underway. Review collaborators, Git clones, forks, tags, release artifacts, caches and any downstream distribution.
3. For **each affected running database**, revoke all potentially exposed refresh tokens and email-verification tokens using a reviewed and transactionally safe administrative procedure. Review other sessions/credentials captured in the dump.
4. Rotate the production JWT signing key through the deployment secret manager to **new cryptographically random Base64 bytes** (at least 32 random bytes). Deploy the new value to every API instance. Previously issued access tokens must fail verification after rotation. Do not derive the new key from the exposed key.
5. Rotate any other affected database, RabbitMQ, cloud, SMTP or service credentials that were exposed or reused. Revoke old credentials before reopening access.
6. If real users or password hashes are involved, assess password-reset and notification obligations under applicable policies/laws. Coordinate with the security/privacy owner.
7. Verify revoked tokens cannot refresh sessions, JWTs signed with old keys are denied, new sign-in and email verification work, and no production instance retains the old keys.

## Repository changes in this PR

- Remove the tracked SQL backup from the current branch's tree.
- Require `JWT_SECRET` injection with no source-controlled fallback. The value must be Base64-encoded random key material.
- Ignore common database export file extensions and add a CI guard that rejects newly tracked dumps/credential files.
- Prevent self-issued ADMIN registration via a separate public role enum (VH-101).

**These Git changes are not sufficient incident remediation**: deletion from a branch does not remove the file from Git history, forks or caches; changing the source value does not rotate deployed secrets.

## History rewrite (coordinated administrative change, not in this PR)

Plan a brief freeze on writes/merges. Inform collaborators that every local clone will need to re-clone or carefully reset. Take an offline backup and retain restricted incident evidence. An authorized repository administrator should use `git filter-repo` on a fresh mirror clone to remove the export from **all refs**, then separately remove historical secrets from configuration where feasible. Review retained tags/branches/PR refs, force-update affected refs as required, and follow GitHub's sensitive-data removal guidance for unadvertised/cached objects. Force-pushing rewritten history is disruptive and must be coordinated. It is deliberately not performed by this code PR.

Example for the backup path only (run on a disposable fresh mirror clone; verify before pushing):

```bash
git filter-repo --path backend/backup_utf8.sql --invert-paths
git log --all -- backend/backup_utf8.sql
```

The second command should produce no matching history in the filtered clone. **Do not push blindly**: history may also contain secrets in other paths; audit and verify all branches/tags, then coordinate a protected force-update.

## Incident closure criteria

- All affected tokens/keys invalidated, old JWT signature rejected by active production services.
- Sensitive export and applicable secrets no longer recoverable from accessible Git refs; assess forks/caches separately.
- Repository scans and deployment scans checked; alerting for new leaks activated.
- Reviewed evidence of token-revocation/rotation and post-deploy smoke tests is stored privately.
- Incident owner decides whether account resets, notifications or external reporting are required.
