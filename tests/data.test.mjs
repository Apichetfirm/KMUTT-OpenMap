import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validCode,validGeometry,validateCatalog,validateFootprints,coverage,safeURL,verifiedEvidence} from '../src/data.mjs';
import {searchBuildings} from '../src/search.mjs';
import {validateHeightOverride,extrusionBase} from '../src/heights.mjs';
import {buildingURL,sharedBuilding} from '../src/sharing.mjs';
const rows=JSON.parse(readFileSync(new URL('../data/buildings.json',import.meta.url))).buildings;
const evidence={source:'https://www.openstreetmap.org/way/1',license:'ODbL-1.0',checked_on:'2026-11-01',method:'public-map-reference'};
const rectangle=[[100.493,13.652],[100.494,13.652],[100.494,13.653],[100.493,13.653],[100.493,13.652]];
test('catalog integrity evolves with evidence instead of freezing initial missing data',()=>assert.deepEqual(validateCatalog(rows),[]));
test('all original inventory codes remain searchable, punctuation and aliases rank correctly',()=>{
 for(const code of [...Array.from({length:20},(_,i)=>'N'+(i+1)),...Array.from({length:15},(_,i)=>'S'+(i+1))])assert.equal(searchBuildings(rows,code)[0].id,code);
 for(const q of ['n-9','Ｎ９','n. 9','F.I.B.O','fibo'])assert.equal(searchBuildings(rows,q)[0].id,'N9');
 assert.equal(searchBuildings(rows,'Classroom Building 2')[0].id,'N17');
});
test('invalid code, coordinates and unsupported verification are rejected',()=>{
 assert.equal(validCode('N0'),false);assert.equal(validCode('<script>'),false);
 for(const mutate of [b=>b.coordinates=[0,0],b=>b.mapping.confidence='verified',b=>b.name_source='javascript:alert(1)',b=>b.building_height_m=Infinity]) {
  const copy=structuredClone(rows);mutate(copy.find(b=>b.id==='N9'));assert.ok(validateCatalog(copy).length);
 }
 const copy=structuredClone(rows);copy.push(copy[0]);assert.ok(validateCatalog(copy).length);
});
test('URL validation rejects active content and embedded credentials',()=>{
 for(const s of ['javascript:alert(1)','data:text/html,hello','https://user:secret@example.org'])assert.equal(safeURL(s),null);
 assert.ok(safeURL('https://www.kmutt.ac.th/'));
});
test('polygon validation rejects unclosed, degenerate, out-of-area and crossing rings',()=>{
 assert.ok(validGeometry({type:'Polygon',coordinates:[rectangle]}));
 for(const ring of [rectangle.slice(0,-1),[rectangle[0],rectangle[2],rectangle[1],rectangle[3],rectangle[0]],[[0,0],[1,0],[1,1],[0,0]],[rectangle[0],rectangle[1],rectangle[1],rectangle[0]]])assert.equal(validGeometry({type:'Polygon',coordinates:[ring]}),false);
 const outsideHole=rectangle.map(([x,y])=>[x+0.01,y]);assert.equal(validGeometry({type:'Polygon',coordinates:[rectangle,outsideHole]}),false);
});
test('footprint association needs an independent evidence basis and no duplicates',()=>{
 const row={...rows.find(b=>b.id==='N9'),coordinates:[100.4935,13.6525],mapping:{footprint_id:'shape-1'}};
 const feature={type:'Feature',id:'shape-1',geometry:{type:'Polygon',coordinates:[rectangle]},properties:{building_code:'N9',confidence:'high-confidence',evidence:{...evidence,association_basis:'Cross-checked name and geometry'}}};
 assert.deepEqual(validateFootprints({type:'FeatureCollection',features:[feature]},[row]),[]);
 assert.ok(validateFootprints({type:'FeatureCollection',features:[feature,feature]},[row]).length);
 assert.ok(validateFootprints({type:'FeatureCollection',features:[{...feature,properties:{...feature.properties,confidence:'verified'}}]},[row]).length);
 assert.equal(verifiedEvidence(evidence),false);
});
test('height overrides separate measured heights from floor-based estimates',()=>{
 const record={building_code:'N9',kind:'osm-levels',render_height_m:18,measured_height_m:null,levels:6,metres_per_level:3,evidence};
 assert.ok(validateHeightOverride(record,['N9']));assert.equal(validateHeightOverride({...record,measured_height_m:18},['N9']),false);
 assert.equal(validateHeightOverride({...record,render_height_m:19},['N9']),false);
 assert.equal(extrusionBase('guarded')[0],'min');
});
test('share URLs retain GitHub Pages base path, other parameters and fragment',()=>{
 const url=buildingURL('https://apichetfirm.github.io/KMUTT-OpenMap/?theme=light#map','N9');
 assert.equal(new URL(url).pathname,'/KMUTT-OpenMap/');assert.equal(new URL(url).searchParams.get('theme'),'light');assert.equal(new URL(url).hash,'#map');
 assert.equal(sharedBuilding(url,rows).building.id,'N9');assert.equal(sharedBuilding('https://example.org/?building=NO',rows).building,undefined);
});
test('coverage never counts candidate geometry as accepted or approximate as verified',()=>{
 const c=coverage(rows);assert.equal(c.verified,0);assert.equal(c.footprints,0);assert.equal(c.coordinates+c.unmapped,c.total);
});
