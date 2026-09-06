const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const control = document.querySelector<HTMLButtonElement>('.motion-control');
let paused = root.dataset.motion === 'paused';
const enabled = () => !paused && !reduceMotion.matches;

function updateControl() {
  const stopped = !enabled();
  root.dataset.motion = stopped ? 'paused' : 'playing';
  control?.setAttribute('aria-pressed', String(stopped));
  control?.setAttribute('aria-label', stopped ? (control?.dataset.play || 'Resume motion') : (control?.dataset.pause || 'Pause motion'));
  const label = control?.querySelector('.motion-label');
  const symbol = control?.querySelector('.motion-symbol');
  if (label) label.textContent = reduceMotion.matches ? (control?.dataset.reduced || 'Reduced motion') : stopped ? (control?.dataset.play || 'Resume motion') : (control?.dataset.pause || 'Pause motion');
  if (symbol) symbol.textContent = stopped ? '▶' : 'Ⅱ';
  if (control) control.disabled = reduceMotion.matches;
}
control?.addEventListener('click', () => {
  paused = !paused;
  try { localStorage.setItem('spady_motion', paused ? 'paused' : 'playing'); } catch {}
  updateControl();
});
reduceMotion.addEventListener('change', updateControl);
updateControl();

const menu = document.querySelector<HTMLDetailsElement>('.mobile-menu');
menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { if (menu) menu.open = false; }));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.open) { menu.open = false; menu.querySelector('summary')?.focus(); }
});
document.addEventListener('click', event => {
  if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
});

const revealItems = document.querySelectorAll<HTMLElement>('.section-heading, .about-copy, .section-top, .project-card, .story-card, .topic-list>a, .profile-photo, .profile-copy, .contact-inner, .inquiry-heading, .inquiry-card');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
  }, { threshold: 0.08, rootMargin: '0px 0px -16px 0px' });
  revealItems.forEach((item, index) => {
    item.classList.add('reveal-item');
    item.style.setProperty('--reveal-delay', `${(index % 2) * 70}ms`);
    observer.observe(item);
  });
  root.classList.add('motion-ready');
}

let previousY = scrollY;
let scrollFrame = 0;
let scrollTimer: ReturnType<typeof setTimeout>;
const updateScroll = () => {
  scrollFrame = 0;
  const y = scrollY;
  const total = document.documentElement.scrollHeight - innerHeight;
  root.style.setProperty('--scroll-progress', String(total > 0 ? Math.max(0, Math.min(1, y / total)) : 0));
  if (enabled()) {
    root.dataset.scrollDirection = y >= previousY ? 'down' : 'up';
    root.dataset.scrolling = 'true';
    root.style.setProperty('--scroll-turn', `${y / 10}deg`);
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => delete root.dataset.scrolling, 180);
  }
  previousY = y;
};
addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }, { passive: true });
addEventListener('resize', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }, { passive: true });
updateScroll();

function celebrateTap(x: number, y: number) {
  if (!enabled()) return;
  ['#164ddc', '#ed5278', '#7bad26', '#ffad22'].forEach((color, i) => {
    const spark = document.createElement('span');
    spark.className = 'tap-spark'; spark.textContent = '✦'; spark.setAttribute('aria-hidden', 'true');
    spark.style.cssText = `left:${x}px;top:${y}px;--spark-color:${color};--spark-x:${(i - 1.5) * 28}px;--spark-y:${-25 - (i % 2) * 23}px`;
    document.body.append(spark); setTimeout(() => spark.remove(), 650);
  });
}

document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest<HTMLElement>('a, button');
  if (!target || target.classList.contains('motion-control') || target.closest('.site-consent')) return;
  const rect = target.getBoundingClientRect();
  const x = event.detail ? event.clientX : rect.left + rect.width / 2;
  const y = event.detail ? event.clientY : rect.top + rect.height / 2;
  celebrateTap(x, y);
  if (enabled() && target.matches('.project-card, .contact-button, .nav-contact, .inquiry-submit')) {
    const ripple = document.createElement('span'); ripple.className = 'click-ripple'; ripple.setAttribute('aria-hidden', 'true');
    ripple.style.left = `${x - rect.left}px`; ripple.style.top = `${y - rect.top}px`;
    target.append(ripple); setTimeout(() => ripple.remove(), 700);
  }
  if (!(target instanceof HTMLAnchorElement) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || target.target === '_blank') return;
  const url = new URL(target.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
  const section = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!section) return;
  event.preventDefault();
  history.pushState(null, '', url.hash);
  section.scrollIntoView({ behavior: enabled() ? 'smooth' : 'instant', block: 'start' });
  const heading = section.querySelector<HTMLElement>('h1,h2') || section;
  heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true });
  if (enabled()) { heading.classList.remove('anchor-highlight'); requestAnimationFrame(() => heading.classList.add('anchor-highlight')); setTimeout(() => heading.classList.remove('anchor-highlight'), 1250); }
});

document.querySelectorAll<HTMLElement>('.project-card').forEach(card => {
  let frame = 0;
  card.addEventListener('pointermove', event => {
    if (!enabled() || event.pointerType !== 'mouse') return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const r = card.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width;
      const y = (event.clientY - r.top) / r.height;
      card.style.setProperty('--glow-x', `${x * 100}%`); card.style.setProperty('--glow-y', `${y * 100}%`);
      card.style.setProperty('--tilt-x', `${(x - .5) * 3}deg`); card.style.setProperty('--tilt-y', `${(.5 - y) * 3}deg`);
    });
  });
  card.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); card.style.setProperty('--tilt-x', '0deg'); card.style.setProperty('--tilt-y', '0deg'); });
});

// Preserve incoming links to the former landing page's sections.
if (location.pathname === '/' && ['#lp-services', '#lp-works', '#local'].includes(location.hash)) {
  location.replace(`/fullfunnelmarketing/${location.search}${location.hash}`);
}

const languageMenu = document.querySelector<HTMLDetailsElement>('.language-menu');
languageMenu?.addEventListener('toggle', () => { if (languageMenu.open && menu) menu.open = false; });
menu?.addEventListener('toggle', () => { if (menu.open && languageMenu) languageMenu.open = false; });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && languageMenu?.open) { languageMenu.open = false; languageMenu.querySelector('summary')?.focus(); } });
document.addEventListener('click', event => { if (languageMenu?.open && event.target instanceof Node && !languageMenu.contains(event.target)) languageMenu.open = false; });
