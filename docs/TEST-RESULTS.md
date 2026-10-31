# Test report — v0.3 implementation, 2026-11-01

Initiated by Firm Impulse · FIBO FRAB11. These are implementer results, not final Codex A acceptance.

Flow under test: load the app → search FIBO/N9 → select → focus the published approximate point and show provenance → share/reload → preview/confirm/export/delete a separate local proposal. Also checked unmapped N16, POIs, style/mode changes, permissions and unavailable services.

## Environment and results

Cloud Linux, Node 24.19.0, Chromium 154.0.8037.57, headless software WebGL. Desktop 1440×1000, mobile 390×844 plus Pixel 7 emulation, landscape 844×390. Browser plugin not available; regular Playwright was used. CI is configured for Node 22 and Playwright's Chromium.

| Check | Result / scope |
| --- | --- |
| Baseline | 11/11 tests and syntax checks passed at `55cbef2` |
| Current unit/data/map integration | 33/33 pass |
| Browser regression fixtures | 12/12 pass across desktop/mobile; targeted landscape/motion checks rerun after final layout adjustment |
| Syntax / data / static build | Pass: `npm run check`, `npm run validate-data`, `npm run build` |
| Dependency check | `npm audit --omit=optional`: 0 vulnerabilities reported |
| Page identity / nonblank / overlay | Correct title and route, 35 directory buttons, no framework error overlay |
| Console errors | No uncaught JS or console errors in live app sequence |
| Console warnings | Live provider styles have missing icons (e.g. office, gate, sports_centre, wood-pattern) and null road-shield filters; recorded in live metrics, not suppressed |
| Interaction proof | Search/selection/URL/camera, unmapped card, theme/2D/3D, proposal persistence/export/delete, POI empty filters and GPS denial pass |
| Responsive evidence | Search, scrollable cards, map controls and selected marker remain reachable; no horizontal document overflow in tested layouts |
| Field/device verification | Not performed; synthetic software tests cannot establish geography or physical-phone performance |

Browser fixture tests load the **real pinned MapLibre** library with controlled empty vector tiles and local data. They inspect actual UI, camera center, layer visibility/count, persistence, downloads, focus and errors. Separate live checks use actual unmodified provider tiles. No fixture geography is published as real campus data. Browser-only instrumentation is injected into test responses; no production test hooks are added.

## Measured performance and limits

Three live cloud runs: catalog ready 546–581 ms; map `load` event 3,655–4,447 ms from navigation start. This does **not** achieve the approximate 3-second map target. These are single-session, unthrottled cloud timings, not controlled mobile-network benchmarks. The load event is distinct from a formally defined first-interactive-map metric.

500 local search calls over 35 entries: median about 0.2 ms, p95 about 0.4 ms in the recorded run. Initial JS heap snapshot approximately 28.4 MB; one sample cannot establish absence of long-term memory growth. Label/layer reuse and selected-marker count are regression checked. No representative-phone 30 FPS or long-session memory claim is made. Live warnings and raw measurements are in [qa/live-metrics.json](qa/live-metrics.json).

## Commands

```sh
npm ci
npm run check
npm run validate-data
npm test
npx playwright install --with-deps chromium
npm run test:e2e
npm audit --omit=optional
npm run build
```

For system Chromium in this execution environment:

```sh
OPENMAP_CHROMIUM=/usr/bin/chromium OPENMAP_QA_DIR=/workspace/work/e2e npm run test:e2e
```

Live screenshots were captured with Playwright against root-served baseline/current static apps, with actual CDN styles/tiles. The archived baseline is the source at `55cbef2`. Controlled browser tests also exercise `/KMUTT-OpenMap/?keep=1&building=N9` with a local path mount. Staged `.site/` is validated separately. Full CI is tracked in the PR.

Remaining QA: Firefox/Safari, physical Android/iOS, representative bandwidth/CPU/GPU, screen-reader review, prolonged memory/FPS measurement, independent GIS/source/licensing review, current entrances and on-site navigation. The implementation has not changed production/main or closed unresolved issues.

## Actual application screenshots

These are application captures with rendered attribution, not generated concepts. Overview camera pitch and label strategy changed; before/after comparisons are qualitative, not a measurement of real height accuracy.

| State | Evidence |
| --- | --- |
| Before desktop / mobile | [desktop](qa/before-desktop.png), [mobile](qa/before-mobile.png) |
| After desktop / mobile | [desktop](qa/after-desktop.png), [mobile](qa/after-mobile.png) |
| Selected / provenance | [desktop](qa/selected-desktop.png), [mobile](qa/selected-mobile.png) |
| Night / 2D | [night](qa/night-desktop.png), [2D](qa/2d-desktop.png) |
| Local preview / landscape | [proposal](qa/proposal-mobile.png), [landscape](qa/landscape.png) |
