const stage = document.querySelector('[data-crew-stage]');
if (stage) {
  const page = stage.closest('.ed-home');
  const cheer = page.querySelector('[data-crew-cheer]');
  const cards = [...stage.querySelectorAll('[data-member]')];
  const name = stage.querySelector('[data-crew-name]');
  const line = stage.querySelector('[data-crew-line]');
  const link = stage.querySelector('[data-crew-link]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const origin = new URL(link.href, location.href).origin;
  let timer;
  function sync(){
    cheer.hidden = motion.matches;
    if (motion.matches) stage.removeAttribute('data-cheer');
  }
  cards.forEach(button=>button.addEventListener('click',()=>{
    const d=button.dataset;
    cards.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    stage.dataset.active=d.member;
    cards.forEach(item=>item.removeAttribute('data-tapped'));
    void button.offsetWidth;
    button.setAttribute('data-tapped','');
    name.textContent=d.name;
    line.textContent=d.line;
    link.textContent=d.detail+' ↗';
    link.href=origin+d.href;
  }));
  cheer.addEventListener('click',()=>{
    clearTimeout(timer);
    stage.removeAttribute('data-cheer');
    if (motion.matches) return;
    void stage.offsetWidth;
    stage.setAttribute('data-cheer','');
    timer=setTimeout(()=>stage.removeAttribute('data-cheer'),1100);
  });
  motion.addEventListener?.('change',sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry])=>stage.toggleAttribute('data-out-of-view',!entry.isIntersecting)).observe(stage);
  }
  document.addEventListener('visibilitychange',()=>stage.toggleAttribute('data-page-hidden',document.hidden));
  sync();
}
