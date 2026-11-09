import {readdir, readFile, lstat, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join, resolve, relative, sep} from 'node:path';

export const MANIFEST = 'release-manifest.json';
const forbidden = new Set(['admin','work','node_modules','tests','scripts','.git','__pycache__']);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

export async function inventory(root) {
  const files = [];
  async function visit(dir) {
    for (const item of await readdir(dir, {withFileTypes:true})) {
      const file = join(dir, item.name), path = relative(root, file).split(sep).join('/');
      if (path === MANIFEST) continue;
      if ((item.name.startsWith('.') && path !== '.nojekyll') || forbidden.has(item.name) || /\.(?:log|pem|key|p12|pfx)$/i.test(item.name)) throw Error('Private or unexpected public path: '+path);
      const info = await lstat(file);
      if (info.isSymbolicLink() || (!info.isDirectory() && !info.isFile())) throw Error('Non-regular public path: '+path);
      if (info.isDirectory()) await visit(file);
      else files.push({path, bytes:info.size, sha256:digest(await readFile(file))});
    }
  }
  await visit(resolve(root));
  return files.sort((a,b)=>a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}

export async function writeManifest(root, metadata={}) {
  const manifest = {schema_version:1, ...metadata, files:await inventory(root)};
  await writeFile(join(root, MANIFEST), JSON.stringify(manifest,null,2)+'\n');
  return manifest;
}

export async function verifyManifest(root) {
  const manifestPath = join(root, MANIFEST);
  if (!(await lstat(manifestPath)).isFile() || (await lstat(manifestPath)).isSymbolicLink()) throw Error('Manifest must be a regular file');
  const manifest = JSON.parse(await readFile(manifestPath,'utf8'));
  if (manifest.schema_version !== 1 || !Array.isArray(manifest.files)) throw Error('Invalid release manifest');
  const actual = await inventory(root);
  if (JSON.stringify(manifest.files) !== JSON.stringify(actual)) throw Error('Release integrity failed: missing, extra or changed public files');
  return manifest;
}
