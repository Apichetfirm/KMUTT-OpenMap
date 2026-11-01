# KMUTT OpenMap

Open-source, community-driven 3D campus map for KMUTT Bangmod.

**Initiated by Firm Impulse · FIBO FRAB11**

This is a student community project, **not an official KMUTT service**. Original application code is MIT licensed; imported geodata has separate licenses.

## v0.4 release candidate

Search → inspect → find services → get supported directions → share. This branch is for independent review; it has not been merged or released.

- All original 35 building codes and URLs remain compatible. Thai/English names, abbreviations, partial matches and single English typos are searchable; exact codes rank first.
- Source-aware building details and `?building=N9` links retain the GitHub Pages path. Unknown locations remain searchable and explicitly unresolved.
- **73 sourced OSM services in Bangmod and nearby streets**, with name/category filters, independent detail cards, source dates, recorded hours, Google Maps walking directions, correction actions and `?poi=…` links. They are approximate records, not 73 verified/current businesses.
- 18 named footprint candidates can be selected in the mapping editor. Dashed outlines and amber 3D previews disclose source-level or generic height assumptions. Local proposals never change published references.
- A generated coverage dashboard separates approximate points, candidates, accepted geometry and field verification. Every unresolved building has a reason.
- Community forms cover building corrections, new services, hours, closures, geometry and inaccessible paths: review, local save/edit/delete, JSON export and a prepared GitHub issue. No browsing login or new backend.
- Pedestrian routing, safety gates, accessibility constraints and route UI states are implemented/tested. **Internal routes remain disabled:** the accepted graph and surveyed entrances are empty. External walking directions use approximate reference points, not confirmed entrances.
- MapLibre module, separate worker, CSS and license are vendored from the locked npm package and digest checked. CI actions pin full SHAs; the application has a tested CSP. The directory remains usable after map/storage failures.

## Data status

| Data | Current result |
| --- | ---: |
| Buildings / approximate references / without coordinates | 35 / 20 / 15 |
| Candidate / accepted / field-verified footprints | 18 / 0 / 0 |
| Documented floor counts / measured heights | 1 / 0 |
| Verified entrances / pedestrian routes | 0 / 0 |
| Candidate pedestrian path segments | 112 |
| POIs / field-verified POIs | 73 / 0 |
| Recorded business schedules | 3, all stale |

[Generated coverage and building review queue](docs/DATA-COVERAGE.md) is computed from the source data. S1/S6/N19 conflicts persist; comparison also found swapped S1/S2 image-map labels in BGM material. No dormitory gender/use claims were inferred. No physical survey or university endorsement is claimed.

## Development

Serve the committed runtime without npm installation:

```sh
python -m http.server 8080
# http://localhost:8080/
```

Windows: `START_WINDOWS.bat`. Do not open the HTML using `file://`. A WebGL2 browser and internet are needed for live tiles. Search already loaded in the current tab survives offline/map failure; first-visit offline support is not promised.

For development and validation (Node >=20, CI Node 22):

```sh
npm ci
npm run verify-vendor
npm run check
npm run validate-data
npm test
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
npm run build
```

The build stages allowlisted static assets in `.site/`; no node_modules, credentials or tests are published. System Chromium option:

```sh
OPENMAP_CHROMIUM=/usr/bin/chromium npx playwright test --project=desktop --project=mobile
```

[Actual browser results and screenshots](docs/TEST-RESULTS.md) distinguish fixture checks, live providers and unavailable physical devices/other engines. [Complete engineering handoff](docs/COMPLETE-IMPLEMENTATION-HANDOFF.md) identifies every phase and blocker.

## Data and maintenance

Read [CONTRIBUTING.md](CONTRIBUTING.md), the [non-programmer contribution guide](docs/COMMUNITY-GUIDE.md), [university collaboration guide](docs/UNIVERSITY-COLLABORATION.md), [architecture](docs/ARCHITECTURE.md), [data model](docs/DATA-MODEL.md), [mapping methodology](docs/MAPPING-METHODOLOGY.md), [height methodology](docs/HEIGHT-QA.md), [navigation methodology](docs/NAVIGATION-METHODOLOGY.md), [security review](docs/SECURITY-REVIEW.md) and [deployment instructions](docs/PUBLISH-GITHUB.md).

Refresh reviewed source snapshots deliberately, never by silently promoting submissions:

```sh
python scripts/acquire-osm.py
node scripts/import-osm.mjs
node scripts/import-campus-data.mjs
npm run generate-data
npm run validate-data
```

Review upstream name/version changes and every derived diff. Geodata: © OpenStreetMap contributors, ODbL; see [DATA-LICENSES.md](DATA-LICENSES.md). No KMUTNB source code, models, photos or protected university map images are reused. The public main site remains https://apichetfirm.github.io/KMUTT-OpenMap/; only an independently accepted merge to main deploys this candidate.
