# v0.5 implementation handoff

Initiated by Firm Impulse · FIBO FRAB11. Base: latest main `8973cf7`. Independent Codex A review required; no self-merge or major release.

## Actual delivery and status

| Phase | Status | Evidence / limitation |
| --- | --- | --- |
| 1 Photography | PARTIAL — EXTERNAL EVIDENCE | Inspected all 35 individual BGM building reference pages (35 HTTP 200), official campus page and Commons search. Commons is blocked HTTP 403 by the managed network. Public university access is not a photo reuse grant. **0 publishable photos**, 35 explicit unresolved records; no image copied. |
| 2 AI matching | PARTIAL — EXTERNAL EVIDENCE | Offline nonsemantic pixel feature extraction plus deterministic observation/provenance validation and sign/metadata comparison, floor-conflict flags and separate candidate output implemented. **0 actual vision observations or AI matches**, because no licensed building images are available. No visual model was run or fabricated. |
| 3 Detail component | IMPLEMENTED | Reusable `BuildingDetail`, licensed-image/unknown/broken states, attribution, explicit-on-open gallery, canonical aliases/faculty/description/review fields, unchanged existing floor/height/entrance/source/actions and URLs. Unknown descriptions remain unknown. |
| 4 Street View | IMPLEMENTED with availability unknown | Official Google Maps panorama-search URL for the 20 existing approximate points; 15 unknown locations have a disabled state. **0 confirmed panoramas**. Opening a nearby viewer does not identify the building. No iframe/key, scrape, image download or Google-derived geometry. |
| 5 Optimization | IMPLEMENTED, real-photo benchmarks blocked | Offline Pillow WebP 320/640/960 derivatives, EXIF removal, sizes/hashes, no upscaling/duplicate width descriptors; static publication allowlist, image header/existence/budget validation; lazy async responsive card. Only synthetic QA images were used to test conversion, never presented as campus photographs. |
| 6 Model | IMPLEMENTED | Separate `building-media.json` covers all 35 codes. Existing `floor_count`, `building_height_m`, `mapping.confidence`, source and verification fields stay canonical. Adds nullable faculty/description and unknown panorama reference. No duplicated canonical height/count/location fields. |
| 7 Review | IMPLEMENTED | `/admin/` local-only tool: building, approved media, source footprint SVG/metadata, private imported analysis, accept-for-PR/reject/request-evidence, distinct reviewer, evidence/rationale, structured export. Decisions never publish. Admin and private `work/` analysis excluded from static build. |
| 8 QA/performance | See results below | Actual Playwright, metadata/logic tests, synthetic image optimization and measured actual-provider comparison. No physical-phone/AI accuracy/photo-rich performance claim. |
| 9 Handoff | IMPLEMENTED | This report, source records, reproducible commands, tests, actual screenshots and unmerged PR. |

## Reproduction

Serve the repository with `node scripts/serve.mjs . 8080` and open `/admin/` for local evidence review. The tool requires no login/backend but is intentionally absent from `.site/`; do not deploy the development root as an admin service. Private analysis stays in memory; export before closing. Exported decisions must undergo a separate independent PR approval before accepted GIS changes.

For a legally reusable photo obtain explicit identity/rights review first. Required metadata: id, meaningful alt text, photographer, allowed license, source, attribution, checked_on, publication reviewer/reviewed_on, width/height, nullable capture_date/camera_coordinates/camera_heading and optimized variants. Permission-only/unlisted licenses require deliberate policy extension and documented grants; do not bypass validation by inventing a CC license.

```sh
python -m pip install -r scripts/requirements-images.txt
python scripts/optimize-building-images.py ORIGINAL REVIEWED-METADATA.json work/derivatives
# Inspect metadata/EXIF/identity, then deliberately copy only approved derivatives
# into assets/buildings and add their metadata to data/building-media.json.
npm run validate-media
```

No original photograph is automatically copied. Build copies only paths from validated approved photo/gallery records and rejects missing, invalid-format or >1MB image files; targets remain 20–40KB thumbnails and 50–120KB main images where real content permits. No current real-photo size claims exist. Synthetic solid-color fixture sizes (216/626/1308 bytes) only test conversion, not representative compression quality.

A development-time vision-capable model can produce a private observation JSON array:

```json
[{"photo_id":"APPROVED-ID","model":"ACTUAL-MODEL","model_version":"ACTUAL-VERSION","analyzed_on":"2026-11-02","sign_text":"OBSERVED SIGN ONLY","features":["observable facade/roof/landmarks with uncertainty"],"visible_floors":null,"uncertainty":"Occlusion, viewpoint and alternative matches"}]
```

Do not use this illustrative schema as an actual observation. Independently check model output against the original legally reusable image. No recurring paid API dependency is introduced, so recurring AI cost is zero. Optional model operation/cost must be evaluated separately before adoption. Current workflow performs zero image inference, both during builds and browsing.

```sh
node scripts/analyze-building-evidence.mjs work/observations.json data/building-media.json work/building-analysis.json
# Or with no input: records all 35 unresolved; zero AI observations/matches.
```

The matcher recognizes reported signs/codes/names, attaches existing independently sourced candidate IDs and flags floor disagreement; it is not an image embedding classifier, facade geolocator or source of measured height. Features are preserved for human inspection. AI candidates are never accepted polygons. No GPS is inferred from a facade, no visual floor estimate is converted to metres and no Google imagery is used in the pipeline. Independent review remains required even after a reviewer records “accept for PR review”.

## Coverage and governance

35 building media records; 35 researched reference pages; 0 approved photographs/gallery images; 0 original photographs redistributed; 0 actual AI observations/matches; 0 new accepted geometry, heights or entrances. Existing 20 approximate points, 18 candidate footprints and all previous unresolved associations are unchanged. Source URLs/retrieval outcomes are in `data/evidence/building-photography-coverage.json` and `photography-research.json`. Known official page source dates/photographers/camera positions are unknown, not invented. Canonical metadata and image publication review are separate from geographical verification.

## Tests, performance and remaining risks

See `docs/qa/v05/` for actual command results, screenshots and measurements. Browser plugin absent: regular Playwright used. Flow: `?building=N9` → evidence card → unknown/approved/broken image states → supported panorama-search link → shared URL/report; local reviewer → independent decision/export. Existing directory, marker, mobile, draft and URL regressions remain in the full suite. Test photographs/model observations are explicitly synthetic and excluded from publication.

Photo rights/identity, licensed source inputs, actual vision-model evaluation, confidence calibration, field matching/entrances and physical-device performance remain external evidence blockers. University staff/photographers can provide licensed dated original images and independently recorded camera metadata; GIS reviewers can then compare with the existing OSM candidates. Accept only a documented association through an independently reviewed PR. Physical reviewers must confirm panorama availability/identity externally; the application deliberately makes no such claim. No runtime AI, Google image caching or backend infrastructure was added.

### Measured results

Six alternating pairs of fresh contexts on system Chromium 156, sandbox enabled, 1440×1000, software WebGL, real OpenFreeMap, no throttling or concurrent local browser QA. Comparison is latest main `8973cf7` versus v0.5 runtime at `64b401c`. The measured runtime includes compact metadata and the retry readiness fix. Later changes add private pixel-extraction tooling, tests and documentation; they do not change startup/photo behavior. Browser process/proxy/OS/provider caches are uncontrolled; these samples do not establish a causal speedup.

| Median metric | main | v0.5 |
| --- | ---: | ---: |
| Initial MapLibre load | 8770.40ms | 7424.45ms |
| Detail open synchronous JS/DOM | 75.55ms | 74.25ms |
| Search synchronous JS/DOM | 1.55ms | 0.75ms |
| Snapshot JS heap | 28.39MB | 27.40MB |
| Building image transfer | 0 bytes | 0 bytes |

All 12 samples loaded a canvas without uncaught app errors. “Detail open” excludes paint and is not input-to-next-paint; heap snapshots do not prove leak freedom. Real photographs remain unavailable, so no image-rich load-time, realistic compression or physical-smartphone performance claim is made. No robust regression in initial map loading was observed, and the existing ~3-second target is still unmet under software rendering. Raw per-resource timings and long tasks are retained in `qa/v05/performance.json`.

Reproduce with a detached main served on 8091 and this branch on 8092:

```sh
OPENMAP_CHROMIUM=/usr/bin/chromium node scripts/measure-building-details.mjs \
 http://127.0.0.1:8091/ http://127.0.0.1:8092/ work/performance.json
```

`npm test`: **52 passed**, including license/provenance, all-code coverage, panorama URL bounds, ambiguous/floor-conflicting observations and independent export gates. Syntax/data/vendor/media validation and `.site` build pass. The focused new Playwright suite passed **8/8** desktop/mobile checks. An initial broader local run had 49 passes and one 5-second map readiness timeout; its isolated recheck passed. The first full CI matrix had 103 passes and one WebKit retry race: old controls remained enabled while a removed map was being replaced. The implementation now disables controls immediately on retry; the existing regression assertion is retained. Final CI result is linked from the PR rather than inferred from earlier passes.

Build inspection confirms `.site/admin` and `.site/work` do not exist. Reviewed image bytes alone can enter `.site/assets/buildings`; original images, private analysis, unreviewed decisions and optimizer metadata sidecars are excluded. Current published derivative count is zero. Actual screenshots in `qa/v05/desktop-n9.png` and `mobile-details.png` show real application rendering and an honest missing-photo state, not substitute building photography. Native dialog, keyboard selection, shared links, attribution, map framing, failed optional media, optimized-image attributes and broken-image fallback are tested. Synthetic image fixtures occur only in tests.

### Reviewer release checklist

- [ ] Inspect the final CI run for the exact PR head; rerun `npm run check`, `npm run validate-data`, `npm run validate-media`, `npm test`, browser matrix and `npm run build`.
- [ ] Confirm all 35 photo records are explicitly unresolved and no source-reference image has been copied into public assets.
- [ ] Confirm privacy separation, lazy selected-card loading, broken states, safe panorama URLs and unchanged canonical GIS/draft/URL behavior.
- [ ] Supply legally reusable pilot photos with identity/photographer/license/date/attribution and reviewed camera metadata; record source rights independently.
- [ ] Only then produce actual model observations, compare alternatives and independently approve any association via PR. Do not equate lexical candidate matches with geospatial verification.
- [ ] Check actual smartphone/Safari/provider behavior and real-photo performance when source assets are available. Keep field/photography/vision blockers open; do not self-merge.

Offline pixel features can be extracted before optional model analysis with `python scripts/extract-photo-features.py ORIGINAL REVIEWED-METADATA.json work/pixels.json`. The extractor records input SHA-256, dimensions and five dominant image colors after orientation correction. These include sky/vegetation/background and are explicitly **not** inferred facade colors, floor counts, OCR, identity or GPS. Synthetic extraction was executed and checked for dimensions, digest and normalized color fractions; no real-photo extraction or actual vision-model inference is claimed. This tool does not replace a vision-capable model or independent review.

The complete card runtime passes **104/104 cross-browser tests** (26 per project) in [CI run 41401966666](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41401966666). The additional Python suite passes **2/2** locally and is now part of CI. An earlier exploratory comparison measured 4.55s/4.37s before the compact refinement; the final six-pair comparison above is substantially slower in both versions. Both raw runs are retained, underscoring why no causal speedup or ordinary-phone performance claim is justified.
