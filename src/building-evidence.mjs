import {safeURL,validDate} from './data.mjs';
import {validCoordinates} from './search.mjs';
export const IMAGE_LICENSES=['CC0-1.0','CC-BY-4.0','CC-BY-SA-4.0','CC-BY-3.0','CC-BY-SA-3.0'];
export const mediaPath=s=>typeof s==='string'&&/^\.\/assets\/buildings\/[a-zA-Z0-9_-]+-(320|640|960)\.(webp|avif)$/.test(s);
export function validPhoto(p){return !!p&&typeof p.id==='string'&&typeof p.alt==='string'&&!!p.alt.trim()&&mediaPath(p.src)&&IMAGE_LICENSES.includes(p.license)&&!!safeURL(p.source)&&typeof p.photographer==='string'&&!!p.photographer.trim()&&typeof p.attribution==='string'&&!!p.attribution.trim()&&validDate(p.checked_on)&&p.review_status==='approved-for-publication'&&typeof p.reviewer==='string'&&!!p.reviewer.trim()&&validDate(p.reviewed_on)&&Number.isInteger(p.width)&&p.width>0&&Number.isInteger(p.height)&&p.height>0&&(p.capture_date===null||validDate(p.capture_date))&&(p.camera_coordinates===null||validCoordinates(p.camera_coordinates))&&(p.camera_heading===null||Number.isFinite(p.camera_heading)&&p.camera_heading>=0&&p.camera_heading<360)&&Array.isArray(p.variants)&&p.variants.every(v=>mediaPath(v.src)&&Number.isInteger(v.width)&&v.width>0);}
export function validateMedia(data,codes){
 if(data?.schema_version!=='0.5.0'||!Array.isArray(data.buildings))return ['Invalid building media index'];
 const errors=[],ids=new Set();for(const b of data.buildings){if(!codes.includes(b.building_code)||ids.has(b.building_code))errors.push('Unknown/duplicate media building');ids.add(b.building_code);if(!Array.isArray(b.gallery)||b.gallery.some(p=>!validPhoto(p))||b.photo!==null&&!validPhoto(b.photo))errors.push(`${b.building_code}: unlicensed or invalid published image`);if(!Array.isArray(b.references)||b.references.some(r=>!safeURL(r.source)))errors.push('Invalid source reference');}
 if(ids.size!==codes.length)errors.push('Media coverage must explicitly cover every code');return errors;
}
/** Opens Google's official viewer search; no assertion about panorama coverage or identity. */
export function streetViewURL(coordinates){if(!validCoordinates(coordinates))return null;const u=new URL('https://www.google.com/maps/@');u.searchParams.set('api','1');u.searchParams.set('map_action','pano');u.searchParams.set('viewpoint',`${coordinates[1]},${coordinates[0]}`);return u.href;}
export function validObservation(o,photos){return !!o&&photos.some(p=>p.id===o.photo_id&&validPhoto(p))&&typeof o.model==='string'&&!!o.model.trim()&&typeof o.model_version==='string'&&!!o.model_version.trim()&&validDate(o.analyzed_on)&&typeof o.sign_text==='string'&&Array.isArray(o.features)&&o.features.every(s=>typeof s==='string'&&s.length<=300)&&(o.visible_floors===null||Number.isInteger(o.visible_floors)&&o.visible_floors>0)&&typeof o.uncertainty==='string'&&!!o.uncertainty.trim();}
export function proposeMatches(buildings,footprints,photos,observations){
 if(observations.some(o=>!validObservation(o,photos)))throw Error('Observations need licensed reviewed image provenance and model/version/date/uncertainty');
 const matches=observations.flatMap(o=>buildings.map(b=>{
  const text=o.sign_text.toLowerCase(),names=[b.name_th,b.name_en,...b.aliases].filter(s=>s.length>=3);
  const signMatch=names.some(n=>text.includes(n.toLowerCase()))||new RegExp(`(^|[^a-z0-9])${b.id}($|[^a-z0-9])`,'i').test(text);
  if(!signMatch)return null;
  const conflict=b.floor_count!==null&&o.visible_floors!==null&&b.floor_count!==o.visible_floors;
  return {building_code:b.id,photo_id:o.photo_id,observation:o,footprint_candidates:footprints.features.filter(f=>f.properties.building_code===b.id).map(f=>f.id),review_status:'needs-independent-review',confidence:'unverified',explanation:'Visible reported sign text matches a directory name/code. Existing named GIS candidates are context only; image similarity does not verify coordinates.',conflicts:conflict?['Visible floor estimate differs from documented count; perspective/occlusion may explain it.']:[],uncertainty:o.uncertainty,coordinates_verified:false,height_measured:false};
 }).filter(Boolean));
 return matches.map(m=>({...m,ambiguous:matches.filter(other=>other.photo_id===m.photo_id).length>1}));
}
export function reviewDecision({building_code,decision,reviewer,survey_reviewer=null,notes,source_refs=[]}){
 if(!/^[NS][1-9]\d?$/.test(building_code)||!['accept-for-pr-review','reject','request-evidence'].includes(decision)||!reviewer?.trim()||!notes?.trim()||reviewer.trim()===survey_reviewer?.trim()||!source_refs.length||source_refs.some(s=>!safeURL(s)))throw Error('Decision requires independent reviewer, evidence URLs and rationale');
 return {building_code,decision,reviewer:reviewer.trim(),notes:notes.trim(),source_refs,recorded_at:new Date().toISOString(),publication_status:'not-published',requires_independent_pr_approval:true};
}
