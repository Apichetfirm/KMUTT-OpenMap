# Data status and provenance — 2026-11-01

**Scope:** KMUTT Bangmod only. This is a community preview, not an official campus map.

- 35 codes from KMUTT's public campus directory: S1–S15 and N1–N20.
- University references mention 39 buildings in total; 35 named codes and 39 reported buildings are not the same thing.
- Only **7** approximate geocoded points exist. **0** are field surveyed or verified entrances.
- **0** confirmed code→polygon joins; **0** measured heights in metres.
- **1** documented floor count (N16/LX: 15 floors), not a building height.
- **0** verified pedestrian paths. No internal routing is offered.
- Unknown fields are stored as `null` or empty arrays. Never invent geometry to fill a gap.

## Conflict watch
Two published sources differ; verify before changing:
- S1: Mechanical Engineering Building 4 vs Discovery Center.
- S6: dormitory description conflict; gender not captured in this dataset.
- N19: Production Engineering Lab 5 vs GMI.

## Sources
Main official list: https://www.kmutt.ac.th/about-kmutt/campus/
BGM cross-check: https://bgm.kmutt.ac.th/MapNavi/MAPNAVI.html
Per-coordinate provenance is in `data/buildings.json`. N9, S3, N5, N11 are approximate third-party location-listing points; N10, N17 and N20 are OSM building centroids. **These are not entrances.**

## Mapping workflow
Select a building → propose point on map → export proposals JSON. Drafts stay in the browser and can be deleted. Never merge draft coordinates into the official data without independent review and a source/date/uncertainty entry.

## Height policy
The visual 3D layer uses `render_height` (with 4m display fallback). The guarded setting caps the rendered extrusion at 55m; raw setting displays underlying source heights. These are **rendering preferences**, not 3D survey results.

## Map licensing
OSM (ODbL), Microsoft building footprints (CDLA-Permissive-2.0) and KMUTT artwork are subject to **different conditions**. Review `../DATA-LICENSES.md` before importing any new external dataset.
