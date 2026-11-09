import {resolve} from 'node:path';
import {verifyManifest} from './release-integrity.mjs';
const site=resolve(process.argv[2]||'.site');
const manifest=await verifyManifest(site);
console.log(`Verified ${manifest.files.length} public files against SHA-256 manifest: ${site}`);
