import {validCoordinates} from './search.mjs';
import {extrusionHeight,extrusionBase,extrusionColor,zoomHeight} from './heights.mjs';
export const HOME=[100.4937,13.6520];
export const STYLES={light:'https://tiles.openfreemap.org/styles/liberty',dark:'https://tiles.openfreemap.org/styles/dark'};
const collection=features=>({type:'FeatureCollection',features});
export function buildingPoints(rows) {
  return collection(rows.filter(b=>validCoordinates(b.coordinates)).map(b=>({type:'Feature',id:b.id,
    properties:{id:b.id,label:b.name_th,confidence:b.mapping.confidence},geometry:{type:'Point',coordinates:b.coordinates}})));
}
function source(map,id,data,options={}) {
  if(map.getSource(id))map.getSource(id).setData(data);else map.addSource(id,{type:'geojson',data,...options});
}
function layer(map,definition,before) {if(!map.getLayer(definition.id))map.addLayer(definition,before);}
export function applyHeights(map,mode) {
  if(!map?.getLayer('campus-3d'))return;
  map.setPaintProperty('campus-3d','fill-extrusion-height',zoomHeight(extrusionHeight(mode)));
  map.setPaintProperty('campus-3d','fill-extrusion-base',zoomHeight(extrusionBase(mode)));
}
/** Reinstall once per style generation; reuse sources/layers within a generation. */
export function installMapLayers(map,state) {
  const style=map.getStyle();if(!style)return;
  const before=style.layers?.find(l=>l.type==='symbol'&&l.layout?.['text-field'])?.id;
  let tileSource=Object.entries(style.sources||{}).find(([,s])=>s.type==='vector'&&s.url?.includes('tiles.openfreemap.org/planet'))?.[0];
  if(!tileSource) {tileSource='campus-tiles';if(!map.getSource(tileSource))map.addSource(tileSource,{type:'vector',url:'https://tiles.openfreemap.org/planet'});}
  for(const l of style.layers||[])if(l.type==='fill-extrusion'&&l.id!=='campus-3d')map.setLayoutProperty(l.id,'visibility','none');
  layer(map,{id:'campus-building-hit',type:'fill',source:tileSource,'source-layer':'building',minzoom:14.8,paint:{'fill-opacity':0}},before);
  layer(map,{id:'campus-3d',type:'fill-extrusion',source:tileSource,'source-layer':'building',minzoom:14.8,
    paint:{'fill-extrusion-color':extrusionColor(),'fill-extrusion-height':zoomHeight(extrusionHeight(state.heightMode)),
      'fill-extrusion-base':zoomHeight(extrusionBase(state.heightMode)),'fill-extrusion-opacity':0.9}},before);
  map.setLayoutProperty('campus-3d','visibility',state.is3d?'visible':'none');applyHeights(map,state.heightMode);
  source(map,'campus-buildings',buildingPoints(state.official));
  layer(map,{id:'campus-labels',type:'symbol',source:'campus-buildings',minzoom:15,
    layout:{'text-field':['step',['zoom'],['get','id'],17,['concat',['get','id'],' · ',['get','label']]],
      'text-size':12,'text-font':['Noto Sans Regular'],'text-max-width':15,'text-padding':10,'text-optional':false,'symbol-sort-key':1},
    paint:{'text-color':state.dark?'#d9fff2':'#123f3b','text-halo-color':state.dark?'#10232b':'#f8fffa','text-halo-width':2}});
  source(map,'campus-footprints',state.footprints);
  layer(map,{id:'campus-selected-footprint',type:'line',source:'campus-footprints',filter:['==',['get','building_code'],state.selected?.id||''],paint:{'line-color':'#18b89b','line-width':4}});
  source(map,'campus-places',collection(state.visiblePlaces),{cluster:true,clusterRadius:45,clusterMaxZoom:16});
  layer(map,{id:'campus-poi-clusters',type:'circle',source:'campus-places',filter:['has','point_count'],paint:{'circle-color':'#dcae5e','circle-radius':19,'circle-stroke-width':2,'circle-stroke-color':'#fff'}});
  layer(map,{id:'campus-poi-count',type:'symbol',source:'campus-places',filter:['has','point_count'],layout:{'text-field':['to-string',['get','point_count_abbreviated']],'text-font':['Noto Sans Regular'],'text-size':12}});
  layer(map,{id:'campus-poi',type:'circle',source:'campus-places',filter:['!', ['has','point_count']],minzoom:14,
    paint:{'circle-color':'#dcae5e','circle-radius':8,'circle-stroke-color':'#ffffff','circle-stroke-width':2}});
  source(map,'campus-drafts',collection(state.drafts.map(p=>({type:'Feature',properties:{id:p.building_code},geometry:{type:'Point',coordinates:p.coordinates}}))));
  layer(map,{id:'campus-drafts',type:'circle',source:'campus-drafts',paint:{'circle-radius':10,'circle-color':'#d49643','circle-opacity':0.75,'circle-stroke-width':2,'circle-stroke-color':'#fff0b0'}});
  // Route visualization source stays empty until a sufficiently reviewed graph/entrance workflow is available.
  source(map,'campus-route',collection([]));
  layer(map,{id:'campus-route',type:'line',source:'campus-route',paint:{'line-color':'#168da5','line-width':5}});
}
export function updateSelection(map,selected) {
  if(map?.getLayer('campus-selected-footprint'))map.setFilter('campus-selected-footprint',['==',['get','building_code'],selected?.id||'']);
  if(map?.getLayer('campus-labels'))map.setFilter('campus-labels',['!=',['get','id'],selected?.id||'']);
}
export function cameraOptions(coordinates,{is3d=true,reducedMotion=false,mobile=false}={}) {
  return {center:coordinates,zoom:17.6,pitch:is3d?48:0,bearing:-20,duration:reducedMotion?0:1000,
    padding:mobile?{top:20,right:20,bottom:260,left:20}:{top:60,right:380,bottom:50,left:340}};
}
