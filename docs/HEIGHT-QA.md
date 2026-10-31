# Building height and 3D accuracy

## Current limitations
MapLibre extrusions come from OpenFreeMap vector tiles/OSM. `render_height` can be a default or an estimate. The tile geometry has not been matched to each official building code; it is not safe to call every visible 3D box a confirmed KMUTT building.

## Implemented mitigation
- Hide the basemap's existing extrusion before drawing our own to avoid stacked buildings.
- Switch between guarded/capped and raw OSM height *rendering*. The 55m guardrail is purely visual, not a fact about any building.
- Preserve `building_height_m:null` until reliable measured evidence exists.
- Save proposals in localStorage only; they do not alter published geometry.

## Future verified pipeline
1. Acquire licensed building polygons and evidence of entrances.
2. Join each official code to a unique polygon by geometry and documentary evidence.
3. Obtain actual height in metres from approved plans or survey; record method/date/uncertainty.
4. Implement optional model overrides with unique IDs, provenance and review status.
5. Compare 3D views against photographs from at least two angles.
6. Add tests for duplicate polygons, missing heights, overlaps, and implausible dimensions.

**Suggested pilot:** N9 FIBO, N10 Library, N11 SIT, N16 LX, N17 CB2 and N20 CB1.
