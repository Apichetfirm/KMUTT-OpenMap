# KMUTT OpenMap — pre-launch visual implementation

Review target: `main` at `6e410b7126ca6cbda2481c15a4aa2ccb88dd42b0`. Prepared 4 November 2026 (Asia/Bangkok). This is an implementation for independent Codex A review, not authorization to merge or launch.

## Audit and technically valid implementation plan

The pasted user request governs this work. The attached Argon4 document supplies visual direction; its example code and factual claims are not authoritative. The actual checkout establishes these contracts:

- `campus-buildings` is a GeoJSON Point source for catalog labels. Never extrude it.
- `campus-3d` uses the provider's vector `building` polygon layer. A real rendered-tile inspection exposed `render_height`, `render_min_height`, and occasional `colour`, with no canonical catalog code. Materials use the two height properties already supported by the repository. Neither tile color nor proximity establishes an official building identity.
- Accepted `building-footprints.geojson` contains zero features. The 18 candidates remain unreviewed. Selection can outline only an accepted footprint matching `building_code`; otherwise it uses the approximate catalog marker. Candidate previews never enter the accepted source.
- Preserve `HOME` as a coordinate array and the public `cameraOptions(coordinates, options)` signature, DOM IDs, storage keys, evidence validation, and URL format.

The implementation plan was: (1) capture and inspect the original live renderer; (2) improve single-extrusion materials, lighting, label hierarchy and basemap contrast; (3) implement the floating daylight/dark explorer and progressive GIS disclosure; (4) implement shared mobile sheet slots and adaptive camera padding; (5) improve media fallback and detail actions; (6) run regressions and capture real application evidence and startup measurements; (7) open an unmerged PR.

## Implemented experience

### Map art direction

Warm limestone, sand, and slate rendering palette, opaque facades, vertical shading, a stronger warm directional light, and a subtle polygon contact wash replace translucent sage blocks. The wash uses the same provider building polygons and is a graphic grounding treatment, not physically accurate cast shadows. Dark mode has a separate material palette.

No extra roof extrusion or custom WebGL renderer was added. MapLibre's existing lighting distinguishes top and side faces; separate parapets, windows, cornices, and roof shapes would imply architectural evidence that is unavailable. There remains one visible building extrusion stack, including during candidate editing, plus one inexpensive fill wash. There is no animation loop, shadow texture, generated geometry, font request, or added runtime dependency.

Parks, landuse, water, and building ground fills use restrained complementary tones. Generic POI labels and road shields are suppressed so catalog labels and services are legible. This styles existing geography and does not invent a campus boundary. Catalog labels prioritize N9, N10, N11, N16, N17 and N20, with a 2.2px halo and less text at overview zoom.

Overview: center `[100.4937,13.6520]`, zoom `16.85`, pitch `54`, bearing `-24`. Selection: zoom `17.8`, pitch `58`, bearing `-24`, center from canonical catalog coordinates, with padding calculated from the actual panels. 2D and reduced motion remain supported.

### Interface and details

The default interface uses ivory canvas `#f4f1ea`, porcelain surfaces `#fffefa`, ink `#282b29`, and burnt orange `#b94712`. System fonts with Thai fallbacks preserve the CSP and avoid font network requests. Dark theme changes the interface, meta theme color, and map together and survives map recovery.

The floating explorer retains search, regional/mapped filters, services, all 35 catalog buildings and existing IDs. The six requested priority buildings lead the unfiltered directory; every other record retains its stable relative order. Data coverage, height modes, quality metrics, proposals and exports live inside **ข้อมูลแผนที่ · Data & GIS** with all evidence notices preserved.

Building details retain canonical identities, approximate-position notices, sourced floors where present, unknown heights, provenance, external directions, Street View, sharing and correction actions. Primary actions precede detailed evidence. The media header uses 16:9 published images only when existing approval/licensing validation permits them. Otherwise it shows an abstract line illustration explicitly labeled **not the shape of this building**. It is not a photograph or building model. Broken approved images keep a visible fallback and source attribution. Additional media remains lazy.

### Mobile

Floating search remains above the map. Directory, building details, services details, and mapping proposals share one bottom-panel area instead of competing vertically. Portrait directory/detail sheets support peek (168px), half (52dvh), and full (available height below search). Handles support click, ArrowUp/ArrowDown, Home/End and pointer drag; scrolling content never captures drag gestures. Snap changes reframe the camera after the height transition. New building selection resets the detail sheet and scroll position. Search restores the directory; close restores focus and the directory. Short landscape uses two slim side rails. Safe areas, attribution access, reduced motion and narrow viewports are addressed.

## Differences from the supplied design document

| Argon4 assumption or example | Implemented correction |
| --- | --- |
| 35 verified polygons / Point extrusion | Zero accepted polygons; 3D uses the provider's polygon layer only. |
| Semantic facade color tied to official code | Height-based display materials; tiles do not establish catalog identity. |
| Selected building glow on nearest polygon | Approximate marker; accepted footprint outline only with a matching accepted code. |
| Roof caps, podiums and physical sun shadows | Existing renderer top/side lighting and graphic polygon contact wash; no invented architectural details. |
| Opaque gold candidate geometry | Separate translucent blue (0.42 opacity) and dashed outline, with existing evidence/height-assumption notices. |
| Examples with wrong N-series identities / 42 buildings | Canonical N9 FIBO, N10 Library, N11 SIT, N16 LX, N17 CB2, N20 CB1; catalog remains 35. |
| Changed `HOME` type / camera API | Public types/signature preserved; all current callers verified. |
| Remote Google Fonts | Existing system font stack; no CSP expansion. |
| Verified imagery / realistic replacement photo | Only rights-reviewed media; generic, explicitly labeled illustration when absent. |
| Three.js benchmark features | No engine migration, trees, windows, paths or physical building claims inferred from appearance. |

The generated UI concept was used only as a visual study of layout, palette and component hierarchy. No generated map or photo is shipped. Its invented example labels were disregarded; implementation reads canonical data.

## Data integrity

The data directory is unchanged. Validation reports 35 buildings, 20 approximate coordinates, 15 unmapped buildings, 18 candidate footprints, **0 accepted footprints, 0 field-verified footprints, 0 measured heights, 0 surveyed entrances and 0 verified pedestrian routes**. Only N16 has a documented floor count (15); no meters are inferred as measured. Internal and wheelchair routing remain disabled. The 73 OSM service records are not newly verified. A visually attractive 3D scene does not establish architectural or geographic accuracy.

## Validation and evidence

Browser plugin was unavailable; validation used the repository's Playwright setup. Tests exercise the real MapLibre runtime/worker with deterministic external-provider fixtures. Separate screenshots and performance samples use the actual provider responses without fixture routes.

| Check | Local result |
| --- | --- |
| Existing Node suite plus polygon/material regression | **56 passed** (baseline 55) |
| Python image tooling | **4 passed** |
| Chromium desktop and Pixel 7 emulation | **60 passed** (54 original plus 6 redesign checks) |
| Firefox | **30 blocked before test execution**: required engine executable absent |
| WebKit | **30 blocked before test execution**: required engine executable absent |
| Syntax, vendor SHA-256, data/media validation | Passed |
| Static GitHub Pages staging | Passed |
| Real MapLibre worker and CSP | Passed in desktop/mobile browser tests |
| WebGL2 | Available, SwiftShader software renderer; not a physical GPU claim |

All 108 original browser tests remain configured, plus 12 new browser regressions (120 total). The original assertions for a separate stacked mobile directory/detail layout were updated to assert the new shared sheet slot. Tests now open the GIS disclosure before using height/quality/export/community controls. Storage, evidence, selection, single-visible-extrusion, recovery and source-security assertions were preserved.

A final focused rerun of six desktop/mobile responsive, reduced-motion and sheet tests also passed after adding the full-sheet focus guard. The local Firefox/WebKit command was attempted; all 60 engine-dependent cases failed at `browserType.launch` because the engine executables were missing, before application assertions. `npx playwright install chromium firefox webkit` returned HTTP 403 **Domain forbidden** for `cdn.playwright.dev`. These are not reported as application passes. The existing CI workflow installs all three engines and remains the required independent cross-engine gate. PR/CI status is recorded at handoff.

Commands:

```sh
npm test
python -m unittest discover -s tests -p 'test_*.py'
npm run check
npm run verify-vendor
npm run validate-data
npm run validate-media
npm run build
OPENMAP_CHROMIUM=/usr/bin/chromium npm run test:e2e -- --project=desktop --project=mobile
npm run test:e2e -- --project=firefox --project=webkit
```

The responsive regression visits **360×640, 390×844, 667×375, 768×1024 and 1440×900**. It checks overflow, control access, marker visibility, exclusive directory/detail state, snap gestures/keyboard controls, canonical selection, source separation and media honesty. Existing tests also verify marker/panel separation at 700×900 and 844×390, attribution access, Google Maps actions, URL back/forward, denied GPS, clipboard fallback, storage corruption/concurrency and recovery.

## Startup performance and resources

Six paired, alternating baseline/redesign loads were measured in fresh browser contexts, one reused sandboxed Chromium process, 1440×900 viewport, live provider through the session proxy, no throttling and no concurrent QA browser. Baseline is the original checked-out commit `6e410b7`; redesign source hashes are included in the raw measurements. Each version loads its actual shipped camera/layout. Provider/OS caches are uncontrolled. These are development-environment samples, not physical-device benchmarks or a statistically established speedup.

| Median across six loads | Baseline | Redesign |
| --- | ---: | ---: |
| Catalog ready | 389.10 ms | 353.15 ms |
| Map loaded | 2,503.25 ms | 2,345.70 ms |
| Synchronous search handler | 0.50 ms | 0.60 ms |
| Coarse JS heap estimate | 27,492,110 bytes | 21,605,366 bytes |
| Canvas count | 1 | 1 |
| Startup resource entries | 32 | 32 |
| Observable transfer bytes | 2,067,752 | 2,079,093 |
| Long tasks | 13.0 | 12.5 |
| Long-task duration total | 2,174.5 ms | 1,944.5 ms |
| App errors / timeouts, all samples | 0 / 0 | 0 / 0 |

Map load ranges: baseline 2,353.7–2,759.4 ms; redesign 2,135.6–2,502.2 ms. The observed medians show no material regression in this sample. Observable transfer grows by 11,341 bytes (about 0.55%). Cross-origin Resource Timing can conceal tile/glyph sizes without `Timing-Allow-Origin`, so this is **not total wire traffic**. Heap estimates exclude GPU memory and do not establish total process memory or energy use. Frame rate and physical mobile battery/thermal behavior were not measured.

Raw data: [performance.json](prelaunch-visual/performance.json). Reproduce with two loopback servers serving the baseline and current checkout, then:

```sh
OPENMAP_CHROMIUM=/usr/bin/chromium \
OPENMAP_BASELINE_COMMIT=6e410b7126ca6cbda2481c15a4aa2ccb88dd42b0 \
node scripts/measure-prelaunch.mjs \
  http://127.0.0.1:8081/ http://127.0.0.1:8080/ work/performance.json
```

## Accessibility review

The interface retains semantic search/landmark regions, live status messages, focus return, skip link, literal untrusted text handling and visible focus rings. Thai titles use at least 1.5 line height. Search has a persistent label; form fields and map controls retain their accessible names. Snap controls have keyboard equivalents, map controls covered by a full sheet leave the tab order until it collapses, pointer gestures do not hijack content scrolling, safe-area insets are respected, and reduced motion disables CSS transitions and camera animation. Primary touch controls are 44px; compact landscape zoom controls are 34px (above the WCAG 2.2 AA 24px minimum, below the preferred 44px target).

Calculated sRGB contrast pairs: white/orange **5.29:1**, light primary text/surface **14.18:1**, light secondary text/surface **5.94:1**, orange code text/soft surface **4.61:1**, dark secondary text/surface **8.01:1**, dark orange text/soft surface **6.63:1**, dark primary text/surface **11.80:1**. Disabled controls intentionally use reduced opacity and are not active text targets. The source map and third-party glyphs have independent contrast characteristics. This is a focused review, not a complete WCAG certification; assistive-technology/device testing remains for independent review.

## Screenshot evidence and launch assets

All PNGs below are original screenshots of the working application with provider tiles. There are no generated map screenshots, synthesized building photographs or postprocessed geometry. The only QA module instrumentation exposes the live map object to record/set camera parameters. [cameras.json](prelaunch-visual/cameras.json) records every screenshot's center, zoom, pitch, bearing, padding, viewport, canvas bounds, selection and theme. Matched before/after views use identical camera parameters and viewport; canvas bounds differ because the actual application layouts differ.

| View | Before | After |
| --- | --- | --- |
| Campus overview, 1440×900 | [Original](prelaunch-visual/before-campus-overview.png) | [Redesign](prelaunch-visual/launch-campus-overview.png) |
| N16 dossier, 1440×900 | [Original](prelaunch-visual/before-building-n16.png) | [Redesign](prelaunch-visual/launch-building-n16.png) |
| N10 mobile, 390×844 | [Original](prelaunch-visual/before-mobile.png) | [Redesign](prelaunch-visual/launch-mobile.png) |
| Dark theme, 1440×900 | [Original](prelaunch-visual/before-dark.png) | [Redesign](prelaunch-visual/dark-theme.png) |

Additional actual-app captures: [360×640](prelaunch-visual/qa-360x640.png), [667×375](prelaunch-visual/qa-667x375.png), [768×1024](prelaunch-visual/qa-768x1024.png), [mobile directory](prelaunch-visual/mobile-directory.png), [full detail sheet](prelaunch-visual/mobile-full-sheet.png). Browser health: [browser-health.json](prelaunch-visual/browser-health.json).

The three Facebook launch candidates are:

1. `docs/prelaunch-visual/launch-campus-overview.png`
2. `docs/prelaunch-visual/launch-building-n16.png`
3. `docs/prelaunch-visual/launch-mobile.png`

Review these for public presentation after independent Codex A review. Capturing an image is not approval to launch.

## Known limitations and review gates

- No accepted building geometry, measured heights, surveyed entrances, verified internal routes or approved building photographs were created. Existing geographic/name conflicts and missing coordinates persist.
- Provider polygons are rendered as received. Attractive materials, a marker over a tile, and successful software tests do not establish that a polygon matches an official building or that its height is correct.
- The contact wash is a visual device, not solar/shadow simulation. Roof architecture is intentionally not invented.
- No provider-failure, offline, or missing-image recovery path can supply map tiles or licensed media that do not exist; the catalog and evidence notices remain the fallbacks.
- A full mobile sheet prioritizes reading over map visibility; collapse it to restore the scene. Dense landscape layouts remain compact and should receive a physical-device usability review.
- Local Firefox/WebKit verification is blocked by engine availability/network policy. CI and Codex A must independently review cross-engine results before launch.
- Screenshot capture can emit software-renderer `ReadPixels` warnings. The provider’s missing `wood-pattern` sprite warning occurred in both baseline and redesign captures and is retained in browser health; no replacement geography or textures were fabricated to mask provider issues.
- Physical-device GPU, frame-time, thermal, battery, assistive-technology and field accuracy testing remain outside the observed evidence. No claims for those tests are made.

No merge or public deployment is performed by this work.
