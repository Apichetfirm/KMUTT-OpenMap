# KMUTT OpenMap 🗺️

> Open-source, community-driven 3D campus map **prototype** for KMUTT Bangmod — built by students, for everyone.

**Project initiator:** Firm Impulse · **FIBO FRAB11** · **Project:** KMUTT OpenMap · **Collaboration:** open to the KMUTT community.

**GitHub account:** `Apichetfirm` (current account handle; distinct from the public display name **Firm Impulse**).

**สถานะ:** Open-source student preview — building locations/heights are NOT field-verified; not an official KMUTT service.

## v0.2 — ปรับความสูง + ระบบจับคู่รหัสอาคาร (2026-11-01)

- ป้องกันการวาดอาคาร extrusion ซ้อนกับเลเยอร์ 3D ที่อาจติดมาใน OpenFreeMap Liberty style
- มี **2 โหมดความสูงสำหรับแสดงภาพเท่านั้น**: ลดค่าความสูงมากผิดปกติให้ไม่เกิน 55 เมตร และความสูงดิบจาก OSM; **ไม่มีโหมดไหนเป็นข้อมูลรังวัด**
- แผนที่ความสูงที่ยังไม่ผ่านการยืนยันจะไม่ถูกเขียนเป็นค่าจริงลงฐานข้อมูล
- จับคู่รหัสอาคารกับพิกัดบนแผนที่ผ่านปุ่ม **＋ เสนอพิกัดบนแผนที่** (เก็บใน Local Storage เท่านั้น)
- ส่งออกไฟล์ `kmutt-openmap-unverified-proposals.json` เพื่อส่งตรวจและทำ Pull Request
- เพิ่มพิกัดภายนอกอ้างอิงเป็น **7 อาคาร** (S3, N5, N9, N10, N11, N17, N20) ทุกจุดยังไม่ใช่ทางเข้าและยังไม่ได้สำรวจยืนยัน
- เพิ่มจำนวนชั้น LX/N16 เป็น **15 ชั้นตามหน้าโครงการ LX ของ มจธ.** แต่ยังไม่มีข้อมูลความสูงเป็นเมตร จึงยังไม่บังคับการแสดงผล 3D
- รายการครบ 35 รหัสและสถานะใน `data/mapping-status.csv`; 28 อาคารยังไม่มีพิกัดอ้างอิงที่เพียงพอ
- Attribution อัปเดตเป็น **Initiated by Firm Impulse · FIBO FRAB11**

## มีอะไรแล้ว

- 3D building extrusions บนแผนที่ OpenFreeMap/OSM (ความสูงบางหลังเป็นค่า fallback เพื่อแสดงภาพ ไม่ใช่ความสูงจริง)
- 35 รายการอาคารรหัส S1–S15 และ N1–N20 จาก [KMUTT Official Campus Directory](https://www.kmutt.ac.th/about-kmutt/campus/) (เว็บไซต์ระบุ 39 อาคารทั้งหมด แต่ไม่แจกแจงครบ 39 ในรายชื่อรหัสนี้)
- ค้นหาไทย/อังกฤษ/ชื่อย่อ/รหัส (FIBO → N9, หอสมุด → N10, LX → N16)
- โหมด 2D/3D, กลางวัน/กลางคืน, ตำแหน่งปัจจุบัน (ต้องขอสิทธิ์จากผู้ใช้), รองรับมือถือ
- พิกัดอ้างอิงภายนอกเฉพาะ **7 อาคาร** (S3, N5, N9, N10, N11, N17, N20) — ไม่มีพิกัดที่อ้างได้จะไม่ปักหมุด
- กดเปิด Google Maps เพื่อขอเส้นทางเดินจากปลายทางที่มีพิกัดได้ แต่ไม่ได้รับรองว่าเป็นเส้นทางในมหาวิทยาลัยที่ผ่านการตรวจสอบ
- Node built-in tests: 11 tests

## เริ่มใช้งานในเครื่อง

Windows: ดับเบิลคลิก `START_WINDOWS.bat` ได้เลย (ต้องติดตั้ง Python 3)

ต้องใช้ Python 3 และเบราว์เซอร์ที่รองรับ WebGL2 พร้อมอินเทอร์เน็ต (โหลด MapLibre JS และ OpenFreeMap tiles)

```bash
cd KMUTT-OpenMap
python -m http.server 8080
# เปิด http://localhost:8080/
```

การเปิด `index.html` ด้วย file:// โดยตรงจะไม่โหลด JSON เพราะข้อจำกัดเบราว์เซอร์

รันการตรวจสอบด้วย Node >=18:

```bash
npm test
npm run check
```

ไม่มีการติดตั้ง NPM dependencies สำหรับตัวเว็บนี้ เป็น static web ที่นำขึ้น GitHub Pages หรือ Cloudflare Pages ได้ (ตั้ง publish directory เป็น repository root)

## โครงสร้าง

```text
index.html                 หน้าเว็บและ semantic markup
src/main.mjs               MapLibre integration, UI, markers, search interactions
src/search.mjs             Search ranking (testable pure functions)
src/mapping.mjs            Validate/save/export location proposals
src/heights.mjs            3D visualization-only height presets
src/styles.css             Responsive UI
favicon.svg                Logo for the prototype
data/buildings.json        35 official code/name pairs + 7 sourced approximate geocodes
data/generate_catalog.py   Reproducible directory seed generator
data/buildings-geocoded.geojson  7 sourced points, no invented shapes
data/mapping-status.csv     Coverage matrix to guide field validation
data/export_geojson.py       Regenerate point GeoJSON
data/walkways.geojson      Empty intentionally — no field-verified paths yet
docs/SPEC.md               Product specification / scope
docs/DATA-STATUS.md       Provenance, conflicts, limitations
docs/FIELD-SURVEY.md      Survey and QA process before routing
docs/ROADMAP.md           Release gates and beta plan
tests/catalog.test.mjs     Smoke/data/search tests
tests/mapping.test.mjs     Visual height and draft proposal tests
docs/HEIGHT-QA.md          What to verify to fix the visual height problem
docs/PUBLISH-GITHUB.md     Recommended publishing and security steps
.github/                    CI and issue templates
```

## สถานะความถูกต้องของข้อมูล

| Data | Status |
|---|---|
| Building codes, Thai/English names | Official KMUTT page (35 records) |
| Geocoordinates | 7 approx., OSM/third-party centroids, NOT on-site verified |
| Building heights | N16 floor count from KMUTT LX site; 0 verified heights in meters; both rendering modes are visualizations |
| Entrances | Unknown for all |
| Pedestrian paths | **0 verified**; app does not claim internal navigation |
| Shop hours and community updates | Not implemented |

ชื่อและตำแหน่งเป็นคนละระดับหลักฐานกัน โปรดอ่าน [DATA-STATUS.md](docs/DATA-STATUS.md)

## Contributing

ยินดีรับการแก้ชื่ออาคาร พิกัด ทางเข้าจริง ข้อมูล accessibility และข้อมูลอาคารที่ยังขาด ผ่าน Pull Request/Issue พร้อมแหล่งอ้างอิง **อย่า**อัปโหลดข้อมูลส่วนบุคคล ภาพที่ไม่ได้รับอนุญาต หรือข้อมูลพื้นที่ควบคุม อ่าน [CONTRIBUTING.md](CONTRIBUTING.md) ก่อน

## License & attribution

- Source code written for this repository: [MIT](LICENSE)
- Public geodata and map tiles have **separate licenses/conditions**; see [DATA-LICENSES.md](DATA-LICENSES.md)
- © OpenStreetMap contributors (ODbL), rendered with MapLibre GL JS and OpenFreeMap.
- KMUTT's official campus directory was used as a *reference for building names/codes*, not a grant to reuse graphics, photographs, logos or full site content.
- This is a **community student project** and is not represented as an official KMUTT product.

## Deployment

This repository is published by Firm Impulse · FIBO FRAB11. For GitHub Pages, open Settings → Pages and configure deployment from `main` / root or use the Pages workflow if enabled.
