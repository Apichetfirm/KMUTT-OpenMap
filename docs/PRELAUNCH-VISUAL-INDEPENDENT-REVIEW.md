# KMUTT OpenMap independent pre-launch visual review

4 November 2026, Asia/Bangkok. Initiated by Firm Impulse · FIBO FRAB11.

Reviewed [PR #16](https://github.com/Apichetfirm/KMUTT-OpenMap/pull/16) from supplied commit `823c3534888e2f12aca464d68259756f8468b707` against v0.5 main `6e410b7126ca6cbda2481c15a4aa2ccb88dd42b0`. Corrected candidate `35bc03ec7c24d78171d8ee59aeb4a51f98dc3ff8`.

## Visual findings and fixes

Reviewed all thirteen implementation screenshots, the [camera records](prelaunch-visual/cameras.json), the [implementation report](PRELAUNCH-VISUAL-IMPLEMENTATION-REPORT.md) and the live MapLibre app. The Argon4 comparison uses the direction described in the implementation handoff, including a warm architectural maquette, an orange-accented floating explorer and coordinated light/dark surfaces. A separate original Argon4 document was unavailable in this checkout.

Compared with v0.5, the opaque sand-colored faces, warmer lighting and contact wash give the buildings clearer depth. Reduced provider POI and road-shield clutter helps catalog labels and services. Daylight is more legible as a launch image. Dark mode coordinates the controls and panels with cooler building faces. Desktop keeps a clear central map corridor. The contact wash is a graphical treatment and the colors encode display height ranges.

| Severity | Finding | Resolution |
| --- | --- | --- |
| P1 | Compact attribution overlapped the header or controls. At 667×375, illustration-first content pushed directions and sharing out of the initial card. | Use a dedicated visible attribution row, move tools clear of it and place core actions ahead of the illustration in compact layouts. Add a regression for fully visible, unobscured actions and attribution. The regression initially recorded zero viewport intersection for directions. |
| P1 | Chromium portrait captures showed pale sheet paint across the visible map. The canvas rendered normally when the detail sheet was hidden. | Clip portrait sheet paint to its rounded bounds. On the same N10 view, the inspected map region returned from 27 colors to 434 colors with the clip applied. The final unmodified capture shows the live scene. |
| P1 | The first layout correction passed locally but still clipped the directions button in cross-engine CI. | Compress the short-landscape detail header and button spacing while retaining the full canonical name and 44px minimum action height. |
| P2 | The short landscape card still scrolls for Street View and extended provenance. Attribution is small on the narrowest portrait. | Primary controls remain directly reachable. Keep these as follow-up usability items. |
| P3 | Detailed façade textures, roof forms and architectural materials would require evidence beyond the current model. | Retain the maquette treatment. |

No P0 finding was identified in this review. The fixes are `49fdb7be638645f612d99018aec10d2d2cf9b6d3` and `35bc03ec7c24d78171d8ee59aeb4a51f98dc3ff8`.

## GIS and content

All 35 rendered names and IDs were compared with the canonical catalog. N9 is the Institute of Field Robotics, N10 the KMUTT Library, N11 the School of Information Technology, N16 the Learning Exchange, N17 Classroom Building 2 and N20 Classroom Building 1. The concept's FIBO description did not enter the catalog or card. N16 has a sourced count of 15 floors and unknown measured height.

The data tree matches v0.5. There are 20 approximate points, 15 unmapped codes, 18 unreviewed candidates, zero accepted footprints, zero measured heights and zero verified entrances or routes. Accepted outlines require a matching catalog code on accepted geometry. Provider extrusion and contact fill use vector building polygons. Live renderer inspection confirmed one opaque vector extrusion in normal use and one 0.42-opacity GeoJSON Polygon extrusion in the N9 candidate preview, with zero accepted features in both states. [Renderer record](prelaunch-independent/renderer.json). Catalog points drive labels and approximate markers. Candidate previews use separate dashed/translucent styling. Internal routing and verified wheelchair routes remain disabled. Google walking directions use the approximate reference coordinates, with an explicit entrance disclaimer. Street View uses nearby panorama search with unknown availability and identity. The generic illustration carries its non-building caption. Zero approved photographs or building-image requests were observed.

## Mobile and accessibility

The live test exercised 360×640, 390×844, 667×375, 768×1024 and 1440×900. It checked horizontal overflow and hit testing of search, directions, sharing, close, location and attribution. Mobile checks also covered full/peek/half keyboard snaps, covered map controls leaving the tab order, separate directory/detail slots, Google Maps and Street View URL dispatch and browser back/forward. Provider imagery was not fetched during the Google dispatch check. The browser suite covers pointer drag, focus return, detail scrolling, proposals, candidate display and map retry.

Computed sRGB checks for the main text pairs give 14.18:1 and 5.94:1 for daylight primary/muted text, 11.80:1 and 8.01:1 in dark mode, 5.29:1 for white text on orange, 4.61:1 for light building-code text and 6.63:1 for dark code text. Focus colors measure 6.19:1 and 8.23:1 against their panel backgrounds. These are sampled component pairs under [WCAG 2.2](https://www.w3.org/TR/WCAG22/), with separate limitations for tile labels and third-party UI. Main actions are 44px high. Compact landscape zoom controls are 34px and sheet handles 36px. Handle clicks and keyboard commands supplement drag. Thai system text was readable at the inspected sizes. Reset has an explicit accessible name. The browser accessibility tree confirmed names for search, close, directions, share, reset and locate, all at 44px high in the inspected portrait view. Keyboard focus was visible on the handle and returned to search on close. [Accessibility record](prelaunch-independent/accessibility.json). Reduced motion suppresses CSS transitions and camera animation. Safe-area CSS was inspected. Physical notches, native Facebook WebViews, assistive technology and 200% zoom were outside the executed checks. This is a targeted review with no full conformance claim.

## Performance

Independent samples used alternating order, fresh contexts, sandboxed Chromium 156.0.8078.4, software WebGL, live OpenFreeMap and loopback static serving on the same Windows machine. Desktop used six pairs at 1440×900 and mobile emulation three pairs at 390×844. There was no throttling and no concurrent QA browser during sampling.

| Median | Desktop v0.5 | Desktop candidate | Mobile v0.5 | Mobile candidate |
| --- | ---: | ---: | ---: | ---: |
| Map ready | 1,937.8 ms | 1,388.0 ms | 1,105.9 ms | 1,023.1 ms |
| Observable transfer | 2,075,410 B | 2,088,747 B | 2,075,410 B | 2,088,747 B |
| Search handler | 0.45 ms | 0.50 ms | 1.10 ms | 0.90 ms |
| Detail handler | 18.1 ms | 18.9 ms | 23.8 ms | 19.5 ms |
| Detail through two frames | 160.9 ms | 150.0 ms | 76.0 ms | 52.6 ms |
| Long-task total | 1,724 ms | 1,565 ms | 646 ms | 537 ms |
| Heap estimate | 27.6 MB | 23.1 MB | 26.0 MB | 19.3 MB |
| Observed layout-shift sum | 0.0542 | 0.0279 | 0.1863 | 0 |

Both variants used one canvas and 31 observed startup resource entries. Paired sign-flip p-values are 0.0625 desktop and 0.25 mobile. The samples do not establish a causal speedup. Cache state was uncontrolled. Transfer excludes opaque cross-origin bytes, heap excludes GPU memory, and layout shifts include scripted selection. Two frames do not measure INP. This does not establish physical-phone FPS or thermal behavior. The implementer's 2.50s/2.35s figures are from a separate environment. [Raw independent measurements](prelaunch-independent/performance.json).

## Checks and privacy

Initial candidate CI logs confirm 56 Node, 4 Python and 120 browser passes. Local syntax, data, media, locked vendor digests, production build, 56 Node and 4 Python tests passed. npm and strict Python dependency audits reported no known vulnerabilities. The initial correction's local three-project run had 91 passes and two WebKit readiness timeouts. Both cases passed in the final serial focused rerun, which passed all nine Chromium desktop/mobile and WebKit checks. Firefox failed to launch locally with Windows `spawn UNKNOWN`. The Linux matrix is authoritative for Firefox. The intermediate CI failure was a real landscape clipping failure and was corrected in the final candidate.

The dependency lock, vendor payloads, CSP and workflows match the previous release. The corrected candidate build inventory contained 222 files including the Pages configuration marker. It contained zero private/offline tool paths or building image files. Live QA recorded no page errors or CSP violations. The private reviewer, offline scripts and work outputs stay outside Pages. [Live browser record](prelaunch-independent/browser.json).

## Launch images

Approve the replacement actual-application captures for the community preview. The originals are valid evidence of the supplied candidate but predate the final attribution, landscape and paint fixes.

- [Campus overview](prelaunch-independent/launch-campus-overview.png)
- [N16 Learning Exchange](prelaunch-independent/launch-building-n16.png)
- [N10 mobile detail](prelaunch-independent/launch-mobile.png)
- Additional [dark](prelaunch-independent/dark.png), [360×640](prelaunch-independent/qa-360.png), [667×375](prelaunch-independent/qa-667.png) and [768×1024](prelaunch-independent/qa-768.png) captures.

## Release record

**Accepted for the community preview.** The corrected head passed [final candidate CI](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41712971381) with 56 Node, 4 Python and 124 browser tests. PR #16 merged at `2717eb0b8c2bebffa1195bb388db9add5737cae6` after checking the current head and base. [Pages deployment](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41714153767) completed successfully.

All 213 served files matched the release merge byte for byte. The 222-file local stage also included local QA captures. Production browser checks covered all 35 buildings and five viewports, including mobile handoff and history navigation. A deliberately blocked runtime module left the directory usable, and retry restored the live map. [File verification](prelaunch-independent/deployed-files.json) · [Production browser](prelaunch-independent/production-browser.json) · [Production recovery](prelaunch-independent/production-recovery.json).

The follow-up evidence commit records this review and the launch captures. The release merge above identifies the application reviewed.

Public announcement scope is the student community preview. Device-level Facebook in-app browser and assistive-technology coverage remain unverified. Geographic uncertainty and unavailable verified routing should remain explicit in the announcement.
