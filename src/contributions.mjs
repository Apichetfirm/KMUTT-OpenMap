import {safeURL} from './data.mjs';
import {validCoordinates} from './search.mjs';
export const COMMUNITY_KEY='kmutt-openmap-community-v1';
export const CONTRIBUTION_TYPES={'building-correction':'แก้ไขข้อมูลอาคาร','new-poi':'เสนอจุดบริการ','opening-hours':'แก้ไขเวลาทำการ','closed-business':'แจ้งสถานที่ปิด','geometry':'แก้ไขรูปทรงอาคาร','inaccessible-route':'แจ้งอุปสรรคทางเดิน'};
export function validateContribution(p) {
 return !!p&&typeof p.id==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(p.id)&&Object.hasOwn(CONTRIBUTION_TYPES,p.type)&&
  typeof p.title==='string'&&p.title.trim().length>0&&p.title.length<=160&&typeof p.details==='string'&&p.details.trim().length>0&&p.details.length<=3000&&
  typeof p.target_id==='string'&&p.target_id.length<=100&&(p.source_url===null||!!safeURL(p.source_url))&&
  (p.coordinates===null||validCoordinates(p.coordinates))&&p.review_status==='community-reported-unreviewed'&&
  typeof p.created_at==='string'&&Number.isFinite(Date.parse(p.created_at));
}
export function readCommunity(store) {
 let raw=null;
 try {raw=store?.getItem(COMMUNITY_KEY)??null;if(raw===null)return {drafts:[],raw,warning:false};const entries=JSON.parse(raw);
  if(!Array.isArray(entries)||entries.length>100||entries.some(p=>!validateContribution(p))||new Set(entries.map(p=>p.id)).size!==entries.length)throw Error('Invalid drafts');
  return {drafts:entries,raw,warning:false};
 }catch{return {drafts:[],raw,warning:true};}
}
export function saveCommunity(store,drafts,expectedRaw) {
 if(!store)throw Error('พื้นที่จัดเก็บในเบราว์เซอร์ไม่พร้อม');
 if(drafts.length>100||drafts.some(p=>!validateContribution(p))||new Set(drafts.map(p=>p.id)).size!==drafts.length)throw Error('Invalid contributions');
 if(store.getItem(COMMUNITY_KEY)!==expectedRaw)throw Error('ข้อมูลเปลี่ยนจากแท็บอื่น โปรดส่งออกข้อมูลแล้วโหลดหน้าใหม่');
 if(readCommunity(store).warning)throw Error('ข้อมูลเดิมอ่านไม่ได้ กรุณาส่งออกสำเนากู้คืนก่อน ไม่เขียนทับข้อมูล');
 store.setItem(COMMUNITY_KEY,JSON.stringify(drafts));
}
export function contributionPackage(drafts) {
 if(drafts.some(p=>!validateContribution(p)))throw Error('Invalid contributions');
 return JSON.stringify({schema_version:'0.4.0',campus:'KMUTT Bangmod',warning:'UNREVIEWED community reports. No published map information changes without independent review.',proposals:drafts},null,2)+'\n';
}
export function reviewIssueURL({title,body}) {
 const url=new URL('https://github.com/Apichetfirm/KMUTT-OpenMap/issues/new');
 url.searchParams.set('title',String(title).slice(0,180));url.searchParams.set('body',String(body).slice(0,6500));return url.href;
}
