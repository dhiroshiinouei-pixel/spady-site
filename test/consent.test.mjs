import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const script = readFileSync(new URL('../src/components/SiteConsent.astro', import.meta.url), 'utf8').split('<script is:inline>')[1].split('</script>')[0];
function setup(saved, storageThrows=false) {
  const handlers = {};
  const buttons = ['granted','denied'].map(value=>({dataset:{consent:value},addEventListener(_,fn){handlers[value]=fn;},focus(){}}));
  const bar = {hidden:true,querySelectorAll(){return buttons;},querySelector(){return buttons[0];}};
  const scripts=[];let reloads=0;
  const window={location:{reload(){reloads++;}}};
  const document={head:{append(s){scripts.push(s);}},createElement(){return {};},getElementById(){return bar;},querySelectorAll(){return [{addEventListener(_,fn){handlers.settings=fn;}}];}};
  const localStorage={getItem(){return saved;},setItem(_,value){if(storageThrows)throw new Error('denied');saved=value;}};
  runInNewContext(script,{window,document,localStorage});
  return {handlers,bar,scripts,window,get reloads(){return reloads;}};
}
test('GTM waits for consent, loads once on accept, and remains optional',()=>{
 const state=setup(null);assert.equal(state.scripts.length,0);assert.equal(state.bar.hidden,false);
 state.handlers.denied();assert.equal(state.scripts.length,0);assert.equal(state.bar.hidden,true);
 state.handlers.settings();assert.equal(state.bar.hidden,false);
 state.handlers.granted();state.handlers.granted();assert.equal(state.scripts.length,1);
 assert.equal(state.scripts[0].src,'https://www.googletagmanager.com/gtm.js?id=GTM-NV5VRH3G');
});
test('stored consent is respected across translated pages',()=>{
 assert.equal(setup('denied').scripts.length,0);assert.equal(setup('granted').scripts.length,1);
});
test('revoking loaded tags updates consent and reloads after preference is saved',()=>{
 const state=setup('granted');state.handlers.denied();assert.equal(state.reloads,1);
 const update=state.window.dataLayer.at(-1);assert.equal(update[0],'consent');assert.equal(update[2].analytics_storage,'denied');
});
test('blocked local storage does not reload indefinitely',()=>{
 const state=setup('granted',true);state.handlers.denied();assert.equal(state.reloads,0);
});
