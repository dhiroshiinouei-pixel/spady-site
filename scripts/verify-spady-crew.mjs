import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)('playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4338';
assert.ok(['localhost','127.0.0.1','[::1]'].includes(new URL(base).hostname),'Use a local build only');
const label=process.env.CREW_QA_LABEL||'current';
assert.match(label,/^[a-z0-9-]+$/);
const dir=new URL('../artifacts/crew-fix-review/'+label+'/',import.meta.url).pathname;
await mkdir(dir,{recursive:true});
const report={browser:'',passed:[],failures:[],errors:[],externalRequestsBlocked:0};
const browser=await chromium.launch({headless:true,channel:'chrome',chromiumSandbox:true});
report.browser=browser.version();
async function context(width,reducedMotion='no-preference'){
 const c=await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion,serviceWorkers:'block'});
 await c.addInitScript(()=>localStorage.setItem('spady_cookie_consent','denied'));
 await c.route('**/*',async route=>{
  if(new URL(route.request().url()).origin===new URL(base).origin&&route.request().method()==='GET')await route.continue();
  else{report.externalRequestsBlocked++;await route.abort();}
 });
 return c;
}
async function check(name,run){
 try{const detail=await run();report.passed.push({name,detail});console.log('PASS',name);}
 catch(e){report.failures.push({name,error:e.message});console.log('FAIL',name,e.message);}
}
async function visibleLabels(page){
 return page.locator('.story-status span').evaluateAll(nodes=>nodes.filter(n=>{
  const s=getComputedStyle(n),r=n.getBoundingClientRect();
  return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;
 }).map(n=>n.textContent.trim()));
}
try{
 for(const width of [390,768,1440]){
  const c=await context(width),page=await c.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(base+'/services/digital-marketing/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('[data-felt-guide]').getAnimations({subtree:true}).every(a=>a.playState!=='running'));
  const box=await page.locator('[data-felt-guide="team"]').evaluate(frame=>{
   const f=frame.getBoundingClientRect();
   return {width:f.width,height:f.height,sprites:[...frame.querySelectorAll('.felt-guide-toy')].map(n=>{
    const r=n.getBoundingClientRect();return {member:n.className,top:r.top-f.top,bottom:f.bottom-r.bottom};
   })};
  });
  await page.locator('[data-felt-guide="team"]').screenshot({path:dir+'team-'+width+'.png'});
  await check('all four team characters stay inside the frame at '+width,()=>{
   for(const s of box.sprites)assert.ok(s.top>=0&&s.bottom>=0,JSON.stringify(box));
   return box;
  });
  await c.close();
 }
 const c=await context(1440),page=await c.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(base,{waitUntil:'networkidle'});
 await page.locator('[data-story-step="2"]').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-innerHeight*.45));
 await page.waitForFunction(()=>document.querySelector('[data-story]').dataset.current==='2');
 await page.locator('.story-screen').screenshot({path:dir+'normal-motion.png'});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>!document.querySelector('[data-story]').hasAttribute('data-motion'));
 await page.locator('.story-screen').screenshot({path:dir+'reduced-after-toggle.png'});
 await check('reduced motion keeps the static character and its numbered label',async()=>{
  const labels=await visibleLabels(page);
  assert.deepEqual(labels,['01 見つける']);
  assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
  const running=await page.locator('.ed-home').evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length);
  assert.equal(running,0,'Reduced motion must not keep animations running');
  return {labels,runningAnimations:running};
 });
 await page.emulateMedia({reducedMotion:'no-preference'});
 await check('restoring normal motion keeps all four scroll states working',async()=>{
  const states=[];
  for(let i=0;i<4;i++){
   await page.locator('[data-story-step="'+i+'"]').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-innerHeight*.45));
   await page.waitForFunction(i=>document.querySelector('[data-story]').dataset.current===String(i),i);
   const active=await page.locator('[data-story-art][data-active]').getAttribute('data-story-art');
   assert.equal(active,String(i));
   const labels=await visibleLabels(page);assert.equal(labels.length,1);
   states.push({active,label:labels[0]});
  }
  return states;
 });
 await c.close();
 const initial=await context(1440,'reduce'),initialPage=await initial.newPage();
 await initialPage.goto(base,{waitUntil:'networkidle'});
 await check('initial reduced-motion rendering keeps the static numbered label',async()=>{
  const labels=await visibleLabels(initialPage);assert.deepEqual(labels,['01 見つける']);return labels;
 });
 await initial.close();
 assert.deepEqual(report.errors,[]);
}finally{
 await browser.close();
 await writeFile(dir+'results.json',JSON.stringify(report,null,2));
}
console.log(JSON.stringify({passed:report.passed.length,failures:report.failures,errors:report.errors,evidence:dir},null,2));
if(report.failures.length)process.exitCode=1;
