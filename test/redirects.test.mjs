import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequest} from '../functions/_middleware.js';
test('preserved permalinks redirect once without rewriting unrelated URLs',async()=>{
 for(const [from,to] of [
  ['https://spady.net/?page_id=601&utm_source=old','https://spady.net/privacy/?utm_source=old'],
  ['https://www.spady.net/?page_id=601','https://spady.net/privacy/'],
  ['https://spady.net/特定商取引法に基づく表記/','https://spady.net/legal/'],
  ['https://spady.net/お問い合わせフォーム/','https://spady.net/contact/'],
  ['https://www.spady.net/akindo','https://spady.net/akindo/']]){
  const res=await onRequest({request:new Request(from),next:()=>{throw Error('unexpected fallthrough');}});assert.equal(res.status,301);assert.equal(res.headers.get('location'),to);
 }
 for(const path of ['/services/','/book/','/api/contact','/?page_id=999','/%broken']){
  const res=await onRequest({request:new Request('https://spady.net'+path),next:()=>new Response('preserved')});assert.equal(await res.text(),'preserved');
 }
});
