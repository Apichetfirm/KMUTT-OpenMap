import {validCoordinates} from './search.mjs';
export const DRAFT_STORAGE_KEY = 'kmutt-openmap-proposals-v02';
const MAX_DRAFTS = 100;
export function validateProposal(p, codes) {
  if (!p || typeof p !== 'object' || !codes.includes(p.building_code)) return false;
  if (!validCoordinates(p.coordinates) || p.review_status !== 'needs-field-verification') return false;
  if (!['clicked-building','clicked-map'].includes(p.capture_method)) return false;
  if (typeof p.created_at !== 'string' || Number.isNaN(Date.parse(p.created_at))) return false;
  return true;
}
export function readDrafts(store, codes) {
  try {
    const entries = JSON.parse(store?.getItem(DRAFT_STORAGE_KEY) || '[]');
    if (!Array.isArray(entries)) return [];
    const seen = new Set();
    return entries.filter(p => {
      if (!validateProposal(p,codes) || seen.has(p.building_code)) return false;
      seen.add(p.building_code); return true;
    }).slice(0,MAX_DRAFTS);
  } catch { return []; }
}
export function putDraft(drafts, proposal, codes) {
  if (!validateProposal(proposal, codes)) throw Error('Invalid draft proposal');
  return [proposal, ...drafts.filter(p=>p.building_code !== proposal.building_code)].slice(0,MAX_DRAFTS);
}
export function proposalFor(building, coordinates, feature, date = new Date()) {
  if (!validCoordinates(coordinates)) throw new Error('Coordinate outside KMUTT Bangmod review area');
  const props = feature?.properties ?? {};
  const height = Number(props.render_height);
  return {
    building_code:building.id,
    building_name_th:building.name_th,
    coordinates:coordinates.map(v=>Number(v.toFixed(6))),
    capture_method:feature ? 'clicked-building':'clicked-map',
    external_feature_id: typeof feature?.id === 'number' || typeof feature?.id === 'string' ? String(feature.id):null,
    tile_render_height_m:Number.isFinite(height) && height > 0 ? height:null,
    review_status:'needs-field-verification',
    created_at:date.toISOString(),
    evidence:'User-selected approximate point; no evidence of surveyed entrance or measured height.'
  };
}
export function exportPackage(drafts) {
  return JSON.stringify({schema_version:'0.2.0', campus:'KMUTT Bangmod',
    warning:'UNVERIFIED location proposals. Do not merge as verified map coordinates without independent review.',
    proposals:drafts},null,2)+'\n';
}
