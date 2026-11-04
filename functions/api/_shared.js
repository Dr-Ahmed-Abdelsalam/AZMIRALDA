const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
const reply=(message,status=200)=>new Response(JSON.stringify(message),{status,headers});
const clamp=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
const checkEmail=email=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&email.length<=180;
const escapeHtml=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function handleForm({request,env},kind){
 if(request.method!=='POST')return reply({error:'Method not allowed'},405);
 if(!request.headers.get('content-type')?.includes('application/json'))return reply({error:'Unsupported content type'},415);
 const len=Number(request.headers.get('content-length')||0);if(len>12000)return reply({error:'Payload too large'},413);
 let data;try{data=await request.json()}catch{return reply({error:'Invalid JSON'},400)}
 if(!data||typeof data!=='object'||Array.isArray(data))return reply({error:'Invalid form'},400);
 const name=clamp(data.name,120),email=clamp(data.email,180),phone=clamp(data.phone,32),message=clamp(data.message,3000),consent=data.consent===true;
 const topic=kind==='contact'?clamp(data.topic,30):clamp(data.specialty,160);
 if(!consent||name.length<2||!checkEmail(email)||message.length<10||!topic)return reply({error:'Missing or invalid fields'},400);
 if(kind==='contact'&&!['maritime','logistics','training','general'].includes(topic))return reply({error:'Invalid topic'},400);
 if(kind==='instructor'&&topic.length<2)return reply({error:'Invalid specialty'},400);
 const profile=kind==='instructor'?clamp(data.profile,400):'';
 if(profile){try{if(!['http:','https:'].includes(new URL(profile).protocol))throw new Error()}catch{return reply({error:'Invalid profile URL'},400)}}
 if(!env.RESEND_API_KEY||!env.CONTACT_TO_EMAIL||!env.MAIL_FROM)return reply({error:'Mail delivery not configured'},503);
 // Optional Cloudflare Turnstile: configure both site widget and secret to activate.
 if(env.TURNSTILE_SECRET_KEY){const token=clamp(data.turnstileToken,3000);if(!token)return reply({error:'Human verification required'},400);
 const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:token})});if(!(await verify.json()).success)return reply({error:'Human verification failed'},400)}
 const subject=(kind==='contact'?'AZMIRALDA enquiry':'AZMIRALDA instructor interest')+' — '+topic;
 const lines=[['Request type',kind],['Name',name],['Email',email],['Phone',phone],['Topic / Specialty',topic],['Profile',profile],['Message',message]];
 const html='<div dir="auto" style="font-family:Arial,sans-serif"><h2>'+escapeHtml(subject)+'</h2>'+lines.map(([k,v])=>`<p><b>${escapeHtml(k)}</b><br><span style="white-space:pre-wrap">${escapeHtml(v)}</span></p>`).join('')+'</div>';
 try{const sent=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.MAIL_FROM,to:[env.CONTACT_TO_EMAIL],reply_to:email,subject,html})});if(!sent.ok)return reply({error:'Email provider failed'},502);return reply({ok:true})}catch{return reply({error:'Delivery unavailable'},502)}
}
