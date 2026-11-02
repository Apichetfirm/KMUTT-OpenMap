# Independent v0.4 release review

Initiated by Firm Impulse · FIBO FRAB11. Codex A, 2026-11-02.

## 1. Executive summary

Independently reviewed [PR #9](https://github.com/Apichetfirm/KMUTT-OpenMap/pull/9), supplied head `c576dff8417f607b0a21c36fbeea24808cb9cf11`, against original main `0bdeadd63d668d359fbe780fd5aef0acf98a25df`. Covered the complete changed-file inventory: application, source/derived GIS, acquisition/import scripts, schemas, unit/integration/browser tests, workflows, vendoring, documentation and evidence. Vendor payloads were checked byte-for-byte against locked npm artifacts.

Two reproduced P1 defects were fixed with regressions. No unresolved P0/P1 application or security defect was identified within this scope. Final candidate CI and production gates passed; PR #9 was merged and deployed **only as Community Preview — Not a Verified Campus Navigation Service**. No field survey, official endorsement, accurate physical 3D model, accessible route or real-device certification is asserted. Corrected application code ends at `5c0170dc90a6b0085992f54996c3d4d88929afbb`; subsequent review changes are QA, CI and documentation.

## 2. Findings by severity

| ID | Severity | Finding and disposition |
| --- | --- | --- |
| R1 | P1, fixed | Windows `core.autocrlf=true` rewrote vendored JS/worker/license bytes; integrity and production build failed although Git/npm artifacts agreed. |
| R2 | P1, fixed | Two same-page deletions queued behind a Web Lock could restore the first deleted community report. |
| R3 | P2, fixed | QA launchers explicitly disabled Chromium sandboxing, and the browser-test default also omitted it. Sandbox now enabled; compatible CI host required. |
| R4 | P2, follow-up | Live provider style warnings (missing sprites/filter nulls) and software-renderer ReadPixels stalls persist. No application exception, failed request or CSP violation occurred in live capture. |
| R5 | P2, open | Actual Safari, physical Android/iOS, GPU memory/FPS, long sessions and current field geography remain unverified. |

## 3. Corrections implemented

R1: `.gitattributes` applies `-text` to the exact vendor directory. Regression uses actual Git checkout filters with `core.autocrlf=true` and verifies all four SHA-256 digests. RED before/GREEN after. Module 1,108,049 bytes, worker 519,372, CSS 71,596, license 5,984; original Git blobs already matched npm, so no vendor payload changed. [Fix commit](https://github.com/Apichetfirm/KMUTT-OpenMap/commit/1e9b28389796bfb0fa76d70ed79a0a5e1aff192d).

R2: capture expected revision before awaiting the Web Lock. Regression seeds two reports, holds the real lock, queues both deletes and releases it. Previously the first report reappeared; now the stale second write is refused and the first deletion remains committed. Feedback covers queued same-page and cross-tab changes. Existing storage keys, drafts, exports and building URLs remain compatible. [Fix commit](https://github.com/Apichetfirm/KMUTT-OpenMap/commit/5c0170dc90a6b0085992f54996c3d4d88929afbb).

R3: remove explicit `--no-sandbox` and request `chromiumSandbox:true`. Local sandboxed Chromium passes 44 tests and actual live/performance captures. The first hardened Linux run failed browser launch with `No usable sandbox` on Ubuntu 24.04/AppArmor. CI now uses Ubuntu 22.04; no OS security control is disabled. [QA correction](https://github.com/Apichetfirm/KMUTT-OpenMap/commit/bd04baafd99de2af8dd6254185cf5817bddf33f4), [CI host correction](https://github.com/Apichetfirm/KMUTT-OpenMap/commit/5e58be7f88c77f95d968d6d926403fcb534665d6). Performance tooling now counterbalances six pairs and records resources/long tasks. No runtime feature or geography was removed to improve benchmarks.

## 4. Test commands and results

| Command/check | Independent result |
| --- | --- |
| `npm ci` | Locked installation succeeds; 28 installed packages. |
| `npm run check` / `npm run validate-data` | Syntax, data/schema and derived coverage pass. |
| `npm test` | 47/47 pass, including real MapLibre expression/style validation. [Log](qa/v04-review/unit-tests.txt). |
| `npm run verify-vendor` / `npm run build` | Initially failed R1; all four digests and allowlisted `.site` staging pass after correction. |
| `npm audit --json` | Zero reported advisories; [raw result](qa/v04-review/npm-audit.json). This is not a complete security proof. |
| `npx playwright test --project=desktop --project=mobile` | Sandbox enabled, 44/44 pass. [Log](qa/v04-review/chromium-e2e.txt). |
| `npx playwright test --project=webkit --workers=1` | 22/22 pass. [Log](qa/v04-review/webkit-e2e.txt). |
| Initial local full matrix | 65 passes, 22 Firefox launch failures (`spawn UNKNOWN` before application execution), one WebKit attribution trial-click timeout. That WebKit case passed twice in isolation and then the full 22-test suite, with unchanged assertions/timeouts. Firefox downloaded but also failed direct launch; local Firefox coverage unavailable. |
| Corrected-application Linux CI | [41395301300](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41395301300), head `5c0170d`: decoded logs confirm 47 unit and 88 browser passes, real WebGL2 in all four projects. |
| Initial sandbox-host CI | [41395903537](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41395903537): Chromium launch failed on Ubuntu 24.04; corrected with a compatible host, not a sandbox bypass. |
| Final exact candidate CI | [41396214334](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41396214334), `5e58be7`: 47/47 unit, 88/88 browser and build pass, Ubuntu 22.04 with Chromium sandbox. Decoded logs inspected; WebGL2 in all four projects. Both PR and push runs pass. |
| Merged-main CI | [41396815775](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41396815775), merge `bbbbc06`: succeeds after merge. |
| Actual production | [Smoke and 39 asset digests](qa/v04-review/production-smoke.json), [failure/retry recovery](qa/v04-review/production-recovery.json): pass against merge `bbbbc06`. |

Behavioral coverage includes actual vendor module/worker under CSP/Pages path, failed-module retry, stalled catalog timeout/recovery, search/deep links/history, malicious text rendered literally, clipboard failure, GPS denial, corrupt storage/recovery bytes, proposal export/edit/delete, cross-tab and queued revisions, candidate separation and disabled routes. Fixtures prove deterministic interactions; separate live-provider screenshots prove actual integration. Neither proves real-world accuracy.

## 5. Data integrity and GIS

| Independently recomputed coverage | Count |
| --- | ---: |
| Buildings / approximate points / without coordinates | 35 / 20 / 15 |
| Candidate / accepted / field-verified footprints | 18 / 0 / 0 |
| Measured heights / verified entrances / verified routes | 0 / 0 / 0 |
| Candidate pedestrian segments / accepted graph edges | 112 / 0 |
| Sourced approximate POIs / field-verified POIs | 73 / 0 |
| Recorded schedules / stale schedules | 3 / 3 |

Independent Shapely 2.2.0 / GEOS 3.14.1 [audit](qa/v04-review/gis-audit.json): all 18 polygons valid, exact source-way node geometry/version matches, representative points inside; zero positive-area overlaps. Shared boundaries: N3/N4, N10/N11, N17/N20. All seven original points are preserved. All 112 edges match contiguous source way-node slices, with no invented connections. All 73 POIs have snapshot source IDs, valid bounds and no imported private/no-access records. Sanitized snapshot omits contributor IDs/usernames/changesets.

N9/FIBO, N10/library, N11/SIT, N16/LX, N17/CB2 and N20/CB1 were checked separately: approximate points lie inside associated candidate polygons. Fresh OSM bbox responses agreed on all six way IDs/versions/names: [samples](qa/v04-review/current-osm-samples.json). OSM agreement is not field verification. N4 stays a partial complex with no published point. S1/S2/S6/N19 naming conflicts stay unresolved; no guessed association, dormitory use/gender, entrance or location correction was applied. Primary references: [campus directory](https://www.kmutt.ac.th/about-kmutt/campus/), [BGM directory](https://bgm.kmutt.ac.th/MapNavi/MAPNAVI.html).

Measured heights remain null. N16's documented 15 floors produce a labeled 48m visualization assumption (3.2m/floor); source-level/fallback heights stay estimates. Amber dashed candidates and preview extrusion never enter accepted geometry. Preview hides other extrusion; 2D hides both. All six selected-building views were inspected: no duplicate preview/base extrusion or marker obstruction observed. Validity/screenshots cannot establish physical roof/elevation accuracy.

Three schedules retain old observation dates and stale warnings, even when recorded intervals suggest likely-open. Stale/unknown records are excluded from the current-hours filter; retrieval is not operator confirmation. Accepted graph/verified entrances are empty, so internal/accessibility routes stay disabled. External directions use disclosed approximate destinations.

## 6. Security findings

Four vendor payloads match locked npm bytes/manifest SHA-256; lock retains tarball integrity and build checks bytes before staging. Module/worker/CSS are same-origin; asset failure leaves directory/retry usable. MIT/third-party notices, ODbL and OpenFreeMap attribution remain present. Code/data licenses remain separate; no protected university map imagery or reference-application assets were imported.

Six action pins were independently matched to official upstream major tags. CI has `contents:read`; Pages alone has `pages:write`/`id-token:write`, main-only deployment. Monthly Dependabot and documented reviewed update process exist. Staging excludes tests, node_modules and credentials. Sandbox host compatibility is checked independently.

Actual meta CSP allows scripts self, workers self/blob, provider connections/images/fonts only under the documented origin allowances, and disables objects/forms. Inline styles remain necessary; this is not a strict style CSP or a complete response-header policy. Remote tiles/styles remain a third-party availability/trust dependency; runtime CDN JavaScript is removed. [Live health](qa/v04-review/browser-health.json): zero exceptions, console errors, failed requests and CSP violations, with disclosed provider/software warnings.

DOM uses textContent, safe HTTP(S) URLs reject credentials, external queries use URLSearchParams/noopener. Issue preparation opens a reviewable URL without submitting. Local storage is validated, fallible, unencrypted and local-only: corruption bytes are retained/exportable, revisions/locks protect writes and R2 closes queued lost updates. No secrets or private student identities found in reviewed additions. Zero audit advisories does not prove absence of vulnerabilities.

## 7. Performance measurements

Six paired AB/BA runs per version; fresh contexts in one Chromium 156.0.8078.4 process, sandbox enabled, headless SwiftShader, Windows 10.0.26200, i5-11400H, 12 logical CPUs, 23.74GiB RAM, 1440×1000. Live provider, no throttling/proxy, no concurrent browser QA. Baseline original main; candidate corrected application. OS/provider caches and browser-process reuse are uncontrolled. [Raw results/resources/long tasks](qa/v04-review/performance.json).

| Metric | Baseline | Candidate |
| --- | ---: | ---: |
| Catalog median | 419.3ms | 204.7ms |
| Map load median, n=6 | 2,385.0ms | 2,183.1ms |
| Map range | 2,093.1–2,777.4ms | 1,431.9–2,643.9ms |
| Median synchronous search time | 0.45ms | 0.60ms |
| Snapshot JS heaps, rounded | 22–26MiB | 25–28MiB |

Paired candidate-minus-baseline mean -273.9ms; exact two-sided sign-flip calculation over 64 assignments gives p=0.40625. Small cache-dependent samples do not establish causal speedup/regression. B's earlier n=3 Linux/proxy medians 4.30s/4.64s reversed in another exploratory comparison. Three seconds is met in this local experiment only, unproven on phones and unmet in the earlier environment. A later production smoke observation loaded in 4,477.2ms; this single observation is not a production median and does not support a universal three-second claim.

Initial main-page resource counts: 22 baseline/28 candidate. Extra modules and separate worker replace CDN runtime. Runtime does not load the ~229KB candidate graph, ~132KB walkway candidates or raw snapshot. POIs ~107KB, candidate polygons ~51KB, catalog ~59KB; optional loading is independent of first map/search. Module+worker total ~1.63MB uncompressed. Candidate maximum main-thread long tasks per run 336–743ms versus baseline 383–514ms: software parse/render startup deserves physical-device profiling, not speculative feature removal.

Style/sprite/font durations were hundreds of milliseconds; main-page Resource Timing lacks full cross-origin byte details and worker-owned tile timing. Total latency cannot be cleanly apportioned among provider, worker startup and rendering. Search is synchronous handling, not paint/INP. Heap snapshots exclude native/GPU memory and cannot establish leak freedom. Mobile memory, FPS/thermal behavior and long-session soak remain open.

## 8. Cross-browser and mobile coverage

CI: Chromium desktop/emulated Pixel 7, Firefox and Playwright WebKit. Logs confirm Chromium SwiftShader and Firefox llvmpipe WebGL2. WebKit's Apple GPU renderer string is not proof of physical Apple hardware. Local Chromium 156/WebKit 27.2 exercised; Firefox 157 cannot launch. Playwright WebKit is not actual Safari certification. Physical Android/iOS unavailable.

Actual live-provider application screenshots, no generated images/mock map: [overview](qa/v04-review/overview.png), [N9](qa/v04-review/selected-n9.png), [N10](qa/v04-review/selected-n10.png), [N11](qa/v04-review/selected-n11.png), [N16](qa/v04-review/selected-n16.png), [N17](qa/v04-review/selected-n17.png), [N20](qa/v04-review/selected-n20.png), [candidate](qa/v04-review/candidate-preview.png), [night](qa/v04-review/night.png), [2D](qa/v04-review/2d.png), [POI](qa/v04-review/poi-details.png), [community](qa/v04-review/community-review.png), [disabled navigation](qa/v04-review/navigation-unverified.png), [coverage](qa/v04-review/coverage.png).

Responsive: desktop 1440×1000; [393×851](qa/v04-review/mobile-portrait.png), [360×640](qa/v04-review/mobile-narrow.png), [844×390](qa/v04-review/mobile-landscape.png), [667×375](qa/v04-review/small-landscape.png), [768×1024](qa/v04-review/tablet.png), [mobile candidate](qa/v04-review/mobile-candidate-preview.png). Markers, controls, attribution, scrollable details/editor and confirmation remain reachable. Some captures retain expanded/scrolled navigation state. Behavioral overlap/trial-click checks complement inspection. Keyboard search/Escape/focus, reduced motion and GPS denial tested; physical touch/assistive technology remains open.

## 9. Remaining blockers and issue disposition

| Issue | Decision against complete acceptance criteria |
| --- | --- |
| [#1 geometry/heights](https://github.com/Apichetfirm/KMUTT-OpenMap/issues/1) | Keep open: accepted associations, measured heights and surveyed entrances absent. |
| [#2 device/browser QA](https://github.com/Apichetfirm/KMUTT-OpenMap/issues/2) | Keep open: actual Safari/Android/iOS, midrange FPS and physical evidence incomplete. |
| [#3 names](https://github.com/Apichetfirm/KMUTT-OpenMap/issues/3) | Keep open: S1/S2/S6/N19 require authoritative dated reconciliation. |
| [#4 routes/accessibility](https://github.com/Apichetfirm/KMUTT-OpenMap/issues/4) | Keep open: candidate source paths do not establish safe/public/accessible passages. |
| [#5 verified services](https://github.com/Apichetfirm/KMUTT-OpenMap/issues/5) | Keep open: 73 approximate records do not satisfy 50–100 verified/current services. |
| [#7 supply chain](https://github.com/Apichetfirm/KMUTT-OpenMap/issues/7) | Full criteria satisfied: vendor/CI/update policy, actual Pages bytes/CSP and directory failure/retry recovery verified. Closed after production acceptance. |

These block stronger field/device claims, not a correctly labeled preview. University/field reviewers must supply dated, licensed, independently reviewed evidence.

## 10. Final release decision

**RELEASE ACCEPTED and deployed as an unofficial community preview.** R1/R2 fixed, exact final-head sandbox-compatible CI passes, actual production byte checks, WebGL journeys, responsive controls and failure/retry recovery pass. Retain uncertainty labels and disabled internal routing. Issues #1–#5 remain open; #7's complete supply-chain acceptance criteria are satisfied.

## 11. Merge status

PR #9 merged after re-reading exact head `5e58be7f88c77f95d968d6d926403fcb534665d6`, base `0bdeadd63d668d359fbe780fd5aef0acf98a25df`, mergeability and final decoded CI logs. Merge: `bbbbc06eb3cbd92415d0d28b50a395a5579666b9`. Separate fixes preserved. Independent acceptance posted as a COMMENT review: the connected maintainer account cannot approve its own PR. This does not imply a second human reviewer or field validation.

## 12. Deployment status

The actual [Pages application](https://apichetfirm.github.io/KMUTT-OpenMap/) was opened after successful [deployment 41396815764](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41396815764); decoded job logs inspected. All 39 tracked source, vendor, data, HTML, favicon and license files match merge-commit bytes, including browser-loaded assets. No application errors/CSP violations in smoke. Six priority codes, FIBO/shared URL reload, night/2D, local proposal save/export/delete, POI stale-hour/deep-link reload, desktop controls and portrait/landscape attribution/clear markers pass. Deliberately blocking the vendor module preserves directory search; explicit retry loads real module/worker/tiles and retains N9.

Evidence: [smoke/asset hashes](qa/v04-review/production-smoke.json), [recovery](qa/v04-review/production-recovery.json), [production desktop](qa/v04-review/production-desktop.png), [portrait](qa/v04-review/production-portrait.png), [landscape](qa/v04-review/production-landscape.png). The initial smoke harness needed a larger Git-output buffer for the 1.1MB module before execution; this was a harness read limit, not an application failure. Report/evidence publication is a subsequent documentation-only commit with identical application bytes; final publication checks are recorded in the PR discussion.

## 13. Final commit record

- Original main: `0bdeadd63d668d359fbe780fd5aef0acf98a25df`.
- Supplied head: `c576dff8417f607b0a21c36fbeea24808cb9cf11`.
- Corrected application: `5c0170dc90a6b0085992f54996c3d4d88929afbb`.
- Sandbox-compatible CI configuration: `5e58be7f88c77f95d968d6d926403fcb534665d6`.
- Final merged/deployed application SHA: `bbbbc06eb3cbd92415d0d28b50a395a5579666b9`.
- Subsequent audit-publication commit: identifiable in this file's Git history; documentation/evidence only, application bytes unchanged. Final CI/Pages checks are recorded in the PR discussion.

## 14. Next-release priorities

1. Reconcile current names with university owners; review code-to-geometry evidence, N4 and shared boundaries.
2. Survey measured heights, public entrances, safe pedestrian links and accessibility with dates, uncertainty and distinct reviewers before enabling routes.
3. Verify current POIs/operator hours/holidays; retain stale/unknown status until confirmed.
4. Test published SHA on physical midrange Android and iOS/Safari: render, input/FPS, native/GPU memory, long sessions and background recovery.
5. Profile startup long tasks and provider style warnings; retain reviewed dependency pins, byte verification and Pages/recovery regressions.
