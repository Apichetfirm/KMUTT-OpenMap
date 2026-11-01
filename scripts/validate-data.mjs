import {readFile} from 'node:fs/promises';
import {validateCandidateFootprints,validateCatalog,validateFootprints,validGeometry,validEvidence,coverage} from '../src/data.mjs';
import {validatePlaces} from '../src/places.mjs';
import {validateGraph} from '../src/navigation.mjs';
import {qualityReport} from '../src/quality.mjs';
import {validateHeightOverride} from '../src/heights.mjs';
const read=async file=>JSON.parse(await readFile(new URL('../data/'+file,import.meta.url)));
const [catalog,footprints,candidates,places,graph,heights,points,walkways]=await Promise.all(['buildings.json','building-footprints.geojson','building-footprint-candidates.geojson','places.geojson','pedestrian-graph.json','height-overrides.json','buildings-geocoded.geojson','walkways.geojson'].map(read));
const rows=catalog.buildings,codes=rows.map(b=>b.id);
const errors=[...validateCandidateFootprints(candidates,codes),...validateCatalog(rows),...validateFootprints(footprints,rows),...validatePlaces(places,codes),...validateGraph(graph,{footprints:footprints.features})];
const candidateGraph=await read('pedestrian-graph-candidates.json');
errors.push(...validateGraph(candidateGraph));
if(candidateGraph.edges.some(e=>e.independently_reviewed))errors.push('Candidate paths cannot be independently accepted');
const expectedReport=qualityReport({buildings:rows,footprints,candidates,places,graph,candidateGraph,heights});
if(JSON.stringify(await read('coverage-report.json'))!==JSON.stringify(expectedReport))errors.push('Coverage report out of sync: run npm run generate-data');
const seen=new Set();
for(const f of candidates.features) {
  if(seen.has(f.id)||!validGeometry(f.geometry)||!codes.includes(f.properties.building_code)||!validEvidence(f.properties.evidence)||f.properties.review_status!=='candidate-needs-independent-review')errors.push('Invalid candidate footprint');
  seen.add(f.id);
}
if(heights.overrides.some(h=>!validateHeightOverride(h,codes))||new Set(heights.overrides.map(h=>h.building_code)).size!==heights.overrides.length)errors.push('Invalid/duplicate height override');
if(new Set(points.features.map(f=>f.properties.id)).size!==points.features.length)errors.push('Duplicate geocoded feature');
for(const b of rows) {
  const f=points.features.find(f=>f.properties.id===b.id);
  if(b.coordinates && JSON.stringify(b.coordinates)!==JSON.stringify(f?.geometry?.coordinates) || !b.coordinates&&f)errors.push(`${b.id}: geocoded view out of sync`);
}
if(walkways.features.length && !graph.edges.length)errors.push('Walkways published without reviewed graph');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log(JSON.stringify({...coverage(rows,footprints),candidate_footprints:candidates.features.length,places:places.features.length,verified_routes:graph.edges.filter(e=>e.independently_reviewed).length},null,2));
