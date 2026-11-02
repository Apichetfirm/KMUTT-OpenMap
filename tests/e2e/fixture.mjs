const origin='http://127.0.0.1:8080';
export async function fixture(page,{cdnFailure=false,dataFailure=false,realRuntime=false}={}) {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin===origin) {
   if(url.pathname.includes('/vendor/maplibre-gl/maplibre-gl.mjs')&&!realRuntime) {
    if(cdnFailure)return route.abort();
    return route.fulfill({contentType:'application/javascript',body:`export * from '${origin}/node_modules/maplibre-gl/dist/maplibre-gl.mjs';
      import {Map} from '${origin}/node_modules/maplibre-gl/dist/maplibre-gl.mjs';
      const on=Map.prototype.on;Map.prototype.on=function(...a){window.__map=this;return on.apply(this,a)};
      const fly=Map.prototype.flyTo;Map.prototype.flyTo=function(options){window.__camera=options;return fly.call(this,options)};`});
   }
   if(dataFailure&&url.pathname.endsWith('/data/buildings.json'))return route.fulfill({status:503,body:'unavailable'});
   return route.continue();
  }
  if(url.hostname==='tiles.openfreemap.org') {
   if(url.pathname.includes('/styles/'))return route.fulfill({json:{version:8,glyphs:'https://tiles.openfreemap.org/test-glyphs/{fontstack}/{range}.pbf',sources:{},layers:[{id:'background',type:'background',paint:{'background-color':url.pathname.endsWith('dark')?'#172b35':'#e4eae5'}}]}});
   if(url.pathname==='/planet')return route.fulfill({json:{tilejson:'3.0.0',attribution:'<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>',tiles:['https://tiles.openfreemap.org/test/{z}/{x}/{y}.pbf'],minzoom:0,maxzoom:14,vector_layers:[{id:'building',fields:{render_height:'Number',render_min_height:'Number'}}]}});
   return route.fulfill({status:204,body:''});
  }
  return route.abort();
 });
 return errors;
}
