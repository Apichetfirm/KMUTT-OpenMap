// Package reviewed, tracked source + verified static site. Never copies the working directory wholesale.
import {execFileSync} from 'node:child_process';
import {cp, mkdir, readFile, writeFile, lstat} from 'node:fs/promises';
import {resolve, join, dirname, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyManifest} from './release-integrity.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=resolve(root,'work','handoff-'+new Date().toISOString().replace(/[:.]/g,'-'));
const read=async path=>JSON.parse(await readFile(join(root,path),'utf8'));
const manifest=await verifyManifest(join(root,'.site'));
const paths=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const roots=new Set(['src','vendor','data','docs','scripts','tests','admin','.github','assets']);
const files=new Set(['index.html','favicon.svg','.nojekyll','.gitattributes','.gitignore','package.json','package-lock.json','playwright.config.mjs','README.md','LICENSE','DATA-LICENSES.md','CONTRIBUTING.md','SECURITY.md','CODE_OF_CONDUCT.md','START_WINDOWS.bat']);
await mkdir(out,{recursive:true});
for(const path of paths) {
 if(isAbsolute(path)||path.split('/').includes('..')||(!roots.has(path.split('/')[0])&&!files.has(path)))continue;
 // Refuse directory links in any source ancestor, not only links at the leaf.
 let parent=root;
 for(const segment of path.split('/')){parent=join(parent,segment);if((await lstat(parent)).isSymbolicLink())throw Error('Source link rejected: '+path);}
 const dest=join(out,'source',path);await mkdir(dirname(dest),{recursive:true});await cp(join(root,path),dest);
}
for(const needed of ['scripts/prepare-handoff.mjs','scripts/release-integrity.mjs','docs/HANDOVER-TH.md']) {
 if(!paths.includes(needed))throw Error('Stage reviewed delivery files with git add before packaging: '+needed);
}
await cp(join(root,'.site'),join(out,'site'),{recursive:true});
await verifyManifest(join(out,'site'));
const {buildings}=await read('data/buildings.json'),places=await read('data/places.geojson'),graph=await read('data/pedestrian-graph-candidates.json');
// Quoting alone does not stop spreadsheet formulas in imported names/notes.
const cell=value=>'"'+String(value??'').replace(/^[\s]*[=+@-]/,match=>"'"+match).replaceAll('"','""')+'"';
const csv=async(name,headers,rows)=>writeFile(join(out,'survey',name),'\uFEFF'+[headers,...rows].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n');
await mkdir(join(out,'survey'));
await csv('buildings.csv',['code','name_th','name_en','reference_lng','reference_lat','current_status','candidate_ids','unresolved_reason','assigned_to','survey_date','observed_name','entrance_lng','entrance_lat','evidence_url','license','independent_reviewer','review_date','decision'],buildings.map(b=>[b.id,b.name_th,b.name_en,...(b.coordinates||['','']),b.mapping.confidence,b.mapping.candidate_footprint_ids.join('; '),b.mapping.unresolved_reason||b.mapping.review_notes,'','','','','','','','','','not-reviewed']));
await csv('places.csv',['id','name','category','reference_lng','reference_lat','source','source_checked_on','assigned_to','observed_on','operating_status','confirmed_hours','evidence_url','independent_reviewer','decision'],places.features.map(f=>[f.id,f.properties.name,f.properties.category,...f.geometry.coordinates,f.properties.evidence.source,f.properties.evidence.checked_on,'','','','','','','not-reviewed']));
const nodes=new Map(graph.nodes.map(n=>[n.id,n.coordinates]));
await csv('paths.csv',['candidate_id','from_node','to_node','from_lng','from_lat','to_lng','to_lat','source','assigned_to','survey_date','public_access','surface','slope','stairs','crossing','gate_hours','evidence_url','independent_reviewer','decision'],graph.edges.map(e=>[e.id,e.from,e.to,...(nodes.get(e.from)||['','']),...(nodes.get(e.to)||['','']),e.evidence?.source||'','','','','','','','','','','','not-reviewed']));
await cp(join(root,'docs/HANDOVER-TH.md'),join(out,'START-HERE-TH.md'));
await cp(join(root,'docs/OPERATIONS-TH.md'),join(out,'OPERATIONS-TH.md'));
for(const name of ['DATA-COVERAGE.md','FIELD-SURVEY.md','DATA-MODEL.md'])await cp(join(root,'docs',name),join(out,name));
await cp(join(root,'data/coverage-report.json'),join(out,'DATA-STATUS.json'));
await writeFile(join(out,'HANDOFF.json'),JSON.stringify({created_at_utc:new Date().toISOString(),source_commit:manifest.source_commit,source_dirty:manifest.source_dirty,scope:'Unofficial community preview; not a field-verified campus navigation service',public_files:manifest.files.length,source_files:paths.filter(p=>roots.has(p.split('/')[0])||files.has(p)).length,survey_rows:{buildings:buildings.length,places:places.features.length,paths:graph.edges.length},evidence_limits:['No new field observations, licensed building photos or physical-device tests supplied.','Browser/dependency results must be read from dated QA evidence; packaging alone does not certify them.'],deployment:'Prepared static assets; no deployment is performed by this command.'},null,2)+'\n');
// Whole-package checksums also cover source and survey sheets; a manifest is an integrity check, not a signature.
// Source contains development scripts/admin, so its inventory deliberately differs from public-site rules.
const {createHash}=await import('node:crypto');
const {readdir}=await import('node:fs/promises');
const checksums=[];
async function hashDir(dir,prefix='') {
 for(const item of await readdir(dir,{withFileTypes:true})){
  const path=prefix+item.name;
  if(item.isDirectory())await hashDir(join(dir,item.name),path+'/');
  else checksums.push(createHash('sha256').update(await readFile(join(dir,item.name))).digest('hex')+'  '+path);
 }
}
await hashDir(out);await writeFile(join(out,'SHA256SUMS'),checksums.sort().join('\n')+'\n');
console.log('Handoff prepared: '+out);
console.log('Source, verified site, Thai operations guide, survey queues and SHA256SUMS. No private work or credentials copied.');
