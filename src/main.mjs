import {searchBuildings, validCoordinates} from './search.mjs';
import {extrusionHeight, extrusionColor, HEIGHT_PRESETS} from './heights.mjs';
import {DRAFT_STORAGE_KEY, readDrafts, putDraft, proposalFor, exportPackage} from './mapping.mjs';

const HOME = [100.4937, 13.6520];
const STYLE_LIGHT = 'https://tiles.openfreemap.org/styles/liberty';
const STYLE_DARK = 'https://tiles.openfreemap.org/styles/dark';
const $ = id => document.getElementById(id);
const state = {official:[],buildings:[],drafts:[],results:[],selected:null,filter:'all',
  map:null,maplibre:null,markers:[],locationMarker:null,is3d:true,dark:false,heightMode:'guarded',mapping:null};
const getCodes = () => state.official.map(b=>b.id);
let toastTimer;
function toast(message) {
  const el=$('toast'); el.textContent=message; el.classList.remove('hidden');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.add('hidden'),4500);
}
function element(tag,cls,text) {
  const e=document.createElement(tag); if(cls)e.className=cls;
  if(text!==undefined)e.textContent=text;return e;
}
function visibleCatalog() {
  return state.official.map(b=>{
    const p=state.drafts.find(p=>p.building_code===b.id);
    return p?{...b,coordinates:p.coordinates,location_quality:'draft-local',location_source:'local-browser-only'}:b;
  });
}
function refresh() {
  state.buildings=visibleCatalog();
  $('draft-count').textContent=String(state.drafts.length);
  $('export-drafts').disabled=!state.drafts.length;
  renderList();
  renderMarkers();
}
function renderList() {
  state.results=searchBuildings(state.buildings,$('search').value,state.filter);
  $('results-label').textContent=state.results.length+' สถานที่';
  $('empty').classList.toggle('hidden',!!state.results.length);
  const fragment=document.createDocumentFragment();
  for(const b of state.results) {
    const button=element('button','place'+(state.selected?.id===b.id?' active':''));
    button.type='button';
    button.setAttribute('aria-label',b.id+' '+b.name_th+(b.coordinates?'':' ยังไม่มีพิกัดที่ตรวจสอบแล้ว'));
    const code=element('span','place-code',b.id);
    const txt=element('span','place-text');
    txt.append(element('strong','',b.name_th),element('small','',b.name_en));
    const marker=element('span','place-end'+(!b.coordinates?' unknown':''),b.location_quality==='draft-local'?'◇':b.coordinates?'↗':'·');
    button.append(code,txt,marker);
    button.addEventListener('click',()=>select(b));
    fragment.append(button);
  }
  $('places').replaceChildren(fragment);
}
function select(b) {
  if(!b)return;
  state.selected=b;renderList();
  $('detail-code').textContent=b.id;
  $('detail-name').textContent=b.name_th;
  $('detail-en').textContent=b.name_en;
  const mapped=validCoordinates(b.coordinates),draft=b.location_quality==='draft-local';
  $('map-delete').classList.toggle('hidden',!draft);
  $('detail-location').textContent=draft?'◇ พิกัดที่เสนอในเครื่องนี้ ยังไม่ยืนยัน':
    mapped?'◉ พิกัดอ้างอิงโดยประมาณ ยังไม่ผ่านการสำรวจ':'◌ ยังไม่มีพิกัดที่ระบุได้ในชุดข้อมูล';
  $('detail-height').textContent=Number.isFinite(b.building_height_m)
    ?'ความสูงที่บันทึกไว้: '+b.building_height_m+' เมตร'
    :Number.isFinite(b.floor_count)?'มีเอกสารระบุ '+b.floor_count+' ชั้น · ยังไม่ยืนยันความสูงเป็นเมตร'
    :'ไม่ทราบความสูงจริงของอาคาร · ภาพ 3D เป็นข้อมูลจำลอง';
  $('focus-detail').disabled=!mapped||!state.map;
  $('directions').disabled=!mapped||draft;
  $('detail-caveat').textContent=draft
    ?'พิกัดข้อเสนอเก็บในเบราว์เซอร์นี้เท่านั้น ต้องตรวจสอบก่อนนำไปใช้จริง'
    :mapped?'จุดอ้างอิงนี้ไม่ใช่ทางเข้าอาคาร และ Google Maps ไม่ได้รับรองเส้นทางเดินในมหาวิทยาลัย':
      'ไม่เดาพิกัดอาคาร: โปรดเสนอข้อมูลพร้อมหลักฐานและให้ผู้ดูแลตรวจสอบก่อน';
  $('detail').classList.remove('hidden');
  if(mapped)focus(b);
}
function focus(b) {
  if(!state.map||!validCoordinates(b.coordinates))return;
  state.map.flyTo({center:b.coordinates,zoom:17.6,pitch:state.is3d?58:0,bearing:-28,duration:1200,essential:true});
}
function renderMarkers() {
  state.markers.forEach(m=>m.remove());state.markers=[];
  if(!state.map||!state.maplibre)return;
  for(const b of state.buildings) {
    if(!validCoordinates(b.coordinates))continue;
    const el=element('button','map-pin'+(b.location_quality==='draft-local'?' draft-pin':''),b.id);
    el.type='button';el.setAttribute('aria-label',b.id+' '+b.name_th);
    el.addEventListener('click',ev=>{ev.stopPropagation();select(b);});
    state.markers.push(new state.maplibre.Marker({element:el,anchor:'bottom'}).setLngLat(b.coordinates).addTo(state.map));
  }
}
function add3DLayer() {
  const map=state.map;
  if(!map||!map.getStyle())return;
  if(!map.getSource('openfreemap'))map.addSource('openfreemap',{type:'vector',url:'https://tiles.openfreemap.org/planet'});
  const labels=map.getStyle().layers||[];
  const before=labels.find(l=>l.type==='symbol'&&l.layout?.['text-field'])?.id;
  if(!map.getLayer('campus-building-hit'))map.addLayer({
    id:'campus-building-hit',type:'fill',source:'openfreemap','source-layer':'building',minzoom:14.8,
    paint:{'fill-color':'#58b5a8','fill-opacity':0.012}
  },before);
  if(map.getLayer('campus-3d'))map.removeLayer('campus-3d');
  // Prevent stacking the custom extrusion with existing extrusions in the base style.
  for(const layer of labels)if(layer.type==='fill-extrusion'&&layer.id!=='campus-3d')
    map.setLayoutProperty(layer.id,'visibility','none');
  if(!state.is3d)return;
  map.addLayer({id:'campus-3d',type:'fill-extrusion',source:'openfreemap',
    'source-layer':'building',minzoom:14.8,paint:{
      'fill-extrusion-color':extrusionColor(),
      'fill-extrusion-height':['interpolate',['linear'],['zoom'],14.8,0,15.6,extrusionHeight(state.heightMode)],
      'fill-extrusion-base':['max',0,['coalesce',['get','render_min_height'],0]],
      'fill-extrusion-opacity':0.87
    }},before);
}
function applyHeightMode() {
  if(state.map?.getLayer('campus-3d'))state.map.setPaintProperty('campus-3d','fill-extrusion-height',
    ['interpolate',['linear'],['zoom'],14.8,0,15.6,extrusionHeight(state.heightMode)]);
}
function cancelMapping() {
  state.mapping=null;$('map-editor-banner').classList.add('hidden');$('map').style.cursor='';
}
function onMapClick(event) {
  if(state.mapping) {
    const target=state.official.find(x=>x.id===state.mapping);
    const features=state.map.getLayer('campus-building-hit')
      ?state.map.queryRenderedFeatures(event.point,{layers:['campus-building-hit']}):[];
    try {
      const proposal=proposalFor(target,[event.lngLat.lng,event.lngLat.lat],features[0]);
      state.drafts=putDraft(state.drafts,proposal,getCodes());
      localStorage.setItem(DRAFT_STORAGE_KEY,JSON.stringify(state.drafts));
      cancelMapping();refresh();select(state.buildings.find(b=>b.id===target.id));
      toast('บันทึก '+target.id+' เป็นข้อเสนอในเครื่องนี้แล้ว ยังไม่ได้ยืนยัน');
    }catch(err){toast('บันทึกไม่สำเร็จ: '+err.message);}
    return;
  }
  const nearest=state.buildings.filter(b=>validCoordinates(b.coordinates)).map(b=>({
    building:b,distance:Math.hypot((event.lngLat.lng-b.coordinates[0])*108050,(event.lngLat.lat-b.coordinates[1])*110574)
  })).sort((a,b)=>a.distance-b.distance)[0];
  if(nearest?.distance<17)select(nearest.building);
}
async function initMap() {
  try {
    state.maplibre=await import('https://unpkg.com/maplibre-gl@6.16.0/dist/maplibre-gl.mjs');
    const map=new state.maplibre.Map({container:'map',style:STYLE_LIGHT,center:HOME,
      zoom:16,pitch:54,bearing:-20,minZoom:11,maxZoom:20,
      canvasContextAttributes:{antialias:true},attributionControl:true});
    state.map=map;
    map.on('click',onMapClick);
    map.on('style.load',()=>{try{add3DLayer();}catch(error){console.error(error);toast('แผนที่โหลดได้ แต่การแสดงอาคาร 3D ยังไม่พร้อม');}});
    map.on('load',()=>{$('map-status').textContent='แผนที่พร้อมใช้ · ข้อมูลพิกัดรอตรวจสอบ';renderMarkers();});
    map.on('error',err=>{console.warn('Map tiles error',err.error||err);$('map-status').textContent='บางส่วนของแผนที่โหลดไม่ได้';});
    map.addControl(new state.maplibre.NavigationControl({showCompass:true}),'top-right');
  }catch(err) {
    console.error(err);$('map-status').textContent='โหลดแผนที่ออนไลน์ไม่สำเร็จ';
    toast('ค้นหารายชื่ออาคารยังใช้ได้ แต่แผนที่ต้องเชื่อมต่ออินเทอร์เน็ต');
  }
}
function downloadDrafts() {
  if(!state.drafts.length)return;
  const url=URL.createObjectURL(new Blob([exportPackage(state.drafts)],{type:'application/json'}));
  const a=element('a');a.href=url;a.download='kmutt-openmap-unverified-proposals.json';
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function setupEvents() {
  $('search').addEventListener('input',renderList);
  $('height-mode').addEventListener('change',event=>{
    if(!HEIGHT_PRESETS[event.target.value])return;
    state.heightMode=event.target.value;applyHeightMode();
    toast('ความสูงเป็นภาพจำลอง ยังไม่ได้ผ่านการวัดจริง');
  });
  for(const btn of document.querySelectorAll('[data-filter]'))btn.addEventListener('click',()=>{
    state.filter=btn.dataset.filter;
    for(const b of document.querySelectorAll('[data-filter]')){
      b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));
    }
    renderList();
  });
  $('map-propose').addEventListener('click',()=>{
    if(!state.selected||!state.map){toast('ต้องโหลดแผนที่ให้สำเร็จก่อน');return;}
    state.mapping=state.selected.id;$('mapping-code').textContent=state.mapping;
    $('map-editor-banner').classList.remove('hidden');$('map').style.cursor='crosshair';
    toast('แตะตำแหน่งอาคารบนแผนที่เพื่อสร้างข้อเสนอ');
  });
  $('cancel-mapping').addEventListener('click',cancelMapping);
  $('map-delete').addEventListener('click',()=>{
    if(!state.selected)return;
    const id=state.selected.id;
    state.drafts=state.drafts.filter(p=>p.building_code!==id);
    localStorage.setItem(DRAFT_STORAGE_KEY,JSON.stringify(state.drafts));
    refresh();select(state.buildings.find(b=>b.id===id));toast('ลบข้อเสนอ '+id+' จากเครื่องแล้ว');
  });
  $('export-drafts').addEventListener('click',downloadDrafts);
  $('close-detail').addEventListener('click',()=>$('detail').classList.add('hidden'));
  $('focus-detail').addEventListener('click',()=>focus(state.selected));
  $('directions').addEventListener('click',()=>{
    const p=state.selected;
    if(!validCoordinates(p?.coordinates)||p.location_quality==='draft-local')return;
    const [lng,lat]=p.coordinates;
    const url=new URL('https://www.google.com/maps/dir/');
    url.searchParams.set('api','1');url.searchParams.set('destination',lat+','+lng);
    url.searchParams.set('travelmode','walking');window.open(url.toString(),'_blank','noopener,noreferrer');
  });
  $('toggle3d').addEventListener('click',()=>{
    state.is3d=!state.is3d;$('toggle3d').classList.toggle('active',state.is3d);
    $('toggle3d').setAttribute('aria-pressed',String(state.is3d));
    state.map?.easeTo({pitch:state.is3d?54:0,duration:700});
    if(state.map?.isStyleLoaded())add3DLayer();
  });
  $('reset-view').addEventListener('click',()=>state.map?.flyTo({center:HOME,zoom:16,pitch:state.is3d?54:0,bearing:-20,essential:true}));
  $('theme-toggle').addEventListener('click',()=>{
    state.dark=!state.dark;$('theme-toggle').textContent=state.dark?'☀':'☾';
    state.map?.setStyle(state.dark?STYLE_DARK:STYLE_LIGHT);
  });
  $('locate').addEventListener('click',()=>{
    if(!navigator.geolocation){toast('เบราว์เซอร์ไม่รองรับตำแหน่งปัจจุบัน');return;}
    navigator.geolocation.getCurrentPosition(p=>{
      const coords=[p.coords.longitude,p.coords.latitude];
      state.locationMarker?.remove();
      const dot=element('div','user-location');
      state.locationMarker=new state.maplibre.Marker({element:dot}).setLngLat(coords).addTo(state.map);
      state.map.flyTo({center:coords,zoom:17,essential:true});
      toast('ตำแหน่ง GPS เป็นค่าโดยประมาณ');
    },err=>toast(err.code===1?'ไม่ได้รับอนุญาตให้เข้าถึง GPS':'ไม่สามารถระบุตำแหน่งได้'),
    {enableHighAccuracy:true,timeout:10000,maximumAge:20000});
  });
  $('mobile-drawer').addEventListener('click',()=>{
    const collapsed=document.querySelector('.sidebar').classList.toggle('collapsed');
    $('mobile-drawer').classList.toggle('collapsed',collapsed);
    $('mobile-drawer').setAttribute('aria-expanded',String(!collapsed));
    state.map?.resize();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='/'&&document.activeElement!==$('search')){event.preventDefault();$('search').focus();}
    if(event.key==='Escape'){
      $('search').value='';renderList();$('detail').classList.add('hidden');cancelMapping();
    }
    if(event.key==='Enter'&&document.activeElement===$('search')&&state.results[0])select(state.results[0]);
  });
}
async function init() {
  setupEvents();
  try {
    const response=await fetch('./data/buildings.json',{cache:'no-cache'});
    if(!response.ok)throw new Error('HTTP '+response.status);
    const data=await response.json();
    state.official=data.buildings;
    state.drafts=readDrafts(localStorage,getCodes());
    $('count-total').textContent=String(state.official.length);
    refresh();
    await initMap();
  }catch(err){
    console.error(err);$('map-status').textContent='ไม่สามารถโหลดข้อมูลอาคาร';
    $('empty').textContent='โหลดข้อมูลไม่สำเร็จ กรุณาเปิดเว็บไซต์ผ่าน HTTP Server';
    $('empty').classList.remove('hidden');
  }
}
init();
