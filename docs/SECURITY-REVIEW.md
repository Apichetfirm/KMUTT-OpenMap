# Runtime and supply-chain review — v0.4 RC

Initiated by Firm Impulse · FIBO FRAB11. This is engineering hardening, not an independent penetration-test certificate.

## Runtime decision (issue #7)

| Delivery | Benefits | Costs / remaining risk |
| --- | --- | --- |
| Versioned CDN + externally checked digest | Small repository; shared caches | Module imports do not accept HTML SRI attributes; prefetch verification would need a carefully audited loader. Worker imports also need protection. Runtime depends on another service. |
| Vendored locked npm artifacts (chosen) | Same-origin module, separate worker, CSS and license; works without a runtime CDN; reviewable byte changes | About 1.7 MB uncompressed source, additional update work; hosting remains trusted. |

`vendor/maplibre-gl/manifest.json` records npm tarball integrity, exact version, SHA-256 and byte size for **all four** module/worker/CSS/license artifacts. `npm run verify-vendor` checks each byte against both the manifest and the installed lockfile package. The v6 ES module loads a separate worker; live QA caught the missing worker in the initial copy and it is now required by validation. No new asset integrity is claimed for third-party tiles or glyphs.

Update process: review an upstream release and advisories; update the exact npm version/lockfile; `npm ci`; `npm run vendor-maplibre`; inspect all manifest/asset/license changes; `npm run verify-vendor`; run unit, browser, Pages-path, live tile, theme and attribution checks. Commit all artifacts together. Never edit a digest to conceal unexplained bytes. Dependabot opens monthly npm/action update proposals; a MapLibre dependency PR also needs regenerated vendor files.

## Actions and permissions

All `uses:` entries pin full 40-character commit SHAs resolved from their existing upstream major release lines on 2026-11-02. Comments retain major versions; review upstream commit/release diff before accepting updates. CI gets `contents:read`. Pages write/OIDC permissions remain only in the main-only deployment workflow. No repository settings, secrets, tokens, production access or release settings changed. Dependabot tracks action pins. npm audit baseline and final commands/results are in the test report.

## Content Security Policy

The HTML meta policy restricts scripts to self; workers to self/blob; connection/image/font destinations to self and OpenFreeMap (plus needed data/blob images); disables objects and form submission; constrains base URLs. MapLibre dynamic styles require `style-src 'unsafe-inline'`; script eval/inline script is not allowed. Source content is built using `textContent`, never `innerHTML`. Worker/module/CSS use the Pages-relative vendor path. Browser tests exercise the actual vendored worker under this policy, record CSP violations, preserve provider attribution and test failed assets/retry. GitHub Pages does not support arbitrary response headers; a meta policy cannot supply `frame-ancestors`. Custom hosting headers could strengthen framing protection later.

## Input and local storage

HTTP(S) evidence URLs reject embedded credentials and active protocols. Coordinates, geometry, schedules, code references and moderation states are validated. Outgoing directions/issue URLs use URLSearchParams. External links use noopener/noreferrer. User report text stays literal; issue links only prepare a submission that the contributor chooses to post.

Legacy coordinate drafts retain their storage key and backup/revision/Web Lock safeguards. Community reports use a separate key with exact-revision locked writes and a corruption-preserving export path. Storage denial/quota/invalid bytes never claim a successful save. GPS requires a click, is not persisted and is not sent to the project. No analytics, private student records or contributor OSM identities are imported. Local drafts have no encryption; anyone using the same browser profile can inspect them, so the form requests public evidence only.

## Provider and release limits

OpenFreeMap still receives tile/glyph/image requests and normal connection metadata. Offline first-visit catalog availability is not promised; an already loaded catalog remains searchable after map/network failure. No internal/accessible navigation is enabled with current data. Local Firefox/WebKit binaries cannot be downloaded under this environment's network policy; CI includes both engines and must be independently inspected before release. Keep issue #7 open until Codex A independently verifies every acceptance criterion on the final PR.
