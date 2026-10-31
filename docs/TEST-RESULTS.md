# Automated check coverage

`tests/project.test.mjs` provides 11 Node built-in tests. CI runs:
- JavaScript syntax checks in `src/`.
- Official directory completeness and unique IDs.
- Evidenced names, placeholders for unknown location/height data.
- Search priority and alias lookup.
- North/south/mapped filtering.
- Empty internal routing graph.
- Height display-only policy.
- Local draft validation, rejection, export and recovery.
- Initiator + FIBO FRAB11 attribution.

**Not covered by Node tests:** WebGL rendering accuracy, external map tile uptime, real-world building position/height, keyboard/screen-reader usability, GPS device accuracy and browser performance.

A final release requires actual desktop/mobile browser tests.
