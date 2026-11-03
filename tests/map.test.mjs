import test from 'node:test';
import assert from 'node:assert/strict';
import {validateStyleMin,createExpression} from '@maplibre/maplibre-gl-style-spec';
import {extrusionHeight,numericVisualHeight} from '../src/heights.mjs';
import {installMapLayers,cameraOptions} from '../src/map.mjs';
function fakeMap() {
 const sources=new Map(),style={version:8,glyphs:'https://example.org/{fontstack}/{range}.pbf',sources:{basemap:{type:'vector',url:'https://tiles.openfreemap.org/planet'}},layers:[{id:'base-3d',type:'fill-extrusion',source:'basemap','source-layer':'building'}]};
 return {getStyle:()=>style,getSource:id=>sources.get(id),getLayer:id=>style.layers.find(l=>l.id===id),
 addSource:(id,s)=>{style.sources[id]=s;sources.set(id,{setData:data=>style.sources[id].data=data});},
 setLight:()=>{},addLayer:l=>style.layers.push(l),setLayoutProperty:(id,k,v)=>{const l=style.layers.find(l=>l.id===id);l.layout={...l.layout,[k]:v};},
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

test('real MapLibre height expression preserves missing-value fallback and matches numeric policy',()=>{
 for(const mode of ['guarded','osm']) {
  const expression=createExpression(extrusionHeight(mode),'layers[0].paint.fill-extrusion-height');assert.equal(expression.result,'success');
  for(const height of [undefined,null,-2,0,12,'18','bad',100]) {
   const properties=height===undefined?{}:{render_height:height};
   assert.equal(expression.value.evaluate({zoom:16},{type:3,properties}),numericVisualHeight(height,mode));
  }
 }
});

test('candidate previews are the only visible extrusion while editing and stay separate from accepted footprints',()=>{
 const map=fakeMap();const candidatePreview={type:'FeatureCollection',features:[{type:'Feature',properties:{preview_height:48},geometry:{type:'Polygon',coordinates:[[[100.493,13.652],[100.494,13.652],[100.494,13.653],[100.493,13.652]]]}}]};
 installMapLayers(map,{...state,candidatePreview});assert.equal(map.getLayer('campus-3d').layout.visibility,'none');assert.equal(map.getLayer('campus-candidate-3d').layout.visibility,'visible');assert.equal(map.getStyle().sources['campus-footprints'].data.features.length,0);
 installMapLayers(map,{...state,candidatePreview:{type:'FeatureCollection',features:[]}});assert.equal(map.getLayer('campus-3d').layout.visibility,'visible');assert.equal(map.getLayer('campus-candidate-3d').layout.visibility,'none');
});

test('architectural materials use provider polygons with no catalog identity assumptions',()=>{
 const map=fakeMap();installMapLayers(map,state);
 const extrusion=map.getLayer('campus-3d'),ground=map.getLayer('campus-grounding');
 assert.equal(extrusion.source,'basemap');assert.equal(extrusion['source-layer'],'building');
 assert.equal(extrusion.paint['fill-extrusion-opacity'],1);assert.equal(extrusion.paint['fill-extrusion-vertical-gradient'],true);
 assert.equal(ground.source,extrusion.source);assert.equal(ground['source-layer'],'building');
 assert.equal(map.getStyle().sources['campus-buildings'].data.features.length,0);
 assert.equal(map.getLayer('campus-candidate-3d').paint['fill-extrusion-opacity'],0.42);
 assert.equal(map.getStyle().sources['campus-footprints'].data.features.length,0);
 // No invented per-building codes, roof heights or selected tile IDs appear in the material expression.
 const color=JSON.stringify(extrusion.paint['fill-extrusion-color']);assert.ok(color.includes('render_height'));assert.ok(!color.includes('building_code'));
 const day=extrusion.paint['fill-extrusion-color'];const night=fakeMap();installMapLayers(night,{...state,dark:true});
 assert.notDeepEqual(day,night.getLayer('campus-3d').paint['fill-extrusion-color']);
 assert.deepEqual(validateStyleMin(map.getStyle()),[]);assert.deepEqual(validateStyleMin(night.getStyle()),[]);
});
