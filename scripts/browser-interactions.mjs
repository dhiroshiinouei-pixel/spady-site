import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
export async function verifyInteractions(browser,base,dir){
 const context=await browser.newContext({viewport:{width:390,height:844}});
 let gtm=0;await context.route('https://www.googletagmanager.com/**',async route=>{gtm++;await route.abort();});
 const page=await context.newPage();const failures=[];const errors=[];page.on('pageerror',e=>errors.push(e.message));
 async function check(name,fn){try{await fn();console.log('PASS',name);}catch(e){failures.push({name,error:e.message});console.log('FAIL',name,e.message);}}
 async function waitForPausedCrystal(){
  await page.waitForFunction(()=>document.documentElement.dataset.motion==='paused'&&document.querySelector('[data-crystal="hero"]')?.getAttribute('data-moving')==='false',null,{timeout:30000});
 }
 await check('GTM waits for consent and loads only once',async()=>{
  await page.goto(base,{waitUntil:'networkidle'});assert.equal(gtm,0);
  await page.locator('[data-consent="denied"]').click();assert.equal(gtm,0);
  await page.locator('[data-cookie-settings]').click();await page.locator('[data-consent="granted"]').click();await page.waitForTimeout(200);assert.equal(gtm,1);
  await page.locator('[data-cookie-settings]').click();await page.locator('[data-consent="denied"]').click();await page.waitForLoadState('networkidle');
 });
 await check('mobile menu and language switching use working routes',async()=>{
  await page.locator('.mobile-menu summary').click();assert.equal(await page.locator('.mobile-menu').getAttribute('open'),'');await page.keyboard.press('Escape');assert.equal(await page.locator('.mobile-menu').getAttribute('open'),null);
  await page.locator('.language-menu summary').click();await page.locator('.language-menu a[lang="en"]').click();await page.waitForURL(base+'/en/');assert.equal(await page.locator('html').getAttribute('lang'),'en');
  await page.locator('.language-menu summary').click();await page.locator('.language-menu a[lang="ja"]').click();await page.waitForURL(base+'/');
 });
 await check('3D artwork controls stay synchronized and remember pause',async()=>{
  // Initial WebGL setup may take longer than DOM load; no fixed animation sleep.
  await page.locator('[data-crystal="hero"][data-initialized="ready"]').waitFor({state:'attached',timeout:30000});
  await page.locator('.h-motion').click();assert.equal(await page.locator('html').getAttribute('data-motion'),'paused');
  assert.deepEqual(await page.locator('.motion-control').evaluateAll(buttons=>buttons.map(b=>b.getAttribute('aria-pressed'))),['true','true']);
  await waitForPausedCrystal();
  await page.reload();await waitForPausedCrystal();
  await page.locator('.h-motion').click();assert.equal(await page.locator('html').getAttribute('data-motion'),'playing');
 });
 await check('reduced motion skips cover and pauses 3D artwork',async()=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);assert.equal(await page.locator('html').getAttribute('data-scene'),null);await waitForPausedCrystal();assert.equal(await page.locator('.h-motion').isDisabled(),true);await page.emulateMedia({reducedMotion:'no-preference'});
 });
 let posted=[];let mode='error';
 await context.route('**/api/contact?*',async route=>{posted.push(route.request().postData());await route.fulfill({status:mode==='success'?200:503,contentType:'application/json',body:JSON.stringify(mode==='success'?{ok:true}:{ok:false})});});
 await check('contact prefill, required consent, failure and successful navigation',async()=>{
  await page.goto(base+'/contact/?topic=gbp&intent=release');assert.match(await page.locator('#topic').inputValue(),/Google/);assert.match(await page.locator('#message').inputValue(),/案内/);
  await page.locator('#name').fill('表示確認用テスト');await page.locator('#email').fill('preview@example.com');
  await page.locator('button[type="submit"]').click();assert.equal(posted.length,0);
  await page.locator('input[name="consent"]').check();await page.locator('button[type="submit"]').click();await page.locator('#formStatus:not([hidden])').waitFor();assert.equal(posted.length,1);assert.equal(await page.locator('#name').inputValue(),'表示確認用テスト');assert.equal(await page.locator('button[type="submit"]').isDisabled(),false);await page.screenshot({path:dir+'contact-error-390.png'});
  mode='success';await page.locator('button[type="submit"]').click();await page.waitForURL(base+'/contact/thanks/');assert.equal(posted.length,2);assert.match(await page.locator('h1').textContent(),/お問い合わせを受け付けました/);
 });
 await check('unknown query parameters do not change form content',async()=>{
  await page.goto(base+'/contact/?topic=%3Cscript%3E&intent=release');assert.equal(await page.locator('#topic').inputValue(),'');assert.equal(await page.locator('#message').inputValue(),'');
 });
 await check('legacy pages honour consent at narrow width',async()=>{
  await page.setViewportSize({width:320,height:850});
  for(const route of ['/akindo/','/ryugaku/en/']){await page.goto(base+route,{waitUntil:'load'});await page.evaluate(()=>localStorage.removeItem('spady_cookie_consent'));const before=gtm;await page.reload({waitUntil:'load'});assert.equal(gtm,before);await page.screenshot({path:dir+'consent'+route.replaceAll('/','-')+'320.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);}
 });
 await check('language pages, readable fields and script errors',async()=>{
  for(const lang of ['en','ko','zh-hant','zh-hans']){await page.goto(base+`/${lang}/contact/`,{waitUntil:'load'});assert.equal(await page.locator('#topic option').count(),6);assert.ok(await page.locator('#email').isVisible());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);}
  assert.deepEqual(errors,[]);
 });
 const metricsPage=await context.newPage();await metricsPage.addInitScript(()=>{window.__layoutShifts=0;window.__lcp=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__layoutShifts+=e.value;}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())window.__lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});});
 await metricsPage.goto(base,{waitUntil:'networkidle'});await metricsPage.waitForTimeout(1800);
 const metrics=await metricsPage.evaluate(()=>({context:'Local unthrottled Chrome, not production Core Web Vitals',lcpMs:window.__lcp,cls:window.__layoutShifts,transferBytes:performance.getEntriesByType('resource').reduce((sum,e)=>sum+e.transferSize,0),scriptUrls:[...document.scripts].filter(s=>s.src).map(s=>s.src)}));
 await writeFile(dir+'interaction-results.json',JSON.stringify({failures,errors,gtmRequests:gtm,mockedSubmissions:posted.length,metrics},null,2));await context.close();
 if(failures.length)throw new Error(`${failures.length} browser checks failed; see interaction-results.json`);
}
