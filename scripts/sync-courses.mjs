import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(readFileSync(resolve(root,'assets/courses.json'),'utf8'));
const result='window.AZM_COURSES = '+JSON.stringify(data,null,2)+';'+String.fromCharCode(10);
const target=resolve(root,'assets/courses.js');
if(process.argv.includes('--check')){
 if(readFileSync(target,'utf8')!==result){console.error('Catalogue adapter stale: run node scripts/sync-courses.mjs');process.exitCode=1}
 else console.log('Catalogue source and adapter match');
}else{writeFileSync(target,result);console.log('Generated assets/courses.js from canonical JSON')}
