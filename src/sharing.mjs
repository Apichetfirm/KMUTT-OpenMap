export function buildingURL(base,code) {
  const url=new URL(base);url.searchParams.delete('poi');url.searchParams.set('building',code);return url.href;
}
export function sharedBuilding(base,buildings) {
  const code=new URL(base).searchParams.get('building');
  return {requested:code,building:code?buildings.find(b=>b.id===code.toUpperCase()):null};
}

export function placeURL(base,id) {const url=new URL(base);url.searchParams.delete('building');url.searchParams.set('poi',id);return url.href;}
export function sharedPlace(base,features) {const id=new URL(base).searchParams.get('poi');return {requested:id,place:id?features.find(f=>String(f.id)===id):null};}
