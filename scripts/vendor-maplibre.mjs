import {readFile,writeFile,mkdir} from 'node:fs/promises';import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),version=JSON.parse(await readFile(new URL('node_modules/maplibre-gl/package.json',root))).version;
const locked=JSON.parse(await readFile(new URL('package-lock.json',root))).packages['node_modules/maplibre-gl'];
if(version!==locked.version)throw Error('Installed MapLibre differs from package-lock');
const manifest={package:'maplibre-gl',version,source:`https://registry.npmjs.org/maplibre-gl/-/maplibre-gl-${version}.tgz`,npm_integrity:locked.integrity,license:'BSD-3-Clause plus bundled notices in LICENSE.txt',worker:'Separate same-origin maplibre-gl-worker.mjs; vendored from the same locked npm package.',files:{}};
await mkdir(new URL('vendor/maplibre-gl/',root),{recursive:true});
for(const [source,name] of [['dist/maplibre-gl.mjs','maplibre-gl.mjs'],['dist/maplibre-gl.css','maplibre-gl.css'],['dist/maplibre-gl-worker.mjs','maplibre-gl-worker.mjs'],['LICENSE.txt','LICENSE.txt']]){const bytes=await readFile(new URL('node_modules/maplibre-gl/'+source,root));await writeFile(new URL('vendor/maplibre-gl/'+name,root),bytes);manifest.files[name]={sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};}
await writeFile(new URL('vendor/maplibre-gl/manifest.json',root),JSON.stringify(manifest,null,2)+'\n');console.log(`Vendored locked MapLibre ${version} module, stylesheet, worker and licenses.`);
