import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequestPost as contact} from '../functions/api/contact.js';
import {onRequestPost as instructor} from '../functions/api/instructor.js';
const env={RESEND_API_KEY:'test-only',CONTACT_TO_EMAIL:'receiver@example.com',MAIL_FROM:'sender@example.com'};
const payload=(kind='contact')=>({name:'Example Applicant',email:'student@example.com',phone:'+201234567890',message:'Please contact me about the training details.',consent:true,...(kind==='contact'?{topic:'training'}:{specialty:'Maritime safety'})});
function req(path,body,headers={}){
 return new Request('https://test.invalid/api/'+path,{method:'POST',headers:{'content-type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
}
test('form rejects invalid consent and unexpected email',async()=>{
 const response=await contact({request:req('contact',{...payload(),consent:false}),env});
 assert.equal(response.status,400);
});
test('oversize request is rejected without Content-Length header',async()=>{
 const response=await contact({request:req('contact','x'.repeat(12001)),env});
 assert.equal(response.status,413);
});
test('missing mail configuration produces a clear 503',async()=>{
 const response=await contact({request:req('contact',payload()),env:{}});
 assert.equal(response.status,503);
});
test('both Cloudflare routes send exactly one sanitized Resend message',async()=>{
 const oldFetch=globalThis.fetch;const sent=[];
 globalThis.fetch=async (url,options)=>{assert.equal(url,'https://api.resend.com/emails');sent.push(JSON.parse(options.body));return new Response(JSON.stringify({id:'test-id'}),{status:200})};
 try{
  for(const [endpoint,kind] of [[contact,'contact'],[instructor,'instructor']]){
   const response=await endpoint({request:req(kind,payload(kind)),env});
   assert.equal(response.status,200);
  }
  assert.equal(sent.length,2);
  assert.equal(sent[0].to[0],'receiver@example.com');
  assert.equal(sent[1].reply_to,'student@example.com');
 }finally{globalThis.fetch=oldFetch}
});
test('Turnstile requires token if backend secret configured',async()=>{
 const response=await contact({request:req('contact',payload()),env:{...env,TURNSTILE_SECRET_KEY:'test-secret'}});
 assert.equal(response.status,400);
});
test('Turnstile success verifies hostname before sending',async()=>{
 const oldFetch=globalThis.fetch;let verified=0,sent=0;
 globalThis.fetch=async url=>{
  if(String(url).includes('siteverify')){verified++;return Response.json({success:true,hostname:'preview.example.com'})}
  if(String(url).includes('resend.com')){sent++;return Response.json({id:'test-id'})}
  throw Error('unexpected request');
 };
 try{
  const data={...payload(),turnstileToken:'test-token'};
  const ok=await contact({request:req('contact',data),env:{...env,TURNSTILE_SECRET_KEY:'test-secret',TURNSTILE_EXPECTED_HOSTNAME:'preview.example.com'}});
  assert.equal(ok.status,200);
  const mismatch=await contact({request:req('contact',data),env:{...env,TURNSTILE_SECRET_KEY:'test-secret',TURNSTILE_EXPECTED_HOSTNAME:'another.example.com'}});
  assert.equal(mismatch.status,400);
  assert.equal(verified,2);assert.equal(sent,1);
 }finally{globalThis.fetch=oldFetch}
});
test('untrusted input is escaped before composing HTML email',async()=>{
 const oldFetch=globalThis.fetch;let html='';
 globalThis.fetch=async (_url,opts)=>{html=JSON.parse(opts.body).html;return Response.json({id:'test-id'})};
 try{
  const response=await contact({request:req('contact',{...payload(),name:'<script>alert(1)</script>'}),env});
  assert.equal(response.status,200);
  assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));
 }finally{globalThis.fetch=oldFetch}
});

test('content type is strictly JSON, not a substring',async()=>{
 const response=await contact({request:req('contact',payload(),{'content-type':'text/plain; note=application/json'}),env});
 assert.equal(response.status,415);
});
test('invalid JSON is rejected',async()=>{
 const response=await instructor({request:req('instructor','{invalid'),env});
 assert.equal(response.status,400);
});
test('explicit oversized Content-Length is rejected',async()=>{
 const response=await contact({request:req('contact',payload(),{'content-length':'12001'}),env});
 assert.equal(response.status,413);
});
