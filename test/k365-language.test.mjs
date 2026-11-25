import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const code=readFileSync(new URL('../public/kuchikomi365/language.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../public/kuchikomi365/index.html',import.meta.url),'utf8');
const dictionaries={};
for(const lang of ['en','zh-Hans','zh-Hant']) dictionaries[lang]=JSON.parse(readFileSync(new URL('../public/kuchikomi365/i18n-'+lang+'.json',import.meta.url),'utf8'));
const keys=Object.keys(dictionaries.en);
for(const dictionary of Object.values(dictionaries)){
 assert.equal(Object.keys(dictionary).length,264);
 for(const key of keys)assert.ok(dictionary[key],key);
}
function page({languages=['ja'],saved='',query='',fails=false}={}){
 let current='https://spady.example/kuchikomi365/'+query, persisted=saved, handler;
 const select={hidden:true,value:'ja',addEventListener:(_e,fn)=>{handler=fn}};
 const root={lang:'ja'};
 const nodes=['Googleマップで見つかる、','口コミ365には、運用をサポートするプランもあります。','本文へ移動'].map(data=>({data,parentElement:{closest:()=>null}}));
 const externalFrame={tagName:'IFRAME',props:{title:'口コミ365本部の相談予約カレンダー',src:'https://meetings-na2.hubspot.com/?consultation_details=placeholder'},getAttribute(k){return this.props[k]},setAttribute(k,v){this.props[k]=v}};
 const fetchCalls=[];
 const context={document:{documentElement:root,getElementById:()=>select,createTreeWalker:()=>{let i=0;return{nextNode:()=>nodes[i++]}},querySelectorAll:()=>[externalFrame]},NodeFilter:{SHOW_TEXT:4},location:{get href(){return current}},URL,
 history:{replaceState(_s,_t,u){current=String(u)}},navigator:{languages},localStorage:{getItem:()=>persisted,setItem:(_k,v)=>{persisted=v}},fetch:async path=>{fetchCalls.push(path);return {ok:!fails,json:async()=>dictionaries[path.slice(7,-5)]}}};
 vm.runInNewContext(code,context);
 return {root,nodes,select,switch:async lang=>{select.value=lang;await handler()},externalFrame,fetchCalls,get url(){return new URL(current)},get saved(){return persisted}};
}
const ready=()=>new Promise(r=>setImmediate(r));
test('device languages pick English, simplified Chinese and traditional Chinese with a Japanese fallback',async()=>{
 for(const [prefs,want] of [[['en-US'],'en'],[['zh-HK'],'zh-Hant'],[['zh-TW'],'zh-Hant'],[['zh-Hans'],'zh-Hans'],[['zh-CN'],'zh-Hans'],[['ko-KR'],'ja'],[['fr-FR','en-GB'],'en']]){
 const p=page({languages:prefs});await ready();assert.equal(p.root.lang,want);assert.equal(p.select.value,want);assert.equal(p.select.hidden,false);
 assert.equal(p.nodes[0].data,want==='ja'?'Googleマップで見つかる、':dictionaries[want]['Googleマップで見つかる、']);
 }
});
test('manual choice persists and keeps campaign identifiers and booking iframe untouched',async()=>{
 const p=page({languages:['en-US'],saved:'zh-Hans',query:'?lang=zh-TW&ref=demo&utm_source=email'});
 const src=p.externalFrame.props.src;await ready();assert.equal(p.root.lang,'zh-Hant');await p.switch('en');await ready();
 assert.equal(p.saved,'en');assert.equal(p.url.searchParams.get('lang'),'en');assert.equal(p.url.searchParams.get('ref'),'demo');assert.equal(p.url.searchParams.get('utm_source'),'email');
 assert.equal(p.externalFrame.props.src,src);assert.equal(p.externalFrame.props.title,dictionaries.en['口コミ365本部の相談予約カレンダー']);
 await p.switch('ja');await ready();assert.equal(p.externalFrame.props.title,'口コミ365本部の相談予約カレンダー');
 const later=page({saved:p.saved,languages:['zh-TW']});await ready();assert.equal(later.root.lang,'ja');
});
test('unavailable translation falls back to Japanese; support line sits below the three items',async()=>{
 const p=page({languages:['en'],fails:true});await ready();assert.equal(p.root.lang,'ja');assert.equal(p.select.value,'ja');
 assert.match(html,/<div class="search-actions">[\s\S]*?<\/ul>\s*<p>口コミ365には、運用をサポートするプランもあります。<\/p>/);
 assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
 assert.match(html,/data-src="https:\/\/meetings-na2.hubspot.com\/kuchikomi365\/metalinemeo\?embed=true&amp;consultation_details=/);
});
