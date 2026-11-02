import {validPhoto,streetViewURL} from './building-evidence.mjs';
const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
/** Reusable supplemental card; canonical fields are read directly, never duplicated into media data. */
export class BuildingDetail{
 constructor(container){this.container=container;this.key=null;}
 render(building,media){
  const key=JSON.stringify([building.id,media]);if(key===this.key)return;this.key=key;
  const body=node('div');body.className='building-visual';const photo=media?.photo;
  if(validPhoto(photo)){
   const figure=node('figure'),image=node('img');image.alt=photo.alt;image.width=photo.width;image.height=photo.height;image.loading='lazy';image.decoding='async';image.src=photo.src;image.srcset=photo.variants.map(v=>`${v.src} ${v.width}w`).join(', ');image.sizes='(max-width:670px) calc(100vw - 52px), 310px';
   image.addEventListener('error',()=>figure.replaceChildren(node('p','ภาพไม่พร้อมใช้งาน · ดูแหล่งข้อมูลด้านล่าง'),caption),{once:true});
   const caption=node('figcaption',photo.attribution+' · '+photo.license+' '),a=node('a','แหล่งภาพ ↗');a.href=photo.source;a.target='_blank';a.rel='noopener noreferrer';caption.append(a);figure.append(image,caption);body.append(figure);
  }else{const fallback=node('p','ยังไม่มีภาพถ่ายอาคารที่ผ่านการตรวจสิทธิ์เผยแพร่');fallback.className='photo-unavailable';body.append(fallback);}
  const dl=node('dl');for(const [label,value] of [['ชื่อย่อ',building.aliases?.join(' · ')||'ยังไม่มีข้อมูล'],['คณะ / หน่วยงาน',building.faculty||building.department||'ยังไม่ยืนยัน'],['คำอธิบาย',building.description||'ยังไม่มีคำอธิบายที่มีแหล่งอ้างอิง'],['ทบทวนตำแหน่งล่าสุด',building.mapping.last_verified_on||'ยังไม่สำรวจยืนยัน']]){dl.append(node('dt',label),node('dd',value));}const extra=node('details');extra.append(node('summary','ข้อมูลเพิ่มเติม · ชื่อย่อและรายละเอียด'),dl);body.append(extra);
  const url=streetViewURL(building.coordinates),link=node('a',url?'ค้นหา Street View ใกล้พิกัด ↗':'Street View: ยังไม่มีพิกัดที่รองรับ');link.id='street-view';link.className='secondary-action street-view';
  if(url){link.href=url;link.target='_blank';link.rel='noopener noreferrer';}else{link.setAttribute('aria-disabled','true');}
  if(media?.gallery.length){const more=node('details'),summary=node('summary',`ภาพเพิ่มเติม (${media.gallery.length}) · โหลดเมื่อเปิด`);more.append(summary);more.addEventListener('toggle',()=>{if(!more.open||more.dataset.loaded)return;more.dataset.loaded='true';for(const p of media.gallery){if(!validPhoto(p))continue;const img=node('img');img.src=p.src;img.alt=p.alt;img.loading='lazy';img.decoding='async';img.width=p.width;img.height=p.height;const a=node('a',p.attribution+' · '+p.license+' ↗');a.href=p.source;a.target='_blank';a.rel='noopener noreferrer';more.append(img,a);}});body.append(more);}
  body.append(link,node('small','เปิด Google Maps เพื่อค้นหาภาพถนน · ยังไม่ยืนยันว่ามีภาพหรือเห็นอาคารนี้ ไม่ใช้ภาพ Google เป็นหลักฐานรูปทรง'));
  this.container.replaceChildren(body);
 }
}
