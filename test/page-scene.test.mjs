import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';
const boot=readFileSync(new URL('../src/components/SceneBoot.astro',import.meta.url),'utf8').split('<script is:inline define:vars={{ isHome }}>')[1].split('</script>')[0];
const controller=stripTypeScriptTypes(readFileSync(new URL('../src/scripts/page-scene.ts',import.meta.url),'utf8')).replace('export function','function')+'\ninitPageScenes();';
const key='spady_language_scene';
function runtime({storageBlocked=false,paused=false,reduced=false,hash='',path='/',isHome=true,back=false,marker,loadController=true,loadBoot=true,throwNavigation=false}={}){
  const listeners=new Map();const timers=new Map();let next=0;
  const store=new Map(marker===undefined?[]:[[key,typeof marker==='string'?marker:JSON.stringify(marker)]]);
  const root={dataset:paused?{motion:'paused'}:{},style:{values:{},setProperty(k,v){this.values[k]=v;}}};
  const label={textContent:'日本語'};
  const on=(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]);
  const motion={matches:reduced,addEventListener(_,fn){on('motion-change',fn);}};
  const calls=[];
  const location={pathname:path,origin:'https://spady.net',hash,href:`https://spady.net${path}${hash}`,assign(url){if(throwNavigation)throw new Error('blocked');calls.push(url);}};
  class Element{}
  class Link extends Element{
    constructor(href,options={}){super();this.href=new URL(href,location.href).href;this.lang='en';this.dataset={languageLabel:'English'};this.target='';this.isLanguage=true;Object.assign(this,options);}
    closest(selector){return selector==='a[href]'||this.isLanguage?this:null;}
    hasAttribute(name){return name==='download'&&!!this.download;}
    getBoundingClientRect(){return {left:800,top:60,width:100,height:40};}
  }
  const globals={document:{documentElement:root,querySelector(){return label;},addEventListener:on},location,Element,URL,Date,Math,Number,isHome,innerWidth:1000,innerHeight:800,
    performance:{getEntriesByType(){return [{type:back?'back_forward':'navigate'}];}},matchMedia(){return motion;},
    localStorage:{getItem(){return paused?'paused':null;}},
    sessionStorage:{getItem(k){if(storageBlocked)throw new Error('blocked');return store.get(k)||null;},setItem(k,v){if(storageBlocked)throw new Error('blocked');store.set(k,v);},removeItem(k){if(storageBlocked)throw new Error('blocked');store.delete(k);}},
    setTimeout(fn,ms){const id=++next;timers.set(id,{fn,ms});return id;},clearTimeout(id){timers.delete(id);},addEventListener:on};
  if(loadBoot)runInNewContext(boot,globals);
  if(loadController)runInNewContext(controller,globals);
  const emit=(name,event={})=>(listeners.get(name)||[]).forEach(fn=>fn(event));
  const click=(href='/en/',options={})=>{
    const {link:linkOptions,...eventOptions}=options;const target=new Link(href,linkOptions);
    const event={target,button:0,detail:1,clientX:840,clientY:80,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...eventOptions};
    emit('click',event);return event;
  };
  const runTimer=ms=>{for(const [id,timer] of [...timers])if(timer.ms===ms){timers.delete(id);timer.fn();}};
  return {root,label,store,calls,motion,emit,click,runTimer,timers};
}
test('homepage opening recovers without the main bundle',()=>{
 const r=runtime({loadController:false});assert.equal(r.root.dataset.scene,'opening');r.runTimer(1650);assert.equal(r.root.dataset.scene,undefined);
});
test('opening yields immediately to scrolling or keyboard input',()=>{
 for(const event of ['wheel','pointerdown','touchstart','keydown']){const r=runtime();r.emit(event);assert.equal(r.root.dataset.scene,undefined);}
});
test('deep links, secondary pages and browser history do not replay the opening',()=>{
 for(const options of [{hash:'#projects'},{isHome:false,path:'/contact/'},{back:true}])assert.equal(runtime(options).root.dataset.scene,undefined);
});
test('motion preferences bypass both opening and intercepted navigation',()=>{
 for(const options of [{paused:true},{reduced:true}]){const r=runtime(options);assert.equal(r.root.dataset.scene,undefined);assert.equal(r.click().defaultPrevented,false);assert.equal(r.store.size,0);}
});
test('valid language handoff is consumed once and enters the destination',()=>{
 const r=runtime({path:'/en/',marker:{id:'test',path:'/en/',at:Date.now(),x:.8,y:.1}});
 assert.equal(r.root.dataset.scene,'language-entering');assert.equal(r.store.size,0);assert.equal(r.root.style.values['--scene-x'],'80%');r.runTimer(800);assert.equal(r.root.dataset.scene,undefined);
});
test('invalid, stale, future and mismatched markers are consumed without entering',()=>{
 for(const marker of ['bad json','null',{id:'x',path:'/',at:Date.now()-13000},{id:'x',path:'/',at:Date.now()+20000},{id:'x',path:'/en/',at:Date.now()}]){
  const r=runtime({marker,isHome:false});assert.equal(r.root.dataset.scene,undefined);assert.equal(r.store.size,0);
 }
});
test('language click covers, retains section hash and navigates only once',()=>{
 const r=runtime({hash:'#projects'});const click=r.click();assert.equal(click.defaultPrevented,true);assert.equal(r.root.dataset.scene,'language-leaving');assert.equal(r.label.textContent,'English');
 const marker=JSON.parse(r.store.get(key));assert.equal(marker.path,'/en/');assert.equal(marker.x,.84);
 assert.equal(r.calls.length,0);r.runTimer(440);assert.deepEqual(r.calls,['https://spady.net/en/#projects']);r.runTimer(440);assert.equal(r.calls.length,1);
});
test('normal browser link actions are not intercepted',()=>{
 for(const options of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{defaultPrevented:true},{link:{download:true}},{link:{target:'_blank'}}]){
  const r=runtime({loadBoot:false});const event=r.click('/en/',options);assert.equal(event.defaultPrevented,!!options.defaultPrevented);assert.equal(r.timers.size,0);
 }
 for(const path of ['/','https://other.example/en/']){const r=runtime({loadBoot:false});assert.equal(r.click(path).defaultPrevented,false);}
});
test('blocked storage leaves language anchors native',()=>{
 const r=runtime({storageBlocked:true});assert.equal(r.click().defaultPrevented,false);assert.equal(r.calls.length,0);
});
test('Escape cancels before navigation and deletes only the owned marker',()=>{
 const r=runtime();r.click();r.emit('keydown',{key:'Escape'});r.runTimer(440);assert.equal(r.calls.length,0);assert.equal(r.store.size,0);assert.equal(r.root.dataset.scene,undefined);
 const newer=runtime();newer.click();newer.store.set(key,JSON.stringify({id:'another-tab-attempt'}));newer.emit('keydown',{key:'Escape'});assert.ok(newer.store.has(key));
});
test('a later ordinary anchor cancels an outstanding language navigation',()=>{
 const r=runtime();r.click();r.click('/#about',{link:{isLanguage:false}});r.runTimer(440);assert.equal(r.calls.length,0);assert.equal(r.store.size,0);
});
test('rapid language choices navigate only to the most recent choice',()=>{
 const r=runtime();r.click('/en/');r.click('/ko/');r.runTimer(440);assert.deepEqual(r.calls,['https://spady.net/ko/']);
});
test('changing motion preference mid-transition reveals content and navigates once',()=>{
 for(const event of ['spady:motionchange','motion-change']){
  const r=runtime();r.click();if(event==='spady:motionchange')r.root.dataset.motion='paused';else r.motion.matches=true;
  r.emit(event,{matches:true});r.runTimer(440);assert.equal(r.root.dataset.scene,undefined);assert.equal(r.calls.length,1);
 }
});
test('a failed or delayed navigation cannot leave the visual cover behind',()=>{
 const r=runtime();r.click();r.runTimer(440);r.runTimer(4500);assert.equal(r.root.dataset.scene,undefined);assert.equal(r.store.size,0);assert.equal(r.calls.length,1);
 const blocked=runtime({throwNavigation:true});blocked.click();blocked.runTimer(440);assert.equal(blocked.root.dataset.scene,undefined);assert.equal(blocked.store.size,0);
});
test('pagehide preserves the marker; restored pages have no pending redirect',()=>{
 const r=runtime();r.click();r.runTimer(440);r.emit('pagehide');assert.equal(r.root.dataset.scene,undefined);assert.ok(r.store.has(key));
 r.emit('pageshow',{persisted:true});r.runTimer(440);assert.equal(r.calls.length,1);
});
test('scroll, touch and keyboard input reveal the page during a slow navigation',()=>{
 for(const event of ['wheel','touchstart','pointerdown','keydown']){
  const r=runtime();r.click();r.runTimer(440);r.emit(event,{key:'Tab'});assert.equal(r.root.dataset.scene,undefined);assert.equal(r.calls.length,1);
 }
});
test('Escape after assignment reveals the page without scheduling another navigation',()=>{
 const r=runtime();r.click();r.runTimer(440);r.emit('keydown',{key:'Escape'});r.runTimer(4500);
 assert.equal(r.root.dataset.scene,undefined);assert.equal(r.store.size,0);assert.equal(r.calls.length,1);
});
test('an inquiry submission takes priority over a pending language switch',()=>{
 const r=runtime();r.click();r.emit('submit');r.runTimer(440);assert.equal(r.calls.length,0);assert.equal(r.store.size,0);
});
