import {searchBuildings,validCoordinates} from './search.mjs';
import {validateCandidateFootprints,validateCatalog,validateFootprints,safeURL,coverage} from './data.mjs';
import {candidateRendering,HEIGHT_PRESETS} from './heights.mjs';
import {readDraftState,saveDrafts,putDraft,proposalFor,exportPackage,DRAFT_STORAGE_KEY,RECOVERY_STORAGE_KEY} from './mapping.mjs';
import {placeURL,sharedPlace,buildingURL,sharedBuilding} from './sharing.mjs';
import {PLACE_CATEGORIES,validatePlaces,filterPlaces,openingStatus} from './places.mjs';
import {HOME,STYLES,installMapLayers,applyHeights,updateSelection,cameraOptions} from './map.mjs';

import {setupCommunity} from './community-ui.mjs';
import {reviewIssueURL} from './contributions.mjs';
import {validateGraph,navigationAvailability,routeToBuilding} from './navigation.mjs';

const $=id=>document.getElementById(id);
const emptyCollection=()=>({type:'FeatureCollection',features:[]});
const state={official:[],drafts:[],results:[],selected:null,filter:'all',map:null,maplibre:null,mapReady:false,
  selectedMarker:null,previewMarker:null,locationMarker:null,is3d:true,dark:false,heightMode:'guarded',
  selectedPlace:null,candidates:emptyCollection(),candidatePreview:emptyCollection(),graph:{nodes:[],edges:[]},route:emptyCollection(),mapping:null,pending:null,footprints:emptyCollection(),places:[],visiblePlaces:[],storage:null,draftRevision:null,returnFocus:null};
const codes=()=>state.official.map(b=>b.id);
const mobile=()=>matchMedia('(max-width:670px)').matches&&!matchMedia('(min-width:541px) and (max-height:540px)').matches;
const reducedMotion=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
let toastTimer,mapPromise,mapAttempt=0;
function element(tag,cls,text) {
  const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;
}
function toast(message) {
  $('toast').textContent=message;$('toast').classList.remove('hidden');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.add('hidden'),6000);
}
function download(text,name) {
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=element('a');
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function setDrawer(collapsed) {
  if(mobile())document.querySelector('.sidebar-scroll').scrollTop=0;
  document.querySelector('.sidebar').classList.toggle('collapsed',collapsed);
  $('mobile-drawer').setAttribute('aria-expanded',String(!collapsed));
  if(collapsed&&document.querySelector('.directory-body').contains(document.activeElement))$('mobile-drawer').focus();
  document.querySelector('.directory-body').inert=mobile()&&collapsed;
}
function syncMap() {
  if(!state.mapReady)return;
  installMapLayers(state.map,state);updateSelection(state.map,state.selected);
}
function renderList() {
  state.results=searchBuildings(state.official,$('search').value,state.filter);
  $('results-label').textContent=state.results.length+' อาคาร';
  $('empty').classList.toggle('hidden',!!state.results.length);
  const fragment=document.createDocumentFragment();
  for(const b of state.results) {
    const button=element('button','place'+(state.selected?.id===b.id?' active':''));button.type='button';button.dataset.code=b.id;
    button.setAttribute('aria-pressed',String(state.selected?.id===b.id));
    const text=element('span','place-text');text.append(element('strong','',b.name_th),element('small','',b.name_en));
    button.append(element('span','place-code',b.id),text,element('span','place-end',validCoordinates(b.coordinates)?'≈':'?'));
    button.setAttribute('aria-label',`${b.id} ${b.name_th} · ${b.coordinates?'พิกัดโดยประมาณ':'ยังไม่มีพิกัด'}`);
    button.addEventListener('click',()=>select(b,{from:button}));fragment.append(button);
  }
  $('places').replaceChildren(fragment);
}
function renderDraftStatus() {
  $('draft-count').textContent=String(state.drafts.length);$('export-drafts').disabled=!state.drafts.length;
  try {$('export-recovery').classList.toggle('hidden',!state.storage?.getItem(RECOVERY_STORAGE_KEY));}catch{}
}
async function persistDrafts(next) {
  // Serialize snapshot comparison and write across tabs; never fall back to an unsafe write.
  if(!navigator.locks)throw Error('การบันทึกอย่างปลอดภัยต้องใช้เบราว์เซอร์ที่รองรับ Web Locks บน HTTPS หรือ localhost');
  const revision=state.draftRevision;
  await navigator.locks.request(DRAFT_STORAGE_KEY,()=>{
    saveDrafts(state.storage,next,codes(),revision);
    state.drafts=next;state.draftRevision=JSON.stringify(next);
  });
}
function showSource(container,label,url) {
  const link=element('a','',label),href=safeURL(url);
  if(href){link.href=href;link.target='_blank';link.rel='noopener noreferrer';container.append(link);}
}
function renderDetail() {
  const b=state.selected;if(!b)return;
  const mapped=validCoordinates(b.coordinates),draft=state.drafts.find(d=>d.building_code===b.id);
  $('detail-code').textContent=b.id;$('detail-name').textContent=b.name_th;$('detail-en').textContent=b.name_en;
  $('detail-location').textContent=mapped?'≈ พิกัดอ้างอิงโดยประมาณ · ไม่ใช่ทางเข้า':'? ยังไม่มีพิกัดที่ยืนยันตำแหน่งได้';
  $('detail-height').textContent=b.building_height_m!==null?`ความสูงที่บันทึก ${b.building_height_m} เมตร · ดูหลักฐานด้านล่าง`:
    b.floor_count!==null?`เอกสารระบุ ${b.floor_count} ชั้น · ยังไม่ทราบความสูงเป็นเมตร`:'ยังไม่ทราบความสูงจริง · ภาพ 3D อาจใช้ค่าประมาณจากไทล์';
  $('focus-detail').disabled=!mapped||!state.mapReady;$('directions').disabled=!mapped;
  $('map-propose').disabled=!state.mapReady;
  $('detail-caveat').textContent=mapped?'จุดนี้ยังไม่ผ่านการสำรวจ ทางเดินและทางเข้าสำหรับผู้ใช้วีลแชร์ยังไม่มีข้อมูลยืนยัน การนำทางภายนอกอาจไม่ตรงทางเข้าจริง':'รายชื่อยังค้นหาและแชร์ได้ โปรดเสนอพิกัดพร้อมหลักฐานเพื่อให้ผู้ดูแลตรวจสอบ';
  $('detail-conflict').classList.toggle('hidden',!b.name_conflict);
  $('detail-department').textContent=b.department||'คณะ / หน่วยงาน: ยังไม่มีข้อมูลยืนยันแยกจากชื่ออาคาร';
  $('entrance-status').textContent=b.entrances.length?`${b.entrances.length} ทางเข้าในข้อมูล · ตรวจหลักฐานก่อนเดินทาง`:'ยังไม่มีทางเข้าสาธารณะที่สำรวจยืนยัน';
  renderNavigation();
  $('detail-provenance').replaceChildren();
  showSource($('detail-provenance'),'ชื่ออาคาร: มจธ. ↗',b.name_source);
  if(mapped)showSource($('detail-provenance'),'พิกัดอ้างอิง ↗',b.location_source);
  if(b.mapping.evidence)$('detail-provenance').append(element('span','',`ตรวจแหล่งพิกัด ${b.mapping.evidence.checked_on} · ${b.mapping.confidence}`));
  if(b.mapping.unresolved_reason)$('detail-provenance').append(element('span','',b.mapping.unresolved_reason));
  if(b.floor_count_source)showSource($('detail-provenance'),'จำนวนชั้น ↗',b.floor_count_source);
  $('detail-provenance').append(element('span','',`ตรวจชื่อ ${b.name_checked_on} · สำรวจตำแหน่ง: ${b.mapping.last_verified_on||'ยังไม่ยืนยัน'}`));
  $('draft-info').textContent=draft?`◇ ข้อเสนอในเครื่อง: ${draft.coordinates[1]}, ${draft.coordinates[0]} · ยังไม่ยืนยัน`:'ยังไม่มีข้อเสนอในเครื่องสำหรับอาคารนี้';
  $('map-delete').classList.toggle('hidden',!draft);$('view-proposal').classList.toggle('hidden',!draft);
}
function select(b,{from=null,move=true,updateURL=true}={}) {
  if(!b)return;
  if(state.mapping)cancelMapping();
  if(state.selected?.id!==b.id){document.querySelector('.contribution-detail').open=false;$('share-url').classList.add('hidden');}
  state.selectedPlace=null;$('poi-detail').classList.add('hidden');state.route=emptyCollection();state.selected=b;state.returnFocus=from;renderList();renderDetail();$('detail').classList.remove('hidden');
  if(mobile())setDrawer(true);
  updateSelection(state.map,state.selected);renderSelectedMarker();
  if(updateURL)history.pushState({},'',buildingURL(location.href,b.id));
  if(move)focusBuilding(b);
  $('detail-name').focus({preventScroll:true});
}
function closeDetail() {
  if(!state.selected&&!state.selectedPlace)return;
  $('detail').classList.add('hidden');$('poi-detail').classList.add('hidden');state.selected=null;state.selectedPlace=null;state.route=emptyCollection();
  const url=new URL(location.href);url.searchParams.delete('building');url.searchParams.delete('poi');history.pushState({},'',url);
  updateSelection(state.map,null);state.selectedMarker?.remove();state.selectedMarker=null;
  renderList();syncMap();
  const button=state.returnFocus?.dataset?.code?document.querySelector(`[data-code="${state.returnFocus.dataset.code}"]`):null;
  (button||$('search')).focus({preventScroll:true});
}
function focusBuilding(b) {
  if(!state.mapReady||!validCoordinates(b?.coordinates))return;
  const options=cameraOptions(b.coordinates,{is3d:state.is3d,reducedMotion:reducedMotion(),mobile:mobile()});
  const activePanel=state.selectedPlace?$('poi-detail'):$('detail');
  if(!activePanel.classList.contains('hidden')) {
    const map=$('map').getBoundingClientRect(),detail=activePanel.getBoundingClientRect(),tools=document.querySelector('.map-tools').getBoundingClientRect();
    const sidebar=document.querySelector('.sidebar').getBoundingClientRect();
    // The selected marker is bottom-anchored: reserve its height above the camera target.
    options.padding={left:mobile()?12:sidebar.right-map.left+12,
      right:mobile()?12:map.right-detail.left+12,top:Math.max(20,tools.bottom-map.top+60),
      bottom:mobile()?Math.max(120,map.bottom-detail.top+12):20};
  }
  state.map.flyTo(options);
}
function renderSelectedMarker() {
  state.selectedMarker?.remove();state.selectedMarker=null;
  const selection=state.selected||state.selectedPlace&&{id:'POI',coordinates:state.selectedPlace.geometry.coordinates};
  if(!state.mapReady||!validCoordinates(selection?.coordinates))return;
  const b=selection,el=element('button','map-pin selected-pin',b.id+' ≈');el.type='button';
  el.setAttribute('aria-label',`${b.id} พิกัดโดยประมาณ แสดงรายละเอียด`);
  el.addEventListener('click',event=>{event.stopPropagation();state.selectedPlace?showPlace(state.selectedPlace,{updateURL:false}):select(b,{updateURL:false});});
  state.selectedMarker=new state.maplibre.Marker({element:el,anchor:'bottom'}).setLngLat(b.coordinates).addTo(state.map);
}
function refreshPlaces() {
  state.visiblePlaces=filterPlaces(state.places,{category:$('poi-category').value,query:$('poi-search').value,likelyOpen:$('poi-open').checked});
  $('poi-count').textContent=`${state.visiblePlaces.length} จาก ${state.places.length} บริการ · ข้อมูล OSM ยังไม่สำรวจยืนยัน`;
  $('poi-results').replaceChildren();
  for(const feature of state.visiblePlaces) {
    const p=feature.properties,status=openingStatus(p.opening_hours),button=element('button','poi-result');button.type='button';
    button.append(element('strong','',p.name),element('small','',`${PLACE_CATEGORIES[p.category]} · ${p.confidence==='verified'?'ยืนยันแล้ว':'โดยประมาณ'} · ${status.label}${status.stale?' · เวลาทำการเก่าเกิน 90 วัน':''}`));
    button.addEventListener('click',()=>showPlace(feature));$('poi-results').append(button);
  }
  $('poi-empty').classList.toggle('hidden',!!state.visiblePlaces.length);syncMap();
}
function showPlace(feature,{updateURL=true}={}) {
  if(!feature?.properties)return;
  if(state.mapping)cancelMapping();state.selected=null;state.selectedPlace=feature;state.route=emptyCollection();
  $('detail').classList.add('hidden');$('poi-detail').classList.remove('hidden');
  const p=feature.properties,hours=openingStatus(p.opening_hours);
  $('poi-name').textContent=p.name;$('poi-category-label').textContent=PLACE_CATEGORIES[p.category]+' · โดยประมาณ';
  $('poi-description').textContent=p.description||'จุดบริการจากข้อมูล OSM';
  $('poi-hours').textContent=hours.label+(hours.stale?' · ตารางเก่าเกิน 90 วัน โปรดตรวจสอบอีกครั้ง':'')+' · วันหยุดอาจต่างจากตาราง';
  const days=['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
  $('poi-schedule').textContent=p.opening_hours?days.map((day,i)=>day+' '+(p.opening_hours.weekly[i]===undefined?'ไม่ทราบ':p.opening_hours.weekly[i].length?p.opening_hours.weekly[i].map(pair=>pair.join('–')).join(', '):'ปิด')).join('\n'):'ยังไม่มีตารางเวลาที่ตีความได้';
  $('poi-provenance').replaceChildren();showSource($('poi-provenance'),'ข้อมูลสถานที่: OpenStreetMap ↗',p.evidence.source);
  $('poi-provenance').append(element('span','',`ดึงแหล่งข้อมูล ${p.evidence.checked_on} · แหล่งข้อมูลลงวันที่ ${p.evidence.source_date||p.evidence.source_timestamp?.slice(0,10)||'ไม่ระบุ'} · ยังไม่สำรวจยืนยัน`));
  $('poi-share-url').classList.add('hidden');$('poi-focus').disabled=!state.mapReady;
  if(mobile())setDrawer(true);renderList();updateSelection(state.map,null);renderSelectedMarker();focusBuilding({coordinates:feature.geometry.coordinates});syncMap();
  if(updateURL)history.pushState({},'',placeURL(location.href,feature.id));$('poi-name').focus({preventScroll:true});
}
function renderNavigation() {
  const availability=navigationAvailability(state.graph,state.selected);
  $('navigation-status').textContent=availability.status==='available'?'มีข้อมูลเส้นทางที่ผ่านการตรวจสอบแล้ว · ตรวจเงื่อนไขในเส้นทาง':'ยังไม่มีทางเข้าและเครือข่ายที่สำรวจยืนยัน ใช้ Google Maps ตามพิกัดอ้างอิงได้';
  $('route-origin').replaceChildren();
  for(const node of availability.origins){const option=element('option','',node.label||node.id);option.value=node.id;$('route-origin').append(option);}
  if(!availability.origins.length)$('route-origin').append(element('option','','ยังไม่มีข้อมูลที่ยืนยัน'));
  $('route-origin').disabled=availability.status!=='available';$('route-plan').disabled=availability.status!=='available';
  $('route-accessible').disabled=availability.status!=='available';$('route-result').textContent='';
}
function externalDirections(coordinates) {
  if(!validCoordinates(coordinates))return;const [lng,lat]=coordinates,url=new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api','1');url.searchParams.set('destination',`${lat},${lng}`);url.searchParams.set('travelmode','walking');window.open(url.href,'_blank','noopener,noreferrer');
}
async function copyLink(url,input) {
  try {await navigator.clipboard.writeText(url);toast('คัดลอกลิงก์แล้ว');}
  catch {input.value=url;input.classList.remove('hidden');input.select();toast('คัดลอกลิงก์จากช่องข้อความได้');}
}
function renderQuality(report) {
  const labels={total_buildings:'อาคารทั้งหมด',buildings_with_coordinates:'พิกัดอ้างอิง',buildings_without_coordinates:'ยังไม่มีพิกัด',candidate_footprints:'รูปทรงรอตรวจ',accepted_footprints:'รูปทรงรับรอง',field_verified_footprints:'รูปทรงสำรวจยืนยัน',documented_floor_counts:'จำนวนชั้นมีเอกสาร',measured_heights:'ความสูงวัดจริง',estimated_render_heights:'ความสูงประมาณเฉพาะอาคาร',verified_entrances:'ทางเข้าสำรวจยืนยัน',candidate_pedestrian_paths:'เส้นทางรอสำรวจ',verified_pedestrian_paths:'เส้นทางยืนยัน',total_pois:'บริการ OSM',verified_pois:'บริการสำรวจยืนยัน',pois_with_recorded_hours:'บริการมีตารางเวลา'};
  $('quality-metrics').replaceChildren();for(const [key,label] of Object.entries(labels)){const row=element('div','quality-metric');row.append(element('span','',label),element('strong','',String(report[key])));$('quality-metrics').append(row);}
  $('unresolved-buildings').replaceChildren(element('p','','อาคารที่ยังมีข้อสงสัยด้านตำแหน่ง / ชื่อ'));
  for(const item of report.unresolved_buildings){const b=state.official.find(b=>b.id===item.id);if(!b)continue;const button=element('button','',item.id+' · '+b.name_th);button.type='button';button.title=item.reason;button.addEventListener('click',()=>select(b));$('unresolved-buildings').append(button);}
}
function cancelMapping() {
  state.mapping=null;state.pending=null;state.candidatePreview=emptyCollection();syncMap();state.previewMarker?.remove();state.previewMarker=null;
  $('map-editor-banner').classList.add('hidden');$('map').style.cursor='';$('confirm-mapping').disabled=true;
}
function previewPoint(coordinates,feature) {
  if(!state.mapping)return;
  try {
    const b=state.official.find(b=>b.id===state.mapping);
    state.pending=proposalFor(b,coordinates,feature,new Date(),$('proposal-evidence').value);
    if(feature?.properties?.review_status==='candidate-needs-independent-review'){state.pending.candidate_footprint_id=feature.id;state.pending.source_url=feature.properties.evidence.source;const rendering=candidateRendering(feature,b);state.candidatePreview={type:'FeatureCollection',features:[{...feature,properties:{...feature.properties,preview_height:rendering.render_height_m}}]};$('candidate-source').append(element('span','',`ภาพร่าง: ${rendering.render_height_m.toFixed(1)} ม. · ${rendering.kind} · ${rendering.levels?rendering.levels+' ชั้น × 3.2 ม. (สมมติฐาน)':'ค่าจำลอง 4 ม.'} · ไม่ใช่ความสูงวัดจริง`));}
    else {state.candidatePreview=emptyCollection();$('candidate-footprint').value='';$('candidate-source').replaceChildren();}
    syncMap();
    $('proposal-lng').value=state.pending.coordinates[0];$('proposal-lat').value=state.pending.coordinates[1];
    $('proposal-preview').textContent=`ดูตัวอย่าง ${b.id}: ${state.pending.coordinates[1]}, ${state.pending.coordinates[0]} · ยังไม่ได้บันทึก`;
    state.previewMarker?.remove();
    const el=element('div','preview-pin','◇ '+b.id+' ข้อเสนอ');
    state.previewMarker=new state.maplibre.Marker({element:el}).setLngLat(state.pending.coordinates).addTo(state.map);
    $('confirm-mapping').disabled=false;
  }catch(error){state.pending=null;$('confirm-mapping').disabled=true;toast(error.message);}
}
function onMapClick(event) {
  if(state.mapping) {
    const features=state.map.getLayer('campus-building-hit')?state.map.queryRenderedFeatures(event.point,{layers:['campus-building-hit']}):[];
    previewPoint([event.lngLat.lng,event.lngLat.lat],features[0]);return;
  }
  const features=state.map.queryRenderedFeatures(event.point,{layers:['campus-labels','campus-poi','campus-poi-clusters'].filter(id=>state.map.getLayer(id))});
  const hit=features[0];if(!hit)return;
  if(hit.layer.id==='campus-poi-clusters') {
    state.map.getSource('campus-places').getClusterExpansionZoom(hit.properties.cluster_id).then(zoom=>state.map.easeTo({center:hit.geometry.coordinates,zoom,duration:reducedMotion()?0:500})).catch(()=>toast('ไม่สามารถขยายกลุ่มสถานที่ได้'));return;
  }
  if(hit.layer.id==='campus-labels')select(state.official.find(b=>b.id===hit.properties.id));
  else {const place=state.places.find(f=>String(f.id)===String(hit.properties.place_id||hit.id));if(place)showPlace(place);}
}
async function initMap() {
  if(mapPromise)return mapPromise;
  const attempt=mapAttempt++;
  const watchdog=setTimeout(()=>{if(attempt===mapAttempt-1&&!state.mapReady){$('map-status').textContent='แผนที่ใช้เวลาโหลดนาน · ยังค้นหารายชื่อได้';$('retry-map').classList.remove('hidden');}},15000);
  mapPromise=(async()=>{
    try {
      const runtime=await import(`../vendor/maplibre-gl/maplibre-gl.mjs${attempt?'?retry='+attempt:''}`);
      if(attempt!==mapAttempt-1)return;state.maplibre=runtime;
      const map=new state.maplibre.Map({container:'map',style:state.dark?STYLES.dark:STYLES.light,center:HOME,zoom:16,pitch:state.is3d?48:0,bearing:-20,minZoom:11,maxZoom:20,
        canvasContextAttributes:{antialias:!mobile()},attributionControl:{compact:matchMedia('(max-width:900px)').matches}});state.map=map;
      map.on('click',onMapClick);
      map.on('style.load',()=>{
        if(state.map!==map)return;
        try {clearTimeout(watchdog);state.mapReady=true;syncMap();renderDetail();renderSelectedMarker();setMapControls(true);focusBuilding(state.selected||state.selectedPlace&&{coordinates:state.selectedPlace.geometry.coordinates});if(state.selectedPlace)$('poi-focus').disabled=false;
          $('map-status').textContent='แผนที่พร้อมใช้ · ตำแหน่งยังรอตรวจสอบ';$('retry-map').classList.add('hidden');
        }catch(error){state.mapReady=false;setMapControls(false);$('map-status').textContent='การแสดงแผนที่ยังไม่พร้อม';$('retry-map').classList.remove('hidden');toast('ค้นหารายชื่อยังใช้ได้ โปรดลองโหลดแผนที่ใหม่');}
      });
      map.on('error',()=>{$('map-status').textContent='บางส่วนของแผนที่โหลดไม่ได้ · รายชื่อยังค้นหาได้';$('retry-map').classList.remove('hidden');});
      map.addControl(new state.maplibre.NavigationControl({showCompass:true}),'top-left');
      map.once('load',()=>{performance.mark('openmap-map-loaded');});
    }catch {
      if(attempt!==mapAttempt-1)return;state.mapReady=false;setMapControls(false);$('map-status').textContent='โหลดแผนที่ไม่ได้ · ยังค้นหาและแชร์อาคารได้';$('retry-map').classList.remove('hidden');
    }
    finally {if(state.mapReady||!state.map)clearTimeout(watchdog);}
  })();return mapPromise;
}
function setMapControls(enabled) {
  for(const id of ['toggle3d','reset-view','theme-toggle','locate','height-mode'])$(id).disabled=!enabled;
  $('poi-focus').disabled=!enabled;renderDetail();
}
async function fetchJSON(path) {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try {const response=await fetch(path,{cache:'no-cache',signal:controller.signal});if(!response.ok)throw Error(`HTTP ${response.status}`);return await response.json();}
  finally {clearTimeout(timer);}
}
async function loadData() {
  $('retry-data').classList.add('hidden');
  try {
    const data=await fetchJSON('./data/buildings.json'),errors=validateCatalog(data.buildings);
    if(errors.length)throw Error(errors.join('; '));state.official=data.buildings;
    try {state.storage=localStorage;}catch{state.storage=null;}
    const saved=readDraftState(state.storage,codes());state.drafts=saved.drafts;state.draftRevision=saved.raw;
    if(saved.warning||!state.storage){$('storage-warning').textContent='ข้อเสนอในเครื่องอ่านไม่ได้ ข้อมูลเดิมจะถูกเก็บไว้เมื่อบันทึกใหม่ หรือส่งออกสำเนากู้คืนได้';$('storage-warning').classList.remove('hidden');}
    $('count-total').textContent=String(state.official.length);renderList();renderDraftStatus();performance.mark('openmap-catalog-ready');
    const shared=sharedBuilding(location.href,state.official);
    if(shared.building)select(shared.building,{updateURL:false});else if(shared.requested)toast('ไม่พบรหัสอาคารในลิงก์: '+shared.requested);
    const report=coverage(state.official,state.footprints);$('coverage').textContent=`${report.total} อาคาร · ${report.coordinates} พิกัดโดยประมาณ · ${report.unmapped} ยังไม่ทราบตำแหน่ง`;
    // Optional collections must never block the core map, or each other.
    initMap();
    fetchJSON('./data/building-footprints.geojson').then(data=>{
      if(validateFootprints(data,state.official).length)throw Error('Invalid footprints');
      state.footprints=data;syncMap();
    }).catch(()=>toast('ข้อมูลรูปทรงอาคารไม่พร้อม จึงยังไม่แสดงรูปทรงที่จับคู่กับรหัส'));
    fetchJSON('./data/places.geojson').then(data=>{
      if(validatePlaces(data,codes()).length)throw Error('Invalid places');
      state.places=data.features;refreshPlaces();const shared=sharedPlace(location.href,state.places);if(shared.place)showPlace(shared.place,{updateURL:false});else if(shared.requested)toast('ไม่พบบริการในลิงก์: '+shared.requested);
    }).catch(()=>{$('poi-empty').textContent='โหลดข้อมูลบริการไม่ได้ โปรดลองใหม่ภายหลัง';$('poi-empty').classList.remove('hidden');});
    fetchJSON('./data/building-footprint-candidates.geojson').then(data=>{if(validateCandidateFootprints(data,codes()).length)throw Error('Invalid candidates');state.candidates=data;}).catch(()=>toast('รูปทรงรอตรวจโหลดไม่ได้ ยังเสนอพิกัดได้'));
    fetchJSON('./data/coverage-report.json').then(renderQuality).catch(()=>$('quality-metrics').textContent='รายงานไม่พร้อม ลองโหลดหน้าใหม่');
    fetchJSON('./data/pedestrian-graph.json').then(graph=>{if(validateGraph(graph,{footprints:state.footprints.features}).length)throw Error('Invalid graph');state.graph=graph;renderNavigation();}).catch(()=>{state.graph={nodes:[],edges:[]};renderNavigation();});
  }catch(error) {
    $('map-status').textContent='โหลดข้อมูลอาคารไม่ได้';$('empty').textContent='โหลดรายชื่อไม่สำเร็จ โปรดตรวจการเชื่อมต่อแล้วลองใหม่';$('empty').classList.remove('hidden');$('retry-data').classList.remove('hidden');
  }
}
function setupEvents() {
  $('search').addEventListener('input',()=>{setDrawer(false);renderList();});
  $('search').addEventListener('focus',()=>{setDrawer(false);if(mobile()){$('detail').classList.add('hidden');$('poi-detail').classList.add('hidden');}});
  for(const button of document.querySelectorAll('[data-filter]'))button.addEventListener('click',()=>{
    state.filter=button.dataset.filter;
    for(const b of document.querySelectorAll('[data-filter]')){b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));}renderList();
  });
  $('close-poi').addEventListener('click',closeDetail);
  $('poi-focus').addEventListener('click',()=>focusBuilding({coordinates:state.selectedPlace?.geometry.coordinates}));
  $('poi-directions').addEventListener('click',()=>externalDirections(state.selectedPlace?.geometry.coordinates));
  $('poi-share').addEventListener('click',()=>{if(state.selectedPlace)copyLink(placeURL(location.href,state.selectedPlace.id),$('poi-share-url'));});
  $('route-plan').addEventListener('click',()=>{
    const route=routeToBuilding(state.graph,$('route-origin').value,state.selected,{accessible:$('route-accessible').checked,footprints:state.footprints.features});
    state.route=route.status==='ok'?{type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:route.geometry}]}:emptyCollection();syncMap();
    $('route-result').textContent=route.status==='ok'?`${Math.round(route.distance_m)} เมตร · ประมาณ ${Math.ceil(route.estimated_seconds/60)} นาที · ${route.confidence}`:'ไม่มีเส้นทางที่ผ่านเงื่อนไขและหลักฐานเพียงพอ';
  });
  $('close-detail').addEventListener('click',closeDetail);
  $('focus-detail').addEventListener('click',()=>focusBuilding(state.selected));
  $('share-building').addEventListener('click',async()=>{
    if(!state.selected)return;const url=buildingURL(location.href,state.selected.id);
    try {await navigator.clipboard.writeText(url);toast('คัดลอกลิงก์อาคารแล้ว');}
    catch {$('share-url').value=url;$('share-url').classList.remove('hidden');$('share-url').select();toast('คัดลอกลิงก์จากช่องข้อความได้');}
  });
  $('directions').addEventListener('click',()=>externalDirections(state.selected?.coordinates));
  $('map-propose').addEventListener('click',()=>{
    if(!state.selected||!state.mapReady)return;
    const b=state.selected;state.mapping=b.id;state.pending=null;$('mapping-code').textContent=b.id;
    const old=state.drafts.find(d=>d.building_code===b.id);$('proposal-evidence').value=old?.evidence||'';
    $('candidate-footprint').replaceChildren(element('option','','เลือกจุดบนแผนที่หรือกรอกพิกัด'));
    for(const f of state.candidates.features.filter(f=>f.properties.building_code===b.id)){const o=element('option','',f.properties.osm_name+' · รอตรวจสอบ');o.value=f.id;$('candidate-footprint').append(o);}
    $('candidate-source').replaceChildren();$('proposal-lng').value=old?.coordinates[0]??'';$('proposal-lat').value=old?.coordinates[1]??'';$('proposal-preview').textContent='แตะบนแผนที่ หรือกรอกพิกัด แล้วดูตัวอย่างก่อนยืนยัน';
    $('confirm-mapping').disabled=true;$('map-editor-banner').classList.remove('hidden');$('map').style.cursor='crosshair';
    if(mobile()){$('detail').classList.add('hidden');setDrawer(true);}
    $('proposal-lat').focus({preventScroll:true});
  });
  $('candidate-footprint').addEventListener('change',()=>{
    const f=state.candidates.features.find(f=>f.id===$('candidate-footprint').value);$('candidate-source').replaceChildren();
    if(!f){state.candidatePreview=emptyCollection();state.pending=null;$('confirm-mapping').disabled=true;syncMap();return;}
    showSource($('candidate-source'),'แหล่งรูปทรง OSM · ยังไม่รับรอง ↗',f.properties.evidence.source);
    $('proposal-evidence').value=`Candidate ${f.id}; ${f.properties.evidence.association_basis}`;previewPoint(f.properties.reference_point,f);focusBuilding({coordinates:f.properties.reference_point});
  });
  $('mapping-github').addEventListener('click',()=>{
    const draft=state.drafts.find(d=>d.building_code===state.selected?.id);if(!draft){toast('บันทึกข้อเสนอในเครื่องก่อนเตรียมส่ง');return;}
    window.open(reviewIssueURL({title:`[Mapping] ${draft.building_code} location proposal`,body:exportPackage([draft])}),'_blank','noopener,noreferrer');
  });
  $('preview-coordinates').addEventListener('click',()=>previewPoint([Number($('proposal-lng').value),Number($('proposal-lat').value)]));
  $('cancel-mapping').addEventListener('click',()=>{cancelMapping();if(state.selected){$('detail').classList.remove('hidden');$('map-propose').focus();}});
  $('proposal-form').addEventListener('submit',async event=>{
    event.preventDefault();if(!state.pending)return;
    try {
      // Changing inputs after preview must require another preview.
      if(Number($('proposal-lng').value)!==state.pending.coordinates[0]||Number($('proposal-lat').value)!==state.pending.coordinates[1])throw Error('โปรดดูตัวอย่างพิกัดใหม่ก่อนยืนยัน');
      const proposal={...state.pending,evidence:$('proposal-evidence').value.trim().slice(0,2000)||state.pending.evidence};
      const next=putDraft(state.drafts,proposal,codes());await persistDrafts(next);
      cancelMapping();renderDraftStatus();syncMap();renderDetail();$('detail').classList.remove('hidden');toast('บันทึกข้อเสนอในเครื่องแล้ว · ตำแหน่งเผยแพร่ยังรอตรวจสอบ');
    }catch(error){toast('บันทึกไม่สำเร็จ: '+error.message);}
  });
  for(const id of ['proposal-lng','proposal-lat'])$(id).addEventListener('input',()=>{$('confirm-mapping').disabled=true;});
  $('map-delete').addEventListener('click',async()=>{
    try {const next=state.drafts.filter(d=>d.building_code!==state.selected?.id);await persistDrafts(next);renderDraftStatus();renderDetail();syncMap();toast('ลบข้อเสนอในเครื่องแล้ว');}
    catch(error){toast('ลบไม่สำเร็จ: '+error.message);}
  });
  $('view-proposal').addEventListener('click',()=>{
    const p=state.drafts.find(d=>d.building_code===state.selected?.id);if(p)focusBuilding({coordinates:p.coordinates});
  });
  $('export-drafts').addEventListener('click',()=>download(exportPackage(state.drafts),'kmutt-openmap-unverified-proposals.json'));
  $('export-recovery').addEventListener('click',()=>{try {download(state.storage.getItem(RECOVERY_STORAGE_KEY)||'','kmutt-openmap-storage-recovery.json');}catch{toast('อ่านสำเนากู้คืนไม่ได้');}});
  $('height-mode').addEventListener('change',event=>{if(HEIGHT_PRESETS[event.target.value]){state.heightMode=event.target.value;applyHeights(state.map,state.heightMode);}});
  $('toggle3d').addEventListener('click',()=>{
    state.is3d=!state.is3d;$('toggle3d').classList.toggle('active',state.is3d);$('toggle3d').setAttribute('aria-pressed',String(state.is3d));
    state.map?.easeTo({pitch:state.is3d?48:0,duration:reducedMotion()?0:600});syncMap();
  });
  $('reset-view').addEventListener('click',()=>state.map?.flyTo({...cameraOptions(HOME,{is3d:state.is3d,reducedMotion:reducedMotion(),mobile:mobile()}),zoom:16}));
  $('theme-toggle').addEventListener('click',()=>{
    state.dark=!state.dark;$('theme-toggle').textContent=state.dark?'☀':'☾';$('theme-toggle').setAttribute('aria-pressed',String(state.dark));
    state.mapReady=false;setMapControls(false);state.map?.setStyle(state.dark?STYLES.dark:STYLES.light);
  });
  $('locate').addEventListener('click',()=>{
    if(!state.mapReady||!state.maplibre)return;
    if(!navigator.geolocation){toast('เบราว์เซอร์ไม่รองรับ GPS');return;}
    navigator.geolocation.getCurrentPosition(position=>{
      const coordinates=[position.coords.longitude,position.coords.latitude];
      if(!validCoordinates(coordinates)){toast('ตำแหน่งอยู่นอกพื้นที่บางมด หรือ GPS คลาดเคลื่อน');return;}
      if(!state.mapReady)return;
      state.locationMarker?.remove();state.locationMarker=new state.maplibre.Marker({element:element('div','user-location')}).setLngLat(coordinates).addTo(state.map);
      focusBuilding({coordinates});toast('GPS โดยประมาณ · ไม่บันทึกหรือส่งตำแหน่งไปยังโครงการ');
    },error=>toast(error.code===1?'ไม่ได้รับอนุญาตให้เข้าถึง GPS':'ไม่สามารถระบุตำแหน่งได้'),{enableHighAccuracy:true,timeout:10000,maximumAge:20000});
  });
  $('retry-map').addEventListener('click',()=>{
    if(state.map)state.map.remove();state.map=null;state.mapReady=false;state.selectedMarker=null;state.previewMarker=null;state.locationMarker=null;cancelMapping();mapPromise=null;initMap();
  });
  $('retry-data').addEventListener('click',loadData);
  $('poi-search').addEventListener('input',refreshPlaces);$('poi-category').addEventListener('change',refreshPlaces);$('poi-open').addEventListener('change',refreshPlaces);
  $('suggest-place').addEventListener('click',()=>{
    const url=new URL('https://github.com/Apichetfirm/KMUTT-OpenMap/issues/new');url.searchParams.set('template','place-data.yml');window.open(url,'_blank','noopener,noreferrer');
  });
  $('mobile-drawer').addEventListener('click',()=>setDrawer(!document.querySelector('.sidebar').classList.contains('collapsed')));
  window.addEventListener('resize',()=>{setDrawer(document.querySelector('.sidebar').classList.contains('collapsed'));state.map?.resize();focusBuilding(state.selected||state.selectedPlace&&{coordinates:state.selectedPlace.geometry.coordinates});});
  window.addEventListener('popstate',()=>{
    const poi=sharedPlace(location.href,state.places);if(poi.place){showPlace(poi.place,{updateURL:false});return;}
    const shared=sharedBuilding(location.href,state.official);
    if(shared.building)select(shared.building,{updateURL:false});else {state.route=emptyCollection();state.selectedPlace=null;$('poi-detail').classList.add('hidden');state.selected=null;$('detail').classList.add('hidden');renderSelectedMarker();updateSelection(state.map,null);renderList();if(shared.requested)toast('ไม่พบรหัสอาคารในลิงก์');}
  });
  window.addEventListener('offline',()=>{$('map-status').textContent='ออฟไลน์ · ค้นหารายชื่อที่โหลดแล้วได้';});
  window.addEventListener('online',()=>toast('เชื่อมต่อแล้ว · หากแผนที่ขาดหายให้กดโหลดใหม่'));
  document.addEventListener('keydown',event=>{
    if($('community-dialog').open)return;
    const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
    if(event.key==='/'&&!typing){event.preventDefault();setDrawer(false);$('search').focus();}
    if(event.key==='Escape'){if(state.mapping){cancelMapping();$('detail').classList.remove('hidden');$('map-propose').focus();}else closeDetail();}
    if(event.key==='Enter'&&document.activeElement===$('search')&&state.results[0]){event.preventDefault();select(state.results[0]);}
    if(event.key==='ArrowDown'&&document.activeElement===$('search')){event.preventDefault();document.querySelector('.place')?.focus();}
  });
}
for(const [value,label] of Object.entries(PLACE_CATEGORIES)){const o=element('option','',label);o.value=value;$('poi-category').append(o);}
setupCommunity({toast,download,getContext:()=>({type:state.selectedPlace?'opening-hours':'building-correction',target:state.selectedPlace?.id||state.selected?.id||'',title:state.selectedPlace?.properties.name||state.selected?.name_th||''})});
setInterval(()=>{if(!document.hidden&&state.places.length)refreshPlaces();},60000);
setupEvents();setMapControls(false);loadData();
