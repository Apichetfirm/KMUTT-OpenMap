# Product specification — KMUTT OpenMap

**Owner:** Firm Impulse · FIBO FRAB11
**Type:** Community-driven, open-source, unofficial student project for public navigation and campus discovery.
**First campus:** KMUTT Bangmod.

## v0.2.1 scope
- Search 35 officially listed building codes/names/aliases in Thai and English.
- Display desktop/mobile interactive map via MapLibre/OpenFreeMap.
- 3D extrusion, 2D mode, day/night, optional GPS with user permission.
- Show only approx geocoded points for seven locations, and label verification limits prominently.
- Allow local-only proposals of missing building positions, export as JSON for review.
- Show approximate Google walking directions only for non-draft geocoded points.
- No internal navigation, indoor floor maps, shop hours, verified building heights, or official service claims.

## Non-functional requirements
- No secrets or proprietary map files in the public repository.
- No analytics collecting precise location.
- Map must remain searchable if CDN tiles are temporarily offline.
- Screen-reader labels and keyboard shortcuts for search.
- Valid data must pass regression tests and explicit provenance review.
- Existing OSM/tiles attribution must remain visible.

## Release gates
R0: source/CI and one public preview deployment.
R1: independent building geocode & height validation.
R2: verified pedestrian graph/navigation.
R3: user research and beta test.
R4: community-maintained public beta.

See `ROADMAP.md`, `DATA-STATUS.md`, `FIELD-SURVEY.md` and `HEIGHT-QA.md`.
