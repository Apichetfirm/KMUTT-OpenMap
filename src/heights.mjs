import {validEvidence} from './data.mjs';
/** Rendering preferences, never physical survey claims. Tile heights may be estimates. */
export const HEIGHT_PRESETS = Object.freeze({
  guarded:{label:'ลดความสูงผิดปกติ (ภาพจำลอง)',floor:4,max:55},
  osm:{label:'ค่าจากไทล์ OSM (อาจเป็นค่าประมาณ)',floor:4,max:null}
});
export function extrusionHeight(mode='guarded') {
  const p=HEIGHT_PRESETS[mode];if(!p)throw Error(`Unsupported height mode: ${mode}`);
  const value=['max',0,['to-number',['get','render_height'],p.floor]];
  return p.max===null?value:['min',p.max,value];
}
export function extrusionBase(mode='guarded') {
  return ['min',extrusionHeight(mode),['max',0,['to-number',['get','render_min_height'],0]]];
}
export function zoomHeight(expression) {
  return ['interpolate',['linear'],['zoom'],14.8,0,15.6,expression];
}
export function extrusionColor() {
  return ['interpolate',['linear'],['to-number',['get','render_height'],4],0,'#c0d4cd',12,'#9fbbb3',30,'#7da49d',55,'#6e9499',110,'#628692'];
}
export function numericVisualHeight(meters,mode='guarded') {
  const p=HEIGHT_PRESETS[mode];if(!p)throw Error(`Unsupported height mode: ${mode}`);
  const n=typeof meters==='number'&&Number.isFinite(meters)&&meters>=0?meters:p.floor;
  return p.max===null?n:Math.min(n,p.max);
}
export const HEIGHT_KINDS=['measured','official-floors','osm-height','osm-levels','documented-estimate','visual-fallback'];
export function validateHeightOverride(record,codes) {
  return !!record && codes.includes(record.building_code) && HEIGHT_KINDS.includes(record.kind) &&
    Number.isFinite(record.render_height_m) && record.render_height_m>0 && record.render_height_m<=500 &&
    validEvidence(record.evidence) && (record.kind==='measured' ? record.measured_height_m===record.render_height_m : record.measured_height_m===null) &&
    (!['official-floors','osm-levels'].includes(record.kind) || Number.isInteger(record.levels)&&record.levels>0&&Number.isFinite(record.metres_per_level)&&record.metres_per_level>0&&Math.abs(record.levels*record.metres_per_level-record.render_height_m)<0.01);
}
