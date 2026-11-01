# Release-candidate baseline audit — 2026-11-02

Initiated by Firm Impulse · FIBO FRAB11.

Latest origin/main is `0bdeadd63d668d359fbe780fd5aef0acf98a25df`. Inspected all source, data, workflows, existing review documents and complete open issues #1–#5/#7. CI and Pages runs for that SHA succeeded. `npm ci`, syntax/data validation and 34 unit/integration tests pass. The 22 existing Chromium browser tests run with system Chromium and the real MapLibre runtime plus controlled provider responses. See the final handoff for full results.

Recomputed baseline: 35 buildings; 7 approximate references; 28 unmapped; 3 candidate polygons; 0 accepted polygons; 1 documented floor count; 0 measured heights/verified entrances/routes; 1 approximate POI; 0 schedules.

Confirmed issues: fetches have no deadline (core and optional sections can remain loading indefinitely); retrying a failed module import reuses the browser's cached failure; POIs lack independent details, searchable names, deep links and source/directions actions; candidate footprints cannot be selected in the correction editor; coverage only reports three totals; CI actions use mutable tags and runtime code depends on CDN availability. The first fixes add bounded fetches and a fresh module URL for deliberate retries, preserving search/drafts and map preferences.

Security baseline: locked npm dependencies; npm audit reports 0 advisories. Actions and runtime delivery still need hardening. Existing Web Locks/revision checks, textContent rendering, coordinate limits and HTTPS evidence validation are retained.

Official directory and BGM pages are reachable. The OSM bbox API returned source geometry and necessary tags; Overpass returns HTTP 406. Live production and reference GitHub Pages hosts are denied by the environment's network policy; this is a testing limitation, not a production outage. Local real-provider checks and fixture checks are recorded separately. No settings or access rules changed. Field surveys and physical devices are unavailable.

The historical v0.3 baseline audit remains in Git history; final architecture, data evidence and limitations are updated with the release candidate.
