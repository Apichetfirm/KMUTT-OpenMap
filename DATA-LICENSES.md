# Data and runtime licenses

Initiated by Firm Impulse · FIBO FRAB11. Root MIT covers original application code, not imported databases/assets.

| Material | Source, rights and limits |
| --- | --- |
| OSM snapshot, footprint candidates, new approximate point references, POIs and candidate paths | © OpenStreetMap contributors, [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). [OSM copyright](https://www.openstreetmap.org/copyright). Retrieved 2026-11-02 from the standard OSM map API; exact source IDs/versions/timestamps retained. Necessary tags/geometry only; contributor identity fields omitted. These editable derived databases are available in `data/` under ODbL, independently of MIT code. No claimed survey/current-business/accessibility verification. |
| Original OSM references | Same ODbL attribution; original source way links retained. Existing published points stay approximate. |
| Legacy S3/N5/N9/N11 third-party point references | Existing factual references preserved with original URLs. Redistribution permission remains unestablished. No new content/coordinates/photos from those sites were imported. Replace with independently licensed and reviewed evidence before a verified-data release. |
| KMUTT official names/codes and existing N16 floor reference | Factual references to [campus directory](https://www.kmutt.ac.th/about-kmutt/campus/) and [BGM](https://bgm.kmutt.ac.th/MapNavi/MAPNAVI.html). Retrieved/reviewed 2026-11-02; page source dates are unknown. No permission to copy university photos, logos, plans, map graphics or page layouts is implied. Conflicts remain unresolved. |
| OpenFreeMap / OpenMapTiles / live OSM tiles | Live requests to https://tiles.openfreemap.org/. Visible provider/OSM attribution retained in app and actual QA screenshots. No tile database is redistributed. Hosting/provider terms and availability are separate from code licensing. |
| MapLibre GL JS 6.16.0 | BSD-3-Clause and bundled notices in `vendor/maplibre-gl/LICENSE.txt`. Locked npm module, separate worker and CSS copied byte-for-byte; SHA-256/npm integrity recorded in manifest. See SECURITY-REVIEW.md for update procedure. |
| Microsoft Global Building Footprints | Documentation investigated at [upstream](https://github.com/microsoft/GlobalMLBuildingFootprints); CDLA-Permissive-2.0. No Microsoft geometry was imported. Machine outlines alone do not identify KMUTT codes/entrances/heights. |
| KMUTNB reference project | Product/engineering concepts inspected only. GitHub reports NOASSERTION; no code, photographs, models, geometry, text or other assets copied. |
| Browser screenshots | Actual local application rendering, retained attribution, QA evidence. They do not establish real-world geometry or authorization to redistribute underlying imagery/plans. |

Imports require exact source URL/version/date, retrieval date, license/permission, transformation/matching method and uncertainty. Keep ODbL-derived data separate from differently licensed sources; original code remains MIT. Public accessibility and public repository hosting are not blanket reuse permission. Never publish private records or restricted campus infrastructure.
