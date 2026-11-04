/** Actual Pages smoke test. No map, catalog, media, or provider fixtures are used. */
import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const base=new URL(process.env.OPENMAP_PRODUCTION_URL||'https://apichetfirm.github.io/KMUTT-OpenMap/');
assert.ok(base.href==='https://apichetfirm.github.io/KMUTT-OpenMap/'||base.origin==='http://127.0.0.1:8080','Unexpected smoke target');
const root=resolve(process.env.OPENMAP_SOURCE_ROOT||'.'),out=resolve(process.env.OPENMAP_SMOKE_EVIDENCE||'work/production-smoke');
const audit=process.env.OPENMAP_SMOKE_MODE==='audit',expectedCommit=process.env.OPENMAP_PRODUCTION_COMMIT||null;
await mkdir(out,{recursive:true});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const paths=['index.html','favicon.svg',...(await readdir(root+'/src')).map(p=>'src/'+p),
 ...(await readdir(root+'/data',{withFileTypes:true})).filter(p=>p.isFile()&&/\.(json|geojson)$/.test(p.name)).map(p=>'data/'+p.name),
 'vendor/maplibre-gl/maplibre-gl.mjs','vendor/maplibre-gl/maplibre-gl-worker.mjs','vendor/maplibre-gl/maplibre-gl.css'];
for(const p of ['docs/FB-LAUNCH-COPY-TH.md','docs/PRELAUNCH-COMPLETE-RELEASE-REPORT.md']){try{await readFile(root+'/'+p);paths.push(p);}catch(e){if(e.code!=='ENOENT')throw e;}}
const expected=new Map();for(const p of paths)expected.set(p,hash(await readFile(root+'/'+p)));
const report={url:base.href,mode:audit?'baseline-audit':'release-smoke',expected_commit:expectedCommit,captured_at_utc:new Date().toISOString(),checks:[],asset_sha256:{},cameras:[],errors:[],console_errors:[],warnings:[],csp_violations:[],instrumentation:'The original production main module hash is verified, then one observational window.__map reference is added for camera and recovery inspection; no map/data/provider fixtures.'};
const check=async(name,fn)=>{console.log('SMOKE CHECK '+name);try{await fn();report.checks.push({name,result:'passed'});console.log('SMOKE PASS '+name);}catch(e){report.checks.push({name,result:'failed',message:e.message});throw e;}};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let browser,context,page;
try{
 await check('published assets match expected source',async()=>{
  for(let attempt=1;attempt<=10;attempt++){
   const outcomes=await Promise.all(paths.map(async p=>{try{const url=new URL(p,base);if(expectedCommit)url.searchParams.set('release',expectedCommit);const r=await fetch(url,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)});assert.equal(r.status,200,p);const actual=hash(Buffer.from(await r.arrayBuffer()));return {path:p,sha256:actual,match:actual===expected.get(p)};}catch(e){return {path:p,error:e.message,match:false};}}));
   report.asset_sha256=Object.fromEntries(outcomes.map(r=>[r.path,r]));
   if(outcomes.every(r=>r.match))return;
   if(attempt===10)throw Error('Published asset mismatch: '+outcomes.filter(r=>!r.match).map(r=>r.path+': '+(r.error||r.sha256)).join(', '));
   await wait(4000);
  }
 });
 browser=await chromium.launch({executablePath:process.env.OPENMAP_CHROMIUM||undefined,headless:true,chromiumSandbox:true,
  ...(process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}}:{}),args:['--enable-unsafe-swiftshader']});
 report.browser=await browser.version();
 context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce',extraHTTPHeaders:{'Cache-Control':'no-cache'}});
 page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.console_errors.push(m.text());if(m.type()==='warning')report.warnings.push(m.text());});
 await page.addInitScript(()=>{window.__externalRequests=[];const nativeOpen=window.open;window.open=function(...args){window.__externalRequests.push(String(args[0]));return nativeOpen.apply(this,args);};window.__csp=[];document.addEventListener('securitypolicyviolation',e=>window.__csp.push({directive:e.violatedDirective,url:e.blockedURI}));
  Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(Error('QA clipboard unavailable: exercise real app fallback'))},configurable:true});});
 // Observational hook only. Verify the unmodified response before exposing its map object.
 await page.route('**/src/main.mjs',async route=>{const r=await route.fetch(),body=await r.text();assert.equal(hash(body),expected.get('src/main.mjs'),'Actual browser module differs from source');await route.fulfill({response:r,body:body.replace('state.map=map;','state.map=map;window.__map=map;')});});
 const ready=()=>page.waitForFunction(()=>performance.getEntriesByName('openmap-map-loaded').length&&window.__map?.isStyleLoaded(),null,{timeout:60000});
 const select=async code=>{await page.locator('#search').fill(code);await page.locator('#search').press('Enter');await page.waitForFunction(c=>document.getElementById('detail-code').textContent===c,code);};
 const shot=async name=>{await wait(800);await page.screenshot({path:out+'/'+name+'.png'});report.cameras.push({file:name+'.png',viewport:page.viewportSize(),...await page.evaluate(()=>{const m=window.__map;return {center:m.getCenter().toArray(),zoom:m.getZoom(),pitch:m.getPitch(),bearing:m.getBearing(),padding:m.getPadding(),selected_building:document.getElementById('detail-code').textContent||null};})});};
 await check('homepage and actual MapLibre WebGL scene',async()=>{await page.goto(base.href,{waitUntil:'domcontentloaded'});assert.equal(await page.title(),'KMUTT OpenMap · Explore Bangmod');await ready();assert.equal(await page.locator('.place').count(),35);assert.equal(await page.locator('canvas').count(),1);assert.ok(await page.evaluate(()=>!!document.createElement('canvas').getContext('webgl2')));});
 await shot(audit?'baseline-campus-overview':'production-campus-overview');
 const rows=JSON.parse(await readFile(root+'/data/buildings.json','utf8')).buildings;report.catalog_count=rows.length;
 await check(audit?'canonical priority building identities':'all 35 canonical building identities and uncertainty',async()=>{
  const chosen=audit?rows.filter(b=>['N9','N10','N16','N17'].includes(b.id)):rows;
  const observed=await page.evaluate(chosen=>chosen.map(b=>{const input=document.getElementById('search');input.focus();input.value=b.id;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return {id:document.getElementById('detail-code').textContent,name:document.getElementById('detail-name').textContent,english:document.getElementById('detail-en').textContent,location:document.getElementById('detail-location').textContent,directionsEnabled:!document.getElementById('directions').disabled};}),chosen);
  for(const [i,b] of chosen.entries()){const actual=observed[i];assert.equal(actual.id,b.id);assert.equal(actual.name,b.name_th);assert.equal(actual.english,b.name_en);assert.equal(actual.directionsEnabled,!!b.coordinates);assert.match(actual.location,b.coordinates?/โดยประมาณ/:/ยังไม่มีพิกัด/);}

 });
 await select('N16');await shot(audit?'baseline-building-n16':'production-building-n16');
 if(!audit){
  await check('2D/3D switching',async()=>{await page.locator('#toggle3d').click();await page.waitForFunction(()=>window.__map.getPitch()===0);assert.equal(await page.evaluate(()=>window.__map.getLayoutProperty('campus-3d','visibility')),'none');await page.locator('#toggle3d').click();await page.waitForFunction(()=>window.__map.getPitch()>0);});
  await check('dark/daylight theme and selection',async()=>{for(const theme of ['dark','light']){await page.locator('#theme-toggle').click();await page.waitForFunction(()=>!document.getElementById('theme-toggle').disabled);assert.equal(await page.locator('html').getAttribute('data-theme'),theme);assert.equal(await page.locator('#detail-code').textContent(),'N16');}});
  await check('Street View remains an approximate-coordinate search',async()=>{await select('N9');assert.match(await page.locator('#street-view').getAttribute('href'),/map_action=pano/);assert.match(await page.locator('#building-visual').textContent(),/ยังไม่ยืนยัน/);const popupPromise=page.waitForEvent('popup');await page.locator('#street-view').click();await (await popupPromise).close();});
  await check('external Google Maps destination',async()=>{const popupPromise=page.waitForEvent('popup');await page.locator('#directions').click();const popup=await popupPromise;const url=new URL(await page.evaluate(()=>window.__externalRequests.at(-1)));assert.ok(/(^|\.)google\.com$/.test(url.hostname));assert.equal(url.pathname,'/maps/dir/');assert.equal(url.searchParams.get('travelmode'),'walking');const b=rows.find(b=>b.id==='N9');assert.equal(url.searchParams.get('destination'),`${b.coordinates[1]},${b.coordinates[0]}`);await popup.close();});
  await check('sharing fallback preserves production URL',async()=>{await page.locator('#share-building').click();await page.locator('#share-url').waitFor({state:'visible'});const url=new URL(await page.locator('#share-url').inputValue());assert.equal(url.origin,base.origin);assert.equal(url.searchParams.get('building'),'N9');});
  await check('community report entry uses selected canonical building',async()=>{await page.locator('#detail [data-report]').click();await page.locator('#community-dialog').waitFor({state:'visible'});assert.equal(await page.locator('#community-target').inputValue(),'N9');await page.locator('#close-community').click();});
  await check('internal routing and accepted geography remain guarded',async()=>{await page.locator('.navigation-panel').evaluate(el=>el.open=true);assert.ok(await page.locator('#route-plan').isDisabled());assert.equal((await page.evaluate(()=>window.__map.getSource('campus-footprints').getData())).features.length,0);});
 }
 await check('required responsive viewports',async()=>{
  for(const viewport of [{width:360,height:640},{width:390,height:844},{width:667,height:375},{width:768,height:1024},{width:1440,height:900}]){
   await page.setViewportSize(viewport);await select('N10');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(!audit&&viewport.width===390){
    assert.ok(!await page.locator('.directory-body').isVisible());await page.locator('#detail .sheet-resize').press('End');assert.equal(await page.locator('#detail').getAttribute('data-snap'),'full');assert.ok(await page.locator('#map').evaluate(e=>e.inert));
    await page.locator('#detail .sheet-resize').press('Home');assert.ok(!await page.locator('#map').evaluate(e=>e.inert));await page.locator('#detail .sheet-resize').press('ArrowUp');assert.equal(await page.locator('#detail').getAttribute('data-snap'),'half');
   }
   if(viewport.width===390)await shot(audit?'baseline-mobile':'production-mobile');
   if(!audit)await shot(`production-${viewport.width}x${viewport.height}`);
  }
 });
 if(!audit)await check('map error and recovery retain selection',async()=>{await page.evaluate(()=>window.__map.fire('error',{error:new Error('Intentional production QA recovery event')}));await page.locator('#retry-map').click();await page.waitForFunction(()=>!document.getElementById('toggle3d').disabled&&window.__map?.isStyleLoaded(),null,{timeout:60000});assert.equal(await page.locator('#detail-code').textContent(),'N10');assert.equal(await page.locator('.selected-pin').count(),1);});
 await check('runtime and CSP health',async()=>{report.csp_violations=await page.evaluate(()=>window.__csp);assert.deepEqual(report.errors,[]);assert.deepEqual(report.console_errors,[]);assert.deepEqual(report.csp_violations,[]);});
 if(audit){
  const reference=await context.newPage();try{await reference.goto('https://sutiporn03082547-eng.github.io/kmutnb-3d-map/',{waitUntil:'domcontentloaded',timeout:30000});await wait(2500);await reference.screenshot({path:out+'/benchmark-reference.png'});report.benchmark={url:reference.url(),title:await reference.title(),screenshot:'benchmark-reference.png'};}catch(e){report.benchmark={limitation:e.message};}await reference.close();
 }
 report.result='passed';
}catch(e){report.result='failed';report.failure=e.stack;process.exitCode=1;if(page)await page.screenshot({path:out+'/failure.png'}).catch(()=>{});}
finally{
 await writeFile(out+'/production-smoke.json',JSON.stringify(report,null,2)+'\n');
 console.log('OPENMAP_PRODUCTION_RESULT '+JSON.stringify(report));await browser?.close();
}
