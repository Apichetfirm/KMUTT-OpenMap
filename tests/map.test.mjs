import test from 'node:test';
import assert from 'node:assert/strict';
import {validateStyleMin} from '@maplibre/maplibre-gl-style-spec';
import {installMapLayers,cameraOptions} from '../src/map.mjs';
function fakeMap() {
 const sources=new Map(),style={version:8,glyphs:'https://example.org/{fontstack}/{range}.pbf',sources:{basemap:{type:'vector',url:'https://tiles.openfreemap.org/planet'}},layers:[{id:'base-3d',type:'fill-extrusion',source:'basemap','source-layer':'building'}]};
 return {getStyle:()=>style,getSource:id=>sources.get(id),getLayer:id=>style.layers.find(l=>l.id===id),
 addSource:(id,s)=>{style.sources[id]=s;sources.set(id,{setData:data=>style.sources[id].data=data});},
 addLayer:l=>style.layers.push(l),setLayoutProperty:(id,k,v)=>{const l=style.layers.find(l=>l.id===id);l.layout={...l.layout,[k]:v};},
 setPaintProperty:(id,k,v)=>{style.layers.find(l=>l.id===id).paint[k]=v;}};
}
const state={official:[],footprints:{type:'FeatureCollection',features:[]},visiblePlaces:[],drafts:[],is3d:true,heightMode:'guarded',dark:false,selected:null};
test('repeated layer installation reuses basemap source and leaves one visible extrusion',()=>{
 const map=fakeMap();installMapLayers(map,state);installMapLayers(map,state);
 assert.equal(map.getStyle().layers.filter(l=>l.type==='fill-extrusion'&&l.layout?.visibility!=='none').length,1);
 assert.equal(Object.values(map.getStyle().sources).filter(s=>s.type==='vector').length,1);
 assert.equal(new Set(map.getStyle().layers.map(l=>l.id)).size,map.getStyle().layers.length);
 assert.deepEqual(validateStyleMin(map.getStyle()),[]);
 installMapLayers(map,{...state,is3d:false});assert.equal(map.getLayer('campus-3d').layout.visibility,'none');
});
test('camera options respect reduced motion and allow room for panels',()=>{
 const options=cameraOptions([100.493,13.652],{reducedMotion:true,mobile:true});
 assert.equal(options.duration,0);assert.ok(options.padding.bottom>200);assert.deepEqual(options.center,[100.493,13.652]);
});
