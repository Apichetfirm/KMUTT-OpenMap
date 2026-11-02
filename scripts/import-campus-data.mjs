import {readFile,writeFile} from 'node:fs/promises';
import {representativePoint} from '../src/geometry.mjs';
import {validGeometry} from '../src/data.mjs';
import {parseRecordedOSMHours} from '../src/places.mjs';
const root=new URL('../data/',import.meta.url),read=async p=>JSON.parse(await readFile(new URL(p,root))),write=async(p,x)=>writeFile(new URL(p,root),JSON.stringify(x,null,2)+'\n');
const snap=await read('evidence/osm-campus-snapshot.json'),catalog=await read('buildings.json'),candidates=await read('building-footprint-candidates.geojson');
const nodes=new Map(snap.elements.filter(e=>e.type==='node').map(n=>[n.id,n]));
const evidence=(e,method)=>({source:`https://www.openstreetmap.org/${e.type}/${e.id}`,license:'ODbL-1.0',method,checked_on:snap.retrieved_on,source_date:e.timestamp.slice(0,10),source_version:e.version,source_timestamp:e.timestamp,verified_on:null,reviewer:null,limitations:'OSM public record; retrieval does not confirm current business operation, surveyed access or present-day schedules.'});
for(const b of catalog.buildings) {
 const f=candidates.features.find(f=>f.properties.building_code===b.id);
 b.department??=null;b.department_evidence??=null;
 // Preserve published points; add only previously missing, supported full-building references.
 if(!b.coordinates&&f&&f.properties.association_scope==='named-building'&&!b.name_conflict) {
  b.coordinates=f.properties.reference_point;b.location_source=f.properties.evidence.source;b.location_quality='approximate-osm-name-match';
  b.mapping.confidence='approximate';b.mapping.review_status='needs-independent-review';b.mapping.evidence={...f.properties.evidence,method:'named-osm-reference-point'};
 }
 const pointId={N2:3176409879,N15:3176409863}[b.id],point=nodes.get(pointId);
 if(!b.coordinates&&point) {b.coordinates=[point.lon,point.lat];b.location_source=`https://www.openstreetmap.org/node/${pointId}`;b.location_quality='approximate-osm-name-match';b.mapping.confidence='approximate';b.mapping.review_status='needs-independent-review';b.mapping.evidence={...evidence(point,'official-name-osm-point-match'),association_basis:`Official ${b.id} name matches named OSM office; approximate office reference, not a footprint or entrance.`};}
 b.mapping.candidate_footprint_ids=f?[f.id]:[];
 b.mapping.unresolved_reason=b.name_conflict?'Official directory and BGM descriptions disagree; current institutional confirmation required.':b.id==='N4'?'Candidate represents Mathematics only; full Physics–Mathematics complex is not established.':!b.coordinates?'No sufficiently supported code-to-location association found in the reviewed public sources.':null;
 b.mapping.review_notes=f?'OSM name/alias association is provisional; no independent acceptance or field verification.':b.coordinates?'Approximate published reference; footprint association and field survey remain pending.':b.mapping.unresolved_reason;
}
catalog.schema_version='0.4.0';catalog.notes='Original building URLs/codes and published references preserved. Named OSM references are approximate; candidates, accepted geometry and surveyed entrances remain separate.';
await write('buildings.json',catalog);
const places=(await read('places.geojson')).features.filter(f=>f.id==='kmutt-library');
for(const e of snap.elements) {
 const t=e.tags;let category=({restaurant:'restaurant',fast_food:'restaurant',food_court:'canteen',cafe:'cafe',library:'library',atm:'atm',bank:'visitor',clinic:'clinic',dentist:'clinic',pharmacy:'pharmacy',parking:'parking',toilets:'restroom',drinking_water:'water'})[t.amenity]||({convenience:'convenience',copyshop:'printing'})[t.shop]||(t.highway==='bus_stop'?'transport':null);
 if(!category||e.type==='way'&&e.id===311879209||t.access==='private'||t.access==='no')continue;
 let point;
 if(e.type==='node')point=[e.lon,e.lat];
 else {const g={type:'Polygon',coordinates:[e.nodes.map(id=>{const n=nodes.get(id);return n?[n.lon,n.lat]:null})]};if(!validGeometry(g))continue;point=representativePoint(g);}
 const ev=evidence(e,'osm-public-service-reference'),name=t.name||t['name:en']||`${({transport:'ป้ายรถโดยสาร',parking:'ที่จอดรถ',restroom:'ห้องน้ำ',water:'จุดน้ำดื่ม'})[category]||'บริการ'} · OSM ${e.id}`;
 // Avoid duplicating node/area representations of the same named service within 25 metres.
 if(places.some(p=>p.properties.name===name&&Math.hypot((p.geometry.coordinates[0]-point[0])*108000,(p.geometry.coordinates[1]-point[1])*111000)<25))continue;
 places.push({type:'Feature',id:`osm-${e.type}-${e.id}`,geometry:{type:'Point',coordinates:point},properties:{name,name_en:t['name:en']||null,category,building_code:null,description:'ข้อมูล OSM ในบางมดและบริเวณใกล้เคียง · จุดอ้างอิง ไม่ใช่ทางเข้าที่สำรวจแล้ว',scope:'campus-or-nearby',confidence:'approximate',opening_hours:parseRecordedOSMHours(t.opening_hours,ev),raw_opening_hours:t.opening_hours||null,last_verified_on:null,accessibility:null,evidence:ev}});
}
await write('places.geojson',{type:'FeatureCollection',features:places});
const paths=snap.elements.filter(e=>e.type==='way'&&['footway','pedestrian','steps'].includes(e.tags.highway)&&!['private','no'].includes(e.tags.access));
const counts=new Map();for(const p of paths)for(const id of new Set(p.nodes))counts.set(id,(counts.get(id)||0)+1);
const graph={schema_version:'0.4.0',campus:'KMUTT Bangmod and nearby',review_status:'candidate-needs-field-survey',nodes:[],edges:[]};
const addNode=id=>{if(graph.nodes.some(n=>n.id===`osm-node-${id}`))return;const n=nodes.get(id);graph.nodes.push({id:`osm-node-${id}`,coordinates:[n.lon,n.lat],kind:'intersection',evidence:evidence(n,'osm-path-topology-candidate'),independently_reviewed:false,accessibility:null});};
for(const way of paths) {
 let start=0;
 for(let i=1;i<way.nodes.length;i++)if(i===way.nodes.length-1||counts.get(way.nodes[i])>1) {
  const from=way.nodes[start],to=way.nodes[i];if(from===to){start=i;continue;}
  addNode(from);addNode(to);graph.edges.push({id:`osm-way-${way.id}-${start}-${i}`,from:`osm-node-${from}`,to:`osm-node-${to}`,coordinates:way.nodes.slice(start,i+1).map(id=>{const n=nodes.get(id);return [n.lon,n.lat]}),kind:way.tags.highway==='steps'?'stairs':'path',access:way.tags.access==='yes'||way.tags.foot==='yes'?'public':'unknown',bidirectional:true,hours:null,accessibility:null,evidence:evidence(way,'osm-pedestrian-candidate'),independently_reviewed:false,review_status:'candidate-needs-field-survey'});start=i;
 }
}
await write('pedestrian-graph-candidates.json',graph);
await write('walkway-candidates.geojson',{type:'FeatureCollection',features:graph.edges.map(e=>({type:'Feature',id:e.id,geometry:{type:'LineString',coordinates:e.coordinates},properties:{review_status:e.review_status,evidence:e.evidence}}))});
console.log(`Catalog: ${catalog.buildings.filter(b=>b.coordinates).length} approximate points; ${places.length} POIs; ${graph.edges.length} candidate path segments. No accepted/surveyed data added.`);
