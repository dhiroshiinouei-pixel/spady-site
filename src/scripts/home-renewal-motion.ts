// Small pointer response adds depth without scroll interception or WebGL overhead.
const visual=document.querySelector<HTMLElement>('[data-hero-visual]');
const tilt=document.querySelector<HTMLElement>('[data-art-tilt]');
const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
if(visual&&tilt){
  const reset=()=>{tilt.style.removeProperty('--art-x');tilt.style.removeProperty('--art-y');};
  visual.addEventListener('pointermove',event=>{
    if(!finePointer.matches||reduced.matches||document.documentElement.dataset.motion==='paused')return;
    const box=visual.getBoundingClientRect();
    tilt.style.setProperty('--art-x',`${-(event.clientY-box.top-box.height/2)/box.height*5}deg`);
    tilt.style.setProperty('--art-y',`${(event.clientX-box.left-box.width/2)/box.width*7}deg`);
  },{passive:true});
  visual.addEventListener('pointerleave',reset);
  addEventListener('spady:motionchange',reset);
  reduced.addEventListener('change',reset);
  document.addEventListener('visibilitychange',()=>{
    const art=visual.querySelector<HTMLElement>('.h-sculpture');
    if(art)art.style.animationPlayState=document.hidden?'paused':'';
    if(document.hidden)reset();
  });
}
