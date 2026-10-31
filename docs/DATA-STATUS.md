# Data integrity report — 2026-11-01

Initiated by Firm Impulse · FIBO FRAB11. Community preview, not an official KMUTT map.

| Metric | Count / status |
| --- | --- |
| Official code/name records | 35; all original entries searchable |
| Buildings with approximate coordinates | 7: S3, N5, N9, N10, N11, N17, N20 |
| Buildings without coordinates | 28; no invented replacements |
| Candidate code-to-footprint matches | 3: N10, N17, N20; OSM source names and existing references agree |
| Accepted footprint associations | 0; independent association review pending |
| Field-verified building associations | 0 |
| High-confidence accepted associations | 0 |
| Approximate point associations | 7 |
| Verified height measurements | 0 |
| Published estimated building-specific heights | 0; tile render heights remain visual estimates/fallbacks |
| Documented floor counts | N16: existing university reference of 15 floors |
| Candidate OSM level tags | N17: 6, N20: 5; not promoted to official floor counts |
| Verified entrances / pedestrian routes | 0 / 0 |
| POIs | 1 approximate library reference; 0 high-confidence/verified/unverified/conflicting places |
| Published opening-hour schedules | 0; unknown remains unknown |

`npm run validate-data` recomputes current coverage. Candidate geometry is counted separately from accepted geometry. Rendered basemap buildings are not confirmed code associations.

## Source investigation

- Rechecked https://www.kmutt.ac.th/about-kmutt/campus/ and https://bgm.kmutt.ac.th/MapNavi/MAPNAVI.html. The 35 named codes remain; the university's reported 39 buildings do not imply four additional known code/location records.
- S1 (Mechanical Engineering 4 / Discovery Center), S6 (dormitory description), and N19 (Production Engineering Lab 5 / GMI) still conflict. No unsupported rename or gender metadata is introduced.
- Retrieved OSM ways 311879209, 420534143 and 436983061 from the OSM API, including geometry. Official names agree with OSM names, and the existing approximate points are inside the shapes. Candidates include source versions/timestamps and the association basis, but have no surveyed entrances or independent association approval.
- The library POI is supported by OSM's named `amenity=library` feature and official directory; its coordinate is the existing approximate reference. No operating hours/accessibility are inferred.
- The Overpass investigation returned HTTP 406 or timed out. Direct OSM API worked. A Python style request returned 403, while the actual Chromium app loaded live OpenFreeMap successfully; these outcomes are recorded separately.
- Microsoft Global Building Footprints documentation was inspected (CDLA-Permissive-2.0). No Microsoft data imported: a machine outline alone cannot establish official building code, height or entrance.
- Existing third-party approximate references remain legacy references with unestablished redistribution permission. No further material is imported from those sites.

New OSM database files are offered under ODbL with source links and attribution. See [DATA-LICENSES](../DATA-LICENSES.md), [source review log](../data/evidence/source-review.json) and [data model](DATA-MODEL.md). A source retrieval date is not a field verification date.

## Mapping work remaining

Independently review the three candidates; survey the remaining 28 locations and all public entrances; resolve name conflicts; acquire height evidence; survey connected public paths and accessibility. Local proposals remain unverified and never overwrite published locations. Every code is included in `data/mapping-status.csv`.
