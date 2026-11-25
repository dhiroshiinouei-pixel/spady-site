import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHmac} from 'node:crypto';
import vm from 'node:vm';
import {onRequestPost} from '../functions/api/kuchikomi365/referral.js';
const browserCode=readFileSync(new URL('../public/kuchikomi365/booking.js',import.meta.url),'utf8');
const sheetCode=readFileSync(new URL('../docs/kuchikomi365-referral-ledger.gs',import.meta.url),'utf8');
const site='https://feat-kuchikomi365-referral-b.spady-site.pages.dev';
const url=site+'/api/kuchikomi365/referral';
const id='sp_AbcdefghijklmnopqrstvXYZ', other='sp_ZabcdefghijklmnopqrstvX';
const origin='https://meetings-na2.hubspot.com', secret='test-only-secret-'.repeat(3);
const success={meetingBookSucceeded:true, meetingsPayload:{bookingResponse:{postResponse:{timerange:{start:1234},name:'do not forward'}}}};
function simulate(search) {
  const frameWindow={}, handler={}, elements=new Map(), calls=[];
  function el(key) { if (!elements.has(key)) elements.set(key,{addEventListener(){},classList:{add(){},remove(){}},style:{},contentWindow:frameWindow,setAttribute(){}}); return elements.get(key); }
  const window={addEventListener:(type,fn)=>handler[type]=fn};
  vm.runInNewContext(browserCode,{window,navigator:{},document:{getElementById:el,querySelectorAll:()=>[]},location:{search,origin:site},URL,URLSearchParams,fetch:(path,req)=>{calls.push([path,req]);return Promise.resolve();}});
  return {send:(data=success,o=origin,source=frameWindow)=>handler.message({data,origin:o,source}),calls,frame:el('bookingFrame')};
}
function sheetFixture(rows,{notify=false,fail=false}={}) {
  const edits=[], mail=[];
  const svg={
    getLastRow:()=>rows.length+2,
    getRange:(r,c,h)=> h?{getValues:()=>rows}:{setValue:v=>edits.push([r,c,v])},
  };
  const ctx=vm.createContext({
    MailApp:{sendEmail:msg=>{mail.push(msg);if(fail)throw Error('mail unavailable');}},
    SpreadsheetApp:{flush(){},openById:()=>({getSheetByName:()=>svg})},
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>({REFERRAL_SECRET:secret,REFERRAL_SHEET_ID:'dummy-id',REFERRAL_OWNER_EMAIL_ENABLED:notify?'true':''})[k]})},
    LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},
    Utilities:{computeHmacSha256Signature:(s,k)=>[...createHmac('sha256',k).update(s).digest()]},
    ContentService:{createTextOutput:data=>data},
  });
  vm.runInContext(sheetCode,ctx);
  return {edits,mail,post: data=>ctx.doPost({postData:{contents:JSON.stringify(data)}})};
}
const request=(ref=id,o=site)=>new Request(url,{method:'POST',headers:{origin:o,'content-type':'application/json'},body:JSON.stringify({ref})});
const opts={K365_REFERRAL_WEBAPP:'https://script.google.com/macros/s/testing/exec',K365_REFERRAL_SECRET:secret};
test('only valid embedded completion signals report the ID once and never read form data',()=>{
 const b=simulate('?ref='+id+'&utm_source=email');
 b.send({height:900}); b.send(success,'https://wrong.example'); b.send(success,origin,{});
 b.send({...success,meetingsPayload:{...success.meetingsPayload,offline:true}});
 assert.equal(b.calls.length,0); b.send(); b.send();
 assert.deepEqual(JSON.parse(b.calls[0][1].body),{ref:id});
 assert.equal(b.calls[0][0],'/api/kuchikomi365/referral');assert.equal(b.calls.length,1);
 assert.equal(new URL(b.frame.src).searchParams.has('ref'),false);
 assert.equal(new URL(b.frame.src).searchParams.get('consultation_details'),'Spady（井上博史）紹介');
 for(const search of ['','?ref=bad','?ref='+id+'&ref='+other]){const a=simulate(search);a.send();assert.equal(a.calls.length,0);}
});
test('relay and sheet update only F of the matching row; invalid signature/unknowns/duplicates never update',async()=>{
 const row=[id,'ダミー店舗 A','','','',''];const store=sheetFixture([row,[other,'別のダミー','','','','']]);
 const original=globalThis.fetch;let observed;
 globalThis.fetch=async(_target,req)=>{observed=JSON.parse(req.body);return new Response(store.post(observed));};
 try{
   assert.equal((await onRequestPost({request:request(),env:{}})).status,503);
   assert.equal((await onRequestPost({request:request(id,'https://wrong.example'),env:opts})).status,403);
   assert.equal((await onRequestPost({request:request('bad'),env:opts})).status,400);
   assert.equal((await onRequestPost({request:request(),env:opts})).status,204);
   assert.equal(store.edits.length,1);
   assert.deepEqual(store.edits[0].slice(0,2),[3,6]);
   assert.deepEqual(Object.keys(observed).sort(),['ref','sig','ts']);
   row[5]=store.edits[0][2];assert.equal(store.post(observed),'ignored');assert.equal(store.edits.length,1);
   assert.equal(store.post({...observed,sig:'0'.repeat(64)}),'forbidden');
   const signed=(ref,ts=observed.ts)=>({ref,ts,sig:createHmac('sha256',secret).update(ref+'\n'+ts).digest('hex')});
   assert.equal(store.post(signed(other,observed.ts-600000)),'forbidden');
   assert.equal(sheetFixture([row,row]).post(observed),'ignored');
   assert.equal(sheetFixture([[id,'','','','','']]).post(observed),'ignored');
   assert.equal(sheetFixture([[other,'別のダミー']]).post(observed),'ignored');
 } finally {globalThis.fetch=original;}
});

test('explicitly enabled notification produces one private LINE draft only for a sent row',()=>{
 const ts=Date.now(), data={ref:id,ts,sig:createHmac('sha256',secret).update(id+'\n'+ts).digest('hex')};
 const row=[id,'架空の店舗 ABC','','',new Date(ts-1000),''];
 const f=sheetFixture([row],{notify:true});
 assert.equal(f.post(data),'recorded');
 assert.equal(f.mail.length,1);
 assert.equal(f.mail[0].to,'info@spady.net');
 assert.match(f.mail[0].body,/架空の店舗 ABC/);
 assert.match(f.mail[0].subject,/本部未確認/);
 assert.match(f.mail[0].body,/Spadyの井上です/);
 assert.ok(!f.mail[0].body.includes(id));
 row[5]=f.edits[0][2];
 f.post(data);
 assert.equal(f.mail.length,1);
 assert.equal(sheetFixture([[id,'ダミー','','',new Date(ts),'']]).post(data),'recorded');
 const off=sheetFixture([[id,'ダミー','','',new Date(ts),'']]);off.post(data);assert.equal(off.mail.length,0);
 const unsent=sheetFixture([[id,'未送信ダミー','','','','']],{notify:true});unsent.post(data);assert.equal(unsent.mail.length,0);
 const fail=sheetFixture([[id,'障害テスト','','',new Date(ts),'']],{notify:true,fail:true});
 assert.equal(fail.post(data),'recorded');assert.equal(fail.edits.length,1);
});
