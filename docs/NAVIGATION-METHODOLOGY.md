# Navigation methodology

Initiated by Firm Impulse · FIBO FRAB11.

## Current public behavior

Accepted pedestrian graph: empty. Verified public building entrances: zero. Therefore internal and wheelchair routes are disabled. Each building card explains this and offers Google Maps walking directions only when an approximate reference exists. POIs offer the same external walking action. Reference points are explicitly distinguished from entrances; the project makes no emergency/evacuation or real-world accuracy claim.

## Candidate pipeline

The licensed OSM snapshot yields 112 candidate footway/pedestrian/stair segments, split only at existing shared source nodes/endpoints. No proximity snapping or invented links are used. Source geometry, date/version, known access tags and unreviewed status are retained. These records live in `pedestrian-graph-candidates.json` / `walkway-candidates.geojson`, separate from published accepted routing data. Candidate bidirectionality is a topology-review assumption, not verified permission to traverse; direction, restrictions, gates, hazards, operating hours, ramps and crossings require survey. Imported candidate paths may cross buildings or restricted areas and must not be enabled merely because their graph validates structurally.

## Engine and UI

Dijkstra derives distances from ordered line geometry with an explicit 1.2m/s default estimate. It enforces direction, public access, reviewed endpoint/edge evidence, current recorded gate schedules and documented passages. A public surveyed record requires a survey reviewer and a distinct independent reviewer. An accepted edge crossing an accepted building outline requires a surveyed passage with the corresponding footprint ID. The validator cannot protect against unknown/unmapped buildings.

`routeToBuilding` chooses only field-verified entrances explicitly linked by graph node ID. UI origins come from reviewed gates/entrances; it reports unavailable, unreachable, invalid-graph, already-there and successful states. Results include line geometry, distance, estimated time, confidence and accessibility assessment. Wheelchair mode additionally requires surveyed wheelchair evidence for every path/node and excludes stairs; it does not infer suitability from an isolated OSM wheelchair tag. Unknown/stale/closed gate schedules cannot produce a route.

Synthetic test fixtures are explicitly synthetic. Their opt-in unverified mode is never used by the application. Same endpoints return no bogus line. Directed paths, disconnected components, inaccessible stairs, restrictions, invalid topology and guessed passages are tested.

## Survey acceptance

Facilities staff and two reviewers must verify public paths, intersections, gate hours, crossings, stairs/ramps, entrance associations and restrictions; check candidate connectivity against actual ground conditions and all buildings. Accessibility reviewers must separately assess widths, slopes, surfaces, kerbs and entrance usability. Publish exact source/review dates and unresolved hazards. Promote only reviewed segments, validate all geometry, then test origin/destination flows on actual campus devices before enabling a route. See FIELD-SURVEY.md and UNIVERSITY-COLLABORATION.md.
