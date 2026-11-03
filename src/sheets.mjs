/** Keyboard and pointer equivalent snap controls. No drag listeners on scrollable content. */
export function setupSheets({onChange}) {
 const levels=['peek','half','full'];
 for(const [panel,handle] of [[document.querySelector('.sidebar'),document.getElementById('mobile-drawer')],
  ...[...document.querySelectorAll('.detail')].map(panel=>[panel,panel.querySelector('.sheet-resize')])]) {
  let start=null,dragged=false;
  const set=snap=>{panel.dataset.snap=snap;handle.setAttribute('aria-expanded',String(snap==='full'));onChange(panel,snap);};
  handle.addEventListener('click',()=>{if(dragged){dragged=false;return;}set(levels[(levels.indexOf(panel.dataset.snap)+1)%levels.length]);});
  handle.addEventListener('pointerdown',event=>{start={y:event.clientY,snap:panel.dataset.snap};dragged=false;handle.setPointerCapture(event.pointerId);});
  handle.addEventListener('pointerup',event=>{if(!start)return;const delta=event.clientY-start.y;if(Math.abs(delta)>24){dragged=true;const index=levels.indexOf(start.snap);set(levels[Math.max(0,Math.min(2,index+(delta<0?1:-1)))]);}start=null;});
  handle.addEventListener('pointercancel',()=>{start=null;dragged=false;});
  handle.addEventListener('keydown',event=>{if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();const index=levels.indexOf(panel.dataset.snap);set(event.key==='Home'?'peek':event.key==='End'?'full':levels[Math.max(0,Math.min(2,index+(event.key==='ArrowUp'?1:-1)))]);});
 }
}
