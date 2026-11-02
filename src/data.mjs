import {validCoordinates} from './search.mjs';

export const CONFIDENCE = ['verified','high-confidence','approximate','unverified','conflicting'];
export const validCode = id => typeof id === 'string' && /^[NS][1-9]\d?$/.test(id);
export const safeURL = value => {
  try { const u=new URL(value); return ['https:','http:'].includes(u.protocol) && !u.username && !u.password ? u.href : null; }
  catch { return null; }
};
export const validDate = s => typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0,10)===s;
export function validEvidence(e) {
  return !!e && safeURL(e.source) && typeof e.license==='string' && !!e.license.trim() &&
    typeof e.method==='string' && !!e.method.trim() && validDate(e.checked_on);
}
export function verifiedEvidence(e) {
  return validEvidence(e) && e.method==='field-survey' && validDate(e.verified_on) &&
    typeof e.reviewer==='string' && !!e.reviewer.trim();
}
const equal = (a,b) => a[0]===b[0] && a[1]===b[1];
const cross = (a,b,c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const onSegment = (a,b,c) => Math.abs(cross(a,b,c))<1e-12 && c[0]>=Math.min(a[0],b[0])-1e-12 &&
  c[0]<=Math.max(a[0],b[0])+1e-12 && c[1]>=Math.min(a[1],b[1])-1e-12 && c[1]<=Math.max(a[1],b[1])+1e-12;
function intersects(a,b,c,d) {
  return (cross(a,b,c)*cross(a,b,d)<0 && cross(c,d,a)*cross(c,d,b)<0) ||
    onSegment(a,b,c)||onSegment(a,b,d)||onSegment(c,d,a)||onSegment(c,d,b);
}
export function pointInRing(point,ring) {
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const a=ring[i],b=ring[j];
    if(onSegment(a,b,point))return true;
    if((a[1]>point[1])!==(b[1]>point[1]) && point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
function validRing(ring) {
  if(!Array.isArray(ring)||ring.length<4||!ring.every(validCoordinates)||!equal(ring[0],ring.at(-1)))return false;
  let area=0;
  for(let i=0;i<ring.length-1;i++) {
    if(equal(ring[i],ring[i+1]))return false;
    area+=(ring[i][0]-ring[0][0])*(ring[i+1][1]-ring[0][1])-(ring[i+1][0]-ring[0][0])*(ring[i][1]-ring[0][1]);
    for(let j=i+2;j<ring.length-1;j++) {
      if(i===0&&j===ring.length-2)continue;
      if(intersects(ring[i],ring[i+1],ring[j],ring[j+1]))return false;
    }
  }
  return Math.abs(area)>1e-12;
}
function ringsIntersect(a,b) {
  return a.slice(0,-1).some((p,i)=>b.slice(0,-1).some((q,j)=>intersects(p,a[i+1],q,b[j+1])));
}
function validPolygon(rings) {
  if(!Array.isArray(rings)||!rings.length||!rings.every(validRing))return false;
  for(let i=1;i<rings.length;i++) {
    if(!pointInRing(rings[i][0],rings[0])||ringsIntersect(rings[i],rings[0]))return false;
    for(let j=1;j<i;j++)if(ringsIntersect(rings[i],rings[j])||pointInRing(rings[i][0],rings[j])||pointInRing(rings[j][0],rings[i]))return false;
  }
  return true;
}
export function validGeometry(g) {
  if(g?.type==='Polygon')return validPolygon(g.coordinates);
  if(g?.type==='MultiPolygon') {
    if(!Array.isArray(g.coordinates)||!g.coordinates.length||!g.coordinates.every(validPolygon))return false;
    return g.coordinates.every((p,i)=>g.coordinates.slice(0,i).every(q=>!ringsIntersect(p[0],q[0])&&!pointInRing(p[0][0],q[0])&&!pointInRing(q[0][0],p[0])));
  }
  return false;
}
export function pointInGeometry(point,g) {
  const polygons=g?.type==='Polygon'?[g.coordinates]:g?.type==='MultiPolygon'?g.coordinates:[];
  return polygons.some(r=>pointInRing(point,r[0])&&!r.slice(1).some(h=>pointInRing(point,h)));
}
export function pathIntersectsGeometry(path,g) {
  const polygons=g?.type==='Polygon'?[g.coordinates]:g?.type==='MultiPolygon'?g.coordinates:[];
  return path.some(p=>pointInGeometry(p,g))||path.slice(1).some((b,i)=>polygons.some(rings=>rings.some(r=>r.slice(1).some((d,j)=>intersects(path[i],b,r[j],d)))));
}
export function validateCatalog(rows) {
  const errors=[],ids=new Set();
  if(!Array.isArray(rows)||!rows.length)return ['Catalog must be a non-empty array'];
  for(const b of rows) {
    if(!b||typeof b!=='object'){errors.push('Invalid building record');continue;}
    if(!validCode(b.id)||ids.has(b.id))errors.push(`Invalid/duplicate code: ${b.id}`);ids.add(b.id);
    if(!b.name_th?.trim()||!b.name_en?.trim()||!Array.isArray(b.aliases))errors.push(`${b.id}: missing names/aliases`);
    if(!safeURL(b.name_source)||!validDate(b.name_checked_on))errors.push(`${b.id}: missing name provenance`);
    if(!CONFIDENCE.includes(b.mapping?.confidence))errors.push(`${b.id}: invalid mapping confidence`);
    if(b.coordinates!==null && (!validCoordinates(b.coordinates)||!validEvidence(b.mapping?.evidence)))errors.push(`${b.id}: coordinate/provenance invalid`);
    if(b.coordinates===null && ['verified','high-confidence','approximate'].includes(b.mapping?.confidence))errors.push(`${b.id}: confidence without location`);
    if(b.mapping?.confidence==='verified' && (!b.site_surveyed||!verifiedEvidence(b.mapping.evidence)))errors.push(`${b.id}: unsupported verification`);
    if(b.building_height_m!==null && (!(b.building_height_m>0)||!Number.isFinite(b.building_height_m)||!validEvidence(b.height_evidence)||b.height_evidence.kind!=='measured'))errors.push(`${b.id}: height lacks measured evidence`);
    if(b.floor_count!==null && (!Number.isInteger(b.floor_count)||b.floor_count<=0||!safeURL(b.floor_count_source)))errors.push(`${b.id}: floor count lacks evidence`);
    if(!Array.isArray(b.entrances))errors.push(`${b.id}: entrances must be explicit`);
    else for(const e of b.entrances)if(!validCoordinates(e.coordinates)||!validEvidence(e.evidence)||e.confidence==='verified'&&!verifiedEvidence(e.evidence))errors.push(`${b.id}: invalid entrance`);
  }
  return errors;
}
export function validateFootprints(collection,rows) {
  if(collection?.type!=='FeatureCollection'||!Array.isArray(collection.features))return ['Invalid footprint collection'];
  const errors=[],ids=new Set(),codes=new Set(),shapes=new Set();
  for(const f of collection.features) {
    if(!f||f.type!=='Feature'){errors.push('Invalid footprint feature');continue;}
    const p=f.properties||{},b=rows.find(b=>b.id===p.building_code);
    if(!f.id||ids.has(f.id))errors.push('Duplicate/missing footprint id');ids.add(f.id);
    if(!b||codes.has(p.building_code))errors.push(`Duplicate/unknown footprint association: ${p.building_code}`);codes.add(p.building_code);
    if(!validGeometry(f.geometry))errors.push(`${f.id}: invalid polygon`);
    const shape=JSON.stringify(f.geometry);if(shapes.has(shape))errors.push(`${f.id}: duplicate geometry`);shapes.add(shape);
    if(b&&b.mapping?.footprint_id!==f.id)errors.push(`${f.id}: building association out of sync`);
    if(!['verified','high-confidence'].includes(p.confidence)||!validEvidence(p.evidence)||!p.evidence?.association_basis)errors.push(`${f.id}: missing accepted association evidence`);
    if(p.confidence==='verified'&&!verifiedEvidence(p.evidence))errors.push(`${f.id}: unsupported verification`);
    if(b?.coordinates&&validGeometry(f.geometry)&&!pointInGeometry(b.coordinates,f.geometry))errors.push(`${f.id}: reference point outside footprint`);
  }
  for(let i=0;i<collection.features.length;i++)for(let j=0;j<i;j++){const a=collection.features[i],b=collection.features[j];if(validGeometry(a.geometry)&&validGeometry(b.geometry)&&geometriesOverlap(a.geometry,b.geometry))errors.push(`${a.id}/${b.id}: accepted footprints overlap`);}
  return errors;
}
export function coverage(rows,footprints={features:[]}) {
  return {total:rows.length,coordinates:rows.filter(b=>validCoordinates(b.coordinates)).length,
    footprints:footprints.features.length,verified:rows.filter(b=>b.mapping?.confidence==='verified').length,
    approximate:rows.filter(b=>b.mapping?.confidence==='approximate').length,
    unmapped:rows.filter(b=>!validCoordinates(b.coordinates)).length,
    measured_heights:rows.filter(b=>b.building_height_m!==null&&b.height_evidence?.kind==='measured').length};
}

/** Positive-area overlap; shared boundaries alone are allowed. */
export function geometriesOverlap(a,b) {
 const polygons=g=>g.type==='Polygon'?[g.coordinates]:g.coordinates;
 const boundary=(p,g)=>polygons(g).some(rs=>rs.some(r=>r.slice(1).some((q,i)=>onSegment(r[i],q,p))));
 const interior=(p,g)=>pointInGeometry(p,g)&&!boundary(p,g);
 for(const pa of polygons(a))for(const pb of polygons(b)) {
  for(const ra of pa)for(const rb of pb)for(let i=1;i<ra.length;i++)for(let j=1;j<rb.length;j++)
   if(cross(ra[i-1],ra[i],rb[j-1])*cross(ra[i-1],ra[i],rb[j])<0&&cross(rb[j-1],rb[j],ra[i-1])*cross(rb[j-1],rb[j],ra[i])<0)return true;
 }
 for(const [g,h] of [[a,b],[b,a]])for(const rs of polygons(g))for(const ring of rs)for(let i=1;i<ring.length;i++) {
  if(interior(ring[i],h))return true;
  const p=ring[i-1],q=ring[i],length=Math.hypot(q[0]-p[0],q[1]-p[1]);
  for(const sign of [-1,1]){const probe=[(p[0]+q[0])/2+sign*(q[1]-p[1])/length*1e-7,(p[1]+q[1])/2-sign*(q[0]-p[0])/length*1e-7];if(interior(probe,g)&&interior(probe,h))return true;}
 }
 return false;
}

export function validateCandidateFootprints(collection,codes) {
 if(collection?.type!=='FeatureCollection'||!Array.isArray(collection.features))return ['Invalid candidate collection'];
 const ids=new Set(),errors=[];
 for(const f of collection.features){const p=f?.properties;
  if(!f||typeof f.id!=='string'||ids.has(f.id)||!validGeometry(f.geometry)||!p||!codes.includes(p.building_code)||!validEvidence(p.evidence)||p.review_status!=='candidate-needs-independent-review'||!validCoordinates(p.reference_point)||!pointInGeometry(p.reference_point,f.geometry))errors.push('Invalid candidate geometry or evidence');
  ids.add(f?.id);
 }
 return errors;
}
