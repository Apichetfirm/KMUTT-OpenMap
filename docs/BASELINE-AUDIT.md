# Baseline audit — 2026-11-01

Initiated by Firm Impulse · FIBO FRAB11. Implementer handoff; independent acceptance is still required.

Baseline: `55cbef26cf2dea4e0c3fb336b6f517b8d2fc15e1`, clean checkout; 11/11 Node tests and syntax checks pass. Latest CI and Pages deployment succeeded ([Pages run](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41229441308)). Five open issues (#1–#5) cover mapping, browser/device QA, name conflicts, routes and places; none is closed by this implementation.

## Findings

| Area | Finding / planned response |
| --- | --- |
| Data | 35 names, seven approximate points, no accepted polygons/entrances/heights. Preserve unknowns; add evidence records, candidate separation and validation. |
| Proposals | Drafts override catalog coordinates, click saves immediately, storage writes can throw, corrupt data silently disappears. Separate drafts; preview/confirm, evidence notes and recovery backup. |
| Map | GPS assumes MapLibre is ready; selection before map load never refocuses; uncapped extrusion bases can exceed capped heights. Guard readiness, replay selection and clamp/interpolate bases. |
| Search | Exact codes rank first, but punctuation/alias spacing and coordinate filtering need stronger validation. Preserve bilingual deterministic search. |
| UI | No shared URLs, provenance links, selected location highlight or reduced-motion support. Mobile sheet can cover details and search. Add focused changes, keyboard access and responsive states. |
| Resilience | Catalog fetch is separate from CDN, but localStorage getter can abort startup. Isolate map/storage failures and add useful retry states. |
| Performance | Recreates every marker on refresh; no collision management. Use batched GeoJSON symbol labels and a single selected marker. Measure browser work, avoid phone FPS claims from emulation. |
| Publication | Static ES modules, pinned CDN MapLibre, no runtime npm dependencies. Keep repository-relative URLs and deploy only from main after independent review. |

## Implementation sequence

1. P0: evidence/geometry/height validation and honest data coverage; preserve all codes and existing local storage key.
2. P0: isolated contributions, safe storage, search/share/selection, robust layer lifecycle, mobile/accessibility and failure handling.
3. P1: sourced places, Bangkok opening-hours evaluation, filters and contribution intake; deterministic routing foundation with real routing disabled until reviewed paths and entrances exist.
4. P0: synthetic/data/browser tests, desktop/mobile evidence, measured limitations, documentation and an unmerged PR.

## Reference and source investigation

Rechecked the official campus directory and BGM master plan: 35 codes remain listed; S1/S6/N19 conflicts persist. No official coordinate or height claims follow from these pages. Existing approximate points remain approximate.

Studied the KMUTNB repository's rendered HTML text for concepts: building/service filters, confidence disclosure, camera presets, selected-place details, day/night controls and a separate contribution mode. Its repository license reports `NOASSERTION`; no code, images, geometry or content is reused. Independent implementation remains MapLibre/ES modules. Live reference-site access and provider availability are environment-dependent.

OSM is investigated as a candidate source, not proof of code associations or accessibility. Microsoft Global Building Footprints requires a reviewed campus clip and independent matching; no Microsoft geometry is imported in this change. See DATA-LICENSES.md for separate licensing.
