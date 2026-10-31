# Building height and 3D QA

Initiated by Firm Impulse · FIBO FRAB11.

Live extrusions come from OpenFreeMap/OSM vector tile `render_height`, which may contain estimates or provider defaults. They are not surveyed KMUTT heights and have not been reliably joined to every official code.

Implemented: reuse one extrusion layer/source, hide provider extrusions, turn all extrusions off in 2D, convert tile numeric values safely, clamp bases to roofs, and apply identical zoom interpolation to base/height. The existing optional 55m cap remains a clearly labeled visualization choice, not a claim that campus buildings are at most 55m. No global multiplier is used.

`height-overrides.json` and its validator distinguish measured heights, official floors, OSM height/levels, documented estimates and visualization-only fallback. No accepted overrides exist. Candidate OSM levels stay candidate tags; N16's 15-floor document is preserved without a guessed position/metre height. The override schema is implemented/tested; applying building-specific extrusions remains blocked by reliable accepted code-to-tile/footprint joins and height evidence.

Selection is represented by a persistent point marker; accepted footprint outlines are supported, but the accepted collection is currently empty. Do not call point highlighting a verified building shape. Three candidate polygons are stored separately for independent review.

Actual before/after, selected, night, 2D and mobile screenshots are in `docs/qa/`. Automated MapLibre style-spec validation and real-browser mode/style switching pass. Remaining provider warnings concern missing sprite icons and road-shield null filters; no app JS errors occurred in the live check. These warnings do not establish geographical accuracy.

Before approving physical fidelity: independently match codes and shapes; obtain measured height or explicit estimate evidence; review footprint overlap and passages; compare lawful current views from multiple angles; check representative phone performance. Prioritize N9/N10/N11/N16/N17/N20 without fabricating values to complete a target.
