# Data model and review workflow

Initiated by Firm Impulse · FIBO FRAB11. Original code: MIT; imported geodata: separate licenses.

## Buildings and evidence

`buildings.json` retains every original code/name/alias. `mapping` separates confidence, review status, footprint ID, centroid and evidence. Existing approximate points are retained; they are neither entrances nor field surveys. Unknown coordinates, height, centroid, category and verification dates stay `null`. Names and location have independent evidence. Conflicts S1/S6/N19 are visible in the card.

Evidence fields: `source` (HTTP(S) URL without embedded credentials), `license`, `method`, `checked_on`, optional `verified_on` and `reviewer`. Verified location/entrance claims require an explicitly recorded field survey, date and reviewer. Merely having a URL or an OSM polygon does not qualify.

Confidence: `unverified` means unmatched; `approximate` means a sourced reference with unresolved position; `conflicting` signals incompatible evidence; `high-confidence` needs a documented code/name/geometry association; `verified` needs field evidence. Do not promote a candidate by renaming its status alone.

`building-footprint-candidates.geojson` contains three named OSM ways associated with existing references (N10, N17, N20). Official names and OSM names agree and existing points fall inside, but association review is pending. Candidates are not rendered as accepted polygons and do not count toward mapping completion. `building-footprints.geojson` is the separate accepted collection, currently empty. One geometry per code; a complex must use an explicitly reviewed MultiPolygon rather than duplicate code records. Validator rejects invalid rings, self intersections, holes, out-of-area coordinates, duplicate associations and missing evidence. It conservatively rejects touching/overlapping MultiPolygon components; an independent GIS review is still needed for overlap between different accepted buildings.

Reproduce the candidate extraction with `node scripts/import-osm.mjs` (network access to OSM required). Or pass an absolute directory containing the OSM API `osm-<way-id>.json` snapshots as an argument. The importer explicitly allowlists known IDs and expected names, validates geometry and exports only necessary feature tags/geometry/version metadata. It never copies contributor user IDs or promotes source levels into official floor counts. Current checked date is recorded in the importer and must be changed when refreshing.

## Height provenance

Physical height (`building_height_m`, `height_evidence`) is independent of rendered height. `height-overrides.json` supports measured, official floors, OSM height/levels, documented estimate and visual fallback classifications. Level estimates require explicit metres per level and calculation consistency; non-measured entries must keep `measured_height_m:null`. There are currently no accepted overrides. OSM candidate levels (N17: 6; N20: 5) stay source tags, not official counts. N16's existing 15-floor university reference is preserved without inventing a metre value or position.

The live extrusion still uses the vector tile's `render_height`, which may itself be estimated. The existing optional 55m cap is a display preference. Heights and bases use numeric conversion, non-negative clamps and the same zoom interpolation; base is clamped to the rendered roof to prevent floating/inverted geometry. No arbitrary global height multiplier or guessed building override is introduced. Basemap extrusion layers are hidden and one custom layer is reused; 2D mode hides every extrusion.

## Local proposals

Select a building → expand “เสนอหรือแก้ไขตำแหน่ง” → propose → click a map point or enter coordinates → preview → add evidence → confirm. Cancel discards the preview. Edit repeats this process. Delete affects only this browser. Export from the directory footer produces an explicitly unverified package. Published catalog coordinates and external directions always use the published reference, even when a local proposal exists. “ดูข้อเสนอ” intentionally focuses the local proposal separately.

The v0.2 storage key is retained. Valid legacy records remain readable. Invalid/partially rejected storage bytes are copied to a recovery key before an explicit new save. Storage failure leaves the preview unsaved and reports the problem; quota/security errors never claim success. An existing different recovery backup is never overwritten automatically. Users can export it. No proposals or GPS locations are transmitted to the project.

## Places and hours

`places.geojson` uses GeoJSON Point features with stable ID, name, category, description, optional building reference, confidence, evidence, verification date, accessibility and optional opening hours. One approximate library reference is published, supported by OSM's `amenity=library` and the official directory. All other categories remain empty rather than guessed. Points are clustered above a fixed density and rendered in one source.

Hours use `{timezone:"Asia/Bangkok",checked_on,evidence,weekly:{"0":[],"1":[["09:00","17:00"]]},exceptions:{"2026-12-31":[]}}`. Day 0 is Sunday; missing day = unknown; empty day = closed. End is exclusive. End earlier than start means overnight; equal times are rejected (split 24-hour schedules into documented intervals). Calendar-date exceptions override that day, including carry from yesterday. Exception hours can themselves cross midnight. Missing exception documentation means ordinary recorded hours, not a promise about holidays. Schedules older than 90 days are marked stale. No published place currently has documented hours.

The UI says “น่าจะเปิดตามเวลาทำการที่บันทึกไว้”, never live open status. Unknown hours do not match that filter. Suggestions for places, corrections, closures, schedules and accessibility use a GitHub issue form and require independent review before data changes.

## Pedestrian graph

`pedestrian-graph.json`: `nodes` contain unique ID, coordinates, kind (intersection/entrance/crossing/gate), evidence, independent review and optional accessibility. Edges contain unique ID, `from`, `to`, ordered coordinates that meet endpoints, `kind` (path/stairs/ramp/crossing/passage), explicit `bidirectional`, access (`public/restricted/unknown`), optional recorded `hours`, evidence, independent review and optional accessibility. Geometry determines edge distances; user-supplied distance cannot shorten a route.

Dijkstra is deterministic. Unknown endpoints, unreviewed nodes/edges, restrictions, stale/unknown/closed gate hours and undocumented passages cannot produce a public route. Wheelchair routes additionally require surveyed accessibility evidence on every node/edge and reject stairs. Building-intersection validation accepts only documented surveyed passages with explicit footprint IDs. Run it against all accepted footprints; it cannot validate unknown buildings. Connectivity reports weak components; directed reachability is tested by the route engine. Estimated seconds use an explicit default 1.2 m/s and are not measured travel times. Same-origin/destination returns “already-there” with no invalid line.

Synthetic tests may opt in to unverified graphs. The application never opts in. Both real path datasets stay empty. An empty route source/layer is installed as rendering infrastructure, but no origin/destination routing UI is enabled until reviewed entrances and network coverage exist. No emergency or accessible-navigation claim is made.
