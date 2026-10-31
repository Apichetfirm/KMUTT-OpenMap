import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {searchBuildings, scoreBuilding, validCoordinates} from '../src/search.mjs';
import {numericVisualHeight, extrusionHeight, HEIGHT_PRESETS} from '../src/heights.mjs';
import {DRAFT_STORAGE_KEY, readDrafts, putDraft, proposalFor, validateProposal, exportPackage} from '../src/mapping.mjs';

const data=JSON.parse(readFileSync(new URL('../data/buildings.json',import.meta.url),'utf-8'));
const rows=data.buildings;
const get=id=>rows.find(b=>b.id===id);

test('original official inventory preserved with unique code/name pairs',()=>{
  assert.ok(rows.length>=35);
  assert.equal(new Set(rows.map(b=>b.id)).size,rows.length);
  assert.ok(rows.every(b=>/^([NS])(\d{1,2})$/.test(b.id)&&b.name_th&&b.name_en));
});
test('every record has evidence metadata',()=>{
  assert.ok(rows.every(b=>b.name_source?.startsWith('https://')&&b.name_checked_on));
});
test('no invented surveyed geometry, entrances, or height',()=>{
  assert.ok(rows.every(b=>b.building_height_m===null || b.height_evidence));
  assert.ok(rows.every(b=>!b.site_surveyed || b.mapping.evidence?.verified_on));
  assert.ok(rows.filter(b=>b.coordinates).every(b=>validCoordinates(b.coordinates)));
});
test('search exact codes before other matching names',()=>{
  assert.equal(searchBuildings(rows,'N9')[0].id,'N9');
  assert.equal(searchBuildings(rows,'n 9')[0].id,'N9');
  assert.equal(searchBuildings(rows,'FIBO')[0].id,'N9');
  assert.equal(searchBuildings(rows,'LX')[0].id,'N16');
  assert.equal(searchBuildings(rows,'หอสมุด')[0].id,'N10');
});
test('filter by zone and geocoded coordinates',()=>{
  assert.ok(searchBuildings(rows,'','south').every(b=>b.zone==='south'));
  assert.ok(searchBuildings(rows,'','north').every(b=>b.zone==='north'));
  assert.equal(searchBuildings(rows,'','mapped').length,rows.filter(b=>validCoordinates(b.coordinates)).length);
  assert.equal(scoreBuilding(get('N9'),'FIBO'),1);
});
test('walkway dataset has no unverified routes',()=>{
  const walkways=JSON.parse(readFileSync(new URL('../data/walkways.geojson',import.meta.url),'utf-8'));
  assert.ok(walkways.features.every(f=>f.properties?.review_status==='verified'&&f.properties?.evidence));
});
test('height modes are visual only',()=>{
  assert.equal(numericVisualHeight(100,'guarded'),55);
  assert.equal(numericVisualHeight(100,'osm'),100);
  assert.deepEqual(extrusionHeight('guarded')[0],'min');
  assert.equal(HEIGHT_PRESETS.guarded.floor,4);
});
test('proposed building mapping is flagged unverified',()=>{
  const p=proposalFor(get('N9'),[100.4935,13.654],null,new Date('2026-11-01T00:00:00Z'));
  assert.equal(p.review_status,'needs-field-verification');
  assert.equal(p.capture_method,'clicked-map');
  assert.equal(p.tile_render_height_m,null);
  assert.ok(validateProposal(p,rows.map(x=>x.id)));
});
test('unknown codes and out-of-bounds coordinates rejected',()=>{
  assert.throws(()=>proposalFor(get('N9'),[0,0]));
  assert.equal(validateProposal({...proposalFor(get('N9'),[100.49,13.65]),building_code:'OTHER'},rows.map(x=>x.id)),false);
});
test('draft proposal storage and corrupted input',()=>{
  const p=proposalFor(get('N9'),[100.49,13.65]);
  const d=putDraft([],p,rows.map(x=>x.id));
  assert.equal(d.length,1);
  const store={getItem:k=>k===DRAFT_STORAGE_KEY?JSON.stringify(d):'[]'};
  assert.equal(readDrafts(store,rows.map(x=>x.id)).length,1);
  assert.deepEqual(readDrafts({getItem:()=>'{bad'},rows.map(x=>x.id)),[]);
});
test('initiator and project governance are identified',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf-8');
  const readme=readFileSync(new URL('../README.md',import.meta.url),'utf-8');
  assert.match(html,/Firm Impulse/);
  assert.match(html,/FRAB11/);
  assert.match(readme,/not an official KMUTT service/i);
  assert.match(exportPackage([]),/UNVERIFIED/);
});
