// Scroll is the clock. Nothing here changes scroll position or runs an idle loop.
const home = document.querySelector('.ed-home');
if (home && 'IntersectionObserver' in window) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let stop = () => {};
  function start() {
    stop(); stop = () => {};
    if (media.matches) return;
    const abort = new AbortController();
    const opts = { passive: true, signal: abort.signal };
    const story = home.querySelector('[data-story]');
    const stage = home.querySelector('[data-crew-stage]');
    const groups = ['step', 'active', 'art'].map(key =>
      [...(story?.querySelectorAll('[data-story-' + key + ']') ?? [])]);
    const count = Math.max(1, ...groups.map(g => g.length));
    const clamp = v => Math.max(0, Math.min(1, v));
    let frame = 0, current = -1;
    const visible = new Set();
    function paint() {
      frame = 0;
      const vh = window.innerHeight;
      if (story && visible.has(story)) {
        const r = story.getBoundingClientRect();
        const sticky = story.querySelector('.story-sticky');
        const pin = sticky && getComputedStyle(sticky).position === 'sticky';
        const top = pin ? parseFloat(getComputedStyle(sticky).top) || 0 : 0;
        const range = pin ? r.height - sticky.offsetHeight : r.height - vh * .34;
        const p = clamp(((pin ? top : vh * .33) - r.top) / Math.max(1, range));
        story.style.setProperty('--story-p', p.toFixed(4));
        const focus = vh * .59;
        const next = groups[0].reduce((best, node, i) => node.getBoundingClientRect().top <= focus ? i : best, 0);
        if (next !== current) {
          current = next; story.dataset.current = String(next);
          groups.forEach(g => g.forEach((el, i) => el.toggleAttribute('data-active', i === next)));
        }
      }
      if (stage && visible.has(stage)) {
        const r = stage.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh + r.height)) - .5;
        stage.style.setProperty('--crew-shift', (22*p).toFixed(2)+'px');
      }
    }
    function queue() { if (!frame && visible.size && !document.hidden) frame = requestAnimationFrame(paint); }
    const scenery = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
      queue();
    }, {rootMargin: '64px'});
    [story, stage].filter(Boolean).forEach(el => scenery.observe(el));
    story?.setAttribute('data-motion', '');
    window.addEventListener('scroll', queue, opts);
    window.addEventListener('resize', queue, opts);
    document.addEventListener('visibilitychange', queue, opts);
    const reveal = new IntersectionObserver(entries => {
      entries.filter(e => e.isIntersecting).forEach(({target}) => {
        target.classList.add('story-entered'); reveal.unobserve(target);
      });
    }, {threshold: .08});
    const targets = [...home.querySelectorAll('.ed-service, .ed-work, .story-reveal')];
    targets.forEach(el => {
      el.style.setProperty('--reveal-delay', (([...el.parentElement.children].indexOf(el)%4)*55)+'ms');
      reveal.observe(el);
    });
    stop = () => {
      abort.abort(); cancelAnimationFrame(frame); scenery.disconnect(); reveal.disconnect();
      story?.removeAttribute('data-motion'); story?.removeAttribute('data-current');
      story?.style.removeProperty('--story-p'); stage?.style.removeProperty('--crew-shift');
      groups.flat().forEach(el => el.removeAttribute('data-active'));
      targets.forEach(el => el.classList.remove('story-entered'));
    };
  }
  start(); media.addEventListener('change', start);
}
