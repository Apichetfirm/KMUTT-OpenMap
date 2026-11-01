# Campus data

Initiated by Firm Impulse · FIBO FRAB11. Code and geodata use separate licenses.

| File | Role |
| --- | --- |
| `buildings.json` | 35 canonical codes, 20 approximate references, explicit unknown/review reasons and separate name/height/entrance evidence |
| `building-footprint-candidates.geojson` | 18 named OSM candidates, unaccepted; N4 is a partial complex |
| `building-footprints.geojson` | Accepted associations only; empty |
| `buildings-geocoded.geojson`, `mapping-status.csv`, `coverage-report.json` | Generated point/queue/coverage views |
| `building-rendering.json` | Generated candidate editor estimates, never physical measured height |
| `height-overrides.json` | Accepted provenance-aware rendering overrides; empty |
| `places.geojson` | 73 approximate OSM campus/nearby service records; three stale source schedules |
| `pedestrian-graph-candidates.json`, `walkway-candidates.geojson` | 112 topology-review path segments; never used for public routing |
| `pedestrian-graph.json`, `walkways.geojson` | Accepted routes; empty |
| `evidence/osm-campus-snapshot.json` | Minimal licensed source geometry/tags/version/date without contributor identity fields |
| `evidence/source-review.json` | Investigation outcomes; retrieval and field verification stay distinct |

README documents acquisition/import/generation/validation commands. Read DATA-MODEL.md, MAPPING-METHODOLOGY.md, NAVIGATION-METHODOLOGY.md and DATA-LICENSES.md before importing or promoting records. Unknown values must remain unknown, and rejected/outdated submissions remain in review history rather than public collections.
