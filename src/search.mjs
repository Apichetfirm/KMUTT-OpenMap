/** Deterministic bilingual ranking; exact building code outranks substring matches. */
export function normalize(value) {
  return String(value ?? '').toLocaleLowerCase('en').normalize('NFKC').replace(/[\p{P}\s]+/gu, ' ').trim();
}
export function scoreBuilding(building, text) {
  const q = normalize(text);
  if (!q) return 10;
  const id = normalize(building.id);
  if (id === q.replace(/\s+/gu, '')) return 0;
  const aliases = (building.aliases || []).map(normalize);
  if (aliases.some(a => a.replace(/\s/gu, '') === q.replace(/\s/gu, ''))) return 1;
  const names = [building.name_th, building.name_en].map(normalize);
  if (names.includes(q)) return 2;
  if (id.startsWith(q)) return 3;
  if (aliases.some(a => a.startsWith(q)) || names.some(n => n.startsWith(q))) return 4;
  if (aliases.some(a => a.includes(q)) || names.some(n => n.includes(q))) return 5;
  if(/^[a-z]{4,40}$/.test(q)&&[...aliases,...names.flatMap(n=>n.split(' '))].some(n=>oneTypo(q,n)))return 6;
  return Number.POSITIVE_INFINITY;
}
export function searchBuildings(buildings, query = '', filter = 'all') {
  return buildings.filter(b => filter === 'all' || (filter === 'mapped' ? validCoordinates(b.coordinates) : b.zone === filter))
    .map(b => ({b, s:scoreBuilding(b,query)})).filter(v => Number.isFinite(v.s))
    .sort((a,b) => a.s - b.s || a.b.id.localeCompare(b.b.id, 'en', {numeric:true}))
    .map(v => v.b);
}
export function validCoordinates(value) {
  return Array.isArray(value) && value.length === 2 && value.every(Number.isFinite) &&
    value[0] > 100.45 && value[0] < 100.54 && value[1] > 13.61 && value[1] < 13.69;
}

function oneTypo(a,b) {
 if(Math.abs(a.length-b.length)>1)return false;
 if(a===b)return true;
 if(a.length===b.length){const ds=[...a].map((c,i)=>c===b[i]?-1:i).filter(i=>i>=0);return ds.length===1||ds.length===2&&ds[1]===ds[0]+1&&a[ds[0]]===b[ds[1]]&&a[ds[1]]===b[ds[0]];}
 if(a.length>b.length)return oneTypo(b,a);
 for(let i=0;i<b.length;i++)if(a===b.slice(0,i)+b.slice(i+1))return true;return false;
}
