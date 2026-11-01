# QA results — v0.4 release candidate

Initiated by Firm Impulse · FIBO FRAB11. Date: 2026-11-02 (Asia/Bangkok).

## Environment and commands

Linux managed workspace, Node 24.19.0, npm 11.9.0, Playwright 1.64.1, system Chromium `/usr/bin/chromium`, headless WebGL2/SwiftShader. The Browser plugin is absent; regular Playwright is the documented fallback. Loopback server exercises both `/` and `/KMUTT-OpenMap/`. CI uses Node 22 and installs all configured browser engines.

| Command | Result |
| --- | --- |
| `npm ci` | Pass; 28 locked development packages installed |
| `npm run check` | Pass; all ES module syntax |
| `npm run validate-data` | Pass; catalog, accepted/candidate geometry, places, schedules, graphs, generated coverage and height provenance |
| `npm test` | **46 passed, 0 failed** |
| `npm run verify-vendor` | Pass; module, separate worker, CSS, license match manifest and locked npm bytes |
| `OPENMAP_CHROMIUM=/usr/bin/chromium npx playwright test --project=desktop --project=mobile` | **40 passed, 0 failed**, 4.1 minutes |
| `npm run build` | Pass; vendor verified and allowlisted Pages assets staged |
| `npm audit --json` | Baseline and final: **0 advisories** |
| `npx playwright install firefox webkit` / separate WebKit attempt | BLOCKED — TECHNICAL: download endpoints denied HTTP 403 by environment policy |

Baseline from latest main `0bdeadd63d668d359fbe780fd5aef0acf98a25df`: 34 Node tests and 22 Chromium desktop/mobile browser tests passed. The release candidate expands to 46 and 40. Intermediate failures exposed stale expectations after data expansion, a popup fixture needing a local response, and the initially missing vendored worker; these were corrected before the final passes. They are not omitted failures from the final command.

After the final preview-framing refinement, the focused desktop/mobile candidate test is rerun with a new explicit non-overlap assertion; result: **2/2 passed**; see `qa/v04/preview-checks.txt`.

## Browser validation

| Check | Final evidence |
| --- | --- |
| Page identity / no blank page | Correct title and 35 building rows; actual selected card and WebGL canvas |
| Framework error overlay | None; the app is framework-free |
| Runtime errors | None in passing interaction checks; actual live-provider health recorded in `qa/v04/browser-health.json` |
| CSP / worker | Actual vendored module and worker return 200 at the Pages base path; no CSP violation in the fixture test |
| Building flow | Thai/English/code search → Enter → focus/highlight/camera → source/floors → URL → reload/history |
| POI flow | Name/category filter → details → stale schedule/source dates → shared URL/reload → walking link → report form |
| Mapping | Candidate selection/48m labeled N16 assumption → one preview extrusion → local confirmation; published reference unchanged |
| Contributions | Review required → local save → JSON export → edit invalidates review → reload → delete; legacy key retained |
| Recovery | Runtime/storage failures, fresh import retry, stalled/failed catalog retry, optional data stall, GPS denial, clipboard fallback and literal hostile text |
| Navigation | Public internal controls remain disabled; synthetic routing checks reject insufficient access/review/entrance/accessibility evidence |
| Layout/accessibility | Desktop 1440×1000; Pixel 7 emulation; additional 360×640, 844×390, 667×375, 700×900; selected marker/controls/attribution reachable; keyboard and reduced motion |

Fixtures run the real MapLibre library with controlled empty provider tiles and actual source data. They prove software behavior, not provider uptime, route safety or geographical truth. Live QA records zero uncaught errors, zero failed requests, zero console errors and zero CSP violations. Nonfatal warnings remain from SwiftShader screenshot readbacks and upstream style filters/missing provider sprite icons; raw messages are retained in browser-health.json and are not described as a warning-free console.

Actual screenshots use the unmodified local application and live OpenFreeMap/OSM tiles; no generated imagery or map fixture is used. Screenshots cover overview, N9/N10/N16, light/night/2D, candidate preview, service search/details, navigation coverage, contribution review and phone/tablet layouts. Before screenshots are from the detached original main checkout.

## Limits and release gates

Firefox/WebKit projects are configured in Playwright and CI, but local binary downloads are denied; this report does not claim a local pass for either engine. The actual production/reference GitHub Pages domains are also denied by this environment. Local same-source/live-provider results are not production-site tests. No physical Android/iOS, Safari hardware, screen-reader session, thermal/memory soak or mid-range Android FPS was performed. No independent WCAG certification is claimed.

Sequential actual-provider load/search measurements are in `qa/v04/performance.json` and PERFORMANCE.md. Software-rendered headless results do not satisfy the physical-device 30 FPS target. Independent reviewer must inspect CI at the final SHA and perform the listed physical/live-release checks. No phase depending on these checks is labeled complete.
