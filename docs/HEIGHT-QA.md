# Height methodology and 3D QA — v0.4 RC

Initiated by Firm Impulse · FIBO FRAB11.

Physical building heights remain unknown: zero measured values, zero accepted footprint associations. N16 retains its documented 15 floors; candidate OSM levels stay source tags and are not promoted into official floor counts. Roof tags are preserved only where present; detailed roofs/facades are not invented.

Ordinary viewing uses one OpenFreeMap/OSM tile extrusion. Its `render_height` can be a provider estimate/default. The existing 55m guarded option is a disclosed display cap, not a campus height claim; the OSM mode removes that cap. Both convert safely, clamp nonnegative height/base, and interpolate base/roof consistently. No global realism multiplier is added. Provider extrusions are hidden; 2D hides all custom extrusions. Day/night light is adjusted independently of dimensions.

The mapping editor adds a separate explicitly unaccepted amber/dashed preview of the selected licensed candidate. It hides ordinary tile extrusions while the candidate extrusion is shown, avoiding overlapping copies. Physical base stays zero; a single candidate preview uses its actual source outline/orientation. Selection marker and camera padding remain independent from the source geometry.

`building-rendering.json` documents building-specific preview metadata for 18 candidates. Height priority is official floors, then candidate OSM levels, then generic 4m visualization. Floor-based examples use **3.2m/level as a rendering assumption**, with null measured height; N16 previews 48m from 15 floors, not a measurement. Buildings with unknown floors use the labeled fallback. Reviewers must replace assumptions with credible measurements or approved documents before claiming faithful physical models. Current accepted overrides remain empty.

Unit tests validate height expressions against the actual MapLibre style spec, prevent inverted/floating bases, distinguish measured/estimated evidence and assert one visible extrusion when entering/exiting candidate preview. Browser tests exercise candidate selection, 48m assumption disclosure, unchanged published point, style/theme/2D switching, reduced motion and selected-marker visibility. Actual before/after source snapshots and final desktop/mobile/light/dark/2D/candidate screenshots are under `docs/qa/v04/`; these are rendering evidence, not field verification.

Accurate roofs, materials, detailed landmark models and ground-truth heights remain BLOCKED — EXTERNAL EVIDENCE: accepted code/geometry associations, lawful current views/plans and measured height sources. Additional Three.js/glTF complexity is not justified by currently available evidence.
