import path from 'node:path';
/** Keep unreviewed output out of every published repository directory, including Windows paths. */
export function privateEvidenceOutput(value,root=process.cwd(),paths=path){
 const output=paths.resolve(root,value),relative=paths.relative(root,output);
 const inside=relative===''||relative!=='..'&&!relative.startsWith('..'+paths.sep)&&!paths.isAbsolute(relative);
 if(inside&&relative.split(paths.sep)[0]!=='work')throw Error('Unreviewed evidence inside the repository must stay under work/');
 return output;
}
