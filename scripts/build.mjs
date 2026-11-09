await import('./verify-vendor.mjs');
import {cp,mkdir,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {writeManifest} from './release-integrity.mjs';
const out=new URL('../.site/',import.meta.url);
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const file of ['index.html','favicon.svg','.nojekyll','src','vendor','data','docs','LICENSE','DATA-LICENSES.md'])await cp(new URL('../'+file,import.meta.url),new URL(file,out),{recursive:true});
const {publishedImagePaths}=await import('./validate-building-media.mjs');
for(const path of publishedImagePaths){await mkdir(new URL('assets/buildings/',out),{recursive:true});await cp(new URL('../'+path.slice(2),import.meta.url),new URL(path.slice(2),out));}
let source_commit=null,source_dirty=null;
try {
 const cwd=fileURLToPath(new URL('../',import.meta.url));
 source_commit=execFileSync('git',['rev-parse','HEAD'],{cwd,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
 source_dirty=Boolean(execFileSync('git',['status','--porcelain','--untracked-files=normal'],{cwd,encoding:'utf8'}).trim());
}catch{/* Exported source bundles need no Git installation. */}
await writeManifest(fileURLToPath(out),{source_commit,source_dirty});
console.log('Static GitHub Pages site staged in .site (no npm runtime, tests, credentials or node_modules).');
