import {validCoordinates} from './search.mjs';
import {validEvidence,verifiedEvidence,pathIntersectsGeometry} from './data.mjs';
import {openingStatus,validHours} from './places.mjs';
export function distanceMetres(a,b) {
  const rad=n=>n*Math.PI/180, dlat=rad(b[1]-a[1]),dlng=rad(b[0]-a[0]);
  const h=Math.sin(dlat/2)**2+Math.cos(rad(a[1]))*Math.cos(rad(b[1]))*Math.sin(dlng/2)**2;
  return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
}
export function validateGraph(graph,{footprints=[]}={}) {
  if(!graph||!Array.isArray(graph.nodes)||!Array.isArray(graph.edges))return ['Invalid graph'];
  const errors=[],nodes=new Map(),ids=new Set();
  for(const n of graph.nodes) {
    if(!n||typeof n!=='object'){errors.push('Invalid graph node');continue;}
    if(typeof n.id!=='string'||!n.id||nodes.has(n.id)||!validCoordinates(n.coordinates))errors.push('Invalid/duplicate node');
    if(!['intersection','entrance','crossing','gate'].includes(n.kind)||!validEvidence(n.evidence))errors.push(`${n.id}: missing node provenance`);
    if(n.independently_reviewed&&!reviewed(n))errors.push(`${n.id}: independent reviewer must differ from survey reviewer`);
    nodes.set(n.id,n);
  }
  for(const e of graph.edges) {
    if(!e||typeof e!=='object'){errors.push('Invalid graph edge');continue;}
    if(!e.id||ids.has(e.id)||!nodes.has(e.from)||!nodes.has(e.to)||e.from===e.to)errors.push('Invalid/duplicate edge or endpoint');ids.add(e.id);
    if(!Array.isArray(e.coordinates)||e.coordinates.length<2||!e.coordinates.every(validCoordinates))errors.push(`${e.id}: invalid path`);
    else if(nodes.has(e.from)&&nodes.has(e.to)) {
      const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
      if(!same(e.coordinates[0],nodes.get(e.from).coordinates)||!same(e.coordinates.at(-1),nodes.get(e.to).coordinates))errors.push(`${e.id}: disconnected geometry`);
      if(e.coordinates.slice(1).some((c,i)=>distanceMetres(c,e.coordinates[i])<0.01))errors.push(`${e.id}: duplicate path point`);
      const crossed=footprints.filter(f=>pathIntersectsGeometry(e.coordinates,f.geometry));
      if(crossed.some(f=>e.kind!=='passage'||!e.traversable_passage_verified||!e.passage_footprint_ids?.includes(f.id)||!verifiedEvidence(e.evidence)))errors.push(`${e.id}: building crossing lacks documented passage`);
    }
    if(!['path','stairs','ramp','crossing','passage'].includes(e.kind)||!validEvidence(e.evidence)||!['public','restricted','unknown'].includes(e.access))errors.push(`${e.id}: missing edge metadata`);
    if(e.independently_reviewed&&!reviewed(e))errors.push(`${e.id}: independent reviewer must differ from survey reviewer`);
    if(e.hours!==null&&!validHours(e.hours))errors.push(`${e.id}: invalid gate schedule`);
    if(typeof e.bidirectional!=='boolean')errors.push(`${e.id}: direction must be explicit`);
    if(e.accessibility!==null&&(!e.accessibility||!verifiedEvidence(e.accessibility.evidence)))errors.push(`${e.id}: unsupported accessibility`);
  }
  return errors;
}
export const reviewed=e=>!!e&&verifiedEvidence(e.evidence)&&e.independently_reviewed===true&&
  typeof e.independent_reviewer==='string'&&!!e.independent_reviewer.trim()&&e.independent_reviewer.trim()!==e.evidence.reviewer.trim();
function usable(edge,nodes,{accessible,allowUnverified,now}) {
  if(edge.access!=='public'||!allowUnverified&&(!reviewed(edge)||!reviewed(nodes.get(edge.from))||!reviewed(nodes.get(edge.to))))return false;
  if(edge.kind==='passage'&&edge.traversable_passage_verified!==true)return false;
  if(edge.hours) {const status=openingStatus(edge.hours,now);if(status.state!=='likely-open'||status.stale)return false;}
  if(accessible && (edge.kind==='stairs'||edge.accessibility?.wheelchair!==true||!verifiedEvidence(edge.accessibility?.evidence)||[edge.from,edge.to].some(id=>nodes.get(id).accessibility?.wheelchair!==true||!verifiedEvidence(nodes.get(id).accessibility?.evidence))))return false;
  return true;
}
/** Dijkstra. Synthetic fixtures may explicitly opt in to unverified edges; production must never do so. */
export function shortestPath(graph,origin,destination,{accessible=false,allowUnverified=false,walkingSpeed=1.2,now=new Date()}={}) {
  const errors=validateGraph(graph);if(errors.length)throw Error(errors.join('; '));
  if(!Number.isFinite(walkingSpeed)||walkingSpeed<=0)throw Error('Invalid walking speed');
  const nodes=new Map(graph.nodes.map(n=>[n.id,n]));
  if(!nodes.has(origin)||!nodes.has(destination))return {status:'unreachable'};
  if(!allowUnverified&&(!reviewed(nodes.get(origin))||!reviewed(nodes.get(destination))))return {status:'unverified'};
  if(origin===destination)return {status:'already-there',distance_m:0,estimated_seconds:0,geometry:null};
  const adjacency=new Map(graph.nodes.map(n=>[n.id,[]]));
  for(const edge of [...graph.edges].sort((a,b)=>a.id.localeCompare(b.id))) {
    if(!usable(edge,nodes,{accessible,allowUnverified,now}))continue;
    const distance=edge.coordinates.slice(1).reduce((sum,c,i)=>sum+distanceMetres(edge.coordinates[i],c),0);
    adjacency.get(edge.from).push({to:edge.to,edge,distance,reverse:false});
    if(edge.bidirectional)adjacency.get(edge.to).push({to:edge.from,edge,distance,reverse:true});
  }
  const distance=new Map([[origin,0]]),previous=new Map(),pending=new Set(nodes.keys());
  while(pending.size) {
    const current=[...pending].sort((a,b)=>(distance.get(a)??Infinity)-(distance.get(b)??Infinity)||a.localeCompare(b))[0];
    if(!Number.isFinite(distance.get(current)))break;
    pending.delete(current);if(current===destination)break;
    for(const step of adjacency.get(current)) {
      const next=distance.get(current)+step.distance;
      if(pending.has(step.to)&&next<(distance.get(step.to)??Infinity)) {distance.set(step.to,next);previous.set(step.to,{from:current,...step});}
    }
  }
  if(!distance.has(destination))return {status:'unreachable'};
  const steps=[];for(let id=destination;id!==origin;){const step=previous.get(id);steps.unshift(step);id=step.from;}
  const coordinates=steps.flatMap((s,i)=>{const c=s.reverse?[...s.edge.coordinates].reverse():s.edge.coordinates;return i?c.slice(1):c;});
  return {status:'ok',distance_m:distance.get(destination),estimated_seconds:distance.get(destination)/walkingSpeed,
    walking_speed_mps:walkingSpeed,confidence:allowUnverified?'synthetic-unverified':'field-surveyed-and-independently-reviewed',accessibility:accessible?'verified-wheelchair-constraints':'not-assessed-for-this-route',edge_ids:steps.map(s=>s.edge.id),geometry:{type:'LineString',coordinates}};
}
export function connectedComponents(graph) {
  if(validateGraph(graph).length)throw Error('Invalid graph');
  const pending=new Set(graph.nodes.map(n=>n.id)),components=[];
  while(pending.size) {
    const queue=[pending.values().next().value],component=[];pending.delete(queue[0]);
    while(queue.length) {
      const id=queue.shift();component.push(id);
      for(const e of graph.edges) {const next=e.from===id?e.to:e.to===id?e.from:null;if(pending.delete(next))queue.push(next);}
    }
    components.push(component.sort());
  }
  return components;
}

export function navigationAvailability(graph,building) {
 const nodes=graph.nodes||[],entranceIds=(building?.entrances||[]).filter(e=>e.confidence==='verified'&&verifiedEvidence(e.evidence)&&validCoordinates(e.coordinates)&&nodes.some(n=>n.id===e.graph_node_id&&n.kind==='entrance'&&n.coordinates[0]===e.coordinates[0]&&n.coordinates[1]===e.coordinates[1])).map(e=>e.graph_node_id);
 const origins=nodes.filter(n=>['entrance','gate'].includes(n.kind)&&reviewed(n));
 return {status:graph.edges?.some(e=>reviewed(e))&&entranceIds.some(id=>nodes.some(n=>n.id===id&&reviewed(n)))&&origins.length?'available':'unverified',origins,destinations:entranceIds};
}
export function routeToBuilding(graph,origin,building,{accessible=false,footprints=[],now=new Date()}={}) {
 if(validateGraph(graph,{footprints}).length)return {status:'invalid-graph'};
 const availability=navigationAvailability(graph,building);if(availability.status!=='available')return {status:'unverified'};
 const routes=availability.destinations.map(id=>shortestPath(graph,origin,id,{accessible,now})).filter(r=>r.status==='ok'||r.status==='already-there').sort((a,b)=>a.distance_m-b.distance_m);
 return routes[0]||{status:'unreachable'};
}
