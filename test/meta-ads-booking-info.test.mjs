import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequest} from '../functions/api/meta-ads-booking-info.js';
const env={SALES_SITES_ACCESS_TOKEN:'server-token',BOOKING_PROXY_KEY:'server-key'};
const request=new Request('https://spady.net/api/meta-ads-booking-info');
const state={calendar:true,duration:30,timezone:'Asia/Tokyo',meetingProvider:'lark',meetingReady:true};
async function mockFetch(fetch, fn){const original=globalThis.fetch;globalThis.fetch=fetch;try{await fn();}finally{globalThis.fetch=original;}}
test('readiness never exposes upstream account IDs, meeting URLs or credentials',async()=>mockFetch(async(url,options)=>{
  assert.equal(url,'https://spady-sales.dhiroshi-inouei.chatgpt.site/api/sales/public/meta-setup/info');
  assert.equal(options.headers['X-Spady-Booking-Key'],'server-key');
  assert.equal(options.redirect,'manual');
  return Response.json({...state,meetingUrl:'https://private.example',calendarId:'private@example.test',token:'secret'});
},async()=>{const response=await onRequest({request,env});assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.deepEqual(await response.json(),state);}));
test('missing integration, HTML redirects and malformed readiness cannot appear ready',async()=>{
  assert.equal((await onRequest({request,env:{}})).status,503);
  for(const result of [null,{}, {...state,meetingReady:'true'}, {...state,duration:45}, {...state,timezone:'UTC'}, {...state,meetingProvider:'google'}]) await mockFetch(async()=>Response.json(result),async()=>{const response=await onRequest({request,env});assert.equal(response.status,503);assert.deepEqual(await response.json(),{ok:false});});
  await mockFetch(async()=>new Response('<html>Login</html>',{headers:{'Content-Type':'text/html'}}),async()=>{assert.equal((await onRequest({request,env})).status,503);});
});
test('disconnected readiness remains explicitly false',async()=>mockFetch(async()=>Response.json({...state,calendar:false,meetingReady:false}),async()=>{assert.deepEqual(await(await onRequest({request,env})).json(),{...state,calendar:false,meetingReady:false});}));
