import path from 'node:path';
import {realpathSync} from 'node:fs';
// Resolve existing ancestors too: the output file/directory usually does not exist yet.
function realOutput(value){
 let current=path.resolve(value);const tail=[];
 for(;;){
  try{return path.resolve(realpathSync(current),...tail);}
  catch(error){if(error.code!=='ENOENT')throw error;const parent=path.dirname(current);if(parent===current)throw error;tail.unshift(path.basename(current));current=parent;}
 }
}
function requirePrivate(output,root,paths){
 const relative=paths.relative(root,output);
 const inside=relative===''||relative!=='..'&&!relative.startsWith('..'+paths.sep)&&!paths.isAbsolute(relative);
 if(inside&&relative.split(paths.sep)[0]!=='work')throw Error('Unreviewed evidence inside the repository must stay under work/');
}
/** Keep unreviewed output out of every published repository directory, including Windows paths. */
export function privateEvidenceOutput(value,root=process.cwd(),paths=path){
 const output=paths.resolve(root,value);requirePrivate(output,root,paths);
 // Alternate path implementations support lexical cross-platform tests only.
 if(paths!==path)return output;
 const actual=realOutput(output);requirePrivate(actual,realOutput(root),paths);return actual;
}
