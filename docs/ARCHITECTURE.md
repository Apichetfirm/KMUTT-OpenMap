# Architecture and operational decisions

Initiated by Firm Impulse · FIBO FRAB11.

The static ES-module architecture is retained. There is no framework migration, backend, authentication service, analytics, location collector or runtime npm bundle.

| Module | Responsibility |
| --- | --- |
| `main.mjs` | Catalog startup, UI state, safe DOM construction, events, optional map startup and contribution persistence |
| `map.mjs` | Idempotent source/layer installation, batched labels, clustered POIs, selection and camera options |
| `data.mjs` | Evidence/URL/date validation, catalog/footprint integrity, polygon validation and coverage |
| `search.mjs` | Deterministic bilingual ranking and coordinate bounds |
| `heights.mjs` | Tile-render policies, matching base/roof interpolation, override provenance validation |
| `mapping.mjs` | Legacy-compatible local draft validation, backup, transactional write and export |
| `sharing.mjs` | Repository-path-preserving building URLs and safe unknown-code lookup |
| `places.mjs` | POI schema, filtering, Bangkok weekly/overnight/exception schedule evaluation |
| `navigation.mjs` | Graph integrity, geometry distance, deterministic Dijkstra, evidence/access gates and connectivity |

Startup loads and validates the canonical catalog, restores safe local drafts and resolves a shared building before awaiting the map. Optional footprints/places fail independently. Map/CDN, storage and GPS failures have separate UI states. A failed map can be retried without refetching the catalog. No user point is persisted before preview and confirmation. Published coordinates and local proposals remain separate states.

Each style load reinstalls the app's layers; repeat installs within one style generation reuse layers and GeoJSON sources. The vector source is reused when the provider supplies the same planet URL. Existing basemap extrusion layers are hidden; there is one custom extrusion, hidden in 2D. Labels use map collision detection and zoom-sensitive content; only the selected building has a DOM marker. Drafts and POIs use batched map sources, POIs cluster, and map rendering remains event driven. No unnecessary framework state/rerender loop is added.

Theme changes preserve selected building, display mode, height policy, drafts and filters. A selection made before map readiness is replayed after style load. Mobile camera padding is derived from actual tools/details bounds. Reduced-motion preferences disable app camera animation. The searchable button directory is also the keyboard/screen-reader alternative to map labels; result count is announced, focus is visible, Enter selects, ArrowDown enters the results, and slash ignores typing fields.

Only HTTP(S) evidence links are rendered, using textContent-based DOM APIs and safe external rel/window features. User content is never inserted as HTML. GPS is neither stored nor submitted. Pinning CDN version avoids silent library upgrades but does not remove CDN availability or supply-chain risks. npm dependencies exist only for development/CI and are locked. Current `npm audit` reports no vulnerabilities; that is not an independent security audit.

`build.mjs` stages only static assets and documented data in `.site/`. CI installs dev tooling, validates, tests in controlled Chromium, then builds. Pages builds from main only; pushing this feature branch does not deploy it. Existing public URL/base path is unchanged. No repository settings are modified.

Technical debt: UI orchestration still lives in main.mjs; additional extraction should follow actual feature growth. Runtime JSON validation is intentionally handwritten and conservative. Cross-building polygon overlap, field truth, other browsers, screen readers and physical-phone performance still require independent review. No live route UI exists until reviewed graph/entrance data supports it.
