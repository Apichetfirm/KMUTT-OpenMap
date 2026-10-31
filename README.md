# KMUTT OpenMap

Open-source, community-driven 3D map **preview** for KMUTT Bangmod.

**Initiated by Firm Impulse · FIBO FRAB11**

This is a student community project, **not an official KMUTT service**. GitHub owner: `Apichetfirm`; public project initiator: Firm Impulse.

## v0.3 implementation for independent review

- Search every original building code and Thai/English name; punctuation and alias spacing are tolerated. FIBO → N9, หอสมุด → N10, LX → N16.
- Share a building with `?building=N9`, including under `/KMUTT-OpenMap/`. The card states location uncertainty, sources, name conflicts and height evidence.
- Map labels use zoom/collision management; selection has a persistent marker. Layer reuse, clamped extrusion bases, 2D/3D, day/night and reduced motion improve rendering reliability.
- Mobile directory and details scroll separately; search remains reachable and camera framing leaves room for the selected point.
- Local coordinate proposals have preview/confirm, evidence notes, edit/delete/export and recovery protection. Published coordinates never change automatically.
- One sourced approximate library POI, category filters and tested Bangkok recorded-hours logic. Other service categories remain empty until evidence exists.
- Tested pedestrian graph/Dijkstra foundation; real internal and accessible routes remain disabled because paths and entrances are unverified.
- Catalog remains usable if map/CDN or local storage fails. GPS is requested only after user action and is neither stored nor sent to the project.

## Data accuracy

| Data | Current status |
| --- | --- |
| Official directory | 35 original codes retained; S1/S6/N19 name/description conflicts remain |
| Building coordinates | Seven approximate references; 28 unmapped |
| Footprints | Three named OSM candidates; zero accepted/field-verified associations |
| Heights | Zero measured heights; N16 has an existing university 15-floor reference |
| Entrances / pedestrian routes | Zero verified; no internal routing advertised |
| POIs | One approximate library point; zero verified places or documented schedules |

An implemented feature, a passing software test and verified real-world data are different things. See [data status](docs/DATA-STATUS.md), [model and review process](docs/DATA-MODEL.md), [baseline audit](docs/BASELINE-AUDIT.md) and [engineering handoff](docs/IMPLEMENTATION-HANDOFF.md).

## Local development

Serving the website requires Python 3, a WebGL2-capable browser and internet for MapLibre/tiles; no npm runtime install is needed:

```sh
python -m http.server 8080
# http://localhost:8080/
```

Windows: `START_WINDOWS.bat`. Opening `index.html` directly as `file://` cannot fetch JSON.

Tests/build tooling uses Node >=20 (CI: Node 22), pinned Playwright and MapLibre dev dependencies:

```sh
npm ci
npm run check
npm run validate-data
npm test
npx playwright install --with-deps chromium
npm run test:e2e
npm run build
```

`npm run build` stages an allowlisted static website in `.site/`; npm dependencies and tests are excluded. On environments with system Chromium, set `OPENMAP_CHROMIUM=/usr/bin/chromium` for browser tests. Test fixtures use the real MapLibre library with controlled empty tiles; they do not prove live provider uptime or geographical truth. [Test report and actual screenshots](docs/TEST-RESULTS.md).

## Architecture and deployment

The app stays framework-free: ES modules, HTML/CSS, MapLibre, OpenFreeMap/OSM and GeoJSON. `main.mjs` coordinates UI; `map.mjs` manages layers/camera; pure modules cover search, evidence/geometry, height, proposals, URLs, places/hours and navigation. See [architecture](docs/ARCHITECTURE.md).

GitHub Actions validates source/data, runs unit/browser tests and stages `.site/`. Pages publishes **main only** at https://apichetfirm.github.io/KMUTT-OpenMap/. This feature branch must be independently reviewed before merge. Existing main deployment was successful; no repository settings or production access changes are needed. [Deployment instructions](docs/PUBLISH-GITHUB.md).

## Contributing and licensing

Read [CONTRIBUTING.md](CONTRIBUTING.md), [field survey guidance](docs/FIELD-SURVEY.md) and [roadmap](docs/ROADMAP.md). Unknown locations remain searchable; suggestions need independent review and evidence. No analytics or location collection are included.

Original code: [MIT](LICENSE). Imported OSM databases: ODbL, © OpenStreetMap contributors. MapLibre, OpenFreeMap and university references have separate conditions; see [DATA-LICENSES.md](DATA-LICENSES.md). No KMUTNB code/assets or protected university photographs/plans are copied.
