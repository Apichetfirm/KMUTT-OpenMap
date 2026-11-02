# v0.5 independent release review

Initiated by Firm Impulse · FIBO FRAB11. Codex A, 2026-11-02.

## Review summary and evidence boundary

Independently reviewed [PR #14](https://github.com/Apichetfirm/KMUTT-OpenMap/pull/14), supplied candidate `e087b0847fdbd9b92e338af92bcb33f54ec9db68`, against main `8973cf7b8b5104c743b5ebcc0dba5fd4fd4ba5b6`. Inspected the complete 43-file change inventory, changed application/admin modules, CLI tools, workflows/tests, source/derived metadata, handoff, raw measurements and screenshots. Generated measurement/data JSON was parsed and checked; committed photographs were not assumed to exist merely because the UI supports them.

**Software implementation complete within the infrastructure release scope:** building cards, missing/broken-image states, supported panorama-search handoff, offline derivative/observation tools, local reviewer/export, publication validation and privacy separation. Three source defects were corrected before the initial merge. A separate Python audit after that merge found a fourth P1 dependency defect. Inspecting the inherited launchers then confirmed a fifth privacy defect: all-interface development serving could expose private work files. Both corrections are in follow-up PR #15. The corrective final head passed strict audit and full CI, and #15 is merged; final publication/deployment verification is recorded below.

**Real-world building evidence incomplete:** zero approved photographs/gallery images, genuine Vision observations, new accepted associations, measured heights, verified entrances/internal routes or confirmed panoramas. Physical phones/actual Safari, real-photo quality/performance and model accuracy are unverified. The local reviewer is not an authenticated online moderation service. This release must be labeled **KMUTT OpenMap v0.5 — Building Evidence Infrastructure / Community Preview**.

## Findings and corrections

| ID | Severity | Root cause, correction and regression |
| --- | --- | --- |
| R1 | P1, fixed | Node private-output protection was lexical only. A `work/` junction/symlink into public `data/`, or an external alias into it, bypassed the restriction. Resolve existing filesystem ancestors, then check the canonical target against the canonical repository root. Preserve permitted private external outputs. A real filesystem-link regression fails before/passes after; Windows junctions were tested locally and POSIX links in CI. [Commit](https://github.com/Apichetfirm/KMUTT-OpenMap/commit/4e9e23ef913e9e3f1673d2cb8ae8883397bd727d). |
| R2 | P1, fixed | Optimizer lacked the extractor's private-output rule. Even with reviewed image rights, its metadata sidecar could contain private notes and be written into recursively published data/docs. The optimizer now resolves the output and rejects in-repository paths outside `work/` before creating them. A synthetic isolated-repository regression originally wrote the sidecar, then correctly refused with no output directory. [Commit](https://github.com/Apichetfirm/KMUTT-OpenMap/commit/bdc41307d3f7f78542e742198014a571f927ca93). |
| R3 | P1, fixed | Reviewer replaced active analysis before validating candidate entries; `[null]` threw during render and poisoned subsequent building selection. Validate every candidate/building code before assignment. Malformed import now preserves prior analysis and supports further selection. Regression also parses displayed JSON and proves hostile HTML-like text stays literal. [Commit](https://github.com/Apichetfirm/KMUTT-OpenMap/commit/4ef4d0c6636a5601b508fb7222d42aeafe2d9806). |
| R4 | P1, fixed | Strict Python audit found 39 advisory records for Pillow 12.3.0 (aliases overlap), including a reachable bundled-codec heap overflow. Pin 13.0.0; configure compatible Python 3.14 with a verified full action SHA; add strict Python advisory auditing to CI. Extractor provenance now uses the actual runtime version, checked by a regression. Final strict audit and full CI pass; PR #15 merged. [Fix](https://github.com/Apichetfirm/KMUTT-OpenMap/commit/0414995e6ad11a5c13f65b43163b53796d1e56b0). |
| R5 | P1, fixed | npm dev and both Windows Python launcher branches listened on wildcard interfaces, unsafe for a repository now containing private work outputs. Bind to 127.0.0.1. A real subprocess regression first observed the wildcard IPv6 listener and now verifies loopback, plus both Windows branches. PR #15 merged the fix. [Commit](https://github.com/Apichetfirm/KMUTT-OpenMap/commit/5323f197cd1e83327938334fa3d6d747fb43d68d). |
| R6 | P2, follow-up | Provider missing-sprite/filter warnings and software-renderer ReadPixels stalls persist. No application exception, console error, failed request or CSP violation occurred in the independent live journey. |
| R7 | P2, external evidence | Real photo decoding/identity/rights checks, rich-image performance, physical devices and actual Vision evaluation cannot be established using empty metadata or synthetic fixtures. Review them before publishing the first real image set. |

No geographical correction or canonical height/location change was made. Current path checks protect intended CLI use; they are not filesystem ACLs or a defense against a hostile local account concurrently replacing directories. Keep private inputs outside public directories. The build still deliberately publishes the reviewed public `data/` and `docs/` trees; arbitrary private files must never be manually placed there.

## Independent tests

| Check | Result and scope |
| --- | --- |
| `npm ci` | Locked installation succeeds, 28 installed packages. |
| `npm run check` | Syntax passes, including admin modules. |
| `npm run validate-data` | Catalog, geometry, generated views/coverage and media schema pass. |
| `npm run validate-media` | 35 explicit records, zero reviewed image derivatives. |
| `npm run verify-vendor` | All four locked npm/manifest digests pass; v0.4 vendor payloads unchanged. |
| `npm test` | Initial 54/54; after review fixes **55/55**. [Log](qa/v05-review/unit-tests.txt). |
| Isolated Python 3.14/Pillow 13.0.0: `python -m unittest discover -s tests -p 'test_*.py'` | Initial 2/2; after output/provenance/server regressions **4/4**. Rights refusal, EXIF removal, nonsemantic extraction, private-output refusal, runtime provenance and actual loopback startup. [Log](qa/v05-review/python-tests.txt). |
| `npx playwright test --project=desktop --project=mobile --project=webkit` | **78/78** initial local matrix. After R3, complete affected detail/reviewer suite **15/15** across those engines. [Matrix](qa/v05-review/browser-matrix-local.txt), [affected suite](qa/v05-review/reviewer-regressions.txt). |
| Local Firefox 157 launch | `spawn UNKNOWN`, before application execution; not counted as local coverage. Downloaded binary cannot launch in this Windows environment. |
| Supplied-candidate CI | Decoded [41404068728](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41404068728) logs independently confirm 54 Node, 2 Python and 104 browser passes, real WebGL2 all projects. |
| Pre-security corrected-head CI | [41408407025](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41408407025), exact `4ef4d0c`: **55 Node, 3 Python and 108 browser passes**, build succeeds. Decoded logs inspected; Chromium desktop/emulated mobile, Firefox and WebKit all create WebGL2. Chromium sandbox enabled on Ubuntu 22.04; Firefox llvmpipe/Xvfb, Chromium SwiftShader. WebKit renderer strings do not certify physical Apple hardware. |
| Final security head CI | [41428108886](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41428108886), exact `5323f197`: **55 Node, 4 Python, 108 browser tests**, strict Python audit clean and build passes. Decoded logs inspected, WebGL2 all four projects, sandboxed Chromium. |
| `npm run build` | Verified static staging passes. [Checks](qa/v05-review/checks.txt), [inventory](qa/v05-review/build-inventory.json). |
| `python -m pip_audit --strict -r scripts/requirements-images.txt` | Initial 12.3.0: 39 advisory records, [IDs/aliases/fixes](qa/v05-review/python-audit-initial.json). Patched 13.0.0: zero known vulnerabilities, [result](qa/v05-review/python-audit.json). The initial audit ran after #14 merged; final acceptance was held and #15 opened. |
| `npm audit --json` | Zero reported advisories. [Raw report](qa/v05-review/npm-audit.json). This is not a complete security proof. |

R1/R2/R3 regressions were observed RED before correction. R4 has an actual failing advisory scan before upgrade and a clean scan afterward; the extractor runtime-version assertion also failed before correcting its hardcoded version. R5 was observed with a real wildcard-bound ephemeral server in an empty temporary directory before the loopback change. A first R3 green attempt incorrectly compared raw quotes with JSON-escaped display text; its assertion was corrected to parse the displayed JSON, after which all 15 affected checks passed. No timeout inflation or suppression was used. The handoff's earlier retry race is fixed in the supplied code by disabling controls before removing/replacing the map; existing behavioral assertions remain and pass.

Fixtures exercise positive/broken licensed-image states, lazy/async responsive attributes, attribution, optional media failures, malicious input, share URLs, proposals/export, keyboard/focus, storage, map retry and routing restrictions. Separate real-provider checks avoid treating fixture success as deployed/provider evidence. Browser emulation/WebKit automation are not physical Android/iOS or actual Safari certification.

## Building, GIS and source integrity

All **35** detail cards were exercised against actual catalog names/codes/English labels, canonical floor/height text, directions availability, share URLs and missing-photo state. All old canonical building fields compare exactly with v0.4; additions are null faculty/description/evidence and unknown panorama references. No faculty or descriptive claim was invented. N16 retains its documented 15 floors, not measured metres. No accepted geometry or entrance appeared.

Coverage remains 35 buildings, 20 approximate points, 15 without coordinates, 18 candidate/zero accepted footprints, zero measured heights/verified entrances/routes, 112 candidate path segments, 73 approximate POIs and three stale schedules. All v0.4 GIS/storage/URL contracts remain. Internal routing stays disabled; external directions remain approximate destinations rather than confirmed entrances.

All 35 photographic source records retain unresolved owner/license/photo/camera metadata. Six priority BGM HTML reference pages independently returned 200 and matched recorded source digests: [reference checks](qa/v05-review/reference-checks.json). Only HTML was read; no source photograph was fetched, copied or granted rights by that result. Existing S1/S2/S6/N19 conflicts and N4 partial mapping remain unresolved.

Live application evidence: [all-code health/results](qa/v05-review/live-browser-health.json), [N9/FIBO](qa/v05-review/selected-n9.png), [N10/library](qa/v05-review/selected-n10.png), [N11/SIT](qa/v05-review/selected-n11.png), [N16/LX](qa/v05-review/selected-n16.png), [N17/CB2](qa/v05-review/selected-n17.png), [N20/CB1](qa/v05-review/selected-n20.png), [metadata](qa/v05-review/desktop-metadata.png). Actual live map, no generated building photography. No building-image requests occurred across all 35 selections.

Responsive screenshots: [390×844](qa/v05-review/mobile-portrait.png), [360×640](qa/v05-review/mobile-narrow.png), [844×390](qa/v05-review/mobile-landscape.png), [667×375](qa/v05-review/small-landscape.png), [768×1024](qa/v05-review/tablet.png), [scrolled mobile action](qa/v05-review/mobile-street-view.png). Details remain scrollable; controls, selected markers, attribution and Street View action are reachable without horizontal page overflow. Desktop is 1440×1000. Physical touch/assistive-technology testing remains outstanding.

## Image rights and publication controls

No campus photograph is published. The only new committed PNGs from implementation are actual application QA screenshots with missing-photo UI. Synthetic conversion/extraction fixtures are labeled QA and are not presented as real buildings. Public source references do not establish reuse permission; Commons access limitations in B's research do not prove that no reusable image exists anywhere.

`validPhoto` requires recognized CC0/CC BY/CC BY-SA identifiers, photographer, attribution, source, review status/reviewer/date, meaningful alt text, positive dimensions and constrained same-origin derivative paths. Build checks listed files, size budget and WebP/AVIF signatures; only validated listed derivative paths are copied into `assets/buildings`. Header/metadata checks alone do not establish content identity, legal rights, full decode quality or trustworthy camera metadata. Independent human rights/identity review of exact image bytes remains required, including license conditions and transformations. Do not invent a CC label for permission-only material.

Pillow creates oriented RGB WebP derivatives at 320/640/960 targets without upscaling or duplicate actual-width descriptors, strips EXIF/GPS, and retains credit in a separate metadata sidecar. Sidecars and originals stay private; only deliberately reviewed derivatives may be copied into public assets and registered. Synthetic solid-color size tests do not prove representative compression quality. The current zero-photo release cannot certify real-photo rendering or licensing completion.

## Street View verification

Compared implementation with [Google's current Maps URLs documentation](https://developers.google.com/maps/documentation/urls/get-started#displaying-a-street-view-panorama). Uses `https://www.google.com/maps/@`, `api=1`, `map_action=pano`, URL-encoded `viewpoint=latitude,longitude`. These URLs need no API key. A viewpoint asks Google's viewer for a nearby panorama; it does not identify a campus building or guarantee current imagery.

All 20 approximate references produce the supported URL; all 15 unknown points have no href and an explicit disabled state. Invalid/out-of-campus/nonfinite coordinates are refused by the existing coordinate validator. Target is `_blank` with noopener/noreferrer. Desktop and [emulated mobile dispatch](qa/v05-review/street-view-mobile.json) were exercised; popup tests intercepted the destination to verify handoff without fetching Google imagery. They do not confirm panorama coverage, native Maps app behavior or identity. UI explicitly states the search/unknown-coverage limitation. No Google imagery is scraped, embedded, redistributed or used as independent GIS evidence; no paid Google API dependency was added.

## AI and local reviewer security

No runtime model, inference endpoint, API key or recurring paid AI dependency exists. The pixel extractor computes dimensions/digest/five dominant image colors, including sky/vegetation/background; it is not semantic Vision, OCR, facade identification or geolocation. Offline matching consumes separately produced observations with reviewed-photo provenance/model/version/date/uncertainty, compares reported signs/names and flags canonical floor conflicts and ambiguous alternatives. Tests use synthetic observations only. Zero actual Vision observations/matches means no real-world accuracy or calibration claim is possible. An independent [whole CLI empty-input run](qa/v05-review/empty-evidence-cli.json) wrote only to a private temporary directory and returned zero observations/matches with all 35 buildings unresolved.

Outputs remain unverified candidates; no facade GPS or measured height is inferred. AI sign/floor output cannot update canonical geography. Different author/reviewer fields and export approval flags support a manual process; user-entered identifiers are not authenticated identity proof.

The local reviewer imports JSON into tab memory, renders with textContent/SVG attributes and exports a download. It has no upload or publication endpoint. Malformed imports now preserve prior state; hostile HTML stays text. Accept means **prepare for independent PR review**, not publish. Export requires evidence URLs/rationale and a distinct known author/reviewer. [Local reviewer screenshot](qa/v05-review/local-reviewer-public-data.png) contains public source data only, not private imported analysis.

## Python dependency security and late corrective follow-up

The npm audit did not cover the new Python dependency. A separate pip-audit 2.10.1 check found known advisories in Pillow 12.3.0 after #14 had merged. [Upstream GHSA-78g4-xqwv-q3g8](https://github.com/python-pillow/Pillow/security/advisories/GHSA-78g4-xqwv-q3g8) identifies a bundled-codec heap overflow reachable through ordinary image opening/loading, fixed in 13.0.0. [Official 13.0.0 release notes](https://pillow.readthedocs.io/en/stable/releasenotes/13.0.0.html) were checked. Rights-reviewed images still require a patched decoder.

No Python/image decoder runs in the public browser app; no photographs were published. This limits visitor exposure, but does not excuse an unsafe offline importer. Final acceptance was held while [PR #15](https://github.com/Apichetfirm/KMUTT-OpenMap/pull/15) adds the patched pin, explicit compatible CI Python, strict requirement auditing and accurate extractor-version provenance. Local 4/4 tests and the strict patched audit pass. The same follow-up binds inherited npm/Windows development serving to loopback; source repositories with private work must not be served to the LAN. Advisory records may have overlapping aliases; 39 records are not asserted to be 39 distinct vulnerabilities. Original negative and final positive audit results are preserved.

## Static-build privacy and security

Independently inspected **all 176 files** in the candidate-stage inventory, not just absence of two directories. Public data includes sanitized GIS provenance and unresolved photographic source references, not private originals or observations. Production has no `admin/`, `work/`, original photographs, unlisted image, private analysis sidecar or reviewer export. A deliberately planted synthetic private-work canary and unlisted asset were excluded by a real build and cleaned up afterward. Unrelated root files are excluded too. [Inventory/digests](qa/v05-review/build-inventory.json). Later documentation publication adds only the reviewed report/evidence.

Production-root tests return 404 for admin/work. Vendor integrity/action pins, main-only Pages deployment, least privileges and tested self-origin CSP are retained. Real provider scripts/worker/tiles ran with zero application/CSP errors; known style/software warnings remain recorded. Meta CSP/inline-style allowances and third-party tile availability/trust limitations remain as documented for v0.4. No secrets or private original-image bytes were found in this change. Local imports are not encrypted secret storage.

## Independent performance

Six counterbalanced AB/BA pairs, fresh contexts in one sandboxed Chromium 156.0.8078.4 process, Windows 10.0.26200, i5-11400H/12 logical CPUs/23.74GiB RAM, 1440×1000, headless SwiftShader, live provider, no throttling/proxy/concurrent browser QA. Baseline `8973cf7`, candidate `4ef4d0c`; provider/OS caches and reused browser process remain uncontrolled. [Raw timings/resources/long tasks](qa/v05-review/performance.json), [calculated summary](qa/v05-review/performance-summary.json).

| Metric, n=6 each | v0.4 main | v0.5 candidate |
| --- | ---: | ---: |
| Initial map median | 1,794.7ms | 1,560.0ms |
| Map range | 1,462.2–1,975.0ms | 1,218.0–2,082.8ms |
| Catalog median | 194.7ms | 178.5ms |
| Detail synchronous JS/DOM median | 16.6ms | 17.0ms |
| Selection through two animation frames, median | 167.1ms | 153.7ms |
| Synchronous search median | 0.4ms | 0.5ms |
| Snapshot heap median | 27.18MiB | 29.75MiB |
| Main-page same-origin resource transfer median | 2,042,835 bytes | 2,075,410 bytes |
| Initial resource count | 28 | 31 |
| Building-image transfer | 0 bytes | 0 bytes |
| Aggregate layout-shift score, each sample | 0.04874 | 0.04874 |

Paired mean map difference -163.75ms; exact two-sided sign-flip p=0.25. No causal optimization/regression is established. B's 8.77s/7.42s medians were independently recomputed from all six pairs. Its raw JSON records Chromium 154.0.8037.57, while its handoff said 156; the handoff is corrected to the raw version. Its software-rendering/provider conditions differ from this review. Three seconds is met in this local experiment, not established as a production/phone guarantee. Cold-provider/real-phone performance remains a next gate.

The added detail/evidence modules and media index account for three requests and ~32.6KB extra same-origin transfer in these samples. No all-building photos or runtime AI load occurs. A separate private synthetic response-fixture check proves [selected-only/deferred-gallery loading](qa/v05-review/synthetic-lazy-loading.json), without publishing any synthetic image file. Maximum candidate long tasks were 338–509ms per sample, versus 344–527ms baseline. Worker-owned tiles/cross-origin transfer details are not fully exposed by main-page Resource Timing. No evidence justified removing features; profile startup/provider latency on real hardware next.

Layout score includes programmatic selections that browsers do not treat as trusted recent input; it is not a pure first-paint or real-user CLS measurement. Two animation frames are not INP. Heap range was 23.37–33.47MiB candidate; snapshots exclude native/GPU memory and do not prove leak freedom. Empty-image results cannot establish image-rich load, compression, broken-photo layout stability or phone thermal/FPS behavior.

## Release decision, merge and deployment

PR #14 merged at `a854d90488c3377840edd1a506a3639ddfba9cb0` after its corrected head `4ef4d0c6636a5601b508fb7222d42aeafe2d9806` passed 55 Node / 3 Python / 108 browser tests. The later separate Python advisory finding held final acceptance and required security follow-up #15, which also fixes all-interface development serving. Security follow-up #15 merged at `6c75e72a9cb25c71e55bbff3916e232f5651cb2d` after exact head `5323f197cd1e83327938334fa3d6d747fb43d68d` passed 55 Node / 4 Python / 108 browser tests and a clean strict Python advisory audit. No claim is made that the initial dependency audit was complete.

Initial [Pages deployment 41424926678](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41424926678) succeeded. Actual production smoke [results](qa/v05-review/production-smoke.json) compare all **159 published source/vendor/data/docs/HTML/favicon/license files** with the initial merge, not just expected exclusions. All 35 cards/Street View states, legacy share/proposal/POI flow, night/2D, portrait/landscape controls and zero image requests pass, with no application/CSP errors. Admin/work/offline-script URLs return 404. Deliberately blocking the production vendor module preserves directory search and missing-photo details; explicit retry loads the real module/worker/tiles and retains N9 ([recovery evidence](qa/v05-review/production-recovery.json)). [Desktop](qa/v05-review/production-desktop.png), [portrait](qa/v05-review/production-portrait.png), [landscape](qa/v05-review/production-landscape.png). The first harness incorrectly probed via a closed request context; corrected to use a fresh context, then the complete smoke rerun passed without an application change. Its map-load observation was 3,554.6ms, a single production observation, not a median or a three-second guarantee.

All five confirmed P1 findings are corrected. **Accept v0.5 as Building Evidence Infrastructure / Community Preview**, with the real-world evidence limits above. Corrective [Pages deployment 41428932601](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41428932601) succeeds for security merge `6c75e72a9cb25c71e55bbff3916e232f5651cb2d`. Git comparison confirms every public build input is byte-identical to the 159-file production smoke already recorded. The subsequent audit-publication commit is verified against all actual published files before final handoff, with final CI/Pages links and commit in the PR discussion. No stronger photography, Vision accuracy or field claim is accepted. The security correction changes offline tooling/CI and local launchers only; public runtime/GIS bytes are unchanged. Final report/evidence publication is separate documentation, and its commit is identifiable in Git history and the PR discussion.

## Remaining blockers and prioritized next steps

1. Obtain a small genuinely reusable pilot set for N9/N10/N11/N16/N17/N20 from university-authorized photographers or willing original creators. Establish photographer identity, exact license/version or documented grant, attribution, dates and permission for derivatives before copying public assets. A publicly visible page or a Google view is not a grant. Avoid personal/student/private-area content.
2. Keep originals/private camera metadata outside public trees. Independently confirm building identity/code and rights against exact original bytes; retain uncertainty and hashes. Produce derivatives under `work/`, inspect EXIF/quality/crop/alt/credit, then deliberately register/copy approved public files through PR review. Never use synthetic fixtures as the pilot.
3. Only then generate actual Vision observations with model/version/date/photo ID/uncertainty, compare ambiguous and conflicting cases against independent human ground truth, and measure false matches. Do not turn visual floors into metres or facade recognition into GPS/accepted polygons.
4. Field reviewers must reconcile S1/S2/S6/N19/N4 and verify geometry, measured heights, public entrances, safe pedestrian/accessibility routes and current POI hours. Existing issues #1–#5 remain open; this release supplies none of that missing verification.
5. Test the published SHA with approved real photos on physical midrange Android and actual iOS/Safari: cold load, card/gallery/failure layout, touch/keyboard/assistive technology, FPS/native/GPU memory, long sessions and background recovery. Keep provider/style and dependency-update review active.

The software delivery is not evidence that photography, AI geographical verification or reliable internal navigation is complete.
