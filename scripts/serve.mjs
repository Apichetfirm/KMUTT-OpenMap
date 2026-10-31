// Loopback-only QA server: exercise the real Pages base path without URL-rewrite fixtures.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=resolve(process.argv[2]||'.'),port=Number(process.argv[3]||8080);
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.geojson':'application/geo+json','.svg':'image/svg+xml','.png':'image/png','.md':'text/plain'};
createServer(async(req,res)=>{
 try {
  let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(path.startsWith('/KMUTT-OpenMap/'))path=path.slice('/KMUTT-OpenMap'.length);
  if(path.split('/').some(p=>p.startsWith('.')))throw Error('Hidden path');
  let file=resolve(root,'.'+path);
  if(!file.startsWith(root+sep)&&file!==root)throw Error('Outside root');
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  const body=await readFile(file);
  res.writeHead(200,{'Content-Type':(mime[extname(file)]||'application/octet-stream'),'Cache-Control':'no-store'});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`QA server: http://127.0.0.1:${port}/KMUTT-OpenMap/`));
