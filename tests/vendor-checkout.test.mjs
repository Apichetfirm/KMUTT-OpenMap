import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,copyFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('Windows checkout filters preserve all vendored npm artifact digests',t=>{
 const manifest=JSON.parse(readFileSync(new URL('../vendor/maplibre-gl/manifest.json',import.meta.url)));
 // Exercise real Git filters on the delivered working files, including in source ZIPs
 // without .git/HEAD. A temporary index needs no commit, identity or network access.
 const root=mkdtempSync(join(tmpdir(),'openmap-checkout-'));
 t.after(()=>rmSync(root,{recursive:true,force:true}));
 const git=args=>execFileSync('git',['-C',root,'-c','core.autocrlf=true',...args],{maxBuffer:8_000_000});
 git(['init','--quiet']);
 copyFileSync(new URL('../.gitattributes',import.meta.url),join(root,'.gitattributes'));
 mkdirSync(join(root,'vendor/maplibre-gl'),{recursive:true});
 for(const name of Object.keys(manifest.files))copyFileSync(new URL('../vendor/maplibre-gl/'+name,import.meta.url),join(root,'vendor/maplibre-gl',name));
 git(['add','.gitattributes','vendor']);
 for(const [name,entry] of Object.entries(manifest.files)){
  const bytes=git(['cat-file','--filters',':vendor/maplibre-gl/'+name]);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,name+' must survive a Windows checkout unchanged');
 }
});
