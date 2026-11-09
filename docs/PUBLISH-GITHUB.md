# Deployment and release review

Initiated by Firm Impulse · FIBO FRAB11.

Existing URL: https://apichetfirm.github.io/KMUTT-OpenMap/. No production settings or access configuration changes are required. Feature branches/PRs run CI and do not deploy this candidate. Do not self-merge or publish a major release without independent review.

1. Install Node >=20/npm and run the README validation commands. Install Chromium, Firefox and WebKit for the complete CI browser matrix. Restricted environments can run explicit system-Chromium projects and must record missing local coverage. CI runs the configured browser matrix (read the current run for the exact count) with sandboxed Chromium on Ubuntu 22.04 and Firefox under Xvfb/software Mesa; see TEST-RESULTS.md.
2. Inspect data evidence/derived diffs, licenses, name conflicts and candidates versus accepted data. Independently verify the handoff, security review and actual screenshots/measurements. Verify CI results for the final commit, not an earlier SHA.
3. `npm run verify` validates source/data/media, runs Node tests, builds, and verifies SHA-256 inventory. `npm run build` verifies vendor bytes then stages allowlisted HTML/CSS/modules/vendor/data/docs/licenses in `.site/`. Test this directory under `/KMUTT-OpenMap/`; no npm runtime installation is required by visitors. Local file URLs are unsupported.
4. A reviewer-approved merge to main triggers the existing SHA-pinned Pages workflow: install locked development tooling, verify/syntax/data/unit checks, stage/upload/deploy. The Pages workflow first calls the same reusable CI workflow at its current SHA and requires it to pass, including all configured browser projects and Python/dependency audits, before deployment can start. Existing Pages permissions are limited to its deployment workflow.
5. Smoke-test the actual published URL on desktop and physical phones, including live tiles, Thai labels, FIBO/N9/N10/LX, 2D/3D/night, source/candidate disclosures, POI links, local proposal export, GPS denial and attribution. Confirm no production console/CSP errors.

Update MapLibre and action pins through reviewed PRs using SECURITY-REVIEW.md. Serving requires internet for provider tiles; same-origin runtime assets no longer depend on unpkg. No service worker/offline first-visit guarantee is included. Keep all unresolved data and performance/physical-device limitations visible.

If a regression is accepted after release, revert through a reviewed commit and redeploy main. Do not roll back by loading an old editor into an active draft-writing session without exporting drafts first. Repository history preserves original data/release artifacts.

Operational ownership, backup/restore, rollback and transfer: [Thai handover](HANDOVER-TH.md), [operations runbook](OPERATIONS-TH.md). Build writes `release-manifest.json`; `npm run verify-site` rejects missing, additional, changed, linked or private-path assets. `npm run handoff` packages tracked source, verified site and survey queues under ignored `work/`, without changing hosting.
