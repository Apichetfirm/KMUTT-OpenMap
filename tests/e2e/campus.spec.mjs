import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const origin='http://127.0.0.1:8080';
const legacy={building_code:'N9',coordinates:[100.49433,13.65439],capture_method:'clicked-map',review_status:'needs-field-verification',created_at:'2026-11-01T00:00:00Z',evidence:'Legacy proposal'};
async function fixture(page,{cdnFailure=false,dataFailure=false}={}) {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin===origin) {
   if(dataFailure&&url.pathname.endsWith('/data/buildings.json'))return route.fulfill({status:503,body:'unavailable'});
   if(url.pathname.startsWith('/KMUTT-OpenMap/'))return route.continue({url:origin+url.pathname.slice('/KMUTT-OpenMap'.length)+url.search});
   return route.continue();
  }
  if(url.hostname==='unpkg.com') {
   if(cdnFailure)return route.abort();
   if(url.pathname.endsWith('.css'))return route.fulfill({contentType:'text/css',body:await readFile('node_modules/maplibre-gl/dist/maplibre-gl.css','utf8')});
   // Instrument the real MapLibre class in the fixture only, without production hooks.
   return route.fulfill({contentType:'application/javascript',body:`export * from '${origin}/node_modules/maplibre-gl/dist/maplibre-gl.mjs';
    import {Map} from '${origin}/node_modules/maplibre-gl/dist/maplibre-gl.mjs';
    const on=Map.prototype.on;Map.prototype.on=function(...a){window.__map=this;return on.apply(this,a)};
    const fly=Map.prototype.flyTo;Map.prototype.flyTo=function(options){window.__camera=options;return fly.call(this,options)};`});
  }
  if(url.hostname==='tiles.openfreemap.org') {
   if(url.pathname.includes('/styles/'))return route.fulfill({json:{version:8,glyphs:'https://tiles.openfreemap.org/test-glyphs/{fontstack}/{range}.pbf',sources:{},layers:[{id:'background',type:'background',paint:{'background-color':url.pathname.endsWith('dark')?'#172b35':'#e4eae5'}}]}});
   if(url.pathname==='/planet')return route.fulfill({json:{tilejson:'3.0.0',tiles:['https://tiles.openfreemap.org/test/{z}/{x}/{y}.pbf'],minzoom:0,maxzoom:14,vector_layers:[{id:'building',fields:{render_height:'Number',render_min_height:'Number'}}]}});
   return route.fulfill({status:204,body:''});
  }
  return route.abort();
 });
 return errors;
}
async function searchSelect(page,q='N9') {
 await page.locator('#search').fill(q);await expect(page.locator('.place').first()).toHaveAttribute('data-code',q==='FIBO'?'N9':q);
 await page.locator('#search').press('Enter');await expect(page.locator('#detail')).toBeVisible();
}
test('directory, shared URLs, keyboard selection and camera target',async({page})=>{
 const errors=await fixture(page);await page.goto('/KMUTT-OpenMap/?keep=1');
 await expect(page).toHaveTitle('KMUTT OpenMap · Explore Bangmod');await expect(page.locator('.place')).toHaveCount(35);
 await expect(page.locator('#toggle3d')).toBeEnabled();await searchSelect(page,'FIBO');
 await expect(page).toHaveURL(/\/KMUTT-OpenMap\/\?keep=1&building=N9/);await expect(page.locator('#detail-name')).toBeFocused();
 expect(await page.evaluate(()=>window.__camera.center)).toEqual([100.49433,13.65439]);
 await page.reload();await expect(page.locator('#detail-code')).toHaveText('N9');
 await page.locator('#close-detail').click();await searchSelect(page,'N16');
 await expect(page.locator('#focus-detail')).toBeDisabled();await expect(page.locator('#detail-height')).toContainText('15');expect(errors).toEqual([]);
});
test('style reloads preserve selection with one extrusion and working height/2D modes',async({page})=>{
 const errors=await fixture(page);await page.goto('/?building=N9');await expect(page.locator('#toggle3d')).toBeEnabled();
 for(let i=0;i<2;i++){
  await page.locator('#theme-toggle').click();await expect(page.locator('#theme-toggle')).toBeEnabled();
  expect(await page.evaluate(()=>window.__map.getStyle().layers.filter(l=>l.type==='fill-extrusion'&&l.layout?.visibility!=='none').length)).toBe(1);
 }
 await page.locator('#height-mode').selectOption('osm');await page.locator('#toggle3d').click();
 expect(await page.evaluate(()=>window.__map.getLayoutProperty('campus-3d','visibility'))).toBe('none');
 await page.locator('#toggle3d').click();await expect(page.locator('.selected-pin')).toHaveCount(1);expect(errors).toEqual([]);
});
test('proposal preview, confirmation, reload, export and deletion preserve official point',async({page})=>{
 const errors=await fixture(page);await page.addInitScript(p=>{if(!localStorage.getItem('seeded')){localStorage.setItem('kmutt-openmap-proposals-v02',JSON.stringify([p]));localStorage.setItem('seeded','1');}},legacy);
 await page.goto('/?building=N9');await expect(page.locator('#toggle3d')).toBeEnabled();
 await page.locator('.contribution-detail summary').click();await page.locator('#map-propose').click();
 await page.locator('#proposal-lat').fill('13.6541');await page.locator('#proposal-lng').fill('100.4941');await page.locator('#preview-coordinates').click();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('kmutt-openmap-proposals-v02'))[0].coordinates)).toEqual(legacy.coordinates);
 await page.locator('#proposal-evidence').fill('Observed sign; independent review requested');await page.locator('#confirm-mapping').click();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('kmutt-openmap-proposals-v02'))[0].coordinates)).toEqual([100.4941,13.6541]);
 expect(await page.evaluate(()=>window.__camera.center)).toEqual(legacy.coordinates);
 await page.reload();await page.locator('.contribution-detail summary').click();await expect(page.locator('#draft-info')).toContainText('13.6541');
 await page.locator('#close-detail').click();await page.locator('#search').focus();
 const download=page.waitForEvent('download');await page.locator('#export-drafts').click();expect((await download).suggestedFilename()).toContain('unverified');
 await searchSelect(page);await page.locator('.contribution-detail summary').click();await page.locator('#map-delete').click();await expect(page.locator('#map-delete')).toBeHidden();expect(errors).toEqual([]);
});
test('catalog survives CDN/storage failures, invalid URLs and POI empty filters',async({page})=>{
 const errors=await fixture(page,{cdnFailure:true});await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError')}}));
 await page.goto('/?building=UNKNOWN');await expect(page.locator('.place')).toHaveCount(35);await expect(page.locator('#retry-map')).toBeVisible();
 await searchSelect(page);await expect(page.locator('#map-propose')).toBeDisabled();await expect(page.locator('#directions')).toBeEnabled();
 await page.locator('#close-detail').click();await page.locator('#search').focus();await page.locator('.campus-services summary').click();await expect(page.locator('.poi-result')).toHaveCount(1);
 await page.locator('#poi-category').selectOption('restaurant');await expect(page.locator('.poi-result')).toHaveCount(0);await expect(page.locator('#poi-empty')).toBeVisible();
 await page.locator('#poi-category').selectOption('all');await page.locator('#poi-open').check();await expect(page.locator('.poi-result')).toHaveCount(0);expect(errors).toEqual([]);
});
test('data failure is actionable and mobile details/search remain reachable',async({page})=>{
 const errors=await fixture(page,{dataFailure:true});await page.goto('/');await expect(page.locator('#retry-data')).toBeVisible();await expect(page.locator('#empty')).toContainText('โหลดรายชื่อไม่สำเร็จ');expect(errors).toEqual([]);
});
test('reduced motion, responsive panels and denied geolocation',async({page,isMobile})=>{
 const errors=await fixture(page);await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>navigator.geolocation.getCurrentPosition=(_ok,fail)=>fail({code:1}));
 await page.goto('/');await expect(page.locator('#toggle3d')).toBeEnabled();await searchSelect(page);
 expect(await page.evaluate(()=>window.__camera.duration)).toBe(0);
 if(isMobile){
  const detail=await page.locator('#detail').boundingBox(),sidebar=await page.locator('.sidebar').boundingBox();expect(detail.y+detail.height).toBeLessThan(sidebar.y);
  await expect.poll(async()=>{const pin=await page.locator('.selected-pin').boundingBox();return pin&&pin.y>=60&&pin.y+pin.height<detail.y;}).toBe(true);
  await page.locator('#search').focus();await expect(page.locator('#mobile-drawer')).toHaveAttribute('aria-expanded','true');
 }
 if(!isMobile)await page.locator('#close-detail').click();else await expect(page.locator('#detail')).toBeHidden();await page.locator('#locate').click();await expect(page.locator('#toast')).toContainText('ไม่ได้รับอนุญาต');
 await page.setViewportSize({width:844,height:390});await searchSelect(page,'N10');
 const search=await page.locator('#search').boundingBox();expect(search.y).toBeGreaterThanOrEqual(70);expect(search.y+search.height).toBeLessThan(355);
 const tools=await page.locator('.map-tools').boundingBox(),detail=await page.locator('#detail').boundingBox();expect(tools.x+tools.width).toBeLessThanOrEqual(detail.x);expect(errors).toEqual([]);
});
