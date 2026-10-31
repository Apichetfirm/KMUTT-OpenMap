# Implementation roadmap — 2026-11-01

Initiated by Firm Impulse · FIBO FRAB11. Feature branch is for independent review; no self-merge or public beta declaration.

| Phase | Implemented/tested now | Still blocked or incomplete |
| --- | --- | --- |
| 0 — audit/stability | Clean baseline, audit, confirmed bug fixes, safe storage/map failures, tests/build | Independent Codex A acceptance |
| 1 — mapping integrity | 35 preserved codes, evidence/confidence schema, three OSM candidates, validation and preview/export | 28 unmapped locations, all field verification, accepted polygon joins, S1/S6/N19 resolution |
| 2 — 3D fidelity | Layer/source reuse, base/roof bounds, selected point, label collision, height provenance/override schema | Actual building-specific dimensions/overrides and accepted shape association |
| 3 — core experience | Search, shared URLs, mapped/unmapped cards, provenance, reduced motion, mobile/keyboard flows | Physical-device and screen-reader review; selected shape remains unavailable without accepted geometry |
| 4 — campus life | One sourced approximate library point, categories/clustering, tested recorded-hours engine, issue intake | Verified service coverage, actual hours, restaurant data and accessibility evidence |
| 5 — navigation | Validated graph, deterministic shortest path, connectivity and evidence/accessibility gates, empty route layer | Reviewed entrances/paths, real origin/destination UI and any published internal/accessible route |
| 6 — reliability/performance | CDN/storage/data/GPS failure handling, batched labels/POIs, cloud measurements | Three-second map target, representative phone FPS, long-session memory/device/network testing |
| 7 — review readiness | Unit/data/real-browser fixtures, live screenshots, CI/Pages staging, documentation | Independent review, cross-browser/device acceptance; no beta approval implied |

Next work in order: independent P0 review → review the three source polygons and legacy reference licensing → field survey missing locations/entrances/heights → physical Android/iOS/Firefox/Safari and assistive-technology QA → verify services/hours → survey and review route/accessibility network. Keep #1–#5 open while their full acceptance criteria remain unmet. Avoid tours/PWA/advanced architecture before these gates pass.
