import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4331';
const out=new URL('../artifacts/meta-ads-review/',import.meta.url).pathname;
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext({reducedMotion:'reduce'});
await context.route(/googletagmanager|google-analytics|facebook\.com\/tr/,route=>route.fulfill({status:200,body:''}));
await context.route('**/api/booking/availability',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"mock unavailable"}'}));
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
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
  await page.screenshot({path:out+'hero-'+width+'.png'});
  if([390,768,1440].includes(width)){
    await page.screenshot({path:out+'full-'+width+'.png',fullPage:true});
    for(const id of ['service','pricing','consultation'])await page.locator('#'+id).screenshot({path:out+id+'-'+width+'.png',style:'.lp-header,.sticky-cta,.skip-link{visibility:hidden!important}'});
    await page.locator('.about-section').screenshot({path:out+'about-'+width+'.png',style:'.lp-header,.sticky-cta,.skip-link{visibility:hidden!important}'});
  }
 }
 if(process.argv.includes('--visuals-only')){console.log(JSON.stringify({visuals:results,screenshots:out}));await browser.close();process.exit(0);}
 // Every primary CTA targets this form, and every local anchor/file resolves.
 const hrefs=await page.locator('a').evaluateAll(els=>els.map(e=>e.getAttribute('href')));
 for(const href of new Set(hrefs)){
  if(href?.startsWith('#'))assert(await page.locator(href).count(),href);
  else if(href?.startsWith('/')){const res=await page.request.get(base+href);assert.equal(res.status(),200,href);}
 }
 assert(await page.locator('[data-setup-cta]:not([href="#consultation"])').count()===0);
 assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://spady.net/meta-ads-setup/');
 assert.equal(await page.locator('meta[name="robots"]').count(),0);
 assert.equal(await page.locator('#setupForm').getAttribute('data-accepting'),'true');
 assert.equal(await page.locator('.consultation-form > .preview-notice').count(),0);
 assert.equal(await page.locator('#faq details').count(),10);
 const firstFaq=page.locator('#faq summary').first();await firstFaq.focus();await page.keyboard.press('Enter');assert(await firstFaq.evaluate(e=>e.parentElement.open));await page.keyboard.press('Space');assert(!(await firstFaq.evaluate(e=>e.parentElement.open)));
 const fill=async()=>{
   await page.locator('#setup-company').fill('QA教室');await page.locator('#setup-name').fill('動作確認');await page.locator('#setup-email').fill('qa@example.com');
   await page.locator('#setup-industry').selectOption('学習塾');await page.locator('input[name="restriction_current"][value="分からない"]').check();await page.locator('input[name="restriction_history"][value="あり"]').check();
   for(const name of ['pixel_scope','no_recovery','consent'])await page.locator(`input[name="${name}"]`).check();
 };
 let posts=0;await page.route('**/api/meta-ads-setup',async route=>{posts++;await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false})});});
 await page.locator('.form-submit').click();assert.equal(posts,0);assert(!(await page.locator('#setup-company').evaluate(e=>e.validity.valid)));
 await page.locator('#setupForm').evaluate(e=>e.dataset.accepting='false');
 await fill();await page.locator('.form-submit').click();await page.waitForFunction(()=>document.querySelector('#setupStatus').dataset.state==='preview');assert.equal(posts,0);assert.match(await page.locator('#setupStatus').textContent(),/入力内容は送信されていません/);
 // Exercise delivery states with a strictly local network mock. Never enables production configuration.
 await page.locator('#setupForm').evaluate(e=>e.dataset.accepting='true');
 await page.locator('.form-submit').click();await page.waitForFunction(()=>document.querySelector('#setupStatus').dataset.state==='error');assert.equal(posts,1);assert.equal(await page.locator('#setup-email').inputValue(),'qa@example.com');
 assert.equal(await page.evaluate(()=>(window.dataLayer||[]).filter(e=>e.event==='meta_setup_inquiry_success').length),0);
 // Consent given: existing GTM loader only; its request is intercepted above.
 await page.evaluate(()=>localStorage.setItem('spady_cookie_consent','granted'));await page.reload({waitUntil:'domcontentloaded'});await fill();await page.locator('#setupForm').evaluate(e=>e.dataset.accepting='true');
 await page.unroute('**/api/meta-ads-setup');
 await page.route('**/api/meta-ads-setup',async route=>{posts++;await new Promise(r=>setTimeout(r,350));await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,request_id:'mock-accepted-only'})});});
 const before=posts;
 await page.locator('#setupForm').evaluate(e=>{e.requestSubmit();e.requestSubmit();});
 await page.waitForFunction(()=>document.querySelector('#setupStatus').dataset.state==='success');assert.equal(posts,before+1);
 await page.locator('#setupForm').evaluate(e=>e.dispatchEvent(new Event('submit',{cancelable:true})));
 const tracking=await page.evaluate(()=>window.dataLayer||[]);
 assert.equal(tracking.filter(e=>e.event==='meta_setup_inquiry_success').length,1);
 assert(!JSON.stringify(tracking).includes('qa@example.com'));assert(!JSON.stringify(tracking).includes('QA教室'));assert(!JSON.stringify(tracking).includes('動作確認'));
 assert.equal(await page.locator('#setup-email').inputValue(),'');assert(await page.locator('.form-submit').isDisabled());
 // A nominal HTTP 200 with no actual acceptance must remain a failure.
 await page.reload({waitUntil:'domcontentloaded'});await fill();await page.locator('#setupForm').evaluate(e=>e.dataset.accepting='true');await page.unroute('**/api/meta-ads-setup');
 await page.route('**/api/meta-ads-setup',route=>route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));await page.locator('.form-submit').click();await page.waitForFunction(()=>document.querySelector('#setupStatus').dataset.state==='error');
 assert.equal(await page.evaluate(()=>(window.dataLayer||[]).filter(e=>e.event==='meta_setup_inquiry_success').length),0);
 // Mobile bar never overlays form or consent, including when cookie settings reopen.
 await page.setViewportSize({width:390,height:844});await page.reload({waitUntil:'domcontentloaded'});await page.locator('#service').scrollIntoViewIfNeeded();await page.waitForTimeout(150);assert(await page.locator('#setupSticky').isVisible());
 await page.locator('#setup-name').focus();assert(!(await page.locator('#setupSticky').isVisible()));
 await page.locator('[data-cookie-settings]').click();assert(await page.locator('#siteConsent').isVisible());assert(!(await page.locator('#setupSticky').isVisible()));
 await page.screenshot({path:out+'cookie-390.png'});
 await page.locator('[data-consent="denied"]').click();await page.waitForLoadState('domcontentloaded');
 await page.locator('#consultation').scrollIntoViewIfNeeded();await page.waitForTimeout(150);assert(!(await page.locator('#setupSticky').isVisible()));
 const storage=await page.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)}));assert.deepEqual(storage,{local:['spady_cookie_consent'],session:[]});
 assert.deepEqual(errors,[]);
 await writeFile(out+'results.json',JSON.stringify({layout:results,interactionChecks:['anchors and footer links','10 keyboard FAQs','required fields','preview no send','503 no success','200 without request ID no success','pending and accepted duplicate lock','single success event after accepted response','no PII in analytics or storage','consent and form hide sticky CTA'],realDelivery:false,errors},null,2));
 console.log(JSON.stringify({layout:results,interactions:'passed',realDelivery:false,screenshots:out}));
 // Owned OGP: HTML text rendered with local fonts; no external artwork or reference assets.
 await mkdir(new URL('../public/meta-ads-setup/',import.meta.url),{recursive:true});
 const og=await context.newPage({viewport:{width:1200,height:630}});await og.setViewportSize({width:1200,height:630});
 const logo=await readFile(new URL('../public/logo.png',import.meta.url));
 await og.setContent(`<!doctype html><html lang="ja"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#f8f7f3;color:#172d48;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif;padding:50px 65px;border-bottom:16px solid #2157be}header{display:flex;align-items:center;gap:20px;font-size:24px;font-weight:700}img{width:65px;height:65px}h1{font-size:52px;line-height:1.5;margin:36px 0 22px;letter-spacing:-.03em}em{color:#2157be;font-style:normal}.bottom{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #cbd6e4;padding-top:25px}.price{font-size:60px;font-weight:750}.price span{font-size:22px;margin-left:10px}.info{font-size:23px;line-height:1.8;text-align:right}.note{font-size:17px;margin-top:10px;color:#536174}</style><header><img src="data:image/png;base64,${logo.toString('base64')}">Meta広告 初期設定サポート</header><h1>Meta広告の初期設定は、<em>専門家に。</em><br>その後の基本操作は、<em>自社で。</em></h1><div class="bottom"><div class="price">33,000<span>円（税込）</span></div><div class="info">買い切り・月額契約不要<br>広告1件の入稿＋45分の操作説明</div></div><p class="note">全国オンライン対応 ／ 広告費別途・素材はお客様にご用意いただきます。</p></html>`);
 await og.evaluate(()=>document.fonts.ready);await og.screenshot({path:new URL('../public/meta-ads-setup/og.png',import.meta.url).pathname});
}catch(error){console.log('BROWSER DEBUG',JSON.stringify({errors,invalid:await page.locator(':invalid').evaluateAll(els=>els.map(e=>({tag:e.tagName,name:e.name,message:e.validationMessage}))),state:await page.locator('#setupStatus').textContent()}));throw error;}finally{await browser.close();}
