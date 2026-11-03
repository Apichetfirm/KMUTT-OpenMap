import {validPhoto,streetViewURL} from './building-evidence.mjs';
const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
/** Abstract editorial illustration, never a depiction of the selected building. */
export function missingPhoto(message='ยังไม่มีภาพถ่ายอาคารที่ผ่านการตรวจสิทธิ์เผยแพร่') {
 const fallback=node('figure');fallback.className='photo-unavailable building-media';
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 480 270');svg.setAttribute('aria-hidden','true');
 for(const [d,cls] of [
  ['M0 220 240 80 480 220 M0 250 240 110 480 250 M0 190 240 50 480 190 M60 270 300 130 M120 270 360 130 M180 270 420 130 M0 130 240 270 M60 130 300 270 M120 130 360 270 M180 130 420 270','illustration-grid'],
  ['M120 180 240 110 360 180 240 250Z','illustration-base'],
  ['M155 167 155 100 240 52 325 100 325 167 240 216Z','illustration-mass'],
  ['M155 100 240 150 325 100 M240 150V216 M155 122 240 172 325 122 M155 145 240 195 325 145 M183 117V183 M211 134V200 M268 134V200 M297 117V183','illustration-line']]){
  const path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('class',cls);svg.append(path);
 }
 const caption=node('figcaption');caption.append(node('strong','พื้นที่สำหรับภาพอาคาร'),node('span',message),node('small','ภาพประกอบทั่วไป · ไม่ใช่รูปทรงของอาคารนี้'));
 fallback.append(svg,caption);return fallback;
}
/** Reusable supplemental card; canonical fields are read directly, never duplicated into media data. */
export class BuildingDetail{
 constructor(container){this.container=container;this.key=null;}
 render(building,media){
  const key=JSON.stringify([building.id,media]);if(key===this.key)return;this.key=key;
  const body=node('div');body.className='building-visual';const photo=media?.photo;
  if(validPhoto(photo)){
   const figure=node('figure'),image=node('img');figure.className='building-media';image.alt=photo.alt;image.width=photo.width;image.height=photo.height;image.loading='lazy';image.decoding='async';image.src=photo.src;image.srcset=photo.variants.map(v=>`${v.src} ${v.width}w`).join(', ');image.sizes='(max-width:670px) calc(100vw - 52px), 310px';
   image.addEventListener('error',()=>figure.replaceChildren(missingPhoto('ภาพไม่พร้อมใช้งาน · ดูแหล่งข้อมูลด้านล่าง'),caption),{once:true});
   const caption=node('figcaption',photo.attribution+' · '+photo.license+' '),a=node('a','แหล่งภาพ');a.href=photo.source;a.target='_blank';a.rel='noopener noreferrer';caption.append(a);figure.append(image,caption);body.append(figure);
  }else{body.append(missingPhoto());}
  const dl=node('dl');for(const [label,value] of [['ชื่อย่อ',building.aliases?.join(' · ')||'ยังไม่มีข้อมูล'],['คณะ / หน่วยงาน',building.faculty||building.department||'ยังไม่ยืนยัน'],['คำอธิบาย',building.description||'ยังไม่มีคำอธิบายที่มีแหล่งอ้างอิง'],['ทบทวนตำแหน่งล่าสุด',building.mapping.last_verified_on||'ยังไม่สำรวจยืนยัน']]){dl.append(node('dt',label),node('dd',value));}const extra=node('details');extra.append(node('summary','ข้อมูลเพิ่มเติม · ชื่อย่อและรายละเอียด'),dl);
  const url=streetViewURL(building.coordinates),link=node('a',url?'ค้นหา Street View ใกล้พิกัด':'Street View: ยังไม่มีพิกัดที่รองรับ');link.id='street-view';link.className='secondary-action street-view';
  if(url){link.href=url;link.target='_blank';link.rel='noopener noreferrer';}else{link.setAttribute('aria-disabled','true');}
  if(media?.gallery.length){const more=node('details'),summary=node('summary',`ภาพเพิ่มเติม (${media.gallery.length}) · โหลดเมื่อเปิด`);more.append(summary);more.addEventListener('toggle',()=>{if(!more.open||more.dataset.loaded)return;more.dataset.loaded='true';for(const p of media.gallery){if(!validPhoto(p))continue;const img=node('img');img.src=p.src;img.alt=p.alt;img.loading='lazy';img.decoding='async';img.width=p.width;img.height=p.height;const a=node('a',p.attribution+' · '+p.license+'');a.href=p.source;a.target='_blank';a.rel='noopener noreferrer';more.append(img,a);}});body.append(more);}
  body.append(link,extra,node('small','เปิด Google Maps เพื่อค้นหาภาพถนน · ยังไม่ยืนยันว่ามีภาพหรือเห็นอาคารนี้ ไม่ใช้ภาพ Google เป็นหลักฐานรูปทรง'));
  this.container.replaceChildren(body);
 }
}
