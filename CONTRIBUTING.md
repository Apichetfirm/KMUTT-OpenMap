# Contributing to KMUTT OpenMap

Initiated by Firm Impulse · FIBO FRAB11. Thai and English contributions are welcome.

1. Open an issue describing the problem, building code/place ID and evidence. A browser proposal is a private draft, not a published correction. Use the building or place issue template; attach the exported proposal JSON if useful.
2. Edit the canonical `data/buildings.json` for reviewed building changes. The old documentation's `data/generate_catalog.py` does not exist. Run `npm run generate-data` to regenerate points and coverage CSV.
3. Keep source, license, observation/check date and uncertainty with every new record. Coordinates are not entrances. Candidate footprints belong in the candidate file until association review supports acceptance. An independent maintainer reviews evidence before merging any promotion.
4. Heights in metres require measured evidence. Official floors, OSM levels, estimates and display fallbacks stay separate. Never mark an OSM tag or a source URL alone as field verification.
5. POI changes, closures and hours need provenance. Unknown fields remain unknown. Accessible paths require surveyed surfaces, steps, ramps, crossings and entrances; a generic wheelchair tag is insufficient.
6. Routes require field evidence and independent topology/entrance review. Synthetic test fixtures must never be published as campus paths. Validate graph edges against accepted footprints and review unknown-building crossings manually.
7. Do not contribute personal/private information, restricted plans, photographs without permission or copyrighted models. Record data licenses separately from MIT code.
8. Run `npm ci`, `npm run check`, `npm run validate-data`, `npm test`, `npm run test:e2e` and `npm run build`; see [testing instructions](docs/TEST-RESULTS.md). Test live tiles separately and document device/browser limits.

The implementer does not self-merge. Independent review and respectful collaboration are required; see CODE_OF_CONDUCT.md.
