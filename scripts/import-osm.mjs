/** Explicit source-name matches only. No nearest-building joins, accepted shapes, or entrances. */
import {readFile,writeFile} from 'node:fs/promises';
import {validGeometry,pointInGeometry} from '../src/data.mjs';
import {representativePoint} from '../src/geometry.mjs';
const root=new URL('../data/',import.meta.url),read=async p=>JSON.parse(await readFile(new URL(p,root)));
const snapshot=await read('evidence/osm-campus-snapshot.json'),catalog=await read('buildings.json');
const nodes=new Map(snapshot.elements.filter(e=>e.type==='node').map(n=>[n.id,[n.lon,n.lat]]));
const features=[];
for(const [code,match] of Object.entries(snapshot.matching)) {
 const way=snapshot.elements.find(e=>e.type==='way'&&e.id===match.way_id);
 if(!way||way.tags.name!==match.expected_name)throw Error(`${code}: name changed; manual review required`);
 const geometry={type:'Polygon',coordinates:[way.nodes.map(id=>nodes.get(id))]};
 if(!validGeometry(geometry))throw Error(`${code}: invalid source geometry`);
 const b=catalog.buildings.find(b=>b.id===code),partial=code==='N4';
 features.push({type:'Feature',id:`osm-way-${way.id}`,properties:{building_code:code,confidence:'approximate',review_status:'candidate-needs-independent-review',association_scope:partial?'partial-complex':'named-building',reference_point_inside:b.coordinates?pointInGeometry(b.coordinates,geometry):null,osm_name:way.tags.name,osm_name_en:way.tags['name:en']||null,osm_levels:Number(way.tags['building:levels'])||null,roof_shape:way.tags['roof:shape']||null,reference_point:representativePoint(geometry),evidence:{source:`https://www.openstreetmap.org/way/${way.id}`,license:'ODbL-1.0',method:'cross-source-name-match',checked_on:snapshot.retrieved_on,source_version:way.version,source_timestamp:way.timestamp,source_date:way.timestamp.slice(0,10),verified_on:null,reviewer:null,association_basis:`Official/BGM ${code} name or documented alias compared with OSM name '${way.tags.name}'. ${partial?'Mathematics is only part of the official Physics–Mathematics complex. ':''}Independent association and physical survey remain pending.`,limitations:'Named source candidate; not an accepted polygon, surveyed location, entrance, official floor count or measured height.'}},geometry});
}
await writeFile(new URL('building-footprint-candidates.geojson',root),JSON.stringify({type:'FeatureCollection',features},null,2)+'\n');
console.log(`Rebuilt ${features.length} candidate polygons; accepted geometry unchanged.`);
