# Dependabot policy and initial backlog cleanup (2026-10-17)

## Why the backlog spiked

VH-111 enabled scheduled version-update PRs across npm, Gradle, GitHub Actions and Docker. During the initial scan Dependabot created 17 PRs (#57–#73), many of which were major version upgrades. These were **version-update PRs**, not confirmed security advisories.

## Revised version-update policy

- Weekly schedule on Monday, staggered at 08:00/08:15/08:30/08:45 Asia/Bangkok.
- **At most one open routine version-update PR per package ecosystem**; compatible minor/patch dependencies are grouped under npm-nonmajor / gradle-nonmajor / actions-nonmajor / docker-nonmajor.
- Routine **major** upgrades are deliberately deferred until a separate compatibility review. `allow.update-types` restricts **version updates**, not security updates; security-update groups remain defined without excluding major security fixes.
- Do not auto-merge Dependabot PRs. Required GitHub Actions quality checks and branch protection still apply.
- One grouped PR may still touch multiple libraries. A passing build is necessary but not sufficient: review the changelog and run appropriate smoke/E2E tests.

**Security caveat:** as of this cleanup, the repository GitHub API reported `security_and_analysis.dependabot_security_updates.status=disabled`, and the Dependabot alerts endpoint returned HTTP 403 ("Dependabot alerts are disabled for this repository"). The configuration leaves room for future security-update PRs but **does not enable Dependabot alerts or security updates**. Enabling these requires a conscious repo-security settings change and may create additional PRs. Gitleaks, Dependency Review on incoming PRs, CodeQL and Trivy audit operate separately and remain configured.

## Initial PR triage

Keep open for separate review, **do not auto-merge**:

- #69: grouped npm minor/patch dependency update (47 packages), frontend CI passed at triage. Needs UI regression smoke tests.
- #64: grouped Gradle minor/patch update (14 packages); its CodeQL Java/Kotlin result failed while other checks passed. Needs diagnosis; also review the Kotlin plugin version alignment.
- #74: manual VH-112 Testcontainers integration-test PR; independent of Dependabot cleanup.

Close without merge after leaving explanatory PR comments:

- #57–#58, #60–#63: individual version bumps to Actions/Trivy. Major upgrades or security-sensitive SHA changes; review in separate CI maintenance work.
- #59: Java 23→25 Docker base image, a breaking runtime/toolchain migration. Track under VH-301; preserve commit/PR link for a later manual change and Trivy rescans.
- #65–#68: Gradle wrapper, Springdoc 3.x and Kotlin plugin major upgrades; postpone until an explicit dependency compatibility task. Revisit under VH-110.
- #70–#73: frontend major/prerelease upgrades such as Vite 8; postpone until a focused frontend compatibility update.
- #42: old draft polling removal conflicts with the current **conditional 3-second polling only while imagesProcessing** on main; not desirable to remove the progress refresh.
- #43: old draft carousel navigation issue; main already uses loop with no `canScrollPrev` / `canScrollNext` disabled buttons.
- #49: 2025 experimental PR with 139 files, 58 commits and conflicting changes; superseded by subsequent main development. Do not merge wholesale.

Closing a PR does not delete commits; GitHub PRs can be reopened later if needed. The next ordinary review cycle should work on #64/#69 in small verified changes, not blindly merge all 61 dependency bumps.
