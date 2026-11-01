import {reviewed} from './navigation.mjs';
import {coverage,verifiedEvidence} from './data.mjs';
export function qualityReport({buildings,footprints={features:[]},candidates={features:[]},places={features:[]},graph={nodes:[],edges:[]},candidateGraph={edges:[]},heights={overrides:[]}}) {
 const c=coverage(buildings,footprints),verified=x=>verifiedEvidence(x?.evidence);
 return {total_buildings:c.total,buildings_with_coordinates:c.coordinates,buildings_without_coordinates:c.unmapped,
  approximate_building_references:c.approximate,verified_building_locations:c.verified,
  candidate_footprints:candidates.features.length,accepted_footprints:footprints.features.length,
  field_verified_footprints:footprints.features.filter(f=>f.properties.confidence==='verified'&&verified(f.properties)).length,
  documented_floor_counts:buildings.filter(b=>Number.isInteger(b.floor_count)).length,measured_heights:c.measured_heights,
  estimated_render_heights:heights.overrides.filter(h=>h.kind!=='measured').length,
  verified_entrances:buildings.flatMap(b=>b.entrances).filter(e=>e.confidence==='verified'&&verified(e)).length,
  candidate_pedestrian_paths:candidateGraph.edges.length,
  verified_pedestrian_paths:graph.edges.filter(e=>reviewed(e)).length,
  total_pois:places.features.length,verified_pois:places.features.filter(f=>f.properties.confidence==='verified'&&verified(f.properties)).length,
  pois_with_recorded_hours:places.features.filter(f=>f.properties.opening_hours!==null).length,
  unresolved_buildings:buildings.filter(b=>!b.coordinates||b.mapping.unresolved_reason).map(b=>({id:b.id,reason:b.mapping.unresolved_reason||'Location unresolved'})),
  pending_association_review:buildings.filter(b=>b.mapping.review_status!=='verified').map(b=>b.id)};
}
