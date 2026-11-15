/** Optional browser QA for the local mock fixture only. Never run against production.
 * Updated 2026-11-15; not executed during this task because browser QA uses CUA.
 * Build first, then run test/serve-meta-qa.mjs. Mock results are not integration proof.
 */
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4334';
const baseURL=new URL(base);
assert(['127.0.0.1','localhost'].includes(baseURL.hostname)&&baseURL.port==='4334','Use the local mock fixture on port 4334 only.');
const probe=await fetch(base+'/meta-ads-setup/');
assert.equal(probe.headers.get('X-Spady-QA'),'local-mock-only','No verified local mock server; refusing browser submissions.');
const out=new URL('../artifacts/meta-ads-review/',import.meta.url).pathname;
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext({reducedMotion:'reduce'});
// Block all external network, including Lark links and tracking. No real meetings or messages.
await context.route('**/*',route=>new URL(route.request().url()).origin===baseURL.origin?route.continue():route.abort());
await context.addInitScript(()=>localStorage.setItem('spady_cookie_consent','denied'));
const page=await context.newPage();
const errors=[];
const requests=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',request=>{
  const path=new URL(request.url()).pathname;
  if(path.startsWith('/api/'))requests.push({path,...(path==='/api/meta-ads-booking'?{body:request.postDataJSON()}:{} )});
});
const results=[];
const complete=()=>page.locator('#setupBookingComplete');
const events=()=>page.evaluate(()=>(window.dataLayer||[]).filter(event=>String(event.event).startsWith('meta_setup_')));
const assertNoCompletion=async()=>{assert(!(await complete().isVisible()));assert(!(await events()).some(event=>event.event==='meta_setup_booking_success'));};
async function visit(scenario='success'){
  const response=await page.goto(`${base}/meta-ads-setup/?qa_case=${scenario}`,{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200);
  await page.locator('[data-setup-cta="hero"]').click();
  await page.locator('#setupAvailabilityReload').waitFor({state:'visible'});
}
async function choose(){
  await page.locator('#setupCalendarDays button[data-date]').first().click();
  await page.locator('#setupTimeSlots button').first().click();
  assert(await page.locator('#setupBookingForm').isVisible());
}
async function enterMockData(){
  await page.locator('#setup-company').fill('ローカル検証専用・送信しない会社');
  await page.locator('#setup-name').fill('検証専用 氏名');
  await page.locator('#setup-email').fill('local-qa@example.test');
  await page.locator('#setup-industry').selectOption('学習塾');
  await page.locator('[name="restriction_current"][value="分からない"]').check();
  await page.locator('[name="restriction_history"][value="あり"]').check();
  for(const name of ['pixel_scope','no_recovery','consent'])await page.locator(`[name="${name}"]`).check();
}
async function verifyPrivacy(){
  const state=await page.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage),events:JSON.stringify(window.dataLayer||[])}));
  assert.deepEqual(state.local,['spady_cookie_consent']);assert.deepEqual(state.session,[]);
  for(const value of ['local-qa@example.test','検証専用 氏名','ローカル検証専用'])assert(!state.events.includes(value));
  for(const request of requests.filter(item=>item.body))assert(!state.events.includes(request.body.receipt_id));
}
try{
  for(const width of (process.argv.includes('--visuals-only')?[390,1440]:[320,360,375,390,768,1024,1440])){
    await page.setViewportSize({width,height:width<600?844:1000});
    await page.goto(base+'/meta-ads-setup/?qa_case=success',{waitUntil:'domcontentloaded'});
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(async image=>{image.loading='eager';await image.decode();}));});
    const check=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelectorAll('h1').length,images:[...document.images].filter(image=>image.complete&&image.naturalWidth===0).map(image=>image.src),firstCta:Math.round(document.querySelector('.hero [data-setup-cta]').getBoundingClientRect().top)}));
    assert(!check.overflow,JSON.stringify(check));assert.equal(check.h1,1);assert.deepEqual(check.images,[]);results.push(check);
    await page.screenshot({path:out+'hero-inline-'+width+'.png'});
    await page.locator('#consultation').scrollIntoViewIfNeeded();
    await page.locator('#setupCalendarDays button[data-date]').first().waitFor();
    await choose();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    await page.locator('#consultation').screenshot({path:out+'calendar-inline-'+width+'.png',style:'.lp-header,.sticky-cta,.skip-link{visibility:hidden!important}'});
    if([390,768,1440].includes(width))await page.screenshot({path:out+'full-inline-'+width+'.png',fullPage:true});
  }
  if(process.argv.includes('--visuals-only')){console.log(JSON.stringify({mockOnly:true,visuals:results,screenshots:out}));process.exitCode=0;}
  else{
    const ctas=await page.locator('[data-setup-cta]').evaluateAll(links=>links.map(link=>({href:link.getAttribute('href'),label:link.textContent.trim(),placement:link.dataset.setupCta})));
    assert.deepEqual(ctas.map(cta=>cta.placement).sort(),['header','hero','pricing','sticky'].sort());
    for(const cta of ctas){assert.equal(cta.href,'#consultation');assert.match(cta.label,/相談日時を予約する/);}
    assert.equal(await page.locator('.lp-brand img').getAttribute('src'),'/logo.png');
    assert.equal(await page.locator('.hero-laptop,.line-reservation').count(),0);
    assert.equal(await page.locator('#setupBookingForm').count(),1);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://spady.net/meta-ads-setup/');
    const hrefs=await page.locator('a').evaluateAll(links=>links.map(link=>link.getAttribute('href')));
    for(const href of new Set(hrefs)){
      if(href?.startsWith('#'))assert(await page.locator(href).count(),href);
      else if(href?.startsWith('/'))assert.equal((await page.request.get(base+href)).status(),200,href);
    }
    assert.equal(await page.locator('#faq details').count(),10);
    const firstFaq=page.locator('#faq summary').first();await firstFaq.focus();await page.keyboard.press('Enter');assert(await firstFaq.evaluate(e=>e.parentElement.open));await page.keyboard.press('Space');assert(!(await firstFaq.evaluate(e=>e.parentElement.open)));
    // Disconnected/no-slot states must not offer fabricated times or completion.
    for(const scenario of ['unavailable','lark_unavailable','empty']){
      await visit(scenario);assert.equal(await page.locator('#setupTimeSlots button').count(),0);assert(!(await page.locator('#setupBookingForm').isVisible()));await assertNoCompletion();
    }
    // A missing Lark URL must not be accepted even with an upstream success-shaped reply.
    for(const scenario of ['missing_meeting','intake_failure']){
      await visit(scenario);await choose();await enterMockData();await page.locator('#setupBookingSubmit').click();
      await page.locator('#setupBookingStatus[data-state="error"]').waitFor();await assertNoCompletion();await verifyPrivacy();
    }
    // Unrecoverable Lark uncertainty stops retries and displays the opaque receipt for support.
    await visit('manual_review');await choose();await enterMockData();await page.locator('#setupBookingSubmit').click();
    await page.locator('#setupBookingStatus[data-state="error"]').waitFor();await assertNoCompletion();
    assert(await page.locator('#setupBookingSubmit').isDisabled());assert(await page.locator('#setupAvailabilityReload').isDisabled());
    assert.match(await page.locator('#setupBookingStatus').textContent(),/受付ID：[a-f0-9]{32}/);await verifyPrivacy();
    // Recoverable uncertain responses retry the exact receipt and time; no second intake.
    await visit('retry');await choose();await enterMockData();const retryOffset=requests.length;await page.locator('#setupBookingSubmit').click();
    await page.locator('#setupBookingStatus[data-state="error"]').waitFor();await assertNoCompletion();
    assert(await page.locator('#setupTimeSlots button').first().isDisabled());await page.locator('#setupBookingSubmit').click();await complete().waitFor({state:'visible'});
    const retryRequests=requests.slice(retryOffset);const retries=retryRequests.filter(item=>item.path==='/api/meta-ads-booking');assert.equal(retries.length,2);assert.deepEqual(retries[0].body,retries[1].body);assert.equal(retryRequests.filter(item=>item.path==='/api/meta-ads-setup').length,1);
    // Explicit slot conflicts permit choosing another live slot using the accepted intake.
    await visit('conflict');await choose();await enterMockData();const conflictOffset=requests.length;await page.locator('#setupBookingSubmit').click();
    await page.locator('#setupBookingStatus[data-state="error"]').waitFor();await assertNoCompletion();await page.locator('#setupCalendarDays button[data-date]:enabled').first().waitFor();await choose();await page.locator('#setupBookingSubmit').click();await complete().waitFor({state:'visible'});
    const conflictRequests=requests.slice(conflictOffset).filter(item=>item.path==='/api/meta-ads-booking');assert.equal(conflictRequests.length,2);assert.equal(conflictRequests[0].body.receipt_id,conflictRequests[1].body.receipt_id);assert.notEqual(conflictRequests[0].body.start,conflictRequests[1].body.start);
    // Full mock reservation ends with the matching date and Lark URL, without opening Lark.
    await visit('success');await choose();await enterMockData();await page.locator('#setupBookingSubmit').click();await complete().waitFor({state:'visible'});
    assert.match(await page.locator('#setupConfirmedTime').textContent(),/30分・日本時間/);assert.equal(await page.locator('#setupLarkMeeting').getAttribute('href'),'https://vc.larksuite.com/j/local-qa-not-a-real-meeting');
    await verifyPrivacy();assert.equal((await events()).length,0,'Cookie consent is denied; no booking analytics may fire.');
    await page.setViewportSize({width:390,height:844});await page.locator('#service').scrollIntoViewIfNeeded();await page.locator('#setupSticky').waitFor({state:'visible'});
    await page.locator('[data-cookie-settings]').click();assert(await page.locator('#siteConsent').isVisible());assert(!(await page.locator('#setupSticky').isVisible()));
    await page.screenshot({path:out+'cookie-inline-390.png'});
    assert.deepEqual(errors,[]);
    const report={mockOnly:true,layout:results,checks:['Spady logo and internal calendar CTAs','local links and keyboard FAQ','no fabricated availability','missing meeting never completes','manual review locks further booking','exact retry idempotency','conflict re-selection','matching confirmed date and Lark URL','no PII storage or analytics','consent hides sticky CTA'],realBookingVerified:false,errors};
    await writeFile(out+'inline-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,screenshots:out}));
  }
}finally{await browser.close();}
