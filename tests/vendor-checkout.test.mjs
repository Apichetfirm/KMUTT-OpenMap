import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

test('Windows checkout filters preserve all vendored npm artifact digests',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../vendor/maplibre-gl/manifest.json',import.meta.url)));
 for(const [name,entry] of Object.entries(manifest.files)){
  const bytes=execFileSync('git',['-c','core.autocrlf=true','cat-file','--filters','HEAD:vendor/maplibre-gl/'+name],{maxBuffer:8_000_000});
  assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,name+' must survive a Windows checkout unchanged');
 }
});
