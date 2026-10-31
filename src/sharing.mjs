export function buildingURL(base,code) {
  const url=new URL(base);url.searchParams.set('building',code);return url.href;
}
export function sharedBuilding(base,buildings) {
  const code=new URL(base).searchParams.get('building');
  return {requested:code,building:code?buildings.find(b=>b.id===code.toUpperCase()):null};
}
