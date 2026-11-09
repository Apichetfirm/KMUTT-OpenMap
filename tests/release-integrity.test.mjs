import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,rm,symlink} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {writeManifest,verifyManifest} from '../scripts/release-integrity.mjs';

async function fixture(fn) {
 const root=await mkdtemp(join(tmpdir(),'openmap-release-'));
 try {await writeFile(join(root,'index.html'),'<title>OpenMap</title>');await fn(root);}
 finally {await rm(root,{recursive:true,force:true});}
}
test('release integrity accepts exact bytes and detects tampering, missing and added files',()=>fixture(async root=>{
 const manifest=await writeManifest(root,{source_commit:'fixture'});
 assert.equal((await verifyManifest(root)).source_commit,'fixture');
 assert.equal(manifest.files.length,1);
 await writeFile(join(root,'index.html'),'changed');await assert.rejects(verifyManifest(root),/integrity failed/);
 await writeFile(join(root,'index.html'),'<title>OpenMap</title>');
 await writeFile(join(root,'extra.txt'),'unexpected');await assert.rejects(verifyManifest(root),/integrity failed/);
 await rm(join(root,'extra.txt'));await rm(join(root,'index.html'));await assert.rejects(verifyManifest(root),/integrity failed/);
}));
test('public packaging refuses private directories, hidden secrets and filesystem links',()=>fixture(async root=>{
 for(const name of ['work','admin','scripts','node_modules']){
  await mkdir(join(root,name));await assert.rejects(writeManifest(root),/Private/);await rm(join(root,name),{recursive:true});
 }
 await writeFile(join(root,'.env'),'private fixture');await assert.rejects(writeManifest(root),/Private/);await rm(join(root,'.env'));
 await symlink(join(root,'index.html'),join(root,'alias.html'));await assert.rejects(writeManifest(root),/Non-regular/);await rm(join(root,'alias.html'));
 await writeFile(join(root,'.nojekyll'),'');await writeManifest(root);assert.equal((await verifyManifest(root)).files.length,2);
}));
