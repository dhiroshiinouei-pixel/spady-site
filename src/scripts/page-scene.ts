/** Native cross-document navigation with a bounded, optional visual handoff. */
export function initPageScenes() {
  const root = document.documentElement;
  const key = 'spady_language_scene';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const enabled = () => !motion.matches && root.dataset.motion !== 'paused';
  const label = document.querySelector<HTMLElement>('[data-scene-language]');
  let pending: { url: URL; id: string; departing: boolean } | null = null;
  let navigationTimer: ReturnType<typeof setTimeout> | undefined;
  let recoveryTimer: ReturnType<typeof setTimeout> | undefined;

  const clearOwnedMarker = (id: string) => {
    try { if (JSON.parse(sessionStorage.getItem(key) || 'null')?.id === id) sessionStorage.removeItem(key); } catch {}
  };
  const reset = (removeMarker = true) => {
    clearTimeout(navigationTimer); clearTimeout(recoveryTimer);
    if (removeMarker && pending) clearOwnedMarker(pending.id);
    pending = null;
    delete root.dataset.scene;
  };
  const depart = () => {
    if (!pending || pending.departing) return;
    pending.departing = true;
    try { location.assign(pending.url.href); } catch { reset(); }
  };
  const settleMotion = () => {
    if (enabled()) return;
    delete root.dataset.scene;
    clearTimeout(navigationTimer);
    if (pending) depart();
  };

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
    // A later link choice takes precedence, including same-page anchors.
    if (pending && event.target.closest('a[href]')) reset();
    const link = event.target.closest<HTMLAnchorElement>('.language-menu a[data-language-label]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol)) return;
    if (url.pathname === location.pathname) return;
    if (!enabled() || !label) return;
    // Keep deep links to the corresponding section across the translated pages.
    if (location.hash && !url.hash) url.hash = location.hash;
    const rect = link.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.detail ? event.clientX : rect.left + rect.width / 2) / innerWidth));
    const y = Math.max(0, Math.min(1, (event.detail ? event.clientY : rect.top + rect.height / 2) / innerHeight));
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    // Without storage, let the browser navigate normally instead of a mismatched handoff.
    try { sessionStorage.setItem(key, JSON.stringify({ path: url.pathname, at: Date.now(), id, x, y })); } catch { return; }
    event.preventDefault();
    pending = { url, id, departing: false };
    label.textContent = link.dataset.languageLabel || link.lang;
    root.style.setProperty('--scene-x', `${x * 100}%`);
    root.style.setProperty('--scene-y', `${y * 100}%`);
    root.dataset.scene = 'language-leaving';
    navigationTimer = setTimeout(depart, 440);
    // A blocked or very slow navigation must leave the current page usable.
    recoveryTimer = setTimeout(() => reset(), 4500);
  }, true);

  addEventListener('spady:motionchange', settleMotion);
  motion.addEventListener('change', settleMotion);
  const revealDuringNavigation = () => { if (pending) delete root.dataset.scene; };
  for (const event of ['wheel', 'touchstart', 'pointerdown']) addEventListener(event, revealDuringNavigation, { passive: true });
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && pending) reset();
    else revealDuringNavigation();
  });
  document.addEventListener('submit', () => { if (pending && !pending.departing) reset(); }, true);
  addEventListener('pagehide', () => reset(false));
  addEventListener('pageshow', event => { if (event.persisted) reset(); });
}
