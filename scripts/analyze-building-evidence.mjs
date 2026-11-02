import {privateEvidenceOutput} from './evidence-paths.mjs';
/** Offline, deterministic matching of reviewed vision observations. No network, model or paid API at runtime. */
import {readFile,mkdir,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';import {proposeMatches,validateMedia} from '../src/building-evidence.mjs';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const catalog=await read('data/buildings.json'),footprints=await read('data/building-footprint-candidates.geojson');
const media=await read(process.argv[3]||'data/building-media.json');const errors=validateMedia(media,catalog.buildings.map(b=>b.id));if(errors.length)throw Error(errors.join('; '));
const observations=process.argv[2]?await read(process.argv[2]):[];
const photos=media.buildings.flatMap(b=>[b.photo,...b.gallery].filter(Boolean));
const output=privateEvidenceOutput(process.argv[4]||'work/building-analysis.json');
const candidates=proposeMatches(catalog.buildings,footprints,photos,observations);
await mkdir(resolve(output,'..'),{recursive:true});await writeFile(output,JSON.stringify({schema_version:'0.5.0',method:'offline-sign-and-metadata-comparison',runtime_ai:false,paid_dependency:false,photographs:photos.length,observations:observations.length,candidates,unresolved:catalog.buildings.filter(b=>!candidates.some(c=>c.building_code===b.id)).map(b=>({building_code:b.id,reason:photos.length?'No supporting visual observation matched.':'No approved reusable photograph available; no visual inference performed.'})),warning:'Unreviewed candidates. AI signs/floors cannot verify GPS, entrances or measured height. Independent PR review required.'},null,2)+'\n');console.log(`Wrote ${candidates.length} unaccepted matches; ${photos.length} publishable photos. Output: ${output}`);
