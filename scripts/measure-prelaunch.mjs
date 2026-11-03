/** Reproducible paired startup samples. Actual app/runtime and provider responses; no fixture routes. */
import {chromium} from 'playwright';
import {mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname} from 'node:path';
const [baselineURL='http://127.0.0.1:8081/',redesignURL='http://127.0.0.1:8080/',output='work/prelaunch-performance.json']=process.argv.slice(2);
await mkdir(dirname(output),{recursive:true});
const browser=await chromium.launch({executablePath:process.env.OPENMAP_CHROMIUM||undefined,headless:true,chromiumSandbox:true,proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}:undefined,args:['--enable-unsafe-swiftshader']});
const results=[];
for(let sample=1;sample<=6;sample++)for(const [version,url] of (sample%2?[['baseline',baselineURL],['redesign',redesignURL]]:[['redesign',redesignURL],['baseline',baselineURL]])){
 const context=await browser.newContext({viewport:{width:1440,height:900}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.__longTasks=[];new PerformanceObserver(list=>window.__longTasks.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true});});
 await page.goto(url,{waitUntil:'domcontentloaded'});let timedOut=false;
 try{await page.waitForFunction(()=>performance.getEntriesByName('openmap-map-loaded').length>0,null,{timeout:45000});}catch{timedOut=true;}
 const metrics=await page.evaluate(()=>{
  const marks=Object.fromEntries(performance.getEntriesByType('mark').map(m=>[m.name,m.startTime]));
  const resources=performance.getEntriesByType('resource');const heap=performance.memory?.usedJSHeapSize??null;
  const times=[];for(const query of ['N9','N10','LX','FIBO','หอสมุด','Classroom','N20','S4','N11','']){const start=performance.now();const input=document.getElementById('search');input.value=query;input.dispatchEvent(new Event('input',{bubbles:true}));times.push(performance.now()-start);}times.sort((a,b)=>a-b);
  return {marks,js_heap_bytes:heap,canvas_count:document.querySelectorAll('canvas').length,search_sync_median_ms:times[Math.floor(times.length/2)],long_task_count:window.__longTasks.length,long_task_total_ms:window.__longTasks.reduce((a,b)=>a+b,0),resource_count:resources.length,observable_transfer_bytes:resources.reduce((n,r)=>n+r.transferSize,0),resources:resources.map(r=>({url:r.name,duration_ms:r.duration,transfer_bytes:r.transferSize,decoded_bytes:r.decodedBodySize}))};
 });
 results.push({version,sample,timedOut,...metrics,errors});console.log(JSON.stringify({version,sample,timedOut,...metrics,resources:undefined}));await context.close();
}
const sourceFiles=['index.html',...(await readdir('src')).map(p=>'src/'+p)];const hashes={};for(const p of sourceFiles)hashes[p]=createHash('sha256').update(await readFile(p)).digest('hex');
await writeFile(output,JSON.stringify({conditions:{captured_at_utc:new Date().toISOString(),baseline_commit:process.env.OPENMAP_BASELINE_COMMIT||null,redesign_source_sha256:hashes,browser:await browser.version(),viewport:'1440x900',physical_device:false,rendering:'Headless system Chromium, sandbox enabled, software WebGL (SwiftShader).',sampling:'Six pairs, alternating baseline/redesign and redesign/baseline; fresh context for each load in one reused browser process; no other QA browsers running.',network:'Live OpenFreeMap via session HTTPS proxy; no throttling. Provider and OS caches uncontrolled. Each version uses its shipped initial camera and canvas/layout.',resource_caveat:'Resource Timing transfer sizes can be zero for cross-origin resources without Timing-Allow-Origin; observable bytes are not total wire bytes. JS heap is a coarse Chromium estimate, not GPU or total process memory.'},results},null,2)+'\n');await browser.close();
