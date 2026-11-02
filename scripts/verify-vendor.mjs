import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),manifest=JSON.parse(await readFile(new URL('vendor/maplibre-gl/manifest.json',root))),lock=JSON.parse(await readFile(new URL('package-lock.json',root)));
if(lock.packages['node_modules/maplibre-gl'].version!==manifest.version||lock.packages['node_modules/maplibre-gl'].integrity!==manifest.npm_integrity)throw Error('Vendor manifest differs from lockfile');
if(Object.keys(manifest.files).length!==4)throw Error('Module, worker, CSS and license are required');
for(const [name,entry] of Object.entries(manifest.files)){
 if(!['maplibre-gl.mjs','maplibre-gl.css','maplibre-gl-worker.mjs','LICENSE.txt'].includes(name))throw Error('Unexpected vendor file');
 const bytes=await readFile(new URL('vendor/maplibre-gl/'+name,root));if(bytes.length!==entry.bytes||createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw Error(`Vendor digest mismatch: ${name}`);
 const source=await readFile(new URL('node_modules/maplibre-gl/'+(name==='LICENSE.txt'?'':'dist/')+name,root));if(!bytes.equals(source))throw Error(`Vendor differs from npm artifact: ${name}`);
}
console.log(`Verified MapLibre ${manifest.version} assets against SHA-256 manifest and locked npm package.`);
