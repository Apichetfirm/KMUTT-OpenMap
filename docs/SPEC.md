# Technical/product specification — v0.4 RC

Initiated by Firm Impulse · FIBO FRAB11.

The static map supports the flow: search a building → inspect evidence and location uncertainty → find sourced nearby services → open supported external walking directions → share a stable destination URL → report a correction. Preserve all 35 original codes, Pages paths, legacy local drafts and initiator attribution. No account is required to browse and no university endorsement is implied.

Search accepts Thai/English names, codes/abbreviations, punctuation/spacing, partial matches and limited English one-edit/transposition tolerance. Exact codes outrank all other matches. Keyboard selection, skip/focus semantics, native modal contribution flow, reduced motion and responsive portrait/landscape/tablet layouts are tested.

Building cards expose code/names, known floors, unknown department/height/entrances, confidence, source dates, directions/share/report and navigation coverage. POI cards expose categories, descriptions, source dates, weekly recorded hours with stale/holiday warnings, directions/share/report. Deep links use `building` or `poi` exclusively while preserving unrelated URL context. Candidate preview and stored proposals never affect these public references.

Geodata schemas and provenance must validate. All missing building locations have reasons. Accepted/candidate geometry, surveyed entrances and physical/rendering heights remain separate. Candidate 3D uses explicit source-level/fallback assumptions only in the editor. No internal/wheelchair route is enabled until reviewed graph and linked verified entrances exist.

The community workflow supports typed reports, evidence notes/links, optional coordinates, review before export, local edit/delete, JSON packages and prepared GitHub issues. It does not silently submit or publish. Safe storage revisions/locks and corruption preservation apply.

Security uses vendored locked MapLibre module/worker/CSS/license, digest verification, SHA-pinned CI actions, least privilege, a tested CSP, safe DOM/URLs and nonpersistent GPS. Network/map/data/storage/GPS failure states preserve the directory when possible. Timeouts and explicit retries are bounded and actionable.

QA includes meaningful Node/MapLibre/data tests, real-browser fixtures, actual-provider screenshots/performance and separate blocker reporting for unsupported browsers, physical devices, sources and independent acceptance. The complete handoff is the release decision input; a passing build or a schema alone does not complete a phase.
