import {execFileSync} from 'node:child_process';
/** Real-provider, fresh-context browser measurements; never a physical-device claim. */
import {chromium} from 'playwright';import {writeFile,mkdir} from 'node:fs/promises';
const [baseline='http://127.0.0.1:8081/',final='http://127.0.0.1:8082/',output='/workspace/work/performance.json']=process.argv.slice(2);
const browser=await chromium.launch({executablePath:process.env.OPENMAP_CHROMIUM||undefined,headless:true,proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}:undefined,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const results=[];
for(let sample=1;sample<=3;sample++)for(const [version,url] of [['baseline',baseline],['final',final]]) {
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});let timedOut=false;
 try {await page.waitForFunction(()=>performance.getEntriesByName('openmap-map-loaded').length>0,{},{timeout:45000});}catch{timedOut=true;}
 const metrics=await page.evaluate(()=>{
  const inputs=['N9','N10','LX','FIBO','หอสมุด','Classroom','N20','S4','N11',''];const times=[];
  for(const q of inputs){const start=performance.now(),input=document.getElementById('search');input.value=q;input.dispatchEvent(new Event('input',{bubbles:true}));times.push(performance.now()-start);}
  times.sort((a,b)=>a-b);return {marks:performance.getEntriesByType('mark').map(m=>({name:m.name,ms:m.startTime})),search_sync_median_ms:times[Math.floor(times.length/2)],js_heap_bytes:performance.memory?.usedJSHeapSize??null,canvas_count:document.querySelectorAll('canvas').length};
 });
 results.push({version,sample,url,timedOut,...metrics,errors});console.log(JSON.stringify(results.at(-1)));await context.close();
}
await writeFile(output,JSON.stringify({conditions:{implementation_commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),browser:await browser.version(),viewport:'1440x1000',network:'Managed proxy, live OpenFreeMap, no throttling, fresh browser context each sample; proxy caches are uncontrolled.',rendering:'Headless Chromium with software WebGL (SwiftShader); no concurrent QA processes.',physical_device:false,date:'2026-11-02'},results},null,2)+'\n');await browser.close();
