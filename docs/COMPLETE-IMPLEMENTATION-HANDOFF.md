# Complete implementation handoff to Codex A — v0.4 RC

**Initiated by Firm Impulse · FIBO FRAB11**

Date: 2026-11-02 (Asia/Bangkok). Repository: `Apichetfirm/KMUTT-OpenMap`. Base: latest main `0bdeadd63d668d359fbe780fd5aef0acf98a25df`. Branch: `feat/kmutt-openmap-v0.4-complete`. Independent acceptance is required; no self-merge, production setting change or major release is performed.

## A. Executive summary

Delivered an implemented release candidate extending the original 35-building community preview. New licensed public-source work adds 13 approximate references (20 total), 18 named candidate footprints (including all six pilots), 73 approximate OSM campus/nearby services and 112 candidate pedestrian segments. None is silently promoted to field verification. Users can search, inspect sources/uncertainty, discover/filter services, view schedules, open external walking directions, share stable building/POI URLs and prepare reviewed local corrections.

Candidate editing now previews source outlines and explicitly estimated 3D; community reporting covers all requested report types with local review/save/edit/delete/export/prepared issues. The map runtime/worker/CSS/license are vendored and digest checked; CI actions pin full SHAs, CSP and error recovery are tested. Routing supports survey/review/accessibility/entrance gates and UI states, but real internal navigation remains disabled with current evidence.

This is a useful software release candidate, not a completed surveyed campus or independently accepted release. No official university endorsement, 35/35 verified geography, current-business guarantee, faithful measured 3D or accessible campus-route accuracy is claimed.

## B. Phase completion matrix

| Phase | Actual status | Delivered / remaining |
| --- | --- | --- |
| 0 Audit/stabilization | **COMPLETE** | Latest main, all open issue criteria, complete source/docs/workflows, baseline tests and confirmed failure cases reviewed; bounded fetch/retry fixes; no known critical application regression in tested Chromium flows |
| 1 Building mapping | **PARTIAL** | All 35 have supported approximate evidence or explicit unresolved reasons; 20 references/18 candidates; full pilot coverage; independent associations, missing shapes, field verification and naming conflicts remain **BLOCKED — EXTERNAL EVIDENCE** |
| 2 Realistic 3D | **PARTIAL** | Source-shaped candidate previews, building-specific estimate metadata, single extrusion, lighting and height safety; faithful roofs/materials/models, accepted geometry and measured dimensions remain **BLOCKED — EXTERNAL EVIDENCE** |
| 3 Core UX | **COMPLETE** in tested Chromium desktop/mobile flows | Bilingual/ranked/limited-typo search, details/provenance, deep links/history, framing, responsive keyboard/reduced-motion behavior; full release cross-browser/assistive-device verification belongs to phase 8 |
| 4 Campus discovery | **PARTIAL** | Functional service search/category filters/cards/source dates/hours/directions/share/report; 73 sourced approximate records; current operator verification, stale schedules and empty categories remain **BLOCKED — EXTERNAL EVIDENCE** |
| 5 Navigation | **PARTIAL** | External walking fallback, candidate pipeline, graph/engine/safety tests and full unavailable/result UI; actual internal/accessible routes remain **BLOCKED — EXTERNAL EVIDENCE** |
| 6 Community contributions | **COMPLETE** | All six report types; references/notes; review before save/export; local edit/delete/recovery; prepared GitHub issue; governance/non-programmer/staff guides; no automatic publication |
| 7 Performance/security/reliability | **PARTIAL** | Vendored verified runtime, pinned actions/update process, CSP/XSS/storage checks and failure recovery; 4.64s measured median misses ~3s target; physical 30 FPS/soak remains **BLOCKED — EXTERNAL EVIDENCE** |
| 8 QA/documentation/release candidate | **PARTIAL** | 46 Node + 40 Chromium browser tests, actual screenshots, measured comparison, full docs/handoff and unmerged PR; local Firefox/WebKit downloads and production-host access **BLOCKED — TECHNICAL**; physical/independent acceptance **BLOCKED — EXTERNAL EVIDENCE** |

No blocked phase is called complete. No remaining implementation is represented as verified data merely because a schema/test exists. Existing issues #1–#5/#7 remain open for full acceptance.

## C. Implementation details

- Retains static ES-module/HTML/CSS/MapLibre/Pages architecture; no backend/framework rewrite. See ARCHITECTURE.md and SPEC.md.
- Data acquisition preserves rights, exact source IDs/versions/timestamps and strips OSM contributor identities. Matching uses explicit names/IDs, never nearest-outline guessing. New references only fill missing supported locations; original points, URLs and legacy draft key are preserved.
- Derived coverage and per-building queue expose all unknowns, candidates versus accepted polygons, floor/height evidence, routes/entrances and places/schedules. Concave polygons use interior points; accepted positive-area overlaps are rejected.
- Candidate previews are amber/dashed, with source-level or generic display heights; ordinary tile extrusions are hidden during preview. Physical heights remain null. Official N16 floors yield a disclosed 48m preview assumption, not a measurement.
- Building/POI cards are mutually exclusive; stable URLs preserve Pages path/query/hash and history. POIs include source dates and stale-hour warnings; opening-status filtering excludes stale/unknown schedules.
- General community drafts use separate storage and locked exact revisions. Review becomes invalid after edits. Corrupt data and legacy proposal recovery are preserved. Prepared issue links never submit a message automatically.
- Candidate path topology stays outside the accepted graph. Public routing needs a survey and distinct independent reviewer plus verified linked entrances; accessibility and passages have separate gates. Current accepted routes remain empty.
- Vendored MapLibre includes its **separate worker**, CSS and full bundled license. Digests and npm lock integrity are checked at build/CI; action SHAs/update policy and tested CSP are documented in SECURITY-REVIEW.md.

## D. Data coverage

| Metric | Baseline | Final |
| --- | ---: | ---: |
| Buildings | 35 | 35 |
| Approximate published references | 7 | 20 |
| Buildings without coordinates | 28 | 15 |
| Candidate footprints | 3 | 18 |
| Accepted / field-verified footprints | 0 / 0 | 0 / 0 |
| Documented official floor counts / measured heights | 1 / 0 | 1 / 0 |
| Candidate rendering estimates / generic fallbacks | Not supplied | 7 / 11 |
| Verified entrances | 0 | 0 |
| Candidate / verified pedestrian segments | 0 / 0 | 112 / 0 |
| POIs / field-verified POIs | 1 / 0 | 73 / 0 |
| Recorded schedules | 0 | 3, all stale |

The generated authoritative report is DATA-COVERAGE.md / `data/coverage-report.json`. All 35 associations still require independent review. Unresolved names now include S2 because BGM image links swap S1/S2. N4's candidate is partial. Legacy third-party source rights remain unresolved for existing points; no new material from those sources was imported.

## E. Test results

Exact commands/environment/interaction checks: TEST-RESULTS.md. Final local results: `npm run check`, `npm run validate-data`, `npm run verify-vendor`, `npm run build` pass; `npm test`: **46/46**; explicit desktop/mobile Playwright command: **40/40**, 4.1m. Baseline: **34/34** and **22/22**. npm audit: zero advisories at baseline/final. Actual MapLibre expression/style validation, source geometry, schedule edge cases, review/route gates and draft corruption/revision cases are covered.

Chromium desktop 1440×1000 and Pixel 7 emulation, plus short/narrow portrait, 844×390 and 667×375 landscape, tablet/short-window bounds. Actual runtime and worker are tested under CSP on the Pages path. Actual-provider screenshot/health evidence is under `docs/qa/v04/`; test logs, audit and raw timings are retained. Fixtures are explicitly distinguished from live-provider and physical verification.

Firefox/WebKit projects and CI installation are configured. Both local browser downloads failed HTTP 403 under environment network policy; no pass is fabricated. Production/reference GitHub Pages URLs are similarly blocked; local real-provider rendering succeeds. Physical devices, screen readers, Safari hardware and Android FPS remain untested.

## F. Performance results

Three alternating fresh-context live-provider samples per version, identical viewport/Chromium/SwiftShader/proxy conditions and no concurrent browser QA. Baseline map-load median **4,297.0ms**, final **4,639.6ms**. Catalog median **690.8 → 646.2ms**. Synchronous search/list median **0.6 → 0.6ms**. All six samples loaded one canvas with zero application errors.

**~3s target not met; 30 FPS physical-device target not measured.** Three samples and uncontrolled provider/proxy cache variation do not prove a causal speedup. Heap snapshots do not establish leak freedom. PERFORMANCE.md and `qa/v04/performance.json` give raw results, conditions, limitations and exact reproduction command.

## G. Security review

Compared digest-verified CDN delivery with vendored artifacts; chose the locked same-origin module/worker/CSS/license. Runtime availability no longer depends on unpkg. Build/CI verify four exact assets and lock integrity. SHA-pinned actions retain least-privilege roles; monthly reviewed update process documented. CSP allows required provider/style/worker behavior without inline/eval scripts, and retains attribution.

Safe DOM/URL construction, literal hostile-text browser check, GPS click/denial and nonpersistence, bounded/recoverable fetch/import behavior, storage denial/quota/corruption and cross-tab revision safety examined. No secrets/credentials/OSM author identities/private student data imported. Third-party tile provider trust, style inline allowance, Pages header limitations and legacy data rights remain disclosed. This is not an independent security audit; leave issue #7 for independent acceptance.

## H. Known limitations

No accepted footprint/entrance/measured-height/path survey exists. Approximate named references and OSM POIs can be wrong/outdated. Current 3D tile heights and candidate previews are not architectural ground truth. Eleven candidate preview heights use generic 4m fallback. Three imported schedules are stale; other hours/holidays are unknown. Some service categories remain empty. Source naming conflicts and legacy third-party redistribution rights persist. Upstream basemap sprite/filter warnings and software-GPU readback warnings remain nonfatal and recorded. No first-visit offline guarantee, physical performance/long-soak result, screen-reader certification or local Firefox/WebKit pass is claimed. No production deployment or merge is performed.

## I. External blockers and exact next actions

| Missing information / why needed | Evidence collected | Exact next action / suggested responsible party | Acceptance |
| --- | --- | --- | --- |
| Current S1/S2/S6/N19 identities and N4 complex | Official/BGM name/button/image discrepancies, partial Mathematics source | BGM/campus-directory owner supplies dated current code/name/history and complex scope | Resolve conflicts with authoritative date/source; independent reviewer approves names and no guessed dorm metadata |
| Accepted code-to-outline associations and remaining locations | 18 versioned named OSM candidates, all 35 queue/reasons | Facilities GIS + independent campus reviewer review each shape, obtain licensed missing geometry, compare ground truth | Every accepted shape has exact code rationale/source/license/date/reviewer; validate containment/overlap; unknown stays unresolved |
| Public entrances and safe pedestrian graph | 112 source-linked candidate segments, synthetic engine/UI | Facilities/student survey team walks public network, records gates/crossings/passages/direction/hours; a distinct reviewer checks each | Verified separate entrance/node links, actual connectivity/access and no undocumented building passage; only reviewed graph enabled |
| Wheelchair usability | No accepted accessibility claims | Accessibility office with users surveys width/slope/surface/kerbs and every entrance/node/edge | Independent accessible-route audit and complete per-segment evidence before enabling accessible routes |
| Physical heights and recognizable detailed models | N16 official 15 floors; six candidate OSM level records; explicit preview assumptions | Building office supplies measured/approved dimension evidence and licensed plans/views; GIS/3D reviewer validates | Physical metres have credible evidence; roof/material/model scale accepted; no height estimate promoted to measurement |
| Current service operation and schedules/holidays | 73 OSM records; three stale 2024 schedules | Operators/student affairs verifies each relevant service and dated public schedule/exceptions | Current source/observation dates, closure status and explicit uncertainty; populate empty categories only with supported places |
| Runtime browser/production access | Local Chromium passes; download/production hosts denied by environment | Codex A runs final CI Firefox/WebKit and live production smoke checks in an authorized network | Final SHA has full CI pass, live provider/Thai labels/CSP/directions/share/attribution work on required engines |
| Physical devices, FPS/soak/assistive QA | Headless desktop/mobile emulation, actual screenshots/load samples | Students/Codex A test mid-range Android, iOS/Safari and screen reader, measure frame/load/latency/thermal memory | Document device/network/browser, ~3s load and ~30 FPS conditions or remaining failures; no major UI/accessibility regression |
| Legacy point redistribution rights | Original S3/N5/N9/N11 sources preserved; no new source content copied | Data steward obtains permission or replaces with independently licensed reviewed points | Clear license/permission and independently supported replacement before verified-data release |
| Independent release acceptance | Full candidate/test/security/data evidence and unmerged PR | Codex A independently reviews final SHA, issues and complete checklist | Explicit reviewer acceptance; only reviewer-approved merge/deployment/release, no implementer self-merge |

## J. Release checklist for Codex A

- [ ] Check latest main/base and review the full PR diff, including vendor bytes/worker/license/action SHAs.
- [ ] Re-run README validation, all configured browsers and staged Pages base path at the exact PR head.
- [ ] Inspect actual screenshot gallery, browser health, logs, raw performance and each unresolved/data-quality claim.
- [ ] Confirm no candidate/local report is counted as accepted/surveyed data and internal/accessible routing stays disabled with current data.
- [ ] Verify original URLs, local draft/recovery behavior, names, source rights and full issue acceptance criteria; close no issue prematurely.
- [ ] Complete authorized live-production, physical-device, assistive and FPS checks; record failures openly.
- [ ] Review staff/non-programmer guides and institutional blockers with the suggested owners.
- [ ] Approve/reject release independently; merge/deploy only through existing main workflow after acceptance. Do not infer approval from CI alone.
