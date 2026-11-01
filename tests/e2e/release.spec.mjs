import {test,expect} from '@playwright/test';
import {fixture} from './fixture.mjs';
import {readFile} from 'node:fs/promises';
const published=JSON.parse(await readFile('data/buildings.json','utf8')).buildings;
test('POI search, independent details, shared Pages URL, directions and correction entry',async({page})=>{
 const errors=await fixture(page);await page.goto('/KMUTT-OpenMap/?keep=1');await expect(page.locator('.place')).toHaveCount(35);
 await page.locator('.campus-services summary').click();await page.locator('#poi-search').fill('Manpuku');await expect(page.locator('.poi-result')).toHaveCount(1);await page.locator('.poi-result').click();
 await expect(page.locator('#poi-detail')).toBeVisible();await expect(page.locator('#poi-name')).toHaveText('Manpuku Ramen');await expect(page).toHaveURL(/\/KMUTT-OpenMap\/\?keep=1&poi=osm-node-/);await expect(page.locator('#poi-hours')).toContainText('เกิน 90 วัน');
 await page.reload();await expect(page.locator('#poi-name')).toHaveText('Manpuku Ramen');await expect(page.locator('#poi-provenance')).toContainText('2024-11-13');
 await page.context().route('https://www.google.com/**',route=>route.fulfill({contentType:'text/html',body:'<title>External directions fixture</title>'}));
 const popup=page.waitForEvent('popup');await page.locator('#poi-directions').click();expect((await popup).url()).toContain('travelmode=walking');
 await page.locator('#poi-detail [data-report]').click();await expect(page.locator('#community-dialog')).toBeVisible();await expect(page.locator('#community-target')).toHaveValue('osm-node-8027501272');expect(errors).toEqual([]);
});
test('candidate footprint preview shows explicit height assumptions and never publishes a proposal',async({page})=>{
 const errors=await fixture(page);await page.goto('/?building=N16');await expect(page.locator('#toggle3d')).toBeEnabled();
 await page.locator('.contribution-detail summary').click();await page.locator('#map-propose').click();await expect(page.locator('#candidate-footprint option')).toHaveCount(2);
 await page.locator('#candidate-footprint').selectOption('osm-way-1333533935');await expect(page.locator('#candidate-source')).toContainText('48.0');await expect(page.locator('#candidate-source')).toContainText('สมมติฐาน');
 expect(await page.evaluate(()=>window.__map.getStyle().layers.filter(l=>l.type==='fill-extrusion'&&l.layout?.visibility!=='none').length)).toBe(1);
 await expect.poll(()=>page.evaluate(()=>{const pin=document.querySelector('.preview-pin')?.getBoundingClientRect(),editor=document.getElementById('map-editor-banner').getBoundingClientRect();return !!pin&&(pin.right<=editor.left||pin.left>=editor.right||pin.bottom<=editor.top||pin.top>=editor.bottom);})).toBe(true);
 await page.locator('#confirm-mapping').click();await expect(page.locator('#map-editor-banner')).toBeHidden();
 const draft=await page.evaluate(()=>JSON.parse(localStorage.getItem('kmutt-openmap-proposals-v02'))[0]);expect(draft.candidate_footprint_id).toBe('osm-way-1333533935');
 expect(await page.evaluate(()=>window.__camera.center)).toEqual(published.find(b=>b.id==='N16').coordinates);expect(errors).toEqual([]);
});
test('community review, local save, export, edit invalidation, reload and delete',async({page})=>{
 const errors=await fixture(page);await page.goto('/');await expect(page.locator('.place')).toHaveCount(35);await page.locator('#search').focus();await page.locator('#open-community').click();
 await page.locator('#community-type').selectOption('closed-business');await page.locator('#community-title').fill('Synthetic test report');await page.locator('#community-details').fill('Test only. Do not publish this synthetic report.');await page.locator('#community-source').fill('https://example.org/evidence');
 await expect(page.locator('#community-save')).toBeDisabled();await page.locator('#community-form button[type=submit]').click();await expect(page.locator('#community-preview')).toContainText('UNREVIEWED');await page.locator('#community-save').click();await expect(page.locator('.community-row')).toHaveCount(1);
 const download=page.waitForEvent('download');await page.locator('#community-export').click();expect((await download).suggestedFilename()).toBe('kmutt-community-unreviewed.json');
 await page.locator('#community-title').fill('Changed after review');await expect(page.locator('#community-export')).toBeDisabled();await page.reload();await page.locator('#search').focus();await page.locator('#open-community').click();await expect(page.locator('.community-row')).toContainText('Synthetic test report');
 await page.locator('.community-row').getByRole('button',{name:'แก้ไข'}).click();await expect(page.locator('#community-title')).toHaveValue('Synthetic test report');await page.locator('.community-row').getByRole('button',{name:'ลบ'}).click();await expect(page.locator('.community-row')).toHaveCount(0);expect(errors).toEqual([]);
});
test('map module can recover after an initial asset failure without losing the directory',async({page})=>{
 await fixture(page);let fail=true;await page.route('**/vendor/maplibre-gl/maplibre-gl.mjs*',route=>fail?route.abort():route.fallback());
 await page.goto('/?building=N9');await expect(page.locator('#retry-map')).toBeVisible();await expect(page.locator('.place')).toHaveCount(35);fail=false;await page.locator('#retry-map').click();await expect(page.locator('#toggle3d')).toBeEnabled();await expect(page.locator('#detail-code')).toHaveText('N9');
});
test('quality dashboard and navigation keep candidates separate from verified data',async({page})=>{
 await fixture(page);await page.goto('/?building=N9');await page.locator('.navigation-panel summary').click();await expect(page.locator('#route-plan')).toBeDisabled();await expect(page.locator('#navigation-status')).toContainText('ยังไม่มี');
 await page.locator('#close-detail').click();await page.locator('#search').focus();await page.locator('.quality-panel summary').click();await expect(page.locator('#quality-metrics')).toContainText('73');await expect(page.locator('#quality-metrics')).toContainText('18');await expect(page.locator('#unresolved-buildings button')).toHaveCount(15);
});
test('real vendored module and worker run under CSP at the Pages base path',async({page})=>{
 const errors=await fixture(page,{realRuntime:true});const workers=[];page.on('response',r=>{if(r.url().includes('/vendor/maplibre-gl/maplibre-gl-worker.mjs'))workers.push(r.status());});
 await page.addInitScript(()=>{window.__csp=[];document.addEventListener('securitypolicyviolation',e=>window.__csp.push({directive:e.violatedDirective,uri:e.blockedURI}));});
 await page.goto('/KMUTT-OpenMap/?building=N9');await expect.poll(()=>page.evaluate(()=>performance.getEntriesByName('openmap-map-loaded').length),{timeout:25000}).toBe(1);
 expect(workers).toContain(200);expect(await page.evaluate(()=>window.__csp)).toEqual([]);expect(errors).toEqual([]);await expect(page.locator('.selected-pin')).toBeVisible();
});
test('POI back and forward restore one detail panel and one selected marker',async({page})=>{
 await fixture(page);await page.goto('/?building=N9');await expect(page.locator('#toggle3d')).toBeEnabled();await page.goto('/?poi=kmutt-library');await expect(page.locator('#poi-detail')).toBeVisible();await page.goBack();await expect(page.locator('#detail-code')).toHaveText('N9');await expect(page.locator('#poi-detail')).toBeHidden();await page.goForward();await expect(page.locator('#poi-name')).toContainText('หอสมุด');await expect(page.locator('#detail')).toBeHidden();await expect(page.locator('.selected-pin')).toHaveCount(1);
});

test('a stalled core catalog times out and recovers on explicit retry',async({page})=>{
 await fixture(page);let stalled=true;await page.route('**/data/buildings.json',route=>stalled?new Promise(()=>{}):route.fallback());await page.clock.install();await page.goto('/',{waitUntil:'domcontentloaded'});await page.clock.runFor(12500);await expect(page.locator('#retry-data')).toBeVisible();stalled=false;await page.locator('#retry-data').click();await expect(page.locator('.place')).toHaveCount(35);
});
test('untrusted report text remains literal and clipboard failure leaves a usable share URL',async({page})=>{
 const errors=await fixture(page);await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('Denied'))}}));await page.goto('/KMUTT-OpenMap/?building=N9');await page.locator('#share-building').click();await expect(page.locator('#share-url')).toHaveValue(/\/KMUTT-OpenMap\/\?building=N9/);await page.locator('#detail [data-report]').click();await page.locator('#community-title').fill('<img src=x onerror=alert(1)>');await page.locator('#community-details').fill('<script>window.bad=true</script>');await page.locator('#community-form button[type=submit]').click();await expect(page.locator('#community-preview')).toContainText('<script>');expect(await page.evaluate(()=>window.bad)).toBeUndefined();expect(errors).toEqual([]);
});
