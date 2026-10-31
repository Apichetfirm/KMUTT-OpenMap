/** Explicit allowlist: no proximity-based matching, no entrances inferred. */
import {readFile,writeFile} from 'node:fs/promises';
import {validGeometry,pointInGeometry} from '../src/data.mjs';
const catalog=JSON.parse(await readFile(new URL('../data/buildings.json',import.meta.url)));
const candidates=[['N10',311879209,'สำนักหอสมุด'],['N17',420534143,'อาคารเรียนรวม 2'],['N20',436983061,'อาคารเรียนรวม 1']];
const features=[];
for(const [code,id,expectedName] of candidates) {
  const source=`https://www.openstreetmap.org/way/${id}`;
  const file=process.argv[2]?new URL(`file://${process.argv[2]}/osm-${id}.json`):null;
  const json=file?JSON.parse(await readFile(file)):await (await fetch(`https://www.openstreetmap.org/api/0.6/way/${id}/full.json`)).json();
  const way=json.elements.find(e=>e.type==='way'&&e.id===id);
  if(!way||way.tags?.name!==expectedName)throw Error(`${code}: source name changed; manual review required`);
  const nodes=new Map(json.elements.filter(e=>e.type==='node').map(n=>[n.id,[n.lon,n.lat]]));
  const geometry={type:'Polygon',coordinates:[way.nodes.map(id=>nodes.get(id))]};
  if(!validGeometry(geometry))throw Error(`${code}: invalid geometry`);
  const building=catalog.buildings.find(b=>b.id===code);
  const contains=pointInGeometry(building.coordinates,geometry);
  features.push({type:'Feature',id:`osm-way-${id}`,properties:{building_code:code,
    confidence:'approximate',review_status:'candidate-needs-independent-review',reference_point_inside:contains,
    osm_name:way.tags.name,osm_name_en:way.tags['name:en']||null,osm_levels:way.tags['building:levels']?Number(way.tags['building:levels']):null,
    evidence:{source,license:'ODbL-1.0',method:'cross-source-name-match',checked_on:'2026-11-01',verified_on:null,reviewer:null,
      source_version:way.version,source_timestamp:way.timestamp,
      association_basis:`Official ${code} directory name agrees with the named OSM way and existing reference ID. Candidate only; independent association review pending.`,
      limitations:'OSM geometry and levels are not field verified; wheelchair tags are not accepted as route evidence.'}},geometry});
}
await writeFile(new URL('../data/building-footprint-candidates.geojson',import.meta.url),JSON.stringify({type:'FeatureCollection',features},null,2)+'\n');
console.log(features.map(f=>({code:f.properties.building_code,reference_point_inside:f.properties.reference_point_inside,vertices:f.geometry.coordinates[0].length})));
