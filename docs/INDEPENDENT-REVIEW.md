# Independent review and release record — 2026-11-01

**Initiated by Firm Impulse · FIBO FRAB11**

PR: [#6](https://github.com/Apichetfirm/KMUTT-OpenMap/pull/6), `feat/campus-map-v0.3` → `main`. Original implementation: `02c63cf9ebcafb024559e9f35d9a45c4bae58021`; initial base: `55cbef26cf2dea4e0c3fb336b6f517b8d2fc15e1`. Both matched the requested source at review start. No conflicting upstream change was present. This is the independent Codex A review, not an endorsement of implementer claims.

## Review scope and findings

Inspected the original PR's complete 62-file change set: 52 text/code/data/configuration files and ten application screenshots (including before/after, night, 2D, proposals and landscape). Also inspected review fixes, regression tests and new evidence. Read all requested handoff/model/architecture/license/test/roadmap/height documents and Issues #1–#5. The ten supplied screenshots are real rendered application evidence; they are not proof of geographic accuracy.

Confirmed defect totals: **P0: 0; P1: 3; P2: 2**. All five below are corrected. Remaining source/device/data limitations are separately listed below; they are not hidden by the defect count.

| ID / severity | Reproduction and root cause | Smallest correction and regression |
| --- | --- | --- |
| R1 / P1 | Open a proposal editor, write a newer proposal in another tab, then confirm/delete in the stale tab. The in-memory collection replaces all stored drafts without comparing revisions. | Compare the captured raw revision inside a cross-tab Web Lock; refuse stale saves/deletes and retain the preview. Unit test proves stale replacements/deletions leave bytes unchanged; browser test reproduces a real second tab. Legacy storage key and corruption backups remain. |
| R2 / P1 | Stall the optional POI request: directory appears but the map never starts. `Promise.allSettled` is awaited before MapLibre initialization. | Start map immediately after valid catalog startup; load/validate each optional collection independently. Browser regression holds the POI request indefinitely and still requires usable map controls. |
| R3 / P1 | N10's marker is behind controls at 360×640 and 844×390; 667×375 also combines incompatible stacked sheets and landscape controls. Fixed camera padding ignores real panel/marker bounds, and cards cover provider attribution. | Derive camera padding from actual panels/tools, reserve marker height, shorten the scrollable portrait card, use side panels on small landscape phones, and keep compact attribution reachable. Regression requires the actual pin rectangle to avoid every panel/control and the attribution copyright link to receive pointer events at 360×640, 844×390, 667×375 and 700×900. |
| R4 / P2 | Select night/2D and retry after a map error: recreated map uses hard-coded light style and 3D pitch. | Initialize style/pitch from existing state; browser regression asserts dark style, 2D pitch and hidden extrusion after recovery. |
| R5 / P2 | Original local E2E run: 9/12 pass; three fail because parallel module requests receive `ERR_CONNECTION_REFUSED` from Python's Windows test server. Traces identify network failure, not assertion slowness. | Use a loopback Node QA server with the real Pages path mount. Remove request-URL rewrite simulation. No assertion-timeout inflation or retries mask the problem. |

Each application regression was run failing before its correction and passing afterward. Review code is in a separate fix commit beginning `cff52c4`, with a further small-landscape correction; all review commits are separate from the implementer's seven commits. No architecture rewrite or geographic promotion was introduced.

## Executed validation

Environment: Windows, Node 24.21.0, npm lockfile installation, Playwright 1.64.1, Chromium 156.0.8078.4, headless browser. CI independently uses Ubuntu / Node 22. No physical phone or assistive-technology session was available.

| Check | Independently executed result |
| --- | --- |
| Dependency installation | `npm ci`: 28 packages installed, exit 0 |
| Syntax | `npm run check`: exit 0 |
| Data | `npm run validate-data`: exit 0; counts below |
| Unit / integration | `npm test`: **34/34 pass**; includes data, geometry, real MapLibre expression/style validation, storage, schedules, routing and layer lifecycle |
| Browser E2E | **20/20 pass**, desktop and Pixel 7 emulation; expanded scenarios also exercise portrait, landscape and tablet widths |
| Dependency audit | `npm audit --omit=optional`: **0 vulnerabilities reported** |
| Static production staging | `npm run build`: exit 0; allowlisted `.site/` contains no node_modules, test traces or credentials |
| Pages base-path staging | Served actual `.site/` at `/KMUTT-OpenMap/?keep=1&building=N9`, reloaded, checked 35 directory entries and selected N9; all app/data responses 200, no page errors |
| Live provider smoke | Actual unmodified CDN modules/worker, OpenFreeMap styles/tiles and sources loaded; FIBO/N9, N10, night and 2D exercised; no app JS or console errors in recorded runs |
| GitHub CI | Original implementation CI passed; review commit `cff52c4` CI [run 41241148388](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41241148388) passed. Final-head CI is rechecked before merge and linked in the PR release comment. |

The browser fixtures run the real pinned MapLibre against controlled empty tile responses. They check actual selected code, camera arguments, URL/reload, focus, extrusion counts/visibility, proposal preview/persistence/download/delete, POI unknown/empty states, GPS denial, reduced motion and recoveries. They do not establish live tile availability, physical height, field truth or on-device performance.

Final-head CI on `4b6c787` initially passed 19/20 browser tests: the proposal test read storage immediately after clicking Confirm, racing the newly asynchronous Web Lock save on Linux. The test now waits for the editor to close (the application's post-save state) before reading persisted data; stale-tab checks likewise wait for the reported refusal before asserting unchanged bytes. No retry or timeout increase hides this failure. The corrected final-head CI must pass before merge.

User scenarios covered: new student FIBO/N9; visitor library/N10; mobile directory/search/cards; services categories with honest empty/unknown hours; local contributor preview/confirmation/export; keyboard search/selection/focus and reduced motion. Unmapped LX/N16 remains searchable/shareable and discloses its 15-floor reference without inventing coordinates or metres. Screen-reader, Firefox/Safari and physical Android/iOS acceptance remain outstanding.

## GIS accuracy and security boundaries

| Metric | Reviewed status |
| --- | --- |
| Buildings | 35 original records |
| Buildings with approximate references | 7: S3, N5, N9, N10, N11, N17, N20 |
| Unmapped locations | 28 |
| Candidate footprints | 3: N10, N17, N20 |
| Accepted / field-verified footprint associations | 0 / 0 |
| Measured heights | 0 |
| Verified entrances / routes | 0 / 0 |
| POIs / verified POIs / documented schedules | 1 approximate library / 0 / 0 |
| Unresolved names/descriptions | S1, S6, N19 |

All candidate rings are valid and their existing approximate references fall inside. N17/N20 share the segment `[100.4935793,13.6515514]` → `[100.4935786,13.6515995]`. Touching is not evidence of overlapping interiors or a traversable passage; review adjacency before accepting associations. Candidate geometry remains excluded from accepted rendering/counts. Cross-building overlap safeguards still need strengthening before accepted coverage grows.

Independently read the [official campus directory](https://www.kmutt.ac.th/about-kmutt/campus/) and [BGM master-plan directory](https://bgm.kmutt.ac.th/MapNavi/MAPNAVI.html). These support directory/name comparisons, not surveyed entrances/heights. Current OSM API retrieval succeeded for N17 (version 6, six level tags); the JSON requests for N10/N20 returned XML in this environment, so their current API contents were not independently reconfirmed. Stored candidate provenance and geometry were inspected; none was promoted. No new locations, routes, entrances or physical heights were fabricated.

Safe text DOM construction and HTTP(S)-only source links reject active-content URLs and credentials; external windows use noopener/noreferrer. No user evidence is inserted as HTML. GPS/proposals stay local; no new collection endpoint exists. CI is contents-read and Pages has its necessary deployment permissions; PR builds do not deploy main. Locked dependencies currently audit clean, but runtime CDN integrity/availability and mutable action tags remain follow-up [#7](https://github.com/Apichetfirm/KMUTT-OpenMap/issues/7). Legacy third-party coordinate redistribution permissions remain unestablished; source references are retained, not declared legally cleared. No copied protected plans, imagery or KMUTNB assets were introduced.

## Performance evidence and limits

Latest live map `load` events: **3.712s, 2.837s, 2.865s** (median 2.865s). Catalog ready: 0.361–0.552s. An earlier review sample was 2.136–2.744s; these different samples must not be presented as a controlled improvement over the implementer's cloud results. The approximate three-second target is **not consistently demonstrated**. Runs used fresh contexts on the same unthrottled local Windows host; OS/provider/network caches, parallel local QA and GPU/CPU load were not controlled.

Resource timing shows catalog/optional GeoJSON transfers take only a few milliseconds locally; MapLibre module transfer about 0.2–0.3s plus evaluation/initialization, followed by provider style, TileJSON, sprites, worker/font and tile work. Provider resources often take about 0.2–0.25s per recorded request in multiple dependency stages. Starting the map without waiting for optional collections removes a proven blocking dependency; it does not guarantee an internet/device latency target. Batched labels/POIs and one selected marker avoid per-frame DOM churn; there is no render loop over all buildings.

Recorded provider warnings concern missing sprite names and null road-shield filters. Four `ERR_ABORTED` tile requests in the first final sample occurred during camera/theme changes; subsequent samples recorded none. These are disclosed in raw evidence, not suppressed. No sustained FPS/GPU benchmark or long-session memory-growth test was run; initial heap/resource samples cannot prove either.

Evidence: [raw metrics](qa/review/live-metrics.json), [desktop selected](qa/review/desktop-selected.png), [night](qa/review/desktop-night.png), [2D](qa/review/desktop-2d.png), [portrait](qa/review/mobile-portrait.png), [360×640](qa/review/mobile-narrow.png), [844×390](qa/review/mobile-landscape.png), [667×375](qa/review/small-landscape.png), [700×900](qa/review/tablet.png). All are actual screenshots with visible provider attribution.

## Release decision and remaining roadmap

Engineering review supports a **community preview**, conditional on successful final-head CI, unchanged final diff/base and the normal merge/deploy checks. No unresolved P0/P1 software defect was identified after corrections. This report is committed before the release transaction: it does not claim a merge or deployment that has not happened yet. The [PR #6 release comment](https://github.com/Apichetfirm/KMUTT-OpenMap/pull/6) records the final reviewed head, CI, merged SHA, Pages deployment and actual production smoke result. Expected live URL: [KMUTT OpenMap](https://apichetfirm.github.io/KMUTT-OpenMap/).

- **P0 for a verified navigation release:** obtain reliable building/entrance associations, independently reviewed safe pedestrian coverage and actual device/browser acceptance. Internal/accessible routing remains disabled; these are not blockers to the explicitly limited community preview.
- **P1 data work:** review candidates/adjacency and legacy source permission, collect credible height evidence, resolve S1/S6/N19, and survey paths/accessibility. Issues [#1](https://github.com/Apichetfirm/KMUTT-OpenMap/issues/1), [#3](https://github.com/Apichetfirm/KMUTT-OpenMap/issues/3), [#4](https://github.com/Apichetfirm/KMUTT-OpenMap/issues/4) remain open.
- **P2 engineering/coverage:** real-device FPS/memory/network tests and Firefox/Safari/screen readers ([#2](https://github.com/Apichetfirm/KMUTT-OpenMap/issues/2)); verified services/hours ([#5](https://github.com/Apichetfirm/KMUTT-OpenMap/issues/5)); CDN/action supply-chain hardening ([#7](https://github.com/Apichetfirm/KMUTT-OpenMap/issues/7)); cross-building overlap validation and provider warning investigation. Issue labels/priorities may remain stricter than this preview-specific roadmap.

All Issues #1–#5 stay open because none has every acceptance criterion satisfied. Supporting software and community-preview publication do not certify the geography or complete those issues.
