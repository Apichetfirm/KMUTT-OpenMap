# Contributing to KMUTT OpenMap

Thank you for helping people navigate campus.

1. **Open an issue first** describing the incorrect/missing information and your source (official page, OSM feature ID, or field notes).
2. Make a small pull request; do not add unreviewed navigation routes to the app.
3. Edit `data/generate_catalog.py` for permanent building-name changes, then run `python data/generate_catalog.py`; do not edit only the generated JSON.
4. Include sources, checked date and uncertainty per new coordinate. Separate building centroids from pedestrian entrances.
5. Never add students' names, phone numbers, identifiable photos without permission, private security routes, or copyrighted campus 3D models without clearance.
6. Run `npm test` and `npm run check`. Verify browser UI on mobile and desktop.
7. A maintainer reviews every geodata PR. Paths require evidence of an on-site survey and graph checks before merge.

**Language:** Thai or English issues/PRs are welcome. Respectful, clear reports are preferred to assumptions. See CODE_OF_CONDUCT.md.