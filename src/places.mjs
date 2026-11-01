import {validCoordinates,normalize} from './search.mjs';
import {CONFIDENCE,validEvidence,verifiedEvidence,validDate} from './data.mjs';
export const PLACE_CATEGORIES={restaurant:'ร้านอาหาร',canteen:'โรงอาหาร',cafe:'คาเฟ่',convenience:'ร้านสะดวกซื้อ',restroom:'ห้องน้ำ',water:'จุดเติมน้ำ',study:'พื้นที่อ่านหนังสือ',library:'หอสมุด',printing:'งานพิมพ์',atm:'ATM',clinic:'คลินิก',pharmacy:'ร้านยา',parking:'ที่จอดรถ',transport:'รถโดยสาร',accessible_entrance:'ทางเข้าสำหรับทุกคน',visitor:'บริการผู้มาติดต่อ'};
const minutes=s=>typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s)?Number(s.slice(0,2))*60+Number(s.slice(3)):null;
function validIntervals(v) {return Array.isArray(v)&&v.every(p=>Array.isArray(p)&&p.length===2&&minutes(p[0])!==null&&minutes(p[1])!==null&&p[0]!==p[1]);}
export function validHours(h) {
  return h===null || !!h && h.timezone==='Asia/Bangkok' && validDate(h.checked_on) && validEvidence(h.evidence) &&
    h.weekly && typeof h.weekly==='object' && !Array.isArray(h.weekly) && Object.keys(h.weekly).every(k=>/^[0-6]$/.test(k)&&validIntervals(h.weekly[k])) &&
    (!h.exceptions || typeof h.exceptions==='object' && !Array.isArray(h.exceptions) && Object.entries(h.exceptions).every(([d,v])=>validDate(d)&&validIntervals(v)));
}
function bangkokDate(now) {
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));
  const date=`${parts.year}-${parts.month}-${parts.day}`;
  return {date,day:new Date(date+'T00:00:00Z').getUTCDay(),minute:Number(parts.hour)*60+Number(parts.minute)};
}
/** Recorded schedules only; missing days and invalid records remain unknown. Exceptions replace a calendar day, including overnight carry. */
export function openingStatus(hours,now=new Date()) {
  if(!hours||!validHours(hours)||!Number.isFinite(now.getTime()))return {state:'unknown',stale:false,label:'ไม่ทราบเวลาทำการ'};
  const {date,day,minute}=bangkokDate(now);
  const yesterday=new Date(Date.parse(date+'T00:00:00Z')-86400000).toISOString().slice(0,10);
  const explicit=Object.hasOwn(hours.exceptions||{},date);
  const today=explicit?hours.exceptions[date]:hours.weekly[String(day)];
  const prev=Object.hasOwn(hours.exceptions||{},yesterday)?hours.exceptions[yesterday]:hours.weekly[String((day+6)%7)];
  const inToday=today?.some(([a,b])=>{
    const start=minutes(a),end=minutes(b);return start<end?minute>=start&&minute<end:minute>=start;
  });
  const carry=!explicit&&prev?.some(([a,b])=>minutes(a)>minutes(b)&&minute<minutes(b));
  const stale=Date.parse(date+'T00:00:00Z')-Date.parse(hours.checked_on+'T00:00:00Z')>90*86400000;
  const state=inToday||carry?'likely-open':today===undefined?'unknown':'likely-closed';
  return {state,stale,label:state==='likely-open'?'น่าจะเปิดตามเวลาทำการที่บันทึกไว้':state==='likely-closed'?'น่าจะปิดตามเวลาทำการที่บันทึกไว้':'ไม่ทราบเวลาทำการ'};
}
export function validatePlaces(collection,codes) {
  if(collection?.type!=='FeatureCollection'||!Array.isArray(collection.features))return ['Invalid POI collection'];
  const ids=new Set(),errors=[];
  for(const f of collection.features) {
    if(!f||f.type!=='Feature'){errors.push('Invalid POI feature');continue;}
    const p=f.properties||{};
    if(typeof f.id!=='string'||!f.id||ids.has(f.id))errors.push('Duplicate/missing POI ID');ids.add(f.id);
    if(f.geometry?.type!=='Point'||!validCoordinates(f.geometry.coordinates))errors.push(`${f.id}: invalid point`);
    if(!p.name?.trim()||!PLACE_CATEGORIES[p.category]||!CONFIDENCE.includes(p.confidence)||!validEvidence(p.evidence))errors.push(`${f.id}: missing POI metadata`);
    if(p.building_code!==null&&!codes.includes(p.building_code))errors.push(`${f.id}: broken building reference`);
    if(p.confidence==='verified'&&(!verifiedEvidence(p.evidence)||!validDate(p.last_verified_on)))errors.push(`${f.id}: unsupported verification`);
    if(p.accessibility!==null && (!p.accessibility||!verifiedEvidence(p.accessibility.evidence)))errors.push(`${f.id}: unsupported accessibility`);
    if(!validHours(p.opening_hours))errors.push(`${f.id}: invalid hours`);
  }
  return errors;
}
export function filterPlaces(features,{category='all',query='',likelyOpen=false,now=new Date()}={}) {
  const q=normalize(query);
  return features.filter(f=>(category==='all'||f.properties.category===category)&&
    normalize([f.properties.name,f.properties.name_en].join(' ')).includes(q)&&
    (!likelyOpen||(()=>{const s=openingStatus(f.properties.opening_hours,now);return s.state==='likely-open'&&!s.stale;})()));
}

/** Strict supported subset only; retain unsupported OSM expressions as raw metadata. */
export function parseRecordedOSMHours(raw,evidence) {
 if(typeof raw!=='string')return null;
 const days=['Mo','Tu','We','Th','Fr','Sa','Su'],weekly={};
 for(const rule of raw.split(';').map(x=>x.trim())) {
  const m=/^(?:(Mo|Tu|We|Th|Fr|Sa|Su)(?:-(Mo|Tu|We|Th|Fr|Sa|Su))?\s+)?(\d\d:\d\d)-(\d\d:\d\d)$/.exec(rule);
  if(!m||minutes(m[3])===null||minutes(m[4])===null||m[3]===m[4])return null;
  const first=m[1]?days.indexOf(m[1]):0,last=m[1]?days.indexOf(m[2]||m[1]):6;
  for(let d=first;;d=(d+1)%7){const key=String((d+1)%7);(weekly[key]??=[]).push([m[3],m[4]]);if(d===last)break;}
 }
 const hours={timezone:'Asia/Bangkok',checked_on:evidence.source_date||evidence.checked_on,evidence,weekly,exceptions:{},holiday_coverage:'unknown'};
 return validHours(hours)?hours:null;
}
