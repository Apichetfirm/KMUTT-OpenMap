import {validCoordinates} from './search.mjs';
export const DRAFT_STORAGE_KEY = 'kmutt-openmap-proposals-v02';
export const RECOVERY_STORAGE_KEY = DRAFT_STORAGE_KEY+'-recovery';
const MAX_DRAFTS = 100;
export function validateProposal(p, codes) {
  return !!p && typeof p==='object' && codes.includes(p.building_code) &&
    validCoordinates(p.coordinates) && p.review_status==='needs-field-verification' &&
    ['clicked-building','clicked-map'].includes(p.capture_method) &&
    typeof p.created_at==='string' && Number.isFinite(Date.parse(p.created_at)) &&
    (p.evidence===undefined || typeof p.evidence==='string' && p.evidence.length<=2000);
}
export function readDraftState(store,codes) {
  let raw=null;
  try {
    raw=store?.getItem(DRAFT_STORAGE_KEY)??null;
    if(!raw)return {drafts:[],warning:null,raw};
    const entries=JSON.parse(raw);
    if(!Array.isArray(entries))throw Error('Invalid proposal collection');
    const seen=new Set();
    const drafts=entries.filter(p=>{
      if(!validateProposal(p,codes)||seen.has(p.building_code))return false;
      seen.add(p.building_code);return true;
    }).slice(0,MAX_DRAFTS);
    return {drafts,warning:entries.length!==drafts.length?'Some proposals could not be read; original storage is preserved.':null,raw};
  }catch {return {drafts:[],warning:'Local proposals unavailable or corrupted; original storage is preserved.',raw};}
}
export const readDrafts = (store,codes) => readDraftState(store,codes).drafts;
export function saveDrafts(store,drafts,codes,expectedRaw=undefined) {
  if(!store)throw Error('Browser storage unavailable');
  if(drafts.length>MAX_DRAFTS||drafts.some(p=>!validateProposal(p,codes))||new Set(drafts.map(p=>p.building_code)).size!==drafts.length)throw Error('Invalid proposals');
  if(expectedRaw!==undefined&&store.getItem(DRAFT_STORAGE_KEY)!==expectedRaw)throw Error('Proposals changed in another tab. Copy your preview coordinates and reload before retrying; newer data was preserved.');
  // Back up unreadable or partially rejected legacy bytes BEFORE overwriting them.
  const current=readDraftState(store,codes);
  if(current.warning) {
    const raw=store.getItem(DRAFT_STORAGE_KEY);
    if(raw!==null) {
      const existing=store.getItem(RECOVERY_STORAGE_KEY);
      if(existing!==null && existing!==raw)throw Error('Recovery backup already exists; export it before replacing corrupted storage');
      store.setItem(RECOVERY_STORAGE_KEY,raw);
    }
  }
  store.setItem(DRAFT_STORAGE_KEY,JSON.stringify(drafts));
  return drafts;
}
export function putDraft(drafts,proposal,codes) {
  if(!validateProposal(proposal,codes))throw Error('Invalid draft proposal');
  return [proposal,...drafts.filter(p=>p.building_code!==proposal.building_code)].slice(0,MAX_DRAFTS);
}
export function proposalFor(building,coordinates,feature,date=new Date(),evidence='') {
  if(!validCoordinates(coordinates))throw Error('Coordinate outside KMUTT Bangmod review area');
  const height=feature?.properties?.render_height;
  return {building_code:building.id,building_name_th:building.name_th,
    coordinates:coordinates.map(v=>Number(v.toFixed(6))),
    capture_method:feature?'clicked-building':'clicked-map',
    external_feature_id:['string','number'].includes(typeof feature?.id)?String(feature.id):null,
    tile_render_height_m:typeof height==='number'&&Number.isFinite(height)&&height>0?height:null,
    review_status:'needs-field-verification',created_at:date.toISOString(),
    evidence:evidence.trim()||'User-selected approximate point; no evidence of surveyed entrance or measured height.'};
}
export function exportPackage(drafts) {
  return JSON.stringify({schema_version:'0.3.0',campus:'KMUTT Bangmod',
    warning:'UNVERIFIED location proposals. Do not merge as verified map coordinates without independent review.',proposals:drafts},null,2)+'\n';
}
