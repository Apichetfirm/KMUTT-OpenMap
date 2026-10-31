# Engineering handoff for Codex A

Historical implementer handoff. Independent review, corrections and release-gate evidence are now recorded in [INDEPENDENT-REVIEW.md](INDEPENDENT-REVIEW.md).

**Initiated by Firm Impulse · FIBO FRAB11**

Feature branch: `feat/campus-map-v0.3`, based on `55cbef26cf2dea4e0c3fb336b6f517b8d2fc15e1`. Implementer: Codex B. This is an unmerged implementation for independent review; no final security, data or acceptance approval is asserted.

## Implementation summary

Students and visitors can find every original building, share a repository-path-safe URL and see location/height uncertainty and source links. Camera selection is replayed after map readiness, remains visible beside mobile panels, respects reduced motion and never invents an unmapped destination. Map rendering reuses a single extrusion/source, bounds/interpolates bases consistently, preserves the four-metre visual fallback for absent tile values, adds collision-aware labels and preserves selection across style reloads. GPS, CDN, JSON and storage failures have useful separate states.

The contribution workflow now previews before confirming, accepts evidence notes, edits/deletes/exports private drafts, retains legacy storage and protects unreadable bytes. Drafts never replace published coordinates or external-direction destinations. This fixes a material data-integrity problem in the baseline.

A typed evidence model, three sourced OSM footprint candidates, geometry validation, one approximate library POI, categories/clustering, recorded-hours evaluation and a guarded graph/routing engine provide the next data-development foundation. No fictional shops, paths, entrances or heights are published. Accepted geometry, actual metre heights and campus routing remain blocked by evidence/review.

## Phase completion matrix

| Phase | Status | Acceptance limits |
| --- | --- | --- |
| 0 Audit/stabilization | Implemented and tested | Independent acceptance pending |
| 1 Mapping | Supporting workflow tested; partial data | 35 retained, 7 approximate points, 3 candidates, 0 accepted polygons, 28 unmapped |
| 2 3D fidelity | Rendering fixes tested; partial | No per-building physical-height correction or accepted shape joins; override schema only |
| 3 Search/UX | Core flows implemented/tested | Physical-device/screen-reader acceptance remains; unknown geometry is disclosed |
| 4 Places | Supported MVP implemented/tested | One approximate library; no documented schedules/restaurants/accessibility |
| 5 Navigation | Foundation implemented/tested | No real route/origin-destination UI; graph/entrances remain empty |
| 6 Reliability/performance | Failure paths and measurements tested; partial | Cloud map load ~3.65–4.45s; phone FPS/memory goals unproven |
| 7 Review readiness | Tests/docs/CI/static staging prepared | PR remains unmerged for Codex A; cross-browser/device/GIS review outstanding |

## Technical decisions and change log

Retained framework-free static ES modules and GitHub Pages. New pure modules cover evidence/geometry, places/hours, sharing and navigation; map lifecycle is extracted from UI orchestration. No backend or runtime npm install is added. Existing approximate catalog records and v0.2 storage key remain. Candidate and accepted geometry are separate collections, as are measured height and render estimates. UI uses safe text DOM construction and HTTP(S)-only evidence links.

New development dependencies: pinned `@playwright/test` 1.64.1 and `maplibre-gl` 6.16.0 (same library/version as the existing runtime CDN), with lockfile. Development now requires Node >=20 because the pinned Playwright version requires it; CI uses Node 22. CI installs them, runs deterministic browser fixtures and stages an allowlisted `.site/` artifact. Production still loads pinned CDN MapLibre and live OpenFreeMap. Existing workflow permissions and main-only deployment are preserved; no repository settings are changed.

Introduced data: OSM ways 311879209, 420534143, 436983061 as **candidates**, plus one approximate library POI. Source versions/timestamps, exact matching rationale, ODbL attribution and limitations are retained. Official names were rechecked; S1/S6/N19 conflicts remain. Microsoft documentation and KMUTNB product concepts were investigated without importing their datasets/assets/code. Third-party legacy reference licensing remains a review risk.

Detailed model, evidence and limitations: [DATA-MODEL](DATA-MODEL.md), [ARCHITECTURE](ARCHITECTURE.md), [DATA-STATUS](DATA-STATUS.md), [HEIGHT-QA](HEIGHT-QA.md), [BASELINE-AUDIT](BASELINE-AUDIT.md), [DATA-LICENSES](../DATA-LICENSES.md).

## Tests and data integrity

33 unit/data/map integration tests and 12 desktop/mobile Playwright regressions pass locally. Syntax, data validation, MapLibre style-spec validation, dependency audit and static build pass. Live Chromium covers overview/selection, real tiles, day/night, 2D, mobile proposal preview and landscape; no app JS errors, with documented provider-style warnings. Raw measurements and 10 actual screenshots are linked in [TEST-RESULTS](TEST-RESULTS.md).

Counts: 35 buildings; 7 approximate coordinates; 0 accepted/verified footprint associations; 3 candidate associations; 28 unmapped buildings; 0 measured heights or published building-specific estimates; 0 verified entrances/routes; 1 approximate POI; 0 verified POIs or documented schedules. Basemap tile rendering is not counted as measured height coverage. Tests do not certify real-world information.

## Reviewer attention and remaining work

- Check code-to-source matching and permissions before accepting the three candidate footprints or legacy third-party reference redistribution. Keep S1/S6/N19 unresolved until evidence supports a change.
- Review storage backup/error behavior, confirmation semantics and strict separation of local/published coordinates. A different existing recovery backup blocks overwriting corrupted storage until it is exported/handled explicitly.
- Review conservative geometry validation and cross-building overlap/topology. Route validation can only test against known accepted footprints; unknown building passages still require field review. Routing production gates must never opt into unverified synthetic fixtures.
- Validate real phone/browser/screen-reader behavior. Cloud software WebGL results do not prove 30 FPS, low-end-phone performance, no persistent memory growth or a 3-second interactive target.
- Upstream provider styles emit missing-sprite and road-filter warnings; no speculative edits to provider geography/assets were made. Heights remain tile-based estimates/fallbacks.
- Height-override validation and empty route visualization sources are infrastructure; there is no claim that physical per-building overrides or real routing were completed.

## Rollback and independent acceptance

Do not merge this PR as implementer. After independent review, merge/revert through the normal maintainer workflow. Rollback can revert the feature commits and redeploy main; no remote database migration exists. Preserve local proposals/recovery exports. The original v0.2 reader accepts the compatible proposal fields, and catalog additions are additive.

Final reviewer checklist:

- [ ] Review diff, dependency/CI security and external link/storage failure handling.
- [ ] Independently check data provenance, license boundaries, candidate geometry and absence of fabricated claims.
- [ ] Run unit/data/browser checks and inspect the staged Pages artifact/base path.
- [ ] Inspect actual desktop/mobile before/after evidence and test physical devices/assistive technology.
- [ ] Confirm all real routing/accessible-navigation and metre-height claims remain disabled/unverified where unsupported.
- [ ] Keep issues #1–#5 open unless their complete acceptance criteria have separately passed.
- [ ] Decide final acceptance; implementer must not self-merge.

## File manifest

Changes relative to the audited baseline (generated from the Git working tree):

Added:

- `.github/ISSUE_TEMPLATE/place-data.yml`
- `data/building-footprint-candidates.geojson`
- `data/building-footprints.geojson`
- `data/evidence/source-review.json`
- `data/height-overrides.json`
- `data/pedestrian-graph.json`
- `data/places.geojson`
- `docs/ARCHITECTURE.md`
- `docs/BASELINE-AUDIT.md`
- `docs/DATA-MODEL.md`
- `docs/IMPLEMENTATION-HANDOFF.md`
- `docs/qa/2d-desktop.png`
- `docs/qa/after-desktop.png`
- `docs/qa/after-mobile.png`
- `docs/qa/before-desktop.png`
- `docs/qa/before-mobile.png`
- `docs/qa/landscape.png`
- `docs/qa/live-metrics.json`
- `docs/qa/night-desktop.png`
- `docs/qa/proposal-mobile.png`
- `docs/qa/selected-desktop.png`
- `docs/qa/selected-mobile.png`
- `package-lock.json`
- `playwright.config.mjs`
- `scripts/build.mjs`
- `scripts/check.mjs`
- `scripts/generate-data.mjs`
- `scripts/import-osm.mjs`
- `scripts/validate-data.mjs`
- `src/data.mjs`
- `src/map.mjs`
- `src/navigation.mjs`
- `src/places.mjs`
- `src/sharing.mjs`
- `tests/data.test.mjs`
- `tests/e2e/campus.spec.mjs`
- `tests/map.test.mjs`
- `tests/places-navigation.test.mjs`

Modified:

- `.github/workflows/pages.yml`
- `.github/workflows/test.yml`
- `.gitignore`
- `CONTRIBUTING.md`
- `DATA-LICENSES.md`
- `README.md`
- `data/README.md`
- `data/buildings-geocoded.geojson`
- `data/buildings.json`
- `data/mapping-status.csv`
- `docs/DATA-STATUS.md`
- `docs/HEIGHT-QA.md`
- `docs/PUBLISH-GITHUB.md`
- `docs/ROADMAP.md`
- `docs/SPEC.md`
- `docs/TEST-RESULTS.md`
- `index.html`
- `package.json`
- `src/heights.mjs`
- `src/main.mjs`
- `src/mapping.mjs`
- `src/search.mjs`
- `src/styles.css`
- `tests/project.test.mjs`
