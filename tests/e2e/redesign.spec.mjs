import {test,expect} from '@playwright/test';
import {fixture} from './fixture.mjs';

test('short landscape keeps attribution, map tools and primary actions clear',async({page})=>{
 await fixture(page);await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:667,height:375});await page.goto('/?building=N16');
 await expect(page.locator('#toggle3d')).toBeEnabled();
 for(const selector of ['#directions','#share-building','#reset-view','#locate','.maplibregl-ctrl-attrib a']){
  const target=page.locator(selector).first();await expect(target).toBeInViewport({ratio:1});
  expect(await target.evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));})).toBe(true);
 }
 for(const code of ['N9','N10','N11','N17','N20']){
  await page.locator('#search').fill(code);await page.locator('#search').press('Enter');
  await expect(page.locator('#detail-code')).toHaveText(code);
  await expect.poll(()=>page.locator('#detail').evaluate(e=>({top:e.scrollTop,left:e.scrollLeft})),{message:`${code}: new card starts at both scroll origins`}).toEqual({top:0,left:0});
  expect(await page.locator('#detail').evaluate(e=>e.scrollWidth<=e.clientWidth),`${code}: card has no horizontal overflow`).toBe(true);
  for(const selector of ['#directions','#share-building']){
   const geometry=await page.locator(selector).evaluate(e=>{const p=e.closest('.detail'),r=e.getBoundingClientRect(),box=p.getBoundingClientRect();return {target:{x:r.x,y:r.y,width:r.width,height:r.height},panel:{x:box.x,y:box.y,width:box.width,height:box.height},scrollTop:p.scrollTop,scrollLeft:p.scrollLeft,scrollWidth:p.scrollWidth,clientWidth:p.clientWidth};});
   await expect(page.locator(selector),`${code} ${selector} must remain fully visible; ${JSON.stringify(geometry)}`).toBeInViewport({ratio:1});
   await page.locator(selector).click({trial:true});
  }
 }
});

test('all 35 detail cards retain canonical identities, uncertainty and safe actions',async({page})=>{
 test.setTimeout(120000);
 const {readFile}=await import('node:fs/promises');const rows=JSON.parse(await readFile('data/buildings.json','utf8')).buildings;
 const errors=await fixture(page);await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:900});await page.goto('/');
 await expect(page.locator('#toggle3d')).toBeEnabled();expect(rows).toHaveLength(35);
 const actual=await page.evaluate(rows=>rows.map(b=>{
  const input=document.getElementById('search');input.focus();input.value=b.id;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  const text=id=>document.getElementById(id).textContent;
  return {id:text('detail-code'),name:text('detail-name'),english:text('detail-en'),location:text('detail-location'),height:text('detail-height'),
   source:document.querySelector('#detail-provenance a').href,illustration:document.querySelector('.photo-unavailable')?.textContent,
   directionsDisabled:document.getElementById('directions').disabled,street:document.getElementById('street-view').getAttribute('href'),
   streetDisabled:document.getElementById('street-view').getAttribute('aria-disabled'),routeDisabled:document.getElementById('route-plan').disabled};
 }),rows);
 for(const [i,b] of rows.entries()){
  const card=actual[i];expect(card.id).toBe(b.id);expect(card.name).toBe(b.name_th);expect(card.english).toBe(b.name_en);expect(card.source).toBe(b.name_source);
  expect(card.location).toContain(b.coordinates?'โดยประมาณ':'ยังไม่มีพิกัด');expect(card.illustration).toContain('ไม่ใช่รูปทรงของอาคารนี้');
  expect(card.directionsDisabled).toBe(!b.coordinates);if(b.coordinates)expect(card.street).toContain('map_action=pano');else expect(card.streetDisabled).toBe('true');
  if(b.floor_count)expect(card.height).toContain(String(b.floor_count));expect(card.routeDisabled).toBe(true);
 }
 expect(errors).toEqual([]);
});

test('daylight UI, GIS disclosure, theme and home camera survive style changes',async({page})=>{
 const errors=await fixture(page);await page.goto('/KMUTT-OpenMap/');await expect(page.locator('#toggle3d')).toBeEnabled();
 await expect(page.locator('.place').first()).toHaveAttribute('data-code','N9');
 await expect(page.locator('#height-mode')).toBeHidden();await page.locator('.data-gis > summary').click();await expect(page.locator('#height-mode')).toBeVisible();
 await page.locator('#height-mode').selectOption('osm');await page.locator('#theme-toggle').click();await expect(page.locator('#theme-toggle')).toBeEnabled();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 expect(await page.evaluate(()=>window.__map.getPaintProperty('campus-3d','fill-extrusion-opacity'))).toBe(1);
 await page.locator('#theme-toggle').click();await expect(page.locator('#theme-toggle')).toBeEnabled();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#reset-view').click();
 expect(await page.evaluate(()=>({center:window.__camera.center,zoom:window.__camera.zoom,pitch:window.__camera.pitch,bearing:window.__camera.bearing,duration:window.__camera.duration}))).toEqual({center:[100.4937,13.652],zoom:16.85,pitch:54,bearing:-24,duration:0});
 expect(errors).toEqual([]);
});

test('responsive sheet slots, keyboard snaps, pointer drag and selection keep map usable',async({page})=>{
 const errors=await fixture(page);await page.emulateMedia({reducedMotion:'reduce'});
 for(const viewport of [{width:360,height:640},{width:390,height:844},{width:667,height:375},{width:768,height:1024},{width:1440,height:900}]){
  await page.setViewportSize(viewport);await page.goto('/?building=N10');await expect(page.locator('#toggle3d')).toBeEnabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('.brand-subtitle')).toBeVisible();await expect(page.locator('.brand-subtitle')).toContainText('ไม่เป็นทางการ');
  await page.locator('#theme-toggle').click({trial:true});await page.locator('#locate').click({trial:true});
  await expect(page.locator('.selected-pin')).toBeVisible();
  if(viewport.width<=390){
   await expect(page.locator('.directory-body')).toBeHidden();const handle=page.locator('#detail .sheet-resize');
   await handle.focus();await handle.press('End');await expect(page.locator('#detail')).toHaveAttribute('data-snap','full');
   await expect(handle).toHaveAttribute('aria-expanded','true');await expect(page.locator('#map')).toHaveAttribute('inert','');await expect(page.locator('.map-tools')).toHaveAttribute('inert','');
   await handle.press('Home');await expect(page.locator('#detail')).toHaveAttribute('data-snap','peek');await expect(page.locator('#map')).not.toHaveAttribute('inert','');
   const box=await handle.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y-60,{steps:5});await page.mouse.up();
   await expect(page.locator('#detail')).toHaveAttribute('data-snap','half');
   await page.locator('#search').focus();await expect(page.locator('#detail')).toBeHidden();await expect(page.locator('.directory-body')).toBeVisible();
   await page.locator('#mobile-drawer').press('End');await expect(page.locator('.sidebar')).toHaveAttribute('data-snap','full');
   await page.locator('#search').fill('N16');await expect(page.locator('#map')).not.toHaveAttribute('inert','');await page.locator('#search').press('Enter');await expect(page.locator('#detail-code')).toHaveText('N16');await expect(page.locator('.directory-body')).toBeHidden();
  }
 }
 expect(errors).toEqual([]);
});

test('unknown geometry and media stay honest through selection and candidate preview',async({page})=>{
 const errors=await fixture(page);await page.goto('/?building=N9');await expect(page.locator('#toggle3d')).toBeEnabled();
 await expect(page.locator('.photo-unavailable')).toContainText('ไม่ใช่รูปทรงของอาคารนี้');await expect(page.locator('.photo-unavailable svg')).toHaveAttribute('aria-hidden','true');
 expect(await page.evaluate(async()=>(await window.__map.getSource('campus-footprints').getData()).features.length)).toBe(0);
 await page.locator('.contribution-detail summary').click();await page.locator('#map-propose').click();await page.locator('#candidate-footprint').selectOption('osm-way-346450376');
 expect(await page.evaluate(()=>window.__map.getPaintProperty('campus-candidate-3d','fill-extrusion-opacity'))).toBe(0.42);
 expect(await page.evaluate(async()=>(await window.__map.getSource('campus-footprints').getData()).features.length)).toBe(0);
 await page.locator('#cancel-mapping').click();await expect(page.locator('.selected-pin')).toHaveCount(1);expect(errors).toEqual([]);
});
