# VH-111 — CI quality gates and branch policy

VolunteerHub is a public learning project. The `main` branch should only receive reviewed, green pull requests. Workflows run with minimal permissions and cancel obsolete attempts for the same PR.

## CI checks

| Check | Trigger | Merge policy |
| --- | --- | --- |
| `frontend` | PR, main | Required: `npm ci`, ESLint, TS and Vite build |
| `registration-security-tests` | PR, main | Required: Gradle/JUnit, including PostgreSQL Testcontainers |
| `reject-tracked-dumps` | PR, main | Required: reject checked-in backup/env/credentials files |
| `dependency-review` | PR | Required: reject **new** high/critical dependency vulnerabilities |
| `gitleaks` | PR, main | Required: detect newly leaked secrets |
| `codeql (java-kotlin)` | PR, main, weekly | Required: CodeQL Kotlin analysis built with Java 23 |
| `codeql (javascript-typescript)` | PR, main, weekly | Required: CodeQL frontend JS/TS analysis |
| `backend-image-audit` | PR, main | **Audit only**: build Docker image, report high/critical Trivy findings; does **not** block existing CVEs |

All PR workflows deliberately run without `paths` filters: required checks must not stay pending when a file outside a filter changes. There is no dummy `always-success` job. No untrusted pull-request code is executed with write-scoped tokens.

Dependabot proposes weekly updates for npm, Gradle, GitHub Actions and backend Docker base images. Its PRs are subject to the same quality gates.

## Branch protection

On `main`, require a pull request and passing, up-to-date status checks; disallow force pushes and branch deletion; require conversations resolved. This is a solo-owned learning repository, so **zero mandatory reviewer approvals** avoids self-blocking. Admins are subject to the same rules. Use GitHub's Settings > Branches / Rulesets UI to inspect the policy (the policy is a repository setting, not a file in this PR).

Current gate names must match GitHub check-run names **exactly**. Never require a job that has never completed or a conditional/skipped job. Enable new checks as required only after they have proved stable on the PR.

## Fault injection verification

To test enforcement without changing `main`, open a disposable PR branch that deliberately fails one existing check. GitHub must display the failed status and disable normal merge. Close the disposable PR and delete its branch. Do not disable branch protection or mark failed checks as successful to force merge.

## Limitations and future work

- Container vulnerabilities are initially inventoried rather than used as a gate because current Docker base images have not been remediated. Once VH-301 hardens the images, change Trivy to nonzero exit for high/critical advisories and make the check mandatory.
- Existing dependency vulnerabilities are tracked separately. Dependency Review prevents newly introduced vulnerable packages rather than retroactively blocking unrelated changes.
- CodeQL catches code patterns but cannot establish absence of exploitable vulnerabilities.
- Release artifacts are built separately from production deployment. Image digest pinning, deploy approval and rollback belong with VH-301/VH-302; do not claim this CI publishes a release.
- Expanded Redis/RabbitMQ business-flow integration testing is VH-112.
