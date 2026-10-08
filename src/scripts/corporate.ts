import { initPageScenes } from './page-scene';
const root=document.documentElement;
const preference=matchMedia('(prefers-reduced-motion: reduce)');
const controls=Array.from(document.querySelectorAll<HTMLButtonElement>('.motion-control'));
let paused=root.dataset.motion==='paused';
const update=()=>{const stopped=paused||preference.matches;root.dataset.motion=stopped?'paused':'playing';controls.forEach(control=>{control.setAttribute('aria-pressed',String(stopped));control.disabled=preference.matches;const label=control.querySelector('.motion-label');if(label)label.textContent=preference.matches?control.dataset.reduced||'':stopped?control.dataset.play||'':control.dataset.pause||'';});dispatchEvent(new Event('spady:motionchange'));};
controls.forEach(control=>control.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('spady_motion',paused?'paused':'playing');}catch{}update();}));preference.addEventListener('change',update);update();
const menus=Array.from(document.querySelectorAll<HTMLDetailsElement>('.mobile-menu,.language-menu'));
menus.forEach(menu=>{menu.addEventListener('toggle',()=>{if(menu.open)menus.filter(other=>other!==menu).forEach(other=>other.open=false);});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.open=false));});
document.addEventListener('keydown',e=>{if(e.key==='Escape')menus.filter(m=>m.open).forEach(m=>{m.open=false;m.querySelector('summary')?.focus();});});
document.addEventListener('click',e=>{menus.forEach(m=>{if(e.target instanceof Node&&!m.contains(e.target))m.open=false;});const link=e.target instanceof Element?e.target.closest('a'):null;if(!link||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||link.target==='_blank')return;const url=new URL(link.href);if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;let id;try{id=decodeURIComponent(url.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(!target)return;e.preventDefault();history.pushState(null,'',url.hash);target.scrollIntoView({behavior:!paused&&!preference.matches?'smooth':'instant'});const heading=target.querySelector<HTMLElement>('h1,h2')||target;heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});});
// Existing incoming anchors from the former landing page still resolve.
if(location.pathname==='/'&&['#lp-services','#lp-works','#local'].includes(location.hash))location.replace(`/fullfunnelmarketing/${location.search}${location.hash}`);
initPageScenes();
