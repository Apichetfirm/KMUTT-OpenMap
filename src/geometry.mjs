import {pointInGeometry,validGeometry} from './data.mjs';
/** A point on the polygon's surface, never an inferred entrance. Scanline handles concavity/holes. */
export function representativePoint(geometry) {
 if(!validGeometry(geometry))throw Error('Invalid geometry');
 const rings=geometry.type==='Polygon'?geometry.coordinates:geometry.coordinates[0],outer=rings[0];
 const ys=[...new Set(outer.map(p=>p[1]))].sort((a,b)=>a-b);
 let best=null,width=-1;
 for(let k=1;k<ys.length;k++) {
  const y=(ys[k-1]+ys[k])/2,xs=[];
  for(const ring of rings)for(let i=1;i<ring.length;i++) {
   const a=ring[i-1],b=ring[i];if((a[1]>y)!==(b[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));
  }
  xs.sort((a,b)=>a-b);
  for(let i=1;i<xs.length;i+=2) {
   const p=[(xs[i-1]+xs[i])/2,y];if(xs[i]-xs[i-1]>width&&pointInGeometry(p,geometry)){best=p;width=xs[i]-xs[i-1];}
  }
 }
 if(!best)throw Error('No interior reference point');return best;
}
