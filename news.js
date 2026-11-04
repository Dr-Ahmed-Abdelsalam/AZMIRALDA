(()=>{'use strict';
const d=window.AZM_COURSES||[];
let lang='ar';
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const menu=document.getElementById('newsMenuBtn');
const nav=document.getElementById('newsNav');
const menuText=open=>lang==='ar'?(open?'إغلاق القائمة':'فتح القائمة'):(open?'Close menu':'Open menu');

function paint(){
 document.documentElement.lang=lang;
 document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 document.querySelectorAll('[data-ar][data-en]').forEach(e=>{e.textContent=e.dataset[lang]});
 document.getElementById('newsLang').textContent=lang==='ar'?'EN':'عربي';
 document.getElementById('newsCourseList').innerHTML=d.slice(0,16).map(c=>`<a href="./courses.html" aria-label="${safe(c.code+' — '+(lang==='ar'?c.ar:c.en))}"><b>${safe(c.code)}</b><span>${safe(lang==='ar'?c.ar:c.en)}</span></a>`).join('');
 if(menu)menu.setAttribute('aria-label',menuText(Boolean(nav?.classList.contains('open'))));
}

document.getElementById('newsLang').onclick=()=>{lang=lang==='ar'?'en':'ar';paint()};
if(menu&&nav){
 menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',menuText(open))});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',menuText(false))}));
}
document.getElementById('year').textContent=new Date().getFullYear();
paint();
})();
