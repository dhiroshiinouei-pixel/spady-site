import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/meta-ads-setup.js';
const env = { SALES_SITES_ACCESS_TOKEN:'test-token', BOOKING_PROXY_KEY:'test-key' };
const id = 'a'.repeat(32);
function request(body = new URLSearchParams({ id, form_version:'meta-ads-setup-v1', name:'確認用', website:'' }), headers = {}) {
  return new Request('https://spady.net/api/meta-ads-setup', {method:'POST',body,headers:{origin:'https://spady.net',...headers}});
}
const call = (req=request(), bindings=env) => onRequest({request:req,env:bindings});
test('rejects bad origin, files, duplicate fields, spam, version and oversized input before forwarding', async () => {
  const original = globalThis.fetch; let calls=0; globalThis.fetch=async()=>{calls++;throw Error('must not send')};
  try {
    assert.equal((await call(request(undefined,{origin:'https://other.example'}))).status,403);
    assert.equal((await call(new Request('https://spady.net/api/meta-ads-setup'))).status,405);
    const duplicate=new URLSearchParams({id,form_version:'meta-ads-setup-v1'});duplicate.append('id',id);
    assert.equal((await call(request(duplicate))).status,400);
    assert.equal((await call(request(new URLSearchParams({id,form_version:'wrong'})))).status,400);
    assert.equal((await call(request(new URLSearchParams({id,form_version:'meta-ads-setup-v1',website:'spam'})))).status,400);
    const file=new FormData();file.set('id',id);file.set('form_version','meta-ads-setup-v1');file.set('message',new Blob(['file']),'file.txt');
    assert.equal((await call(request(file))).status,400);
    assert.equal((await call(request(new URLSearchParams({message:'a'.repeat(25000)})))).status,413);
    assert.equal(calls,0);
  } finally {globalThis.fetch=original;}
});
test('missing bindings and non-json upstream cannot appear accepted',async()=>{
  const original=globalThis.fetch;
  try{
    assert.equal((await call(request(),{})).status,503);
    globalThis.fetch=async()=>new Response('login',{status:302,headers:{'Content-Type':'text/html'}});
    const r=await call();assert.equal(r.status,503);assert.equal((await r.json()).ok,false);
  }finally{globalThis.fetch=original;}
});
test('accepts only the matching durable receipt, forwards secrets only server-to-server, and strips private data',async()=>{
  const original=globalThis.fetch;
  try{
    globalThis.fetch=async(url,options)=>{
      assert.equal(url,'https://spady-sales.dhiroshi-inouei.chatgpt.site/api/sales/public/meta-setup');
      assert.equal(options.redirect,'manual');assert.equal(options.headers['X-Spady-Booking-Key'],'test-key');
      assert.equal(options.headers['OAI-Sites-Authorization'],'Bearer test-token');
      assert.equal(JSON.parse(options.body).id,id);
      return Response.json({ok:true,request_id:id,private_data:'must not cross'});
    };
    const r=await call();assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');assert.deepEqual(await r.json(),{ok:true,request_id:id});
    globalThis.fetch=async()=>Response.json({ok:true,request_id:'b'.repeat(32)});
    assert.equal((await call()).status,503);
    globalThis.fetch=async()=>Response.json({ok:true});assert.equal((await call()).status,503);
    globalThis.fetch=async()=>{throw Error('network token must not leak')};const failure=await call();assert.equal(failure.status,503);assert(!JSON.stringify(await failure.json()).includes('token'));
  }finally{globalThis.fetch=original;}
});
test('validation and idempotency conflicts never become success',async()=>{
  const original=globalThis.fetch;
  try{
    for(const status of [400,409,429]){
      globalThis.fetch=async()=>Response.json({error:'入力をご確認ください'},{status});
      const r=await call();assert.equal(r.status,status);assert.equal((await r.json()).ok,false);
    }
  }finally{globalThis.fetch=original;}
});
