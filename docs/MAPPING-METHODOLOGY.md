# Mapping methodology and source investigation

Initiated by Firm Impulse · FIBO FRAB11. Review date: 2026-11-02.

## Evidence collected

Official KMUTT campus and BGM navigation pages were retrieved. They support names/codes but provide no accepted georeferenced entrances or measured heights. BGM button labels and image-map labels disagree for S1/S2; S6 and N19 descriptions also remain inconsistent. No protected map image was copied, traced or redistributed.

Overpass returned HTTP 406. The standard OSM bbox API succeeded for `100.488,13.646,100.499,13.658`. `scripts/acquire-osm.py` stores a minimal licensed extract in `data/evidence/osm-campus-snapshot.json`, with source IDs/versions/timestamps, required tags and geometry; contributor identity fields are removed. OSM timestamps record source edits, not a current survey. Retrieval dates must not reset business-hours freshness.

The Microsoft Global Building Footprints documentation was reviewed: permissively licensed machine outlines can help an unmatched shape survey, but do not identify official building codes, public access, entrances or measured heights. A separate Microsoft clip was not redistributed because the available OSM outlines already cover named pilots, and additional unlabeled geometry would not resolve the missing associations. Campus imagery/photos/plans need their own redistribution/tracing rights. No unlicensed imagery was acquired.

The KMUTNB reference source was inspected for product concepts: search/selected-place flow, camera framing, collision/zoom labels, day/night, nearby categories, schedules and mobile cards. Its license is NOASSERTION; no code, models, photos, wording or geometry were copied. Live reference and production GitHub Pages hosts are blocked by this environment, which is distinct from a production failure. Local actual-provider QA is available.

## Association rules

`import-osm.mjs` uses an explicit code/OSM-way/expected-name table. It aborts if a name changes or geometry is invalid; it never picks a nearest outline. Thai/English names and documented abbreviations are compared with the official/BGM inventory. All six priority pilots N9/N10/N11/N16/N17/N20 now have named **candidates**, alongside 12 other candidates. N4 represents Mathematics only and is explicitly a partial complex. S6 keeps its conflicting-name blocker. Neither receives a new public coordinate.

Eighteen candidates retain source version/date, retrieval date, license, matching rationale, scope, uncertainty and null reviewer/verification. None is accepted. Thirteen previously missing full-building/office references are now approximate points; existing seven published points are preserved. Polygon reference points are computed on the interior surface with a scanline, including concave polygons/holes. They are not entrances or necessarily centroids. N2/N15 use named OSM office points; these have no inferred footprint.

Every building has either supported approximate evidence or an explicit unresolved reason. All 35 still need independent association/entrance review. The generated report lists each one. Legacy third-party point redistribution rights remain unresolved; no extra material from those sites was copied. Replace such points with licensed independent evidence before a verified-data release.

## Review and promotion

1. Check the current university code/name, code history and any complex/annex ambiguity.
2. Check the exact licensed source outline/version and uncertainty. Investigate conflicts; proximity is insufficient.
3. Have an independent reviewer document the association basis and reviewer/date. Survey when claiming field verification.
4. Update canonical `mapping.footprint_id` and accepted GeoJSON together. Never move candidates by renaming their status alone.
5. Validate geometry, duplicate associations, cross-building positive-area overlaps, point containment, height provenance and separate entrances.
6. Regenerate views, run tests, review actual screenshots and request a PR review.

The app lets contributors select a candidate, see a dashed/amber preview, add evidence, confirm a local proposal, edit/delete/export it and prepare a GitHub issue. It never accepts their association automatically.

Reproduce with the commands in README. A saved OSM XML response can be passed to `acquire-osm.py`; committed snapshots make subsequent imports offline/reproducible. Refreshing upstream data is a reviewed import, not part of the ordinary build.
