# Building and campus data

Initiated by Firm Impulse · FIBO FRAB11.

| File | Role and status |
| --- | --- |
| `buildings.json` | Canonical 35-code inventory, seven approximate references, separate name/mapping/height evidence. |
| `buildings-geocoded.geojson` | Generated approximate point view. None is an entrance. |
| `mapping-status.csv` | Generated review work queue for all codes, including three candidate footprint IDs. |
| `building-footprint-candidates.geojson` | Three OSM polygons (N10/N17/N20), independent code-association review pending; ODbL. |
| `building-footprints.geojson` | Accepted associations only; currently empty. |
| `height-overrides.json` | Provenance-aware override schema; currently empty. |
| `places.geojson` | One approximate OSM library point; no documented hours or accessibility. |
| `pedestrian-graph.json`, `walkways.geojson` | Intentionally empty: no verified pedestrian network or entrances. |
| `evidence/source-review.json` | Source investigation outcomes; retrieval is distinct from field verification. |

Regenerate derived views with `npm run generate-data`. Validate with `npm run validate-data`. Refresh named OSM candidates with `node scripts/import-osm.mjs`; never join by proximity alone. See [data model](../docs/DATA-MODEL.md), [coverage](../docs/DATA-STATUS.md) and [separate licenses](../DATA-LICENSES.md). No private campus information belongs in this database.
