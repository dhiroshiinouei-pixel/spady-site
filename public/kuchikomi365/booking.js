(() => {
  'use strict';
  const CONFIG = {
    metaPixelId: '',
    appsScriptUrl: '',
    referral: 'Spady（井上博史）紹介',
  };
  const get = id => document.getElementById(id);
  const frame = get('bookingFrame');
  const reserve = get('reserve');
  const reserveTitle = get('reserve-title');
  const retry = get('retryBooking');
  const panel = get('metaConsent');
  const reset = get('resetMeta');
  const success = get('bookingSuccess');
  const sticky = get('mobileCta');
  const allowedOrigin = 'https://meetings-na2.hubspot.com';
  const base = new URL('/kuchikomi365/metalinemeo', allowedOrigin);
  const validPixel = /^\d{10,25}$/.test(CONFIG.metaPixelId);
  const consentKey = 'spady_k365_meta_consent';
  const utm = new URLSearchParams(location.search);
  const steps = { view: 'K365_ReservationSectionView', cta: 'K365_BookingCTAClick' };
  let metaEnabled = false;
  let consent = null;
  let processed = false;
  let seenReserve = false;

  // Build the in-page URL from one fixed referral. Do not forward arbitrary landing
  // parameters or a second consultation_details value to the cross-origin frame.
  base.searchParams.set('consultation_details', CONFIG.referral);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = utm.get(key);
    if (value && /^[a-zA-Z0-9_.+-]{1,100}$/.test(value)) base.searchParams.set(key, value);
  }
  const embedded = new URL(base.href);
  embedded.searchParams.set('embed', 'true');

  const safeMeta = (...args) => {
    if (consent !== 'yes' || !metaEnabled || typeof window.fbq !== 'function') return;
    try { window.fbq(...args); } catch (_) { /* Tracking cannot block booking. */ }
  };
  function trackStep(type, args = {}) {
    safeMeta('trackCustom', steps[type], args);
  }
  function enableMeta() {
    if (metaEnabled || !validPixel || consent !== 'yes') return;
    if (!window.fbq) {
      const q = function (...args) {
        if (q.callMethod) q.callMethod.apply(q, args);
        else q.queue.push(args);
      };
      window.fbq = q;
      window._fbq = q;
      q.push = q;
      q.loaded = true;
      q.version = '2.0';
      q.queue = [];
      const tag = document.createElement('script');
      tag.async = true;
      tag.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.append(tag);
    }
    metaEnabled = true;
    safeMeta('init', CONFIG.metaPixelId);
    safeMeta('track', 'PageView');
  }
  if (validPixel) {
    try { consent = localStorage.getItem(consentKey); } catch (_) {}
    panel.hidden = consent === 'yes' || consent === 'no';
    reset.hidden = !panel.hidden;
    enableMeta();
  }
  function chooseConsent(value) {
    consent = value;
    try { localStorage.setItem(consentKey, value); } catch (_) {}
    panel.hidden = true;
    reset.hidden = false;
    enableMeta();
    get('hero-cta').focus({ preventScroll: true });
  }
  get('acceptMeta').addEventListener('click', () => chooseConsent('yes'));
  get('declineMeta').addEventListener('click', () => chooseConsent('no'));
  reset.addEventListener('click', () => {
    consent = null;
    safeRevoke();
    try { localStorage.removeItem(consentKey); } catch (_) {}
    // A fresh document removes the already-loaded tag and enables a fresh choice.
    location.reload();
  });
  function safeRevoke() {
    if (!metaEnabled || typeof window.fbq !== 'function') return;
    try { window.fbq('consent', 'revoke'); } catch (_) {}
  }

  document.querySelectorAll('[data-cta]').forEach(link => {
    link.addEventListener('click', event => {
      trackStep('cta', { placement: link.dataset.cta });
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (location.hash !== '#reserve') history.pushState(null, '', '#reserve');
      reserve.scrollIntoView();
      reserveTitle.focus({ preventScroll: true });
    });
  });
  retry.hidden = false;
  retry.addEventListener('click', () => {
    frame.src = embedded.href;
    frame.scrollIntoView({ block: 'start' });
  });
  get('footerPrivacy').addEventListener('click', () => { get('booking-privacy').open = true; });

  if ('IntersectionObserver' in window) {
    let heroPassed = false;
    let inReserve = true;
    let inConsent = true;
    const sync = () => { sticky.hidden = !heroPassed || inReserve || inConsent; };
    new IntersectionObserver(([hit]) => {
      heroPassed = !hit.isIntersecting && hit.boundingClientRect.bottom <= 0;
      sync();
    }).observe(get('hero-cta'));
    new IntersectionObserver(([hit]) => {
      inReserve = hit.isIntersecting;
      sync();
      if (hit.isIntersecting && !seenReserve) {
        seenReserve = true;
        trackStep('view');
      }
    }).observe(reserve);
    new IntersectionObserver(([hit]) => {
      inConsent = hit.isIntersecting;
      sync();
    }).observe(panel);
  }

  function notify() {
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(CONFIG.appsScriptUrl)) return;
    const sessionId = window.crypto?.randomUUID?.() || String(Date.now()) + '_' + Math.random().toString(36).slice(2);
    const content = JSON.stringify({
      event: 'hubspot.meeting_booked',
      referral: CONFIG.referral,
      sessionId,
      detectedAt: new Date().toISOString(),
      page: location.origin + location.pathname,
    });
    // A queued Beacon is not proof of receipt. Never send a duplicate fallback
    // after a Beacon was queued; never read or forward booking field values.
    try {
      if (navigator.sendBeacon?.(CONFIG.appsScriptUrl, new Blob([content], { type: 'text/plain;charset=UTF-8' }))) return;
    } catch (_) {}
    try {
      fetch(CONFIG.appsScriptUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: content, keepalive: true }).catch(() => {});
    } catch (_) {}
  }

  window.addEventListener('message', event => {
    if (event.origin !== allowedOrigin || !frame.contentWindow || event.source !== frame.contentWindow) return;
    const data = event.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return;
    if (Number.isFinite(data.height) && data.height >= 250 && data.height <= 2400) {
      frame.style.height = Math.max(765, Math.ceil(data.height)) + 'px';
    }
    // Confirm the shape emitted by the current public HubSpot booking summary.
    // Do not copy, persist or forward the payload (it may contain booking data).
    const payload = data.meetingsPayload;
    const result = payload?.bookingResponse?.postResponse;
    const start = result?.timerange?.start;
    const hasStart = (typeof start === 'number' && Number.isFinite(start) && start > 0)
      || (typeof start === 'string' && start.trim() !== '' && Number.isFinite(Date.parse(start)));
    if (processed || data.meetingBookSucceeded !== true || !hasStart || payload?.offline === true || result?.bookedOffline === true) return;
    processed = true;
    success.hidden = false;
    // Keep HubSpot's own confirmation/next actions in view; this is supplementary.
    safeMeta('track', 'Schedule', { content_name: '口コミ365 商談予約' });
    notify();
  });
  frame.src = embedded.href;
})();
