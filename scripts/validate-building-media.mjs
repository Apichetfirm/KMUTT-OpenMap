import {readFile} from 'node:fs/promises';import {validateMedia} from '../src/building-evidence.mjs';
const {buildings}=JSON.parse(await readFile(new URL('../data/buildings.json',import.meta.url))),media=JSON.parse(await readFile(new URL('../data/building-media.json',import.meta.url)));
const errors=validateMedia(media,buildings.map(b=>b.id));if(errors.length)throw Error(errors.join('; '));
export const publishedImagePaths=[...new Set(media.buildings.flatMap(b=>[b.photo,...b.gallery].filter(Boolean)).flatMap(p=>[p.src,...p.variants.map(v=>v.src)]))];
for(const path of publishedImagePaths){const bytes=await readFile(new URL('../'+path.slice(2),import.meta.url));if(bytes.length>1024*1024)throw Error('Image exceeds 1MB publication budget: '+path);if(!((bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')||/ftypavi[fs]/.test(bytes.toString('ascii',0,32))))throw Error('Invalid optimized image: '+path);}
console.log(`Image metadata valid; ${publishedImagePaths.length} reviewed derivatives. Missing/unknown photos remain explicit.`);
