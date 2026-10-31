/** Visual-only 3D height policies. Neither mode asserts surveyed heights. */
export const HEIGHT_PRESETS = Object.freeze({
  guarded: {label: 'ลดความสูงผิดปกติ (ภาพจำลอง)', floor: 4, max: 55},
  osm: {label: 'ความสูงตาม OpenStreetMap (ยังไม่ยืนยัน)', floor: 4, max: null}
});
export function extrusionHeight(mode='guarded') {
  const p = HEIGHT_PRESETS[mode];
  if (!p) throw new Error(`Unsupported height mode: ${mode}`);
  const source = ['coalesce', ['get','render_height'], p.floor];
  return p.max === null ? ['max', 0, source] : ['min', p.max, ['max', 0, source]];
}
export function extrusionColor() {
  return ['interpolate', ['linear'], ['coalesce', ['get','render_height'], 4],
    0, '#b2c7c2', 12, '#8faeaa', 30, '#739d98', 55, '#668e91', 110, '#5d8291'];
}
export function numericVisualHeight(meters, mode='guarded') {
  const p = HEIGHT_PRESETS[mode];
  if (!p) throw new Error(`Unsupported height mode: ${mode}`);
  const val = typeof meters === 'number' && Number.isFinite(meters) && meters >= 0 ? meters : p.floor;
  return p.max === null ? val : Math.min(p.max, val);
}
