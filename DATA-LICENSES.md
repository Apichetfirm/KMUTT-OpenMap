# Data sources, licenses, and separate permissions

Initiated by Firm Impulse · FIBO FRAB11. The root MIT license applies to original project code; it does not relicense imported data.

| Material | License / permission and attribution |
| --- | --- |
| `data/building-footprint-candidates.geojson` | © OpenStreetMap contributors, [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). Three named ways retrieved 2026-11-01 via OSM API; geometry, necessary tags, way versions and timestamps are included. Source links and attribution are retained per feature. This derived database is offered under ODbL 1.0; see [OSM copyright](https://www.openstreetmap.org/copyright). |
| `data/places.geojson` | OSM-derived library reference, © OpenStreetMap contributors, ODbL 1.0. Publicly distributed editable GeoJSON is the available underlying data, not MIT code. No opening-hours or accessibility data inferred. |
| Existing OSM-centroid references in catalog/point view | © OpenStreetMap contributors, ODbL 1.0; source way URLs are retained. Approximate reference points are not surveyed entrances. |
| Existing third-party approximate points (S3, N5, N9, N11) | Legacy factual references retained with their original URLs. Redistribution permission was not established by this change. No new third-party page text, assets or locations are copied. Review these references or replace them with independently licensed survey evidence before a verified-data release. |
| KMUTT names/codes | Official [campus directory](https://www.kmutt.ac.th/about-kmutt/campus/) and [BGM master plan](https://bgm.kmutt.ac.th/MapNavi/MAPNAVI.html) are factual references only. No permission to copy photos, logos, plans, map graphics, site layouts or protected content is implied. Conflicts remain documented. |
| OpenFreeMap styles/tiles | Live requests to https://tiles.openfreemap.org/. Provider and OSM/OpenMapTiles attribution remain visible. Tiles are not redistributed as a tile database. Screenshots in `docs/qa/` retain rendered attribution and are visual QA evidence, not verified geometry. |
| MapLibre GL JS 6.16.0 | BSD-3-Clause; runtime is pinned at unpkg. Dev dependency mirrors the same version for repeatable offline browser tests. See [upstream license](https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt). |
| Microsoft Global Building Footprints | Investigated via the project's [documentation](https://github.com/microsoft/GlobalMLBuildingFootprints), CDLA-Permissive-2.0. No geometry is imported: machine outlines lack code/entrance verification and a campus clip still needs review. |
| KMUTNB reference | Product concepts only; repository license is `NOASSERTION`. No source code, photos, models, data, wording or other assets are reused. |

A new geospatial import must document source, exact source version/date, permissions/license, transformations, evidence limits and attribution. Keep ODbL-derived databases separate from differently licensed datasets. Candidate association review and legal permission are separate questions.
