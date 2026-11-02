import {footprintPreview} from './footprint.mjs';
import {reviewDecision} from '../src/building-evidence.mjs';
const $=id=>document.getElementById(id),node=(t,text)=>{const n=document.createElement(t);n.textContent=text;return n;};
const load=async p=>{const r=await fetch(p);if(!r.ok)throw Error('Evidence unavailable');return r.json();};
const [catalog,footprints,media]=await Promise.all(['buildings.json','building-footprint-candidates.geojson','building-media.json'].map(n=>load('../data/'+n)));
let analysis={candidates:[]},decisions=[];
for(const b of catalog.buildings){const o=node('option',b.id+' · '+b.name_th);o.value=b.id;$('building').append(o);}
function render(){const id=$('building').value,b=catalog.buildings.find(b=>b.id===id),m=media.buildings.find(b=>b.building_code===id);$('evidence').replaceChildren(node('h2',b.name_th),node('p','Published reference: '+JSON.stringify(b.coordinates)+' · '+b.mapping.confidence));
 for(const p of [m?.photo,...m?.gallery||[]].filter(Boolean)){const img=document.createElement('img');img.src='../'+p.src.slice(2);img.alt=p.alt;img.loading='lazy';$('evidence').append(img,node('p',p.attribution+' · '+p.license));}
 $('evidence').append(node('h3','Photo rights/source metadata'),node('pre',JSON.stringify(m,null,2)));
 if(!m?.photo)$('evidence').append(node('p','No approved reusable photograph. Rights/identity remain unresolved.'));
 for(const f of footprints.features.filter(f=>f.properties.building_code===id)){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 360 200');svg.setAttribute('aria-label','Unaccepted OSM footprint '+f.id);const poly=document.createElementNS(svg.namespaceURI,'polygon');poly.setAttribute('points',footprintPreview(f.geometry));svg.append(poly);$('evidence').append(svg,node('pre',JSON.stringify(f.properties,null,2)));
 }
 $('evidence').append(node('h3','AI suggestions (unaccepted)'),node('pre',JSON.stringify(analysis.candidates.filter(c=>c.building_code===id),null,2)),node('h3','Canonical record'),node('pre',JSON.stringify(b,null,2)));
}
$('building').onchange=render;$('analysis').onchange=async()=>{try{const data=JSON.parse(await $('analysis').files[0].text());if(!Array.isArray(data?.candidates)||data.candidates.length>10000||data.candidates.some(c=>!c||typeof c!=='object'||!catalog.buildings.some(b=>b.id===c.building_code)))throw Error('Invalid analysis');analysis=data;render();$('status').textContent='Private analysis loaded into this tab only.';}catch(e){$('status').textContent=e.message;}};
$('review').onsubmit=e=>{e.preventDefault();try{const d=reviewDecision({building_code:$('building').value,decision:$('decision').value,reviewer:$('reviewer').value,survey_reviewer:$('author').value||null,notes:$('notes').value,source_refs:$('sources').value.split('\n').map(s=>s.trim()).filter(Boolean)});decisions.push(d);$('decisions').textContent=JSON.stringify(decisions,null,2);$('export').disabled=false;$('status').textContent='Decision recorded in memory. Published data unchanged.';}catch(err){$('status').textContent=err.message;}};
$('export').onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify({schema_version:'0.5.0',publication_status:'requires-independent-pr-review',decisions},null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='building-evidence-review.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};render();
