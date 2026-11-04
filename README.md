# KMUTT OpenMap — แผนที่ 3D มจธ. บางมด

**แผนที่มหาวิทยาลัยแบบโอเพนซอร์สที่นักศึกษาทำขึ้น เพื่อช่วยค้นหาอาคารและสถานที่ต่าง ๆ ภายใน มจธ. บางมด**

[**เปิดแผนที่**](https://apichetfirm.github.io/KMUTT-OpenMap/) · [วิธีร่วมแก้ไขข้อมูล](docs/COMMUNITY-GUIDE.md) · [รายละเอียดทางเทคนิค (English)](#english-technical-details)

> **โปรเจกต์ของนักศึกษา ไม่ใช่เว็บไซต์หรือบริการอย่างเป็นทางการของ มจธ.** ข้อมูลพิกัด อาคาร ทางเข้า และเส้นทางจำนวนมากยังไม่ได้สำรวจยืนยันจากสถานที่จริง จึงไม่ควรใช้แทนแผนที่หรือคำแนะนำด้านความปลอดภัยของมหาวิทยาลัย

## ใช้ทำอะไรได้บ้าง

- **ค้นหาอาคาร:** ค้นจากชื่อไทย/อังกฤษ รหัสอาคาร หรือคำใกล้เคียง พร้อมเปิดดูข้อมูลที่มีแหล่งอ้างอิง
- **สำรวจสถานที่ใกล้เคียง:** ดูจุดบริการและสถานที่ต่าง ๆ ที่นำเข้าจาก OpenStreetMap โดยอาจมีข้อมูลเก่าหรือคลาดเคลื่อน
- **แชร์ตำแหน่ง:** ส่งลิงก์สถานที่ที่พบให้คนอื่นดูต่อได้
- **ช่วยปรับปรุงแผนที่:** ส่งข้อมูลที่ควรแก้ไขหรือเสนอจุดใหม่เพื่อนำไปตรวจสอบก่อนเผยแพร่

### สถานะข้อมูลที่ควรรู้

| รายการ | สถานะ |
| --- | --- |
| ข้อมูลอาคารในระบบ | 35 อาคาร |
| จุดบริการ/สถานที่ที่รวบรวมจาก OSM | 73 รายการ (ยังไม่ยืนยันภาคสนาม) |
| พิกัดอาคาร | มีตำแหน่งอ้างอิงโดยประมาณ 20 อาคาร; อีก 15 อาคารยังไม่มีพิกัด |
| เส้นทางเดินภายในมหาวิทยาลัย | **ยังไม่เปิดใช้งาน** เพราะไม่มีโครงข่ายและทางเข้าอาคารที่ผ่านการตรวจสอบ |

ตัวเลขเป็นสถานะข้อมูลใน Repository ไม่ใช่การรับรองตำแหน่งจริง ดูข้อมูลล่าสุดใน [รายงานความครอบคลุม](docs/DATA-COVERAGE.md)

## อยากช่วยให้แผนที่แม่นขึ้น?

ไม่จำเป็นต้องเขียนโค้ดก็ช่วยได้ เช่น แจ้งชื่ออาคารผิด พิกัดคลาดเคลื่อน สถานที่ปิด หรือทางเดินที่ไม่สามารถผ่านได้

1. [เข้าแผนที่](https://apichetfirm.github.io/KMUTT-OpenMap/) แล้วเลือกอาคารหรือสถานที่
2. เลือกปุ่มแจ้งแก้ไข/เสนอข้อมูล กรอกรายละเอียดและแหล่งอ้างอิงที่ตรวจสอบได้
3. ตรวจทานข้อมูลแล้วส่งเป็น GitHub Issue ตามขั้นตอนใน [คู่มือสำหรับชุมชน](docs/COMMUNITY-GUIDE.md) (ไม่มีการส่งรายงานขึ้นระบบโดยอัตโนมัติ)

สำหรับคนอยากช่วยพัฒนาโค้ด: อ่าน [CONTRIBUTING.md](CONTRIBUTING.md) และรายละเอียดด้านล่าง

## ร่วมสนับสนุนโครงการ

หากโครงการมีประโยชน์ การช่วยตรวจข้อมูลหรือส่ง Pull Request เป็นประโยชน์มากอยู่แล้ว หากต้องการสนับสนุนค่าใช้จ่ายในการพัฒนาเพิ่มเติม ดู [ช่องทางสนับสนุนของผู้พัฒนา](https://github.com/Apichetfirm/Apichetfirm/blob/main/SUPPORT.md)

**หมายเหตุ:** ช่องทางรับเงิน PayPal ยังอยู่ระหว่างตรวจสอบและยังไม่มีลิงก์รับเงินที่ยืนยันแล้ว การสนับสนุนเป็นความสมัครใจ และไม่ได้เป็นการบริจาคให้มหาวิทยาลัย

---

## English — technical details

Open-source, community-driven 3D campus map for KMUTT Bangmod.

**Initiated by Firm Impulse · FIBO FRAB11**

This is a student community project, **not an official KMUTT service**. Original application code is MIT licensed; imported geodata has separate licenses.

## v0.5 community preview

Independent review findings, corrected tests and release status: [v0.5 independent release report](docs/V05-INDEPENDENT-RELEASE-REPORT.md). The [v0.4 report](docs/V04-INDEPENDENT-RELEASE-REPORT.md) remains historical evidence.

Search → inspect → find services → get supported directions → share. PR #14 was independently reviewed, corrected and merged as the v0.5 building-evidence infrastructure community preview. This is not a verified campus navigation service.

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
python -m http.server 8080 --bind 127.0.0.1
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

Final v0.5 candidate CI passes **108/108 browser checks**, including real WebGL2 in all four projects, **55 Node tests and 4 Python image-tool tests**. Chromium sandboxing is enabled; CI uses Ubuntu 22.04 because the downloaded browser sandbox is blocked by the Ubuntu 24.04 AppArmor host policy. On a compatible Linux host, the CI rendering setup is reproducible with `CI=1 LIBGL_ALWAYS_SOFTWARE=1 MOZ_WEBRENDER=1 xvfb-run --auto-servernum npm run test:e2e` after installing browser dependencies. This does not substitute for physical-device tests.

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

Review upstream name/version changes and every derived diff. Geodata: © OpenStreetMap contributors, ODbL; see [DATA-LICENSES.md](DATA-LICENSES.md). No KMUTNB source code, models, photos or protected university map images are reused. The public main site is https://apichetfirm.github.io/KMUTT-OpenMap/. The independent report records the accepted application SHA and deployed byte verification.

## v0.5 building evidence infrastructure

[Implementation handoff](docs/V05-IMPLEMENTATION-HANDOFF.md): reusable visual building cards, official Street View search links with explicit unknown coverage, reviewed media metadata for every code, offline image optimization and evidence matching, and a local-only evidence review/export tool. No building photo has established publication rights yet; the app shows an honest unavailable state. No runtime AI or automatically accepted GIS associations. `npm run validate-media` verifies approved image files; private analysis and `/admin/` are excluded from production builds.

The independent v0.5 review fixes private-output directory-link bypasses, optimizer sidecar placement, malformed reviewer imports the offline Pillow dependency and local development-server exposure. Software infrastructure is complete within this release scope; genuine licensed photography, actual Vision observations, field verification and physical-device validation remain incomplete. See the release report for production verification and the prioritized photography plan.

Offline image tools require Python 3.11 or newer (CI uses 3.14), patched Pillow 13.0.0 and the strict Python dependency audit. The v0.5 report records the late audit finding and corrective follow-up #15; Node advisory checks alone do not cover Python.
