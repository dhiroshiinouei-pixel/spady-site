/* AKINDO Lab — essential page interactions. */
(() => {
  'use strict';

  function initialize() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const header = document.getElementById('siteHeader');
    const menuButton = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    const mobileBar = document.getElementById('mobileCtaBar');
    const finalCta = document.getElementById('cta');
    const originalOverflow = document.body.style.overflow;
    let menuOpen = false;
    let introLocksScroll = false;
    let finalCtaInView = false;

    function syncScrollLock() {
      document.body.style.overflow = menuOpen || introLocksScroll ? 'hidden' : originalOverflow;
    }

    function updateHeader() {
      if (header) header.classList.toggle('scrolled', window.scrollY > 10);
      if (mobileBar) {
        const show = window.scrollY > window.innerHeight * 0.6 && !finalCtaInView && !menuOpen;
        mobileBar.classList.toggle('visible', show);
        mobileBar.inert = !show;
        mobileBar.setAttribute('aria-hidden', String(!show));
      }
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', updateHeader, { passive: true });
    if (finalCta && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        finalCtaInView = entries[0].isIntersecting;
        updateHeader();
      }).observe(finalCta);
    }
    updateHeader();

    /* The background stays silent and offers a readable still-image fallback. */
    (() => {
      const hero = document.getElementById('hero');
      const media = document.getElementById('heroMedia');
      const video = document.getElementById('heroVideo');
      const toggle = document.getElementById('heroVideoToggle');
      if (!hero || !media || !video || !toggle) return;
      const saveData = Boolean(navigator.connection && navigator.connection.saveData);
      let userPaused = false;
      let inView = true;
      let failed = false;
      video.muted = true;
      video.defaultMuted = true;

      function updateButton() {
        toggle.textContent = video.paused ? '背景動画を再生' : '背景動画を一時停止';
      }
      function showPoster() {
        video.pause();
        media.classList.remove('has-video');
        toggle.hidden = true;
      }
      function sync() {
        if (reduceMotion.matches || saveData || failed) {
          showPoster();
          return;
        }
        if (!video.getAttribute('src')) video.src = video.dataset.src;
        if (userPaused || document.hidden || !inView) {
          video.pause();
          return;
        }
        video.play().catch(() => {
          if (!video.paused || document.hidden || !inView || userPaused) return;
          showPoster();
        });
      }
      video.addEventListener('playing', () => {
        if (reduceMotion.matches || saveData) {
          showPoster();
          return;
        }
        media.classList.add('has-video');
        toggle.hidden = false;
        updateButton();
      });
      video.addEventListener('pause', updateButton);
      video.addEventListener('error', () => {
        failed = true;
        showPoster();
      });
      toggle.addEventListener('click', () => {
        userPaused = !video.paused;
        sync();
      });
      document.addEventListener('visibilitychange', sync);
      reduceMotion.addEventListener('change', () => {
        if (reduceMotion.matches) {
          showPoster();
          video.removeAttribute('src');
          video.load();
        } else {
          sync();
        }
      });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
          inView = entries[0].isIntersecting;
          sync();
        }).observe(hero);
      }
      sync();
    })();

    /* Closed navigation is excluded from keyboard focus and assistive reading. */
    if (menu && menuButton) {
      const desktop = window.matchMedia('(min-width: 961px)');
      const focusableSelector = 'a[href], button:not([disabled]), [tabindex="0"]';

      function visibleFocusables() {
        return [menuButton, ...menu.querySelectorAll(focusableSelector)]
          .filter(element => element.getClientRects().length > 0 && !element.hidden);
      }
      function closeMenu(restoreFocus = false) {
        if (!menuOpen) return;
        const focusWasInMenu = menu.contains(document.activeElement);
        menuOpen = false;
        menu.classList.remove('open');
        menuButton.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'メニューを開く');
        if (restoreFocus || focusWasInMenu) {
          const target = menuButton.getClientRects().length ? menuButton : header?.querySelector('.header-logo');
          target?.focus({ preventScroll: true });
        }
        menu.inert = true;
        menu.setAttribute('aria-hidden', 'true');
        syncScrollLock();
        updateHeader();
      }
      function openMenu() {
        if (desktop.matches) return;
        menuOpen = true;
        menu.inert = false;
        menu.setAttribute('aria-hidden', 'false');
        menu.classList.add('open');
        menuButton.classList.add('open');
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.setAttribute('aria-label', 'メニューを閉じる');
        syncScrollLock();
        updateHeader();
        const firstLink = menu.querySelector(focusableSelector);
        firstLink?.focus({ preventScroll: true });
      }
      menu.inert = true;
      menu.setAttribute('aria-hidden', 'true');
      menuButton.setAttribute('aria-controls', 'mobileMenu');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.addEventListener('click', () => menuOpen ? closeMenu(true) : openMenu());
      menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
      document.addEventListener('pointerdown', event => {
        if (!menuOpen || menuButton.contains(event.target)) return;
        if (!menu.contains(event.target) || event.target === menu) closeMenu(true);
      });
      document.addEventListener('keydown', event => {
        if (!menuOpen) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          closeMenu(true);
          return;
        }
        if (event.key !== 'Tab') return;
        const focusables = visibleFocusables();
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && (active === first || !focusables.includes(active))) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && (active === last || !focusables.includes(active))) {
          event.preventDefault();
          first?.focus();
        }
      });
      desktop.addEventListener('change', event => {
        if (event.matches) closeMenu(true);
      });
    }

    /* Native smooth scrolling, with an offset based on the actual header height. */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const hash = link.getAttribute('href');
        if (!hash || hash.length < 2) return;
        const target = document.getElementById(hash.slice(1));
        if (!target) return;
        event.preventDefault();
        const top = hash === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight || 0) - 20;
        const hadTabindex = target.hasAttribute('tabindex');
        if (!hadTabindex) {
          target.setAttribute('tabindex', '-1');
          target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
        target.focus({ preventScroll: true });
        window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion.matches ? 'instant' : 'smooth' });
      });
    });

    /* Preserve the opening; the logo then rests at its hero anchor. */
    (() => {
      const logo = document.getElementById('spinLogo');
      const image = document.getElementById('spinLogoImg');
      const anchor = document.getElementById('logoAnchor');
      const intro = document.getElementById('introWhite');
      const word = document.getElementById('iwWord');
      if (!logo || !image || !anchor) {
        intro?.remove();
        return;
      }
      let finished = false;
      let finishing = false;
      let spinVelocity = 30;
      let spinExtra = 0;
      let currentAngle = 0;
      let animationFrame = 0;
      let alignmentFrame = 0;
      let startedAt = 0;
      const timers = [];

      function setRect(rect) {
        logo.style.left = `${rect.left}px`;
        logo.style.top = `${rect.top}px`;
        logo.style.width = `${rect.width}px`;
      }
      function align() {
        if (!finished) return;
        const rect = anchor.getBoundingClientRect();
        setRect(rect);
        const visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
        logo.style.visibility = visible ? 'visible' : 'hidden';
      }
      function scheduleAlign() {
        if (!finished || alignmentFrame) return;
        alignmentFrame = requestAnimationFrame(() => {
          alignmentFrame = 0;
          align();
        });
      }
      function finalize() {
        if (finished) return;
        finished = true;
        introLocksScroll = false;
        syncScrollLock();
        cancelAnimationFrame(animationFrame);
        timers.forEach(clearTimeout);
        intro?.remove();
        logo.classList.remove('intro-pop', 'rolling', 'squash', 'moving', 'front');
        logo.classList.add('ready');
        image.classList.remove('flash');
        image.style.transition = '';
        image.style.transform = 'rotate(0deg)';
        align();
      }
      function endIntro(fast = false) {
        if (finished || (finishing && !fast)) return;
        if (fast) {
          finalize();
          return;
        }
        finishing = true;
        introLocksScroll = false;
        syncScrollLock();
        cancelAnimationFrame(animationFrame);
        logo.classList.remove('intro-pop', 'rolling', 'squash');
        logo.classList.add('moving');
        setRect(anchor.getBoundingClientRect());
        image.style.transition = 'transform .65s ease';
        image.style.transform = `rotate(${Math.ceil(currentAngle / 360) * 360}deg)`;
        intro?.classList.add('fade');
        timers.push(setTimeout(finalize, 720));
      }
      function spin(time) {
        if (finished || finishing) return;
        if (!startedAt) startedAt = time;
        if (spinVelocity > 0.1) {
          spinExtra += spinVelocity;
          spinVelocity *= 0.945;
        }
        currentAngle = ((time - startedAt) / 1000) * 14 + spinExtra;
        image.style.transform = `rotate(${currentAngle}deg)`;
        animationFrame = requestAnimationFrame(spin);
      }

      window.addEventListener('scroll', scheduleAlign, { passive: true });
      window.addEventListener('resize', scheduleAlign, { passive: true });
      if ('ResizeObserver' in window) new ResizeObserver(scheduleAlign).observe(anchor);
      if (document.fonts?.ready) document.fonts.ready.then(scheduleAlign);
      reduceMotion.addEventListener('change', event => {
        if (event.matches) endIntro(true);
      });

      if (reduceMotion.matches || !intro || !word) {
        finalize();
        return;
      }
      intro.hidden = false;
      introLocksScroll = true;
      syncScrollLock();
      let characterIndex = 0;
      [...word.childNodes].forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const fragment = document.createDocumentFragment();
          [...node.textContent].forEach(character => {
            const span = document.createElement('span');
            span.className = 'ch';
            span.style.setProperty('--i', characterIndex++);
            span.textContent = character === ' ' ? '\u00a0' : character;
            fragment.appendChild(span);
          });
          word.replaceChild(fragment, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          node.classList.add('ch');
          node.style.setProperty('--i', characterIndex + 2);
          characterIndex += 3;
        }
      });
      requestAnimationFrame(time => {
        if (finished) return;
        const size = Math.min(190, window.innerWidth * 0.42);
        const center = { left: (window.innerWidth - size) / 2, top: window.innerHeight * 0.36 - size / 2, width: size };
        setRect({ left: -size - 60, top: center.top, width: size });
        logo.classList.add('ready', 'front');
        requestAnimationFrame(() => {
          if (finished || finishing) return;
          logo.classList.add('rolling');
          setRect(center);
        });
        spin(time);
      });
      timers.push(setTimeout(() => {
        if (finished || finishing) return;
        logo.classList.remove('rolling');
        logo.classList.add('squash');
      }, 950));
      timers.push(setTimeout(() => {
        if (!finished && !finishing) intro.classList.add('s2');
      }, 1050));
      timers.push(setTimeout(() => {
        if (finished || finishing) return;
        image.style.setProperty('--flash-c', 'rgba(217,138,31,.95)');
        image.classList.add('flash');
      }, 1800));
      timers.push(setTimeout(() => endIntro(), 2250));
      timers.push(setTimeout(() => endIntro(true), 4800));
    })();

    /* Optional self-check: selection stays on this page until the visitor shares it. */
    window.__akCheckedItems = [];
    const checklist = document.getElementById('checkList');
    const count = document.getElementById('chkCount');
    if (checklist) {
      function updateChecklist() {
        const selected = [...checklist.querySelectorAll('li.done .check-option')];
        window.__akCheckedItems = selected.map(button => {
          const copy = button.cloneNode(true);
          copy.querySelectorAll('.check-marker').forEach(marker => marker.remove());
          return copy.textContent.trim();
        });
        const total = selected.length;
        if (count) {
          count.textContent = total ? `${total}項目を選択中。LINE登録後、トークでお悩みをお聞かせください。` : '';
          count.classList.toggle('show', total > 0);
        }
        if (window.dataLayer?.push) {
          window.dataLayer.push({ event: 'checklist_update', checked_count: total, checked_items: [...window.__akCheckedItems] });
        }
      }
      checklist.querySelectorAll('.check-option').forEach(button => {
        button.addEventListener('click', () => {
          const selected = button.getAttribute('aria-pressed') !== 'true';
          button.setAttribute('aria-pressed', String(selected));
          button.closest('li')?.classList.toggle('done', selected);
          updateChecklist();
        });
      });
    }
    document.querySelectorAll('a[href*="s.lmes.jp"]').forEach(link => {
      link.addEventListener('click', () => {
        const items = window.__akCheckedItems || [];
        if (window.dataLayer?.push) {
          window.dataLayer.push({ event: 'line_cta_click', page: 'akinai-lab', checked_count: items.length, checked_items: [...items] });
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
