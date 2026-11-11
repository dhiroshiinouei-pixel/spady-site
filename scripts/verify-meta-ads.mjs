import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4331';
const lineUrl='https://s.lmes.jp/landing-qr/2002523511-OZpWpGdr?uLand=O4rFry';
const out=new URL('../artifacts/meta-ads-review/',import.meta.url).pathname;
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext({reducedMotion:'reduce'});
await context.route(/googletagmanager|google-analytics|facebook\.com\/tr/,route=>route.fulfill({status:200,body:''}));
// Never open the external LINE flow or send a real consultation during QA.
await context.route('https://s.lmes.jp/**',route=>route.abort());
const page=await context.newPage();
const errors=[];
const apiRequests=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',request=>{if(new URL(request.url()).pathname.startsWith('/api/'))apiRequests.push(request.url());});
const results=[];
try{
 await page.addInitScript(()=>{if(!localStorage.getItem('spady_cookie_consent'))localStorage.setItem('spady_cookie_consent','denied');});
 for(const width of (process.argv.includes('--visuals-only')?[390,1440]:[320,360,375,390,768,1024,1440])){
  await page.setViewportSize({width,height:width<600?844:1000});
  const response=await page.goto(base+'/meta-ads-setup/',{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(async image=>{image.loading='eager';await image.decode();}));});
  const check=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelectorAll('h1').length,images:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src),firstCta:Math.round(document.querySelector('.hero [data-setup-cta]').getBoundingClientRect().top),outside:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+1;}).map(e=>e.className).slice(0,10)}));
  assert(!check.overflow,JSON.stringify(check));assert.equal(check.h1,1);assert.deepEqual(check.images,[]);if(width<=390)assert(check.firstCta<800);
  results.push(check);
  await page.screenshot({path:out+'hero-line-'+width+'.png'});
  if([390,768,1440].includes(width)){
    await page.screenshot({path:out+'full-line-'+width+'.png',fullPage:true});
    for(const id of ['service','pricing','consultation'])await page.locator('#'+id).screenshot({path:out+id+'-line-'+width+'.png',style:'.lp-header,.sticky-cta,.skip-link{visibility:hidden!important}'});
    await page.locator('.about-section').screenshot({path:out+'about-line-'+width+'.png',style:'.lp-header,.sticky-cta,.skip-link{visibility:hidden!important}'});
  }
 }
 if(process.argv.includes('--visuals-only')){console.log(JSON.stringify({visuals:results,screenshots:out}));await browser.close();process.exit(0);}
 // Verify direct LINE links without entering LINE or sending any messages.
 const hrefs=await page.locator('a').evaluateAll(els=>els.map(e=>e.getAttribute('href')));
 for(const href of new Set(hrefs)){
  if(href?.startsWith('#'))assert(await page.locator(href).count(),href);
  else if(href?.startsWith('/')){const res=await page.request.get(base+href);assert.equal(res.status(),200,href);}
 }
 const ctas=await page.locator('[data-setup-cta]').evaluateAll(links=>links.map(link=>({href:link.href,label:link.textContent.trim(),placement:link.dataset.setupCta})));
 assert.deepEqual(ctas.map(cta=>cta.placement).sort(),['header','hero','pricing','final','sticky'].sort());
 for(const cta of ctas){assert.equal(cta.href,lineUrl);assert.match(cta.label,/LINEで予約する/);}
 assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://spady.net/meta-ads-setup/');
 assert.equal(await page.locator('meta[name="robots"]').count(),0);
 assert.equal(await page.locator('form,#setupBooking,#setupForm').count(),0);
 assert.equal(await page.locator('input,textarea,select').count(),0);
 assert.equal(await page.locator('#faq details').count(),10);
 const firstFaq=page.locator('#faq summary').first();await firstFaq.focus();await page.keyboard.press('Enter');assert(await firstFaq.evaluate(e=>e.parentElement.open));await page.keyboard.press('Space');assert(!(await firstFaq.evaluate(e=>e.parentElement.open)));
 const clickWithoutNavigation=async()=>{
  const heroCta=page.locator('[data-setup-cta="hero"]');
  await heroCta.evaluate(link=>link.addEventListener('click',event=>event.preventDefault(),{once:true}));
  await heroCta.click();
 };
 await clickWithoutNavigation();
 assert.equal(await page.evaluate(()=>(window.dataLayer||[]).filter(event=>String(event.event).startsWith('meta_setup_')).length),0);
 await page.evaluate(()=>localStorage.setItem('spady_cookie_consent','granted'));await page.reload({waitUntil:'domcontentloaded'});
 await clickWithoutNavigation();
 const events=await page.evaluate(()=>(window.dataLayer||[]).filter(event=>String(event.event).startsWith('meta_setup_')));
 assert.deepEqual(events,[{event:'meta_setup_cta_click',service:'meta_ads_setup',destination:'line',placement:'hero'}]);
 // A click expresses navigation intent; no intake or booking completion event/API call occurs.
 assert.deepEqual(apiRequests,[]);
 await page.setViewportSize({width:390,height:844});await page.reload({waitUntil:'domcontentloaded'});
 await page.locator('#service').scrollIntoViewIfNeeded();await page.waitForTimeout(150);assert(await page.locator('#setupSticky').isVisible());
 await page.locator('[data-cookie-settings]').click();assert(await page.locator('#siteConsent').isVisible());assert(!(await page.locator('#setupSticky').isVisible()));
 await page.screenshot({path:out+'cookie-line-390.png'});
 await page.locator('[data-consent="denied"]').click();await page.waitForLoadState('domcontentloaded');
 await page.locator('#consultation').scrollIntoViewIfNeeded();await page.waitForTimeout(150);assert(!(await page.locator('#setupSticky').isVisible()));
 const storage=await page.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)}));assert.deepEqual(storage,{local:['spady_cookie_consent'],session:[]});
 assert.deepEqual(errors,[]);
 const report={layout:results,interactionChecks:['all primary CTAs use the existing Spady LINE URL','local anchors and footer links','10 keyboard FAQs','no form or calendar UI','no intake/booking API requests','CTA event only after consent','no completion event on click','consent and final section hide sticky CTA'],lineBookingConfirmed:false,errors};
 await writeFile(out+'line-results.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({...report,screenshots:out}));
}catch(error){console.log('BROWSER DEBUG',JSON.stringify({errors,apiRequests,url:page.url()}));throw error;}finally{await browser.close();}
