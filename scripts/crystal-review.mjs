import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4328';
const folder=new URL('../artifacts/crystal-review/',import.meta.url).pathname;await mkdir(folder,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1050}});
await context.addInitScript(()=>localStorage.setItem('spady_cookie_consent','denied'));
const page=await context.newPage(),errors=[],warnings=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());else if(m.type()==='warning')warnings.push(m.text());});
try{
 await page.goto(base,{waitUntil:'networkidle'});await page.locator('[data-crystal="hero"][data-initialized="ready"]').waitFor({timeout:30000});
 await page.waitForTimeout(2200);await page.screenshot({path:folder+'hero-live-1440.png'});
 console.log(JSON.stringify({errors,warnings,scene:await page.locator('[data-crystal="hero"]').evaluate(e=>({...e.dataset})),canvases:await page.locator('canvas').count()}));
 if(process.argv.includes('--look')){
  await page.setViewportSize({width:320,height:1000});
  console.log(JSON.stringify({overflow:await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,bad:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,class:e.className,right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width})).filter(e=>e.right>innerWidth+1&&e.width).slice(0,18)}))}));
  process.exitCode=errors.length?1:0;
 }
 else{
 const results=[];
 const hero=page.locator('[data-crystal="hero"]');
 const before=await hero.getAttribute('data-rotation');await page.waitForTimeout(800);assert.notEqual(await hero.getAttribute('data-rotation'),before);results.push('actual geometry rotates');
 await page.locator('.h-motion').click();const paused=await hero.getAttribute('data-rotation');await page.waitForTimeout(500);assert.equal(await hero.getAttribute('data-rotation'),paused);results.push('pause stops rendering motion');
 await page.locator('[data-crystal-palette="1"]').click();assert.equal(await hero.getAttribute('data-palette'),'1');assert.equal(await page.locator('[data-crystal-palette="1"]').getAttribute('aria-pressed'),'true');results.push('colour control changes live material');
 await page.locator('[data-crystal-palette="0"]').click();
 // Capture the true WebGL renders, with alpha, for no-WebGL/no-JS artwork.
 for(const variant of ['hero','map','line']){
  const el=page.locator(`[data-crystal="${variant}"]`);await el.scrollIntoViewIfNeeded();await el.locator('canvas').waitFor();await page.waitForFunction(v=>document.querySelector(`[data-crystal="${v}"]`)?.dataset.initialized==='ready',variant);
  const data=await el.locator('canvas').evaluate(c=>{c.dispatchEvent(new Event('spady:crystal-capture'));return c.toDataURL('image/png').split(',')[1];});
  await writeFile(folder+`crystal-${variant}.png`,Buffer.from(data,'base64'));
 }
 await page.locator('#about').scrollIntoViewIfNeeded();const buddy=page.locator('.play-buddy');await buddy.click();assert.ok(await buddy.getAttribute('data-mood'));results.push('crystal companion responds');
 const report=[];
 for(const width of process.argv.includes('--smoke')?[]:[320,390,768,1024,1440]){
  await page.setViewportSize({width,height:1000});await page.goto(base,{waitUntil:'networkidle'});await page.locator('[data-crystal="hero"][data-initialized="ready"]').waitFor();
  await page.screenshot({path:folder+`home-${width}.png`});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(overflow)console.log(JSON.stringify({width,overflow:await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,bad:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,class:e.className,parent:e.parentElement?.className,right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width})).filter(e=>e.right>innerWidth+1&&e.width).slice(0,30)}))}));assert.equal(overflow,false);report.push({width,overflow});
  if(width===390||width===1440){await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));});for(const id of ['projects','services','stories','profile','contact'])await page.locator('#'+id).screenshot({path:folder+`${id}-${width}.png`,style:'.corp-header,.skip-link,.play-reading-progress{visibility:hidden!important}'});}
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base,{waitUntil:'networkidle'});await page.locator('[data-crystal="hero"][data-initialized="ready"]').waitFor();assert.equal(await hero.getAttribute('data-moving'),'false');assert.equal(await page.locator('.h-motion').isDisabled(),true);results.push('reduced motion leaves a still crystal');
 await page.locator('canvas').first().evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context')?.loseContext());await page.waitForTimeout(200);assert.equal(await hero.getAttribute('data-initialized'),'fallback');assert.equal(await hero.locator('.crystal-poster').isVisible(),true);results.push('GPU loss retains static artwork');
 assert.deepEqual(errors,[]);await writeFile(folder+(process.argv.includes('--smoke')?'results-smoke.json':'results.json'),JSON.stringify({results,layouts:report,errors,warnings},null,2));console.log(JSON.stringify({results,layouts:report,errors,warnings}));
 }
}finally{await browser.close();}
