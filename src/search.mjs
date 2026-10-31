/** Deterministic bilingual ranking; exact building code outranks substring matches. */
export function normalize(value) {
  return String(value ?? '').toLocaleLowerCase('en').normalize('NFKC').replace(/[\s._-]+/gu, ' ').trim();
}
export function scoreBuilding(building, text) {
  const q = normalize(text);
  if (!q) return 10;
  const id = normalize(building.id);
  if (id === q.replace(/\s+/gu, '')) return 0;
  const aliases = (building.aliases || []).map(normalize);
  if (aliases.includes(q)) return 1;
  const names = [building.name_th, building.name_en].map(normalize);
  if (names.includes(q)) return 2;
  if (id.startsWith(q)) return 3;
  if (aliases.some(a => a.startsWith(q)) || names.some(n => n.startsWith(q))) return 4;
  if (aliases.some(a => a.includes(q)) || names.some(n => n.includes(q))) return 5;
  return Number.POSITIVE_INFINITY;
}
export function searchBuildings(buildings, query = '', filter = 'all') {
  return buildings.filter(b => filter === 'all' || (filter === 'mapped' ? Array.isArray(b.coordinates) : b.zone === filter))
    .map(b => ({b, s:scoreBuilding(b,query)})).filter(v => Number.isFinite(v.s))
    .sort((a,b) => a.s - b.s || a.b.id.localeCompare(b.b.id, 'en', {numeric:true}))
    .map(v => v.b);
}
export function validCoordinates(value) {
  return Array.isArray(value) && value.length === 2 && value.every(Number.isFinite) &&
    value[0] > 100.45 && value[0] < 100.54 && value[1] > 13.61 && value[1] < 13.69;
}
