/** Local equirectangular thumbnail: preserve metre-scale proportions at the footprint latitude. */
export function footprintPreview(geometry){
 const ring=geometry.type==='Polygon'?geometry.coordinates[0]:geometry.coordinates[0][0];
 const xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]),minx=Math.min(...xs),maxx=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys),cos=Math.cos((miny+maxy)/2*Math.PI/180),width=(maxx-minx)*cos,height=maxy-miny;
 if(!(width>0&&height>0))throw Error('Invalid footprint preview');
 const scale=Math.min(340/width,180/height),left=(360-width*scale)/2,bottom=(200+height*scale)/2;
 return ring.map(p=>`${left+(p[0]-minx)*cos*scale},${bottom-(p[1]-miny)*scale}`).join(' ');
}
