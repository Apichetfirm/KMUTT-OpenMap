import test from 'node:test';
import assert from 'node:assert/strict';
import {openingStatus,validHours,validatePlaces,filterPlaces} from '../src/places.mjs';
import {shortestPath,validateGraph,connectedComponents} from '../src/navigation.mjs';
import {readDraftState,saveDrafts,proposalFor,DRAFT_STORAGE_KEY,RECOVERY_STORAGE_KEY} from '../src/mapping.mjs';
const evidence={source:'https://example.org/survey',license:'CC0-1.0',method:'field-survey',checked_on:'2026-11-01',verified_on:'2026-11-01',reviewer:'Synthetic test fixture'};
const hours={timezone:'Asia/Bangkok',checked_on:'2026-11-01',evidence,weekly:{'0':[],'1':[['09:00','17:00']],'2':[['22:00','02:00']],'3':[]},exceptions:{'2026-11-04':[]}};
test('Bangkok schedules use local dates and closed/open boundaries',()=>{
 assert.equal(openingStatus(hours,new Date('2026-11-02T01:59:00Z')).state,'likely-closed');
 assert.equal(openingStatus(hours,new Date('2026-11-02T02:00:00Z')).state,'likely-open');
 assert.equal(openingStatus(hours,new Date('2026-11-02T10:00:00Z')).state,'likely-closed');
 assert.equal(openingStatus(hours,new Date('2026-11-01T03:00:00Z')).state,'likely-closed');
 assert.equal(openingStatus(hours,new Date('2026-11-05T03:00:00Z')).state,'unknown');
});
test('overnight carry works, holiday exceptions override it, missing schedules stay unknown',()=>{
 const noException={...hours,exceptions:{}};
 assert.equal(openingStatus(noException,new Date('2026-11-03T16:00:00Z')).state,'likely-open');
 assert.equal(openingStatus(noException,new Date('2026-11-03T18:00:00Z')).state,'likely-open');
 assert.equal(openingStatus(noException,new Date('2026-11-03T19:00:00Z')).state,'likely-closed');
 assert.equal(openingStatus(hours,new Date('2026-11-03T18:00:00Z')).state,'likely-closed');
 assert.equal(openingStatus(null).state,'unknown');
});
test('hours reject malformed calendars and show stale schedules separately',()=>{
 assert.equal(validHours({...hours,weekly:{'9':[]}}),false);
 assert.equal(validHours({...hours,weekly:{'1':[['25:00','30:00']]}}),false);
 assert.equal(validHours({...hours,exceptions:{'2026-02-30':[]}}),false);
 assert.equal(openingStatus({...hours,checked_on:'2025-01-01'},new Date('2026-11-02T03:00:00Z')).stale,true);
});
test('places validate provenance/references and unknown hours are not open-now',()=>{
 const f={type:'Feature',id:'test-library',geometry:{type:'Point',coordinates:[100.493,13.652]},properties:{name:'Test only',category:'library',confidence:'approximate',building_code:'N10',opening_hours:null,accessibility:null,last_verified_on:null,evidence}};
 assert.deepEqual(validatePlaces({type:'FeatureCollection',features:[f]},['N10']),[]);
 assert.equal(filterPlaces([f],{likelyOpen:true}).length,0);assert.equal(filterPlaces([f],{category:'cafe'}).length,0);
 assert.ok(validatePlaces({type:'FeatureCollection',features:[f,f]},[]).length);
});
const coordinates=[[100.493,13.652],[100.494,13.652],[100.495,13.652],[100.496,13.653]];
const nodes=coordinates.map((c,i)=>({id:String(i),coordinates:c,kind:i===0||i===2?'entrance':'intersection',evidence,independently_reviewed:true,accessibility:{wheelchair:true,evidence}}));
const edge=(id,a,b,extra={})=>({id,from:String(a),to:String(b),coordinates:[coordinates[a],coordinates[b]],kind:'path',access:'public',hours:null,bidirectional:true,evidence,independently_reviewed:true,accessibility:{wheelchair:true,evidence},...extra});
const graph={nodes,edges:[edge('a',0,1),edge('b',1,2),edge('long',0,2,{coordinates:[coordinates[0],[100.494,13.655],coordinates[2]]})]};
test('deterministic shortest path uses geometry distance with explicit walking speed',()=>{
 const r=shortestPath(graph,'0','2');assert.equal(r.status,'ok');assert.deepEqual(r.edge_ids,['a','b']);assert.ok(r.distance_m>200&&r.distance_m<230);assert.equal(r.estimated_seconds,r.distance_m/1.2);
 assert.deepEqual(shortestPath(graph,'2','0').edge_ids,['b','a']);assert.deepEqual(connectedComponents(graph),[['0','1','2'],['3']]);
 assert.equal(shortestPath(graph,'0','3').status,'unreachable');assert.equal(shortestPath(graph,'0','missing').status,'unreachable');
});
test('unverified paths, restrictions and missing accessibility never get promoted',()=>{
 const unverified=structuredClone(graph);unverified.edges.forEach(e=>e.independently_reviewed=false);
 assert.equal(shortestPath(unverified,'0','2').status,'unreachable');assert.equal(shortestPath(unverified,'0','2',{allowUnverified:true}).status,'ok');
 const stairs={nodes,edges:[edge('stairs',0,2,{kind:'stairs'})]};assert.equal(shortestPath(stairs,'0','2',{accessible:true}).status,'unreachable');
 const unknown={nodes,edges:[edge('unknown',0,2,{accessibility:null})]};assert.equal(shortestPath(unknown,'0','2',{accessible:true}).status,'unreachable');
 const restricted={nodes,edges:[edge('restricted',0,2,{access:'restricted'})]};assert.equal(shortestPath(restricted,'0','2').status,'unreachable');
 const oneWay={nodes,edges:[edge('one-way',0,2,{bidirectional:false})]};assert.equal(shortestPath(oneWay,'2','0').status,'unreachable');
});
test('graph rejects invalid topology, geometry and guessed passage access',()=>{
 assert.ok(validateGraph({nodes,edges:[edge('bad',0,5)]}).length);
 assert.ok(validateGraph({nodes,edges:[edge('bad',0,2,{coordinates:[coordinates[1],coordinates[2]]})]}).length);
 assert.equal(shortestPath({nodes,edges:[edge('passage',0,2,{kind:'passage'})]},'0','2').status,'unreachable');
 assert.throws(()=>shortestPath(graph,'0','2',{walkingSpeed:0}));
});
function storage(raw) {const map=new Map(raw?[[DRAFT_STORAGE_KEY,raw]]:[]);return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};}
const proposal=()=>proposalFor({id:'N9',name_th:'Test'},[100.493,13.652]);
test('legacy proposals survive and corrupt bytes are backed up before an edit',()=>{
 const store=storage(JSON.stringify([proposal()]));assert.equal(readDraftState(store,['N9']).drafts.length,1);
 saveDrafts(store,[proposal()],['N9']);assert.equal(store.getItem(RECOVERY_STORAGE_KEY),null);
 const bad=storage('{bad');assert.ok(readDraftState(bad,['N9']).warning);saveDrafts(bad,[proposal()],['N9']);assert.equal(bad.getItem(RECOVERY_STORAGE_KEY),'{bad');
 const partial=storage(JSON.stringify([proposal(),{bad:true}]));assert.equal(readDraftState(partial,['N9']).drafts.length,1);saveDrafts(partial,[proposal()],['N9']);assert.ok(partial.getItem(RECOVERY_STORAGE_KEY).includes('bad'));
});
test('storage quota/security failures do not silently save or overwrite recovery',()=>{
 assert.throws(()=>saveDrafts({getItem:()=>null,setItem:()=>{throw Error('Quota');}},[proposal()],['N9']),/Quota/);
 assert.ok(readDraftState({getItem:()=>{throw Error('Denied');}},['N9']).warning);
 const store=storage('{broken');store.setItem(RECOVERY_STORAGE_KEY,'previous broken data');assert.throws(()=>saveDrafts(store,[proposal()],['N9']),/Recovery backup/);assert.equal(store.getItem(DRAFT_STORAGE_KEY),'{broken');
});
test('building intersections need explicit surveyed passages and identical endpoints are handled',()=>{
 const footprint={id:'test-building',geometry:{type:'Polygon',coordinates:[[[100.4934,13.6519],[100.4936,13.6519],[100.4936,13.6521],[100.4934,13.6521],[100.4934,13.6519]]]}};
 assert.ok(validateGraph(graph,{footprints:[footprint]}).some(e=>e.includes('building crossing')));
 const passage={nodes,edges:[edge('passage',0,2,{kind:'passage',traversable_passage_verified:true,passage_footprint_ids:['test-building']})]};
 assert.deepEqual(validateGraph(passage,{footprints:[footprint]}),[]);
 assert.equal(shortestPath(graph,'0','0').status,'already-there');
});
