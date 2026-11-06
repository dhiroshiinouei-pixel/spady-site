// Optional browser QA; uses the same external Playwright installation as capture-preview.mjs.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4328';
const out=new URL(base.startsWith('https:') ? '../artifacts/kaigyo-public-review/' : '../artifacts/kaigyo-review/',import.meta.url).pathname;
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext({reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const layout=[];
const heroOnly=process.argv.includes('--hero-only');
const routes=heroOnly?['']:['','checklist/','diagnosis/','tools/','start/salon/'];
try{
  for(const width of process.argv.includes("--interactions-only") ? [] : [320,375,390,768,1024,1280,1440]){
    await page.setViewportSize({width,height:1000});
    for(const route of routes){
      const response=await page.goto(`${base}/akindo/kaigyo/${route}`);
      assert.equal(response.status(),200,route);
      assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
      assert(await page.locator('.k-test-notice').isVisible());
      assert((await page.title()).startsWith('【テスト公開】'));
      if(base.startsWith('https:'))assert.match(response.headers()['x-robots-tag']||'',/noindex/);
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(async i=>{i.loading='eager';try{await i.decode();}catch{}}));});
      const pageArt = ({'checklist/':'.checklist-desk-art','diagnosis/':'img[src*="diagnosis-planning-v3"]','tools/':'img[src*="tools-workbench-v3"]','start/salon/':'img[src*="salon-preparation-v3"]'})[route];
      if(pageArt)assert(await page.locator(pageArt).isVisible(),`${route}: supporting illustration must be visible at ${width}px`);
      const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelectorAll('h1').length,images:[...document.images].filter(i=>i.naturalWidth===0).map(i=>i.src),outside:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+1;}).map(e=>e.className).slice(0,5)}));
      const actionSelector = ({'':'.visual-hero .k-button','checklist/':'[data-item-id="business"]','diagnosis/':'input[name="business"]','tools/':'[data-category="all"]','start/salon/':'.salon-lead .k-button'})[route];
      const firstActionY = await page.locator(actionSelector).first().evaluate(el => Math.round(el.getBoundingClientRect().top + scrollY));
      if(width <= 390 && route !== 'start/salon/')assert(firstActionY < 1000, `${route}: first action too far down at ${firstActionY}px`);
      layout.push({width,route,firstActionY,...result});
      await page.screenshot({path:out+`${route.replaceAll('/','-')||'home-'}${width}.png`});
      assert.equal(result.overflow,false,`${route} at ${width}: ${result.outside}`);
      assert.equal(result.h1,1);assert.equal(result.images.length,0);
      await page.screenshot({path:out+`${route.replaceAll('/','-')||'home-'}${width}.png`});
      if([375,768,1280].includes(width)&&route==='')await page.screenshot({path:out+`home-full-${width}.png`,fullPage:true});
      if([375,1280].includes(width)&&route==='')for(const section of ['.k-stages','.k-roadmap-wrap','.k-industries'])await page.locator(section).screenshot({path:out+`section-${section.slice(1)}-${width}.png`,style:".k-header,.k-skip{visibility:hidden!important}"});
      if([375,1280].includes(width)&&route==='start/salon/')await page.locator('.business-flow').screenshot({path:out+`salon-flow-${width}.png`,style:".k-header,.k-skip{visibility:hidden!important}"});
      if([320,375,768,1280].includes(width)&&route==='start/salon/')await page.locator('.salon-phase-nav').screenshot({path:out+`salon-phases-${width}.png`,style:".k-header,.k-skip{visibility:hidden!important}"});
    }
  }
  const sitemap=await context.request.get(base+'/sitemap.xml');
  assert.equal(sitemap.status(),200);assert(!(await sitemap.text()).includes('/akindo/kaigyo/'));
  if(base.startsWith('https:'))for(const route of ['/','/akindo/']){const response=await context.request.get(base+route);assert.equal(response.status(),200);assert(!/noindex/.test(response.headers()['x-robots-tag']||''));}
  if(layout.length)await writeFile(out+'viewport-report.json',JSON.stringify(layout,null,2));
  if(heroOnly){await writeFile(out+'hero-layout-report.json',JSON.stringify(layout,null,2));console.log('Hero visual checks passed: '+layout.length);}
  if(!heroOnly){
  await page.setViewportSize({width:375,height:900});
  await page.goto(base+'/akindo/kaigyo/checklist/');
  const first=page.locator('[data-item-id="business"]');
  await first.locator('[data-status="in_progress"]').focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('[data-completed-count]').textContent(),'0');
  await first.locator('[data-status="completed"]').click();
  assert.equal(await page.locator('[data-completed-count]').textContent(),'1');
  assert.equal(await page.locator('[data-progress-percent]').textContent(),'5%');
  await page.locator('[data-item-id="audience"] [data-status="in_progress"]').click();
  await page.reload();
  assert.equal(await page.locator('[data-completed-count]').textContent(),'1');
  assert.match(await page.locator('[data-next-title]').textContent(),/顧客/);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('akindo_kaigyo_progress_v1')));
  assert.equal(Object.keys(saved).length,20);assert(Object.values(saved).every(v=>['not_started','in_progress','completed'].includes(v)));
  await page.locator('[data-resume]').click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'task-audience');
  await page.locator('[data-incomplete-filter]').check();
  assert.equal(await page.locator('[data-item-id]:visible').count(),19);
  await page.locator('[data-item-id="audience"] [data-status="completed"]').focus();await page.keyboard.press('Space');
  assert.equal(await page.locator('[data-item-id]:visible').count(),18);
  assert(await page.evaluate(()=>document.activeElement.getBoundingClientRect().width>0));
  await page.goto(base+'/akindo/kaigyo/checklist/#finance');
  assert.equal(await page.locator('[data-phase]:visible').count(),1);
  assert.equal(await page.locator('[data-phase]:visible').getAttribute('id'),'finance');
  await page.locator('[data-reset-open]').click();await page.locator('[data-reset-cancel]').click();
  assert.equal(await page.locator('[data-completed-count]').textContent(),'2');
  await page.locator('[data-reset-open]').click();await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-completed-count]').textContent(),'2');
  await page.locator('[data-reset-open]').click();await page.locator('[data-reset-confirm]').click();
  assert.equal(await page.locator('[data-completed-count]').textContent(),'0');
  await page.reload();assert.equal(await page.locator('[data-completed-count]').textContent(),'0');
  await page.evaluate(()=>localStorage.setItem('akindo_kaigyo_progress_v1','invalid{'));
  await page.reload();assert.match(await page.locator('[data-storage-message]').textContent(),/読み込めなかった/);
  await page.evaluate(()=>localStorage.setItem('akindo_kaigyo_progress_v1',JSON.stringify({business:'completed',audience:'bogus',unknown:'completed'})));
  await page.reload();assert.equal(await page.locator('[data-completed-count]').textContent(),'1');
  await page.goto(base+'/akindo/kaigyo/checklist/#after');assert.equal(await page.locator('[data-phase]:visible').getAttribute('id'),'after');
  const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});
  const blockedPage=await blocked.newPage();await blockedPage.goto(base+'/akindo/kaigyo/checklist/');await blockedPage.locator('[data-item-id="business"] [data-status="completed"]').click();assert.equal(await blockedPage.locator('[data-completed-count]').textContent(),'1');assert.match(await blockedPage.locator('[data-storage-message]').textContent(),/保存できません/);await blocked.close();
  // Expanded filters remain keyboard operable; completing a later card keeps focus nearby.
  await page.goto(base+'/akindo/kaigyo/checklist/');
  await page.locator('.checklist-phase-picker summary').focus();await page.keyboard.press('Enter');
  await page.locator('[data-phase-filter="finance"]').click();assert.equal(await page.locator('[data-phase]:visible').getAttribute('id'),'finance');
  await page.locator('.checklist-phase-picker summary').click();
  await page.locator('[data-phase-filter="all"]').click();
  await page.locator('[data-incomplete-filter]').check();
  await page.locator('[data-item-id="tax"] [data-status="completed"]').focus();await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.closest('[data-item-id]')?.id),'task-bank');
  assert(await page.evaluate(()=>{const r=document.activeElement.getBoundingClientRect();return r.top>=0&&r.top<innerHeight;}));
  await page.goto(base+'/akindo/kaigyo/tools/?category=reservation');
  assert.equal(await page.locator('[data-tool-category]:visible').count(),1);
  assert.equal(await page.locator('[data-tool-category]:visible').getAttribute('id'),'stores-reserve');
  await page.locator('[data-category="line"]').focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('[data-category="line"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('[data-tool-category]:visible').getAttribute('id'),'line-official');
  await page.locator('.tool-result:visible details summary').focus();await page.keyboard.press('Enter');assert(await page.locator('.tool-result:visible details').getAttribute('open')!==null);
  await page.goto(base+'/akindo/kaigyo/tools/#square');assert.equal(await page.locator('[data-tool-category]:visible').getAttribute('id'),'square');
  await page.goto(base+'/akindo/kaigyo/start/salon/#permissions');
  await page.locator('#permissions details summary').focus();await page.keyboard.press('Enter');assert(await page.locator('#permissions details').getAttribute('open')!==null);
  await page.goto(base+'/akindo/kaigyo/diagnosis/');
  await page.locator('[data-diagnosis-next]').click();assert(await page.locator('[data-diagnosis-error]').isVisible());assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('name')),'business');
  async function answer(values){for(const pairs of [[['business',values.business],['reservation',values.reservation]],[['payment',values.payment],['online',values.online]],[['staff',values.staff],['line',values.line]],[['skill',values.skill],['budget',values.budget]]]){for(const [name,value] of pairs)await page.locator(`input[name="${name}"][value="${value}"]`).check();await page.locator('[data-diagnosis-next]').click();}}
  await answer({business:'salon',reservation:'yes',payment:'yes',online:'no',staff:'solo',line:'yes',skill:'guide',budget:'small'});
  assert(await page.locator('[data-diagnosis-results]').isVisible());assert.equal(await page.evaluate(()=>document.activeElement.id),'diagnosis-result-title');
  const salonResult=await page.locator('[data-diagnosis-tier="first"]').textContent();assert.match(salonResult,/予約/);assert.match(salonResult,/Google/);
  await page.screenshot({path:out+'diagnosis-result-375.png',fullPage:true});
  await page.setViewportSize({width:1280,height:1000});await page.screenshot({path:out+'diagnosis-result-1280.png',fullPage:true});await page.setViewportSize({width:375,height:900});
  await page.locator('[data-diagnosis-edit]').click();assert(await page.locator('input[name="business"][value="salon"]').isChecked());
  await answer({business:'online',reservation:'no',payment:'no',online:'yes',staff:'team',line:'no',skill:'confident',budget:'flexible'});
  const onlineResult=await page.locator('[data-diagnosis-tier="first"]').textContent();assert.notEqual(salonResult,onlineResult);assert.match(onlineResult,/ネットショップ/);assert.doesNotMatch(onlineResult,/予約の受付/);
  await page.locator('[data-diagnosis-reset]').click();assert.equal(await page.locator('input:checked').count(),0);
  await page.locator('.k-mobile-menu summary').focus();await page.keyboard.press('Enter');assert(await page.locator('.k-mobile-menu nav').isVisible());await page.keyboard.press('Escape');assert.equal(await page.locator('.k-mobile-menu').getAttribute('open'),null);
  await page.locator('.k-mobile-menu summary').click();await page.locator('.k-mobile-menu nav a').last().focus();await page.keyboard.press('Tab');assert.equal(await page.locator('.k-mobile-menu').getAttribute('open'),null);
  // Internal destinations, fragments and SEO on every new page.
  const links=new Set();
  for(const route of routes){await page.goto(base+'/akindo/kaigyo/'+route);for(const href of await page.locator('a[href]').evaluateAll(anchors=>anchors.map(a=>a.href)))if(href.startsWith(base))links.add(href);assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://spady.net/akindo/kaigyo/'+route);assert.equal(await page.locator('meta[property="og:image"]').count(),1);}
  for(const link of links){const response=await context.request.get(link);assert.equal(response.status(),200,link);const url=new URL(link);if(url.hash){const body=await response.text();const id=decodeURIComponent(url.hash.slice(1));assert(body.includes(`id="${id}"`)||body.includes(`id='${id}'`),'Missing anchor '+link);}}
  const nojs=await browser.newContext({javaScriptEnabled:false});const nojsPage=await nojs.newPage();await nojsPage.goto(base+'/akindo/kaigyo/checklist/');assert.equal(await nojsPage.locator('[data-item-id]').count(),20);await nojs.close();
  assert.equal(errors.length,0,errors.join('\n'));
  await writeFile(out+'qa-report.json',JSON.stringify({base,testRelease:true,layout,errors,internalLinks:links.size,interactions:'passed'},null,2));
  console.log(JSON.stringify({layoutChecks:layout.length,errors,internalLinks:links.size,interactions:'passed',screenshots:out}));
  }
}finally{await browser.close();}
