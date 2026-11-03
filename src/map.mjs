import {validCoordinates} from './search.mjs';
import {extrusionHeight,extrusionBase,extrusionColor,zoomHeight} from './heights.mjs';
export const HOME=[100.4937,13.6520];
export const OVERVIEW={zoom:16.85,pitch:54,bearing:-24};
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
/** Style existing provider geography; no invented campus boundary or polygon associations. */
export function styleBasemap(map,dark=false) {
  for(const l of map.getStyle()?.layers||[]) {
    if(l.id.startsWith('campus-'))continue;
    const source=l['source-layer'];
    if(l.type==='background'&&!dark)map.setPaintProperty(l.id,'background-color','#f4f1ea');
    if(l.type==='fill') {
      const color=source==='water'?(dark?'#294856':'#a8c5c6'):
        ['park','landcover'].includes(source)?(dark?'#273e36':'#dce3cd'):
        source==='landuse'?(dark?'#283631':'#e9e6da'):source==='building'?(dark?'#4b5654':'#d5cebf'):null;
      if(color)map.setPaintProperty(l.id,'fill-color',color);
    }
    if(l.type==='line'&&source==='waterway')map.setPaintProperty(l.id,'line-color',dark?'#355866':'#a8c5c6');
    if(l.type==='symbol'&&(source==='poi'||/shield/.test(l.id)))map.setLayoutProperty(l.id,'visibility','none');
    if(l.type==='symbol'&&source==='place')map.setPaintProperty(l.id,'text-opacity',0.65);
  }
}
export function installMapLayers(map,state) {
  const style=map.getStyle();if(!style)return;
  if(!map.getLayer('campus-3d'))styleBasemap(map,state.dark);
  const before=style.layers?.find(l=>l.type==='symbol'&&l.layout?.['text-field'])?.id;
  let tileSource=Object.entries(style.sources||{}).find(([,s])=>s.type==='vector'&&s.url?.includes('tiles.openfreemap.org/planet'))?.[0];
  if(!tileSource) {tileSource='campus-tiles';if(!map.getSource(tileSource))map.addSource(tileSource,{type:'vector',url:'https://tiles.openfreemap.org/planet'});}
  for(const l of style.layers||[])if(l.type==='fill-extrusion'&&l.id!=='campus-3d')map.setLayoutProperty(l.id,'visibility','none');
  layer(map,{id:'campus-building-hit',type:'fill',source:tileSource,'source-layer':'building',minzoom:14.8,paint:{'fill-opacity':0}},before);
  // Ground-contact wash from the very same provider polygons, not a physical sun shadow.
  layer(map,{id:'campus-grounding',type:'fill',source:tileSource,'source-layer':'building',minzoom:14.8,
    paint:{'fill-color':state.dark?'#071b21':'#6f6759','fill-opacity':0.15,'fill-translate':[3,4],'fill-translate-anchor':'viewport'}},before);
  map.setLayoutProperty('campus-grounding','visibility',state.is3d&&!state.candidatePreview?.features.length?'visible':'none');
  layer(map,{id:'campus-3d',type:'fill-extrusion',source:tileSource,'source-layer':'building',minzoom:14.8,
    paint:{'fill-extrusion-color':extrusionColor(state.dark),'fill-extrusion-height':zoomHeight(extrusionHeight(state.heightMode)),
      'fill-extrusion-base':zoomHeight(extrusionBase(state.heightMode)),'fill-extrusion-opacity':1,'fill-extrusion-vertical-gradient':true}},before);
  map.setLayoutProperty('campus-3d','visibility',state.is3d&&!state.candidatePreview?.features.length?'visible':'none');applyHeights(map,state.heightMode);
  source(map,'campus-buildings',buildingPoints(state.official));
  layer(map,{id:'campus-labels',type:'symbol',source:'campus-buildings',minzoom:15,
    layout:{'text-field':['step',['zoom'],['get','id'],17.9,['concat',['get','id'],' · ',['get','label']]],
      'text-size':13,'text-font':['Noto Sans Regular'],'text-max-width':15,'text-padding':10,'text-optional':false,'symbol-sort-key':['match',['get','id'],['N9','N10','N11','N16','N17','N20'],0,1]},
    paint:{'text-color':state.dark?'#fff1d9':'#423b2d','text-halo-color':state.dark?'#152630':'#fffdf6','text-halo-width':2.2}});
  source(map,'campus-footprints',state.footprints);
  layer(map,{id:'campus-selected-footprint',type:'line',source:'campus-footprints',filter:['==',['get','building_code'],state.selected?.id||''],paint:{'line-color':'#b94712','line-width':4}});
  source(map,'campus-places',collection(state.visiblePlaces.map(f=>({...f,properties:{...f.properties,place_id:String(f.id)}}))),{cluster:true,clusterRadius:45,clusterMaxZoom:16});
  layer(map,{id:'campus-poi-clusters',type:'circle',source:'campus-places',filter:['has','point_count'],paint:{'circle-color':'#bb6c37','circle-radius':19,'circle-stroke-width':2,'circle-stroke-color':'#fff'}});
  layer(map,{id:'campus-poi-count',type:'symbol',source:'campus-places',filter:['has','point_count'],layout:{'text-field':['to-string',['get','point_count_abbreviated']],'text-font':['Noto Sans Regular'],'text-size':12}});
  layer(map,{id:'campus-poi',type:'circle',source:'campus-places',filter:['!', ['has','point_count']],minzoom:14,
    paint:{'circle-color':'#bb6c37','circle-radius':8,'circle-stroke-color':'#ffffff','circle-stroke-width':2}});
  source(map,'campus-drafts',collection(state.drafts.map(p=>({type:'Feature',properties:{id:p.building_code},geometry:{type:'Point',coordinates:p.coordinates}}))));
  layer(map,{id:'campus-drafts',type:'circle',source:'campus-drafts',paint:{'circle-radius':10,'circle-color':'#d49643','circle-opacity':0.75,'circle-stroke-width':2,'circle-stroke-color':'#fff0b0'}});
  // Route visualization source stays empty until a sufficiently reviewed graph/entrance workflow is available.
  source(map,'campus-route',state.route||collection([]));
  source(map,'campus-candidate-preview',state.candidatePreview||collection([]));
  layer(map,{id:'campus-candidate-3d',type:'fill-extrusion',source:'campus-candidate-preview',paint:{'fill-extrusion-color':'#7da9d0','fill-extrusion-opacity':0.42,'fill-extrusion-height':['get','preview_height'],'fill-extrusion-base':0}});
  map.setLayoutProperty('campus-candidate-3d','visibility',state.is3d&&!!state.candidatePreview?.features.length?'visible':'none');
  map.setLight({anchor:'viewport',color:state.dark?'#dce8ff':'#fff1d7',intensity:state.dark?0.38:0.58,position:[1.35,215,38]});
  layer(map,{id:'campus-candidate-preview',type:'line',source:'campus-candidate-preview',paint:{'line-color':'#547eac','line-width':4,'line-dasharray':[2,2]}});
  layer(map,{id:'campus-route',type:'line',source:'campus-route',paint:{'line-color':'#168da5','line-width':5}});
}
export function updateSelection(map,selected) {
  if(map?.getLayer('campus-selected-footprint'))map.setFilter('campus-selected-footprint',['==',['get','building_code'],selected?.id||'']);
  if(map?.getLayer('campus-labels'))map.setFilter('campus-labels',['!=',['get','id'],selected?.id||'']);
}
export function cameraOptions(coordinates,{is3d=true,reducedMotion=false,mobile=false}={}) {
  return {center:coordinates,zoom:17.8,pitch:is3d?58:0,bearing:-24,duration:reducedMotion?0:1000,
    padding:mobile?{top:20,right:20,bottom:260,left:20}:{top:60,right:380,bottom:50,left:340}};
}
