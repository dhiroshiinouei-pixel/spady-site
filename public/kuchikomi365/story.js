(() => {
  const player = document.getElementById('videoScreen');
  const play = document.getElementById('playVideo');
  if (player && play) {
    play.hidden = false;
    play.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.title = '口コミ365公式チャンネルによる紹介動画';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      frame.src = 'https://www.youtube-nocookie.com/embed/PYlKfw8bIQY?autoplay=1&rel=0';
      player.replaceChildren(frame);
      frame.focus();
    }, { once: true });
  }
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const count = document.getElementById('adoptionCount');
  const lines = [...document.querySelectorAll('[data-underline]')];
  if (motion.matches || !('IntersectionObserver' in window)) {
    if (count) count.dataset.state = 'done';
    return;
  }
  if (count) {
    const finalText = count.textContent.trim();
    const goal = Number(finalText.replaceAll(',', ''));
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const fmt = new Intl.NumberFormat('ja-JP');
      count.dataset.state = 'running';
      function render(now) {
        const t = Math.min(1, (now - start) / 1000);
        if (t >= 1 || motion.matches || !Number.isFinite(goal)) {
          count.textContent = finalText;
          count.dataset.state = 'done';
          return;
        }
        count.textContent = fmt.format(Math.floor(goal * (1 - (1 - t) ** 3)));
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);
    }, { threshold: 0.4 });
    observer.observe(count);
  }
  if (lines.length) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.4 });
    for (const line of lines) {
      line.classList.add('can-animate');
      observer.observe(line);
    }
  }
})();
