import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {join,resolve,relative,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const all=(dir)=>readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?all(join(dir,d.name)):[join(dir,d.name)]);
const htmlFiles=all(root).filter(p=>extname(p)==='.html'&&!p.includes('node_modules'));
let checks=0;const errors=[];
for(const filename of htmlFiles){
 const text=readFileSync(filename,'utf8');
 const origin='https://test.invalid/'+relative(root,filename).split(sep).join('/');
 const ids=new Set([...text.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]));
 for(const a of text.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)){
  const val=a[1];if(!val||/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(val))continue;
  let url;try{url=new URL(val,origin)}catch{errors.push(filename+': bad URL '+val);continue}
  if(url.origin!=='https://test.invalid')continue;
  let target=resolve(root,decodeURIComponent(url.pathname).replace(/^\//,''));
  if(!target.startsWith(root+sep)&&target!==root){errors.push(filename+': traversal '+val);continue}
  if(target===root||target.endsWith(sep))target=join(target,'index.html');
  checks++;
  if(!existsSync(target)){errors.push(relative(root,filename)+': missing '+val);continue}
  if(url.hash&&extname(target)==='.html'){
   const targetIds=target===filename?ids:new Set([...readFileSync(target,'utf8').matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]));
   if(!targetIds.has(decodeURIComponent(url.hash.slice(1))))errors.push(relative(root,filename)+': unknown anchor '+val);
  }
 }
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
else console.log('Validated '+checks+' internal URLs across '+htmlFiles.length+' HTML pages');
