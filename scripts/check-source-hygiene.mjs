import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>readFileSync(resolve(root,name),'utf8');
const page=read('courses.html');
const errors=[];
if(/<style(?:\s|>)/i.test(page))errors.push('Inline CSS returned');
if(/<script(?:\s|>)(?![^>]*\bsrc=)/i.test(page))errors.push('Inline script returned');
if(!page.includes('assets/courses-page.css')||!page.includes('assets/courses-page.js'))errors.push('Course asset missing');
if(!read('assets/courses-page.js').includes('const D='))errors.push('Explorer data missing');
const items=JSON.parse(read('assets/courses.json'));
if(items.length!==16||new Set(items.map(x=>x.code)).size!==16)errors.push('Catalogue must contain 16 unique codes');
if(!read('index.html').includes('name="azm-turnstile-site-key"'))errors.push('Turnstile config missing');
for(const id of ['contactForm','trainerForm'])if(!read('index.html').includes('id="'+id+'"'))errors.push('Form '+id+' missing');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
else console.log('Source hygiene checks passed');
