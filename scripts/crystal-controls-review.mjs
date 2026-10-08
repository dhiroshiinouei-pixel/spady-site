import {createRequire} from 'node:module';
import {mkdir, writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4328';
const dir=new URL('../artifacts/renewal-review/',import.meta.url).pathname;
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const report={checks:[],errors:[],environment:'Headless Chrome on local Mac; local preview, no production messages or analytics'};
try {
 for(const width of [1440,390]) {
  const context=await browser.newContext({viewport:{width,height:width===390?844:1050},deviceScaleFactor:1});
  await context.addInitScript(()=>{
   localStorage.setItem('spady_cookie_consent','denied');
   const timing=window.__crystalPaintTiming={fcpMs:null,lcpMs:null,cls:0};
   new PerformanceObserver(list=>{
    for(const entry of list.getEntries())if(entry.name==='first-contentful-paint')timing.fcpMs=entry.startTime;
   }).observe({type:'paint',buffered:true});
   new PerformanceObserver(list=>{
    for(const entry of list.getEntries())timing.lcpMs=entry.startTime;
   }).observe({type:'largest-contentful-paint',buffered:true});
   let windowStart=0,lastShift=0,windowScore=0;
   new PerformanceObserver(list=>{
    for(const entry of list.getEntries()){
     if(entry.hadRecentInput)continue;
     if(entry.startTime-lastShift<1000&&entry.startTime-windowStart<5000)windowScore+=entry.value;
     else{windowStart=entry.startTime;windowScore=entry.value;}
     lastShift=entry.startTime;timing.cls=Math.max(timing.cls,windowScore);
    }
   }).observe({type:'layout-shift',buffered:true});
   const observer=new MutationObserver(records=>{
    if(records.some(({target})=>target instanceof HTMLElement&&target.dataset.crystal==='hero'&&target.dataset.initialized==='ready')) {
     window.__crystalReadyMs=performance.now();observer.disconnect();
    }
   });
   observer.observe(document,{subtree:true,attributes:true,attributeFilter:['data-initialized']});
  });
  const page=await context.newPage();
  page.on('pageerror',error=>report.errors.push({width,message:error.message}));
  await page.route(/googletagmanager\.com/,route=>route.abort());
  await page.goto(base,{waitUntil:'domcontentloaded'});
  const hero=page.locator('[data-crystal="hero"]');
  await page.waitForFunction(()=>document.querySelector('[data-crystal="hero"]')?.dataset.initialized==='ready',{},{timeout:60000});
  const readyMs=await page.evaluate(()=>window.__crystalReadyMs);
  const initialization=await page.evaluate(()=>{
   const canvas=document.querySelector('[data-crystal="hero"] canvas');
   const gl=canvas.getContext('webgl2');
   return {...window.__crystalPaintTiming,parallelShaderCompile:Boolean(gl?.getExtension('KHR_parallel_shader_compile')),sampleAtMs:performance.now()};
  });
  const canvas=hero.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('[data-crystal="hero"]')?.dataset.moving==='true');
  // Wait for the short page opening to finish before pointer interaction.
  await page.waitForTimeout(1500);
  const rotation=()=>hero.getAttribute('data-rotation').then(Number);
  const before=await rotation();
  const box=await canvas.boundingBox();
  await page.mouse.move(box.x+box.width*.35,box.y+box.height*.5);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width*.35+85,box.y+box.height*.5,{steps:10});
  await page.mouse.up();
  await page.waitForTimeout(100);
  const after=await rotation();
  assert(after-before>.4,`Drag should rotate the model at ${width}px`);
  report.checks.push({width,check:'drag',before,after,passed:true});
  await page.locator('.h-motion').click();
  await page.waitForFunction(()=>document.documentElement.dataset.motion==='paused');
  assert.equal(await hero.getAttribute('data-moving'),'false');
  const pausedBefore=await rotation();
  await hero.locator('[data-crystal-turn]').click();
  const stepped=await rotation();
  assert(Math.abs(stepped-pausedBefore-Math.PI/4)<.002,'Paused turn should step 45 degrees');
  await page.waitForTimeout(700);
  const still=await rotation();
  assert.equal(still,stepped,'The model must remain still after a paused manual turn');
  report.checks.push({width,check:'paused-manual-turn',pausedBefore,stepped,after700ms:still,passed:true});
  await page.locator('.h-motion').click();
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('[data-crystal="hero"]')?.dataset.moving==='true');
  const resumed=await rotation();await page.waitForTimeout(500);const advanced=await rotation();
  assert(advanced>resumed,'Resume should restore automatic rotation');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('[data-crystal="hero"]')?.dataset.moving==='false');
  const outside=await rotation();await page.waitForTimeout(450);assert.equal(await rotation(),outside);
  report.checks.push({width,check:'resume-and-offscreen-stop',resumed,advanced,offscreenRotation:outside,passed:true});
  report.checks.push({width,check:'local-ready-time',milliseconds:Math.round(readyMs),...initialization,note:'Single local headless run. Paint metrics sampled just after hero readiness, before interactions; not production Core Web Vitals.'});
  await context.close();
 }
 const noJS=await browser.newContext({viewport:{width:1440,height:1050},javaScriptEnabled:false});
 const page=await noJS.newPage();
 await page.route(/googletagmanager\.com/,route=>route.abort());
 await page.goto(base,{waitUntil:'networkidle'});
 const poster=page.locator('[data-crystal="hero"] .crystal-poster');
 const fallback=await poster.evaluate(image=>({src:image.currentSrc,width:image.naturalWidth,height:image.naturalHeight,visible:getComputedStyle(image).visibility,opacity:getComputedStyle(image).opacity,ready:image.complete}));
 assert(fallback.src.endsWith('.webp')&&fallback.width>0&&fallback.ready);
 assert.equal(fallback.visible,'visible');assert.equal(fallback.opacity,'1');
 assert.equal(await page.locator('[data-crystal="hero"] canvas').evaluate(canvas=>getComputedStyle(canvas).opacity),'0');
 const services=await page.locator('a[href="/services/"]').count();
 const detail=await page.locator('a[href="/services/google-business-profile/"]').count();
 assert(services>0&&detail>0,'Service links should exist without JavaScript');
 await page.screenshot({path:dir+'crystal-without-javascript.png'});
 report.checks.push({check:'no-javascript-fallback',fallback,serviceLinks:services,googleServiceLinks:detail,passed:true});
 await noJS.close();
 assert.deepEqual(report.errors,[]);
} catch(error) {report.failure=error.message;process.exitCode=1;}
finally {await browser.close();await writeFile(dir+'crystal-controls-review.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
