import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequest} from '../functions/api/booking/[action].js';
const env={SALES_SITES_ACCESS_TOKEN:'test-private-token',BOOKING_PROXY_KEY:'test-proxy-key'};
const call=(action,init={})=>onRequest({request:new Request('https://spady.net/api/booking/'+action,init),params:{action},env});
test('public booking proxy exposes only fixed routes and validates origin before forwarding',async()=>{
 let calls=0;const before=globalThis.fetch;globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'https://spady-sales.dhiroshi-inouei.chatgpt.site/api/sales/public/info');assert.equal(options.headers['OAI-Sites-Authorization'],'Bearer test-private-token');return Response.json({calendar:true,meetingReady:true,adminSecret:'must-not-cross',duration:30})};
 try{assert.equal((await call('overview')).status,404);assert.equal((await call('book',{method:'GET'})).status,405);assert.equal((await call('book',{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body:'{}'})).status,403);assert.equal(calls,0);const r=await call('info');assert.deepEqual(await r.json(),{calendar:true,duration:30,meetingReady:true});assert.equal(calls,1);assert.equal(r.headers.get('cache-control'),'no-store')}finally{globalThis.fetch=before}
});
test('booking preserves idempotency payload and does not leak a login page',async()=>{
 const before=globalThis.fetch;const body=JSON.stringify({id:'a'.repeat(32),name:'テスト',privacy:true});globalThis.fetch=async(url,opt)=>{assert.equal(opt.body,body);assert.equal(opt.redirect,'manual');return new Response('login',{status:302,headers:{'content-type':'text/html'}})};
 try{const r=await call('book',{method:'POST',headers:{origin:'https://spady.net','content-type':'application/json'},body});assert.equal(r.status,503);assert.match((await r.json()).error,/接続できません/)}finally{globalThis.fetch=before}
});
