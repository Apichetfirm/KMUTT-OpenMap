import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
async function check(dir) {
 for(const item of await readdir(dir,{withFileTypes:true})) {
  const file=dir+'/'+item.name;
  if(item.isDirectory())await check(file);
  else if(file.endsWith('.mjs')) {const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status)process.exitCode=1;}
 }
}
for(const path of ['src','scripts','tests'])await check(path);
