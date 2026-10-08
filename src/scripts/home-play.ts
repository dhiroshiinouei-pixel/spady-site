/** Homepage micro-interactions. Navigation and native scrolling stay untouched. */
const home = document.querySelector<HTMLElement>('.h-content');

if (home && !home.dataset.playReady) {
  home.dataset.playReady = 'true';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const canMove = () => !document.hidden && !reduced.matches && root.dataset.motion !== 'paused';
  const frames = new Map<HTMLElement, number>();
  const surfaces = Array.from(home.querySelectorAll<HTMLElement>('.h-product-art, .h-work, .h-calendar'));
  const visible = new Set<Element>();

  const progress = document.createElement('div');
  progress.className = 'play-reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  document.body.append(progress);
  const progressLine = progress.firstElementChild as HTMLElement;
  let scrollFrame = 0;
  let lastY = scrollY;
  const updateProgress = () => {
    scrollFrame = 0;
    const total = root.scrollHeight - innerHeight;
    const value = total > 0 ? Math.max(0, Math.min(1, scrollY / total)) : 0;
    progressLine.style.transform = `scaleX(${value})`;
    if (canMove()) progress.dataset.direction = scrollY < lastY ? 'up' : 'down';
    lastY = scrollY;
  };
  const queueProgress = () => {
    if (!document.hidden && !scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
  };
  addEventListener('scroll', queueProgress, { passive: true });
  addEventListener('resize', queueProgress, { passive: true });
  addEventListener('load', queueProgress, { once: true });
  updateProgress();

  const resetSurface = (surface: HTMLElement) => {
    const frame = frames.get(surface);
    if (frame) cancelAnimationFrame(frame);
    frames.delete(surface);
    surface.classList.remove('play-pointing');
    ['--play-x', '--play-y', '--play-rx', '--play-ry'].forEach(name => surface.style.removeProperty(name));
  };

  surfaces.forEach(surface => {
    surface.classList.add('play-surface');
    surface.addEventListener('pointermove', event => {
      if (!canMove() || !finePointer.matches || event.pointerType !== 'mouse' || !visible.has(surface)) return;
      if (frames.has(surface)) return;
      frames.set(surface, requestAnimationFrame(() => {
        frames.delete(surface);
        if (!canMove() || !visible.has(surface)) return;
        const rect = surface.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        surface.style.setProperty('--play-x', `${(x * 100).toFixed(2)}%`);
        surface.style.setProperty('--play-y', `${(y * 100).toFixed(2)}%`);
        surface.style.setProperty('--play-rx', `${((.5 - y) * 3.2).toFixed(2)}deg`);
        surface.style.setProperty('--play-ry', `${((x - .5) * 4).toFixed(2)}deg`);
        surface.classList.add('play-pointing');
      }));
    }, { passive: true });
    surface.addEventListener('pointerleave', () => resetSurface(surface));
    surface.addEventListener('pointercancel', () => resetSurface(surface));
    surface.addEventListener('blur', () => resetSurface(surface));
  });

  // A tiny original crystal companion belongs to the mission, never follows the cursor.
  const companion = document.createElement('button');
  companion.type = 'button';
  companion.className = 'play-buddy';
  companion.setAttribute('aria-label', 'クリスタルの相棒を輝かせる');
  companion.innerHTML = `<svg class="play-buddy-art" viewBox="0 0 100 106" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="play-gem-body" x1="17" y1="15" x2="82" y2="91" gradientUnits="userSpaceOnUse"><stop stop-color="#E5FFFF"/><stop offset=".32" stop-color="#A5D7FF"/><stop offset=".62" stop-color="#D9C4FF"/><stop offset="1" stop-color="#F9CBD9"/></linearGradient>
      <linearGradient id="play-gem-facet" x1="30" y1="18" x2="70" y2="80" gradientUnits="userSpaceOnUse"><stop stop-color="white" stop-opacity=".9"/><stop offset="1" stop-color="#ACEAF4" stop-opacity=".2"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="24" ry="4" fill="#949BDA" opacity=".14"/>
    <g class="play-buddy-gem">
      <path d="M30 16 70 16 89 40 50 89 11 40Z" fill="url(#play-gem-body)" stroke="#C5D4F5" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M30 16 37 40 11 40ZM70 16 63 40 89 40Z" fill="white" fill-opacity=".7"/>
      <path d="M30 16 50 11 70 16 63 40 37 40Z" fill="url(#play-gem-facet)"/>
      <path d="M37 40 50 89 11 40Z" fill="#66B7EE" fill-opacity=".36"/><path d="M63 40 50 89 89 40Z" fill="#B199F3" fill-opacity=".4"/>
      <path d="M37 40 50 89 63 40Z" fill="white" fill-opacity=".55"/><path d="M11 40H89M30 16 37 40 50 89 63 40 70 16" stroke="white" stroke-opacity=".88" stroke-width="1.2"/>
      <g class="play-buddy-eyes" fill="#283751"><ellipse cx="40" cy="47" rx="2.5" ry="4"/><ellipse cx="60" cy="47" rx="2.5" ry="4"/></g>
      <path class="play-buddy-smile" d="M46 57Q50 61 54 57" stroke="#283751" stroke-width="1.8" stroke-linecap="round"/>
      <ellipse cx="32" cy="55" rx="4" ry="2" fill="#F7B6D5" opacity=".8"/><ellipse cx="68" cy="55" rx="4" ry="2" fill="#F7B6D5" opacity=".8"/>
      <path d="m22 29 1.5-5L25 29l5 1.5-5 1.5-1.5 5-1.5-5-5-1.5Z" fill="white"/>
    </g>
    <g class="play-buddy-stars" stroke-linecap="round"><path d="M84 12v10M79 17h10" stroke="#AE91EF" stroke-width="2"/><path d="M13 70v8M9 74h8" stroke="#67BCCD" stroke-width="2"/><path d="M85 70v6M82 73h6" stroke="#ED9DC8" stroke-width="1.5"/></g>
  </svg><span class="play-buddy-hint" aria-hidden="true">さわってみて</span>`;
  home.querySelector('.h-mission > .h-section-label')?.append(companion);
  let companionTimer: ReturnType<typeof setTimeout> | undefined;
  let companionFrame = 0;
  let mood = 0;
  companion.addEventListener('click', () => {
    mood = (mood + 1) % 3;
    companion.dataset.mood = String(mood);
    companion.classList.remove('play-buddy-hello');
    clearTimeout(companionTimer);
    cancelAnimationFrame(companionFrame);
    if (!canMove()) return;
    companionFrame = requestAnimationFrame(() => {
      companionFrame = 0;
      if (!canMove()) return;
      companion.classList.add('play-buddy-hello');
      companionTimer = setTimeout(() => companion.classList.remove('play-buddy-hello'), 1100);
    });
  });

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const target = entry.target as HTMLElement;
      if (entry.isIntersecting) visible.add(target);
      else { visible.delete(target); resetSurface(target); }
      target.dataset.playVisible = String(entry.isIntersecting);
    });
  }, { rootMargin: '40px', threshold: .04 }) : null;
  [...surfaces, companion].forEach(surface => {
    if (observer) observer.observe(surface);
    else { visible.add(surface); surface.dataset.playVisible = 'true'; }
  });

  // A bounded ring gives buttons and links the same physical, light-touch response.
  const ripple = (target: HTMLElement, clientX?: number, clientY?: number) => {
    if (!canMove() || target.matches(':disabled, [aria-disabled="true"]') || target.closest('.site-consent') || target.classList.contains('motion-control')) return;
    const rect = target.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const layer = document.createElement('span');
    const ring = document.createElement('span');
    layer.className = 'play-tap-layer';
    ring.className = 'play-tap-ring';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.left = `${rect.left}px`;
    layer.style.top = `${rect.top}px`;
    layer.style.width = `${rect.width}px`;
    layer.style.height = `${rect.height}px`;
    layer.style.borderRadius = getComputedStyle(target).borderRadius;
    ring.style.left = `${clientX === undefined ? rect.width / 2 : clientX - rect.left}px`;
    ring.style.top = `${clientY === undefined ? rect.height / 2 : clientY - rect.top}px`;
    layer.append(ring);
    document.body.append(layer);
    ring.addEventListener('animationend', () => layer.remove(), { once: true });
    setTimeout(() => layer.remove(), 700);
  };
  document.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || !(event.target instanceof Element)) return;
    const target = event.target.closest<HTMLElement>('a, button');
    if (target) ripple(target, event.clientX, event.clientY);
  }, { passive: true });
  document.addEventListener('click', event => {
    if (event.detail !== 0 || !(event.target instanceof Element)) return;
    const target = event.target.closest<HTMLElement>('a, button');
    if (target) ripple(target);
  });

  const syncMotion = () => {
    root.classList.toggle('play-document-hidden', document.hidden);
    if (!canMove()) {
      surfaces.forEach(resetSurface);
      document.querySelectorAll('.play-tap-layer').forEach(layer => layer.remove());
      companion.classList.remove('play-buddy-hello');
      clearTimeout(companionTimer);
      cancelAnimationFrame(companionFrame);
      companionFrame = 0;
    }
    if (document.hidden) { cancelAnimationFrame(scrollFrame); scrollFrame = 0; }
    else queueProgress();
  };
  addEventListener('spady:motionchange', syncMotion);
  reduced.addEventListener('change', syncMotion);
  finePointer.addEventListener('change', () => surfaces.forEach(resetSurface));
  document.addEventListener('visibilitychange', syncMotion);
  addEventListener('pagehide', () => { surfaces.forEach(resetSurface); cancelAnimationFrame(scrollFrame); cancelAnimationFrame(companionFrame); clearTimeout(companionTimer); });
  syncMotion();
}
