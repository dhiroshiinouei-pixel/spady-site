import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {verifyInteractions} from './browser-interactions.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const dir=new URL('../artifacts/renewal-review/',import.meta.url).pathname;
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext({viewport:{width:1440,height:1050},deviceScaleFactor:1});
await context.addInitScript(()=>localStorage.setItem('spady_cookie_consent','denied'));
const page=await context.newPage();
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4328';
const homeOnly=process.argv.includes('--home-only');
if(process.argv.includes('--interactions-only')){try{await verifyInteractions(browser,base,dir);}finally{await browser.close();}process.exit(0);}
if(process.argv.includes('--visuals-only')){
 for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:1000});await page.goto(base,{waitUntil:'networkidle'});await page.waitForTimeout(1700);await page.evaluate(async()=>{await Promise.all([...document.images].map(async i=>{i.loading='eager';try{await i.decode();}catch{}}));});await page.screenshot({path:dir+'home-'+width+'.png'});if(width===390||width===1440){await page.screenshot({path:dir+'home-full-'+width+'.png',fullPage:true});for(const name of ['projects','services','profile','contact']){await page.locator('#'+name).screenshot({path:dir+name+'-section-'+width+'.png',style:'.corp-header,.skip-link{visibility:hidden!important}'});}}}
 await browser.close();process.exit(0);
}
await page.goto(base,{waitUntil:'networkidle'});await page.waitForTimeout(1800);
await page.screenshot({path:dir+'home-1440.png'});
await page.screenshot({path:dir+'home-full-1440.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.goto(base,{waitUntil:'networkidle'});await page.waitForTimeout(1800);
await page.screenshot({path:dir+'home-390.png'});await page.screenshot({path:dir+'home-full-390.png',fullPage:true});
const report=[];
for(const width of [320,390,768,1024,1440]){
 await page.setViewportSize({width,height:900});
 for(const route of homeOnly?['/']:['/','/services/','/services/google-business-profile/','/services/line-mini-app/','/about/','/projects/','/support/','/contact/','/privacy/','/legal/','/terms/','/cancellation/','/news/']){
  await page.goto(base+route,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);await page.evaluate(async()=>{await Promise.all([...document.images].map(async image=>{image.loading='eager';try{await image.decode();}catch{}}));});
  const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelector('h1')?.textContent,images:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src')),badElements:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+2&&getComputedStyle(e).position!=='absolute';}).slice(0,4).map(e=>({tag:e.tagName,class:e.className}))}));
  report.push({width,route,...result});
  if(route==='/'){await page.waitForTimeout(1700);await page.screenshot({path:dir+'home-'+width+'.png'});if(width===390||width===1440){for(const name of ['projects','services','profile','contact'])await page.locator('#'+name).screenshot({path:dir+name+'-section-'+width+'.png',style:'.corp-header,.skip-link{visibility:hidden!important}'});}}
  if([320,390,768,1440].includes(width)&&['/contact/','/services/','/services/google-business-profile/','/about/','/support/','/projects/','/legal/'].includes(route))await page.screenshot({path:dir+route.replaceAll('/','-').slice(1,-1)+'-'+width+'.png'});
 }
}
// Reference is read-only; failure doesn't invalidate local checks.
if(!homeOnly)try{await page.setViewportSize({width:1440,height:1000});await page.goto('https://www.tsg-jpn.co.jp/',{waitUntil:'domcontentloaded',timeout:30000});await page.waitForTimeout(4500);await page.screenshot({path:dir+'reference-tsg.png'});}catch(e){console.log('Reference capture unavailable:',e.message.split('\n')[0]);}
await writeFile(dir+'layout-results.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({checks:report.length,issues:report.filter(r=>r.overflow||r.images.length),screenshots:dir}));
await verifyInteractions(browser,base,dir);
await browser.close();
