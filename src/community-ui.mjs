import {COMMUNITY_KEY,CONTRIBUTION_TYPES,validateContribution,readCommunity,saveCommunity,contributionPackage,reviewIssueURL} from './contributions.mjs';
/** Independent local store: legacy coordinate proposals are never migrated or overwritten. */
export function setupCommunity({toast,download,getContext}) {
 const $=id=>document.getElementById(id),dialog=$('community-dialog'),form=$('community-form');let store=null;
 try{store=localStorage;}catch{}
 const notify=message=>{$('community-feedback').textContent=message;toast(message);};
 let saved=readCommunity(store),drafts=saved.drafts,revision=saved.raw,pending=null,editing=null;
 for(const [value,label] of Object.entries(CONTRIBUTION_TYPES)){const o=document.createElement('option');o.value=value;o.textContent=label;$('community-type').append(o);}
 function invalidate(){pending=null;$('community-preview').textContent='';for(const id of ['community-save','community-export','community-github'])$(id).disabled=true;}
 function render(){
  $('community-list').replaceChildren();$('community-warning').textContent=saved.warning?'ข้อมูลเดิมอ่านไม่ได้ ส่งออกสำเนากู้คืนได้ก่อนตรวจแก้ด้วยตนเอง':'';
  $('community-recovery').classList.toggle('hidden',!saved.warning);
  for(const p of drafts){const row=document.createElement('div');row.className='community-row';const text=document.createElement('span');text.textContent=p.title;row.append(text);
   for(const [label,action] of [['แก้ไข',()=>open(p)],['ลบ',()=>persist(drafts.filter(d=>d.id!==p.id))]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',action);row.append(b);}$('community-list').append(row);}
  $('community-export-all').disabled=!drafts.length;
 }
 async function persist(next){
  try{if(!navigator.locks)throw Error('การบันทึกต้องใช้ Web Locks บน HTTPS หรือ localhost');await navigator.locks.request(COMMUNITY_KEY,()=>{saveCommunity(store,next,revision);drafts=next;revision=JSON.stringify(next);});saved=readCommunity(store);render();notify('บันทึกข้อเสนอในเครื่องแล้ว ยังไม่ได้ส่งหรือแก้ข้อมูลเผยแพร่');return true;}
  catch(e){notify('บันทึกไม่สำเร็จ: '+e.message);return false;}
 }
 function open(p){
  form.reset();$('community-feedback').textContent='';editing=p||null;const context=getContext();$('community-type').value=p?.type||context.type||'building-correction';$('community-target').value=p?.target_id||context.target||'';$('community-title').value=p?.title||context.title||'';$('community-details').value=p?.details||'';$('community-source').value=p?.source_url||'';$('community-lat').value=p?.coordinates?.[1]??'';$('community-lng').value=p?.coordinates?.[0]??'';invalidate();render();dialog.showModal();
 }
 $('open-community').addEventListener('click',()=>open());$('close-community').addEventListener('click',()=>dialog.close());
 document.querySelectorAll('[data-report]').forEach(b=>b.addEventListener('click',()=>open()));
 form.addEventListener('input',invalidate);form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const lat=$('community-lat').value,lng=$('community-lng').value;
  if(Boolean(lat)!==Boolean(lng)){notify('กรอกพิกัดทั้งสองช่อง หรือเว้นว่างทั้งคู่');return;}
  const p={id:editing?.id||crypto.randomUUID(),type:$('community-type').value,title:$('community-title').value.trim(),target_id:$('community-target').value.trim(),details:$('community-details').value.trim(),source_url:$('community-source').value.trim()||null,coordinates:lat&&lng?[Number(lng),Number(lat)]:null,review_status:'community-reported-unreviewed',created_at:editing?.created_at||new Date().toISOString()};
  if(!validateContribution(p)){notify('ข้อมูลข้อเสนอไม่ถูกต้อง ตรวจพิกัดและลิงก์ HTTP(S)');return;}
  pending=p;$('community-preview').textContent=contributionPackage([p]);for(const id of ['community-save','community-export','community-github'])$(id).disabled=false;
 });
 $('community-save').addEventListener('click',async()=>{if(pending&&await persist([pending,...drafts.filter(d=>d.id!==pending.id)])){editing=pending;}});
 $('community-export').addEventListener('click',()=>{if(pending)download(contributionPackage([pending]),'kmutt-community-unreviewed.json');});
 $('community-export-all').addEventListener('click',()=>download(contributionPackage(drafts),'kmutt-community-unreviewed-all.json'));
 $('community-recovery').addEventListener('click',()=>download(saved.raw||'','kmutt-community-recovery.txt'));
 $('community-github').addEventListener('click',()=>{if(pending)window.open(reviewIssueURL({title:`[Community] ${pending.title}`,body:'Please independently review this unverified report.\n\n```json\n'+contributionPackage([pending])+'```'}),'_blank','noopener,noreferrer');});
 return {open};
}
