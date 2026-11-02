await import('./verify-vendor.mjs');
import {cp,mkdir,rm} from 'node:fs/promises';
const out=new URL('../.site/',import.meta.url);
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const file of ['index.html','favicon.svg','.nojekyll','src','vendor','data','docs','LICENSE','DATA-LICENSES.md'])await cp(new URL('../'+file,import.meta.url),new URL(file,out),{recursive:true});
const {publishedImagePaths}=await import('./validate-building-media.mjs');
for(const path of publishedImagePaths){await mkdir(new URL('assets/buildings/',out),{recursive:true});await cp(new URL('../'+path.slice(2),import.meta.url),new URL(path.slice(2),out));}
console.log('Static GitHub Pages site staged in .site (no npm runtime, tests, credentials or node_modules).');
