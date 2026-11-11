import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/meta-ads-booking.js';

const env = { SALES_SITES_ACCESS_TOKEN:'server-only-site-token', BOOKING_PROXY_KEY:'server-only-booking-key' };
const receipt = 'a'.repeat(32);
const start = '2026-11-17T01:00:00.000Z';
const valid = { receipt_id:receipt, start };
const accepted = (extra={}) => ({ok:true,request_id:receipt,start,...extra});
function request(body=valid, headers={}, method='POST') {
  return new Request('https://spady.net/api/meta-ads-booking',{method,headers:{Origin:'https://spady.net','Content-Type':'application/json',...headers},...(['GET','HEAD'].includes(method)?{}:{body:typeof body==='string'?body:JSON.stringify(body)})});
}
const call = (req=request(), bindings=env) => onRequest({request:req,env:bindings});
async function mockFetch(fetch, fn) { const original=globalThis.fetch;globalThis.fetch=fetch;try{return await fn();}finally{globalThis.fetch=original;} }

for (const method of ['GET','HEAD','PUT','PATCH','DELETE']) {
  test(`rejects ${method} before forwarding`,async()=>mockFetch(()=>assert.fail('unexpected external call'),async()=>{
    const response=await call(request(valid,{},method));assert.equal(response.status,405);assert.equal((await response.json()).ok,false);
  }));
}
for (const origin of ['', 'https://other.example', 'https://spady.net.attacker.example','http://spady.net']) {
  test(`rejects origin ${origin || '(empty)'}`,async()=>mockFetch(()=>assert.fail('unexpected external call'),async()=>{
    assert.equal((await call(request(valid,{Origin:origin}))).status,403);
  }));
}
test('missing Origin cannot reach the backend',async()=>mockFetch(()=>assert.fail('unexpected external call'),async()=>{
  const req=request();req.headers.delete('origin');assert.equal((await call(req)).status,403);
}));
for (const contentType of ['', 'text/plain', 'application/x-www-form-urlencoded','application/jsonp']) {
  test(`rejects content type ${contentType || '(empty)'}`,async()=>mockFetch(()=>assert.fail('unexpected external call'),async()=>{
    assert.equal((await call(request(valid,{'Content-Type':contentType}))).status,415);
  }));
}
test('rejects malformed JSON, invalid dates, missing or extra fields without forwarding personal data',async()=>mockFetch(()=>assert.fail('unexpected external call'),async()=>{
  const bodies=[
    '{', 'null', '[]', 'true', '"text"', {}, {receipt_id:receipt}, {start},
    {...valid,name:'入力された氏名',email:'private@example.test'},
    {...valid,receipt_id:'A'.repeat(32)}, {...valid,receipt_id:'a'.repeat(31)}, {...valid,receipt_id:1},
    {...valid,start:1}, {...valid,start:'2026-11-17T10:00:00+09:00'}, {...valid,start:'not-a-date'},
    {...valid,start:'2026-02-31T01:00:00.000Z'}, {...valid,start:'2026-11-17T01:00:00Z'},
  ];
  for(const body of bodies) assert.equal((await call(request(body))).status,400,JSON.stringify(body));
}));
test('enforces 512-byte streaming limit, even without Content-Length',async()=>mockFetch(()=>assert.fail('unexpected external call'),async()=>{
  let cancelled=false;
  const stream=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode(' '.repeat(300)));controller.enqueue(new TextEncoder().encode(' '.repeat(213)));},cancel(){cancelled=true;}});
  const req=new Request('https://spady.net/api/meta-ads-booking',{method:'POST',headers:{Origin:'https://spady.net','Content-Type':'application/json'},body:stream,duplex:'half'});
  assert.equal((await call(req)).status,413);assert.equal(cancelled,true);
}));
test('accepts a JSON body exactly at the boundary and content-type charset',async()=>mockFetch(async()=>Response.json(accepted()),async()=>{
  const raw=JSON.stringify(valid).padEnd(512,' ');
  assert.equal((await call(request(raw,{'Content-Type':'application/json; charset=utf-8'}))).status,200);
}));
for(const bindings of [{},{SALES_SITES_ACCESS_TOKEN:env.SALES_SITES_ACCESS_TOKEN},{BOOKING_PROXY_KEY:env.BOOKING_PROXY_KEY}]) {
  test(`missing required bindings never forwards (${Object.keys(bindings).join(',')||'none'})`,async()=>mockFetch(()=>assert.fail('unexpected external call'),async()=>{
    const response=await call(request(),bindings);assert.equal(response.status,503);assert.equal((await response.json()).ok,false);
  }));
}
test('uses only fixed upstream route, server credentials, and opaque booking identifiers',async()=>mockFetch(async(url,options)=>{
  assert.equal(url,'https://spady-sales.dhiroshi-inouei.chatgpt.site/api/sales/public/meta-setup/book');
  assert.equal(options.method,'POST');assert.equal(options.redirect,'manual');assert(options.signal instanceof AbortSignal);
  assert.deepEqual(options.headers,{'Content-Type':'application/json',Origin:'https://spady-sales.dhiroshi-inouei.chatgpt.site','OAI-Sites-Authorization':`Bearer ${env.SALES_SITES_ACCESS_TOKEN}`,'X-Spady-Booking-Key':env.BOOKING_PROXY_KEY,'X-Spady-Visitor-IP':'192.0.2.1'});
  assert.deepEqual(JSON.parse(options.body),valid);
  assert(!options.body.includes('private@example.test'));
  return Response.json(accepted({meeting_url:'https://meet.google.com/example',email:'upstream-private@example.test',token:env.SALES_SITES_ACCESS_TOKEN,private_data:'not for browser'}));
},async()=>{
  const response=await call(request(valid,{'cf-connecting-ip':'192.0.2.1',Authorization:'client-private-token','X-Email':'private@example.test',Cookie:'private=session','X-Spady-Booking-Key':'client-cannot-override'}));
  assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.equal(response.headers.get('X-Content-Type-Options'),'nosniff');
  assert.deepEqual(await response.json(),{ok:true,request_id:receipt,start,meeting_url:'https://meet.google.com/example'});
}));
test('HTML/login redirects and malformed JSON do not appear confirmed',async()=>{
  for(const response of [new Response('<html>private login</html>',{headers:{'Content-Type':'text/html'}}),new Response('',{status:302,headers:{Location:'https://login.example','Content-Type':'text/html'}}),new Response('{broken',{headers:{'Content-Type':'application/json'}})]) {
    await mockFetch(async()=>response,async()=>{const result=await call();assert.equal(result.status,503);const body=await result.json();assert.equal(body.ok,false);assert(!JSON.stringify(body).includes('private'));});
  }
});
test('requires explicit ok=true, matching receipt and exact selected start',async()=>{
  for(const body of [{},accepted({ok:false}),accepted({ok:'true'}),accepted({request_id:'b'.repeat(32)}),accepted({request_id:undefined}),accepted({start:'2026-11-17T02:00:00.000Z'}),accepted({start:undefined}),null]) {
    await mockFetch(async()=>Response.json(body),async()=>{const result=await call();assert.equal(result.status,503);assert.equal((await result.json()).ok,false);});
  }
});
test('absent/non-string meeting link returns an empty link instead of private response data',async()=>{
  for(const meeting_url of [undefined,null,1,{url:'https://private.example'}]) await mockFetch(async()=>Response.json(accepted({meeting_url})),async()=>{
    assert.deepEqual(await(await call()).json(),{ok:true,request_id:receipt,start,meeting_url:''});
  });
});
test('upstream error statuses are allowlisted and upstream messages are never reflected',async()=>{
  for(const [status,expected] of [[400,400],[401,503],[403,403],[404,404],[409,409],[413,413],[415,503],[429,429],[500,503],[502,503],[503,503],[504,503]]) {
    await mockFetch(async()=>Response.json({ok:false,message:'secret-token private@example.test',code:'internal_private_code'},{status}),async()=>{
      const response=await call();assert.equal(response.status,expected);const body=await response.json();assert.equal(body.ok,false);assert.equal(body.code,undefined);assert(!JSON.stringify(body).includes('private'));assert(!JSON.stringify(body).includes('secret'));
    });
  }
});
test('only explicit HTTP 409 slot_unavailable can unlock date selection',async()=>{
  for(const [status,code,expected] of [[409,'slot_unavailable','slot_unavailable'],[409,'conflict',undefined],[409,'SLOT_UNAVAILABLE',undefined],[503,'slot_unavailable',undefined],[400,'slot_unavailable',undefined]]) {
    await mockFetch(async()=>Response.json({ok:false,code},{status}),async()=>{const response=await call();assert.equal(response.status,status);assert.equal((await response.json()).code,expected);});
  }
});
test('network errors and timeout detail are sanitized as uncertain outcomes',async()=>mockFetch(async()=>{throw Error('server-only-site-token private@example.test network failure');},async()=>{
  const response=await call();assert.equal(response.status,503);const body=await response.json();assert.equal(body.ok,false);assert.equal(body.code,undefined);assert(!JSON.stringify(body).includes('token'));assert(!JSON.stringify(body).includes('private'));
}));
test('an error status cannot confirm a booking even with matching success-shaped JSON',async()=>mockFetch(async()=>Response.json(accepted(),{status:503}),async()=>{
  const response=await call();assert.equal(response.status,503);assert.equal((await response.json()).ok,false);
}));

for (const status of [201,202,203,206,207]) {
  test(`HTTP ${status} cannot confirm a booking even with matching success-shaped JSON`,async()=>mockFetch(async()=>Response.json(accepted(),{status}),async()=>{
    const response=await call();assert.equal(response.status,503);assert.equal((await response.json()).ok,false);
  }));
}
