# Architecture — v0.4 RC

Initiated by Firm Impulse · FIBO FRAB11.

Static HTML/CSS/ES modules, MapLibre and JSON/GeoJSON remain the architecture. No framework rewrite, backend, account service or analytics was added. GitHub Pages paths stay relative.

| Module | Responsibility |
| --- | --- |
| `main.mjs` | Validated startup, building/POI selection, URL history, camera and UI orchestration |
| `map.mjs` | Idempotent sources/layers, clustered POIs, stable POI identifiers, route source, candidate preview, lighting and camera options |
| `data.mjs`, `geometry.mjs`, `quality.mjs` | Evidence/schema/topology/overlap validation, interior reference points, derived coverage |
| `heights.mjs` | Tile display policies and explicit candidate preview estimates |
| `search.mjs`, `sharing.mjs` | Bilingual deterministic ranking, limited English typo tolerance, building/POI deep links |
| `places.mjs` | Categories, Bangkok schedules, overnight/exception/stale states and strict OSM schedule subset |
| `mapping.mjs` | Legacy coordinate proposal persistence, revisions, recovery backups and export |
| `contributions.mjs`, `community-ui.mjs` | General report schema, independent local drafts, review/export and prepared issues |
| `navigation.mjs` | Graph validation, Dijkstra, distinct independent reviewers, entrance/accessibility/schedule constraints, availability and route-to-building selection |

Catalog startup validates buildings before rendering the directory. Map startup is independent of optional places, candidates, coverage and graph loads. Fetches time out after 12 seconds; the core catalog has a retry. Optional failures show limitations without blocking search. A map-load watchdog and deliberate retry produce actionable states. Map retries use a fresh module URL and generation checks so late stale imports do not create a second map. Theme and 2D/3D preferences survive retries. GPS is click initiated and ephemeral.

The real runtime comes from `vendor/maplibre-gl/`: module, separate worker, stylesheet and full license. Its manifest and npm lockfile are checked by CI and the build. CSP permits self-hosted scripts/workers and the needed OpenFreeMap network/style/image behavior. See SECURITY-REVIEW.md.

Each style generation reuses the provider vector source and reinstalls app layers once. Subsequent updates reuse GeoJSON sources/layers. The provider's extrusions are hidden; ordinary viewing has one tile extrusion. A candidate editor preview temporarily hides that tile extrusion and shows one amber candidate extrusion instead, so preview geometry is not doubled. In 2D both are hidden. A candidate never enters accepted footprints. During editing the form occupies the detail-card slot, the camera reserves its bounds, and portrait map tools are temporarily hidden to leave a visible proposal preview; the published marker returns after cancel/save. Public selection uses one marker, collision-managed labels and accepted-outline support. POIs cluster in one batched source and carry a stable `place_id` for click resolution. The route source remains empty under current coverage.

Building and POI details are mutually exclusive. Deep links retain unrelated query parameters, hash and Pages path; choosing one destination clears the other's parameter. Popstate restores the appropriate card/marker. Camera padding uses actual visible panels and toolbar dimensions. Mobile directory collapse keeps search visible; portrait, short portrait and small-landscape side panels are tested. Reduced motion removes camera animation. Native dialog semantics supply community-form focus trapping/return, with an internal live status and review output.

Coordinate drafts keep their original v0.2 key; valid legacy entries survive. General community reports have a separate key. Writes compare an exact stored revision inside Web Locks; stale tabs cannot overwrite newer drafts. Corruption is preserved/backed up/exportable, and failed storage never reports success. Export and prepared issue links do not change published data or submit messages automatically.

Data acquisition is separate from the runtime. The minimal OSM snapshot retains required tags, source IDs/versions/timestamps and geometry, omitting contributor identities. Explicit named associations produce candidates; an importer adds only previously missing supported references. Original coordinates are retained. Raw candidate graph topology never enters the accepted graph. Coverage and candidate rendering metadata are generated and validated against the canonical data.

Maintainer debt: main.mjs still coordinates several views; extraction should follow a concrete change rather than a broad rewrite. Handwritten validation is conservative, and physical/GIS review remains independent of software checks. See the complete handoff for release blockers.
