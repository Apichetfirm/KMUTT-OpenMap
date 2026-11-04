/** Browser observations only: no physical-device/GPU-energy claim. */
import {chromium} from 'playwright';import {readFile,writeFile,mkdir} from 'node:fs/promises';import {dirname} from 'node:path';
const [base='http://127.0.0.1:8080/KMUTT-OpenMap/',out='work/release-interactions.json']=process.argv.slice(2);await mkdir(dirname(out),{recursive:true});
const browser=await chromium.launch({executablePath:process.env.OPENMAP_CHROMIUM||undefined,headless:true,chromiumSandbox:true,...(process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}}:{}),args:['--enable-unsafe-swiftshader']});const samples=[];
try{for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
 const page=await browser.newPage({viewport});await page.route('**/src/main.mjs',async route=>route.fulfill({contentType:'application/javascript',body:(await readFile('src/main.mjs','utf8')).replace('state.map=map;','state.map=map;window.__map=map;')}));
 await page.goto(base);await page.waitForFunction(()=>performance.getEntriesByName('openmap-map-loaded').length,null,{timeout:60000});
 for(const code of ['N9','N10','N16']){
  const result=await page.evaluate(async code=>{
   const input=document.getElementById('search');input.focus();input.value=code;input.dispatchEvent(new Event('input',{bubbles:true}));
   const frames=[],map=window.__map;let running=true,last=performance.now();const frame=t=>{frames.push(t-last);last=t;if(running)requestAnimationFrame(frame);};requestAnimationFrame(frame);
   const before=performance.now();const camera=new Promise(resolve=>{let timer;const end=()=>{clearTimeout(timer);timer=setTimeout(()=>{if(map.isMoving())return end();map.off('moveend',end);resolve(performance.now()-before);},250);};map.on('moveend',end);});
   input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));const detail_sync_ms=performance.now()-before;
   const camera_settled_ms_with_250ms_guard=await camera;running=false;frames.sort((a,b)=>a-b);
   return {code,detail_sync_ms,camera_settled_ms_with_250ms_guard,observed_frames:frames.length,frame_interval_median_ms:frames[Math.floor(frames.length/2)]??null,js_heap_bytes:performance.memory?.usedJSHeapSize??null,canvas_count:document.querySelectorAll('canvas').length,selected:document.getElementById('detail-code').textContent};
  },code);samples.push({viewport,...result});console.log(JSON.stringify(samples.at(-1)));
 }
 await page.close();
}}finally{await writeFile(out,JSON.stringify({captured_at_utc:new Date().toISOString(),browser:await browser.version(),conditions:'One sandboxed headless Chromium process, software SwiftShader rendering, real provider, desktop and mobile-sized viewport. Default camera motion, no throttling. Camera settling includes a 250ms quiet guard to account for sheet-driven camera restarts. Frame intervals are browser QA observations, not physical smartphone FPS, battery or thermal measurements. One observational map hook; no map/data fixtures.',samples},null,2)+'\n');await browser.close();}
