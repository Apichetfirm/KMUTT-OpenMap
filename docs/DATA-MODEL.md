# Data model and governance — v0.4 RC

Initiated by Firm Impulse · FIBO FRAB11.

## Canonical buildings and evidence

`buildings.json` retains all original IDs, names, aliases, zones and published coordinates. Fields include Thai/English names, department and department evidence (null when unknown), coordinates, floor count/source, physical height/evidence, separate public entrances and mapping metadata. `mapping` contains confidence, review status, accepted footprint ID, candidate IDs, evidence, verification date, unresolved reason and review notes. Unknowns remain null/explicitly unresolved. Name sources are independent of location sources. S1/S2/S6/N19 conflicts stay visible.

Evidence records retain HTTP(S) source URLs without embedded credentials, license/permission, method, source date/version/timestamp when available, retrieval/check date, reviewer/verification date and limitations. Field-verified claims require `method:field-survey`, a valid verification date and reviewer; routing additionally requires a distinct independent reviewer. A retrieved page or named OSM feature is not a field survey.

Confidence values: `unverified`, `approximate`, `conflicting`, `high-confidence`, `verified`. Approximate points are references, never implied entrances. Accepted geometry belongs in `building-footprints.geojson`; candidates stay in `building-footprint-candidates.geojson`. Canonical `mapping.footprint_id` and accepted features must agree. Rings, holes, self-intersections, multipolygon components, duplicate associations, point containment and positive-area overlaps across accepted buildings are checked. Shared boundaries are permitted. Complex/partial associations require explicit review; N4 is a Mathematics-only candidate.

`geometry.mjs` computes an interior point rather than assuming the vertex average of a concave shape is inside. `coverage-report.json`, `mapping-status.csv`, `buildings-geocoded.geojson`, DATA-COVERAGE.md and candidate `building-rendering.json` are derived views. Regenerate with `npm run generate-data`; validation rejects stale coverage/point views. Source counts must never be edited to imply verification.

## Height and candidate visualization

Physical height and rendering height are separate. `height-overrides.json` supports measured, official-floor, OSM-height/levels, documented-estimate and generic fallback kinds with evidence; it contains no accepted overrides. `building-rendering.json` records all 18 candidate preview choices, geometry IDs, roof source tags, kind, explicit metres-per-level assumptions and null measured height. Candidate previews use official floor count first, then source levels, then a generic 4m fallback. Estimates use 3.2m/level only as a disclosed editor visualization. They never populate physical height. See HEIGHT-QA.md.

## POIs and schedules

`places.geojson` uses stable Point feature IDs, names, optional English names, category, description/scope, optional building reference, confidence, evidence, last verification, accessibility and optional opening hours/raw source expression. All 73 current records are approximate OSM services in the campus/nearby area. No point is declared a surveyed entrance. Unsupported categories remain empty, including verified accessible entrances, water and printing.

Hours schema: `{timezone:'Asia/Bangkok',checked_on,evidence,weekly:{'0':[],'1':[['09:00','17:00']]},exceptions:{'2026-12-31':[]},holiday_coverage:'unknown'}`. Sunday is day 0; absent day means unknown, empty day means closed. Intervals end exclusively; an end earlier than start crosses midnight. Calendar exceptions replace that date, including previous-day carry; exception intervals can themselves cross midnight. Three imported schedules preserve original source dates and are stale. Retrieval does not refresh them. `parseRecordedOSMHours` accepts only a strict documented subset and keeps unsupported expressions raw; it never guesses. Likely-open filtering excludes unknown and stale schedules. Recorded schedules are never live status or confirmation about holidays.

## Local reports and moderation

Coordinate proposals keep their legacy storage key and fields. New optional candidate ID/source fields preserve source references without promoting geometry. Preview/confirm is required; edits/deletes affect only local drafts. Revision checks and Web Locks prevent stale writes; corrupt legacy bytes are backed up before replacement and a different recovery copy is not overwritten.

General reports use a separate key/schema and cover building corrections, new POIs, schedules, closures, geometry and inaccessible paths. Public evidence notes/URL and optional coordinates are reviewed before save/export. Reports retain `community-reported-unreviewed`; no report changes the catalog. Corrupt report storage remains untouched/exportable. Exports and prepared GitHub issues require deliberate contributor action, with no backend submission.

Moderation distinguishes official name/document sources, independently surveyed/reviewed evidence, community reports and unreviewed candidates. Rejected/outdated proposals remain in the GitHub review history with reasons/source history; they must not be imported into published collections. Existing source history is retained in Git and evidence snapshots. An accepted edit needs a reviewable PR; field-survey and institutional-source claims are distinct.

## Pedestrian data

Nodes have ID, coordinates, kind, evidence, survey/independent review and optional accessibility. Edges have IDs/endpoints, ordered geometry, kind, public/restricted/unknown access, explicit direction, schedule, evidence, review, optional accessibility and surveyed-passage footprint IDs. Accepted node/edge independent reviewers must differ from survey reviewers. Distances are computed from geometry.

The candidate graph and candidate line views are separate from accepted graph/walkways. The UI never opts into unverified routing. Verified entrance points need graph-node links before a destination can route. Wheelchair mode additionally requires surveyed accessibility at all nodes/edges. See NAVIGATION-METHODOLOGY.md for validation limits and field requirements.
