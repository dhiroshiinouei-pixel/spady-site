/* Shared consent for the preserved, standalone project pages. No tags load until accepted. */
(() => {
  if (document.getElementById('spadyLegacyConsent')) return;
  const source = document.currentScript;
  const english = source?.dataset.lang === 'en';
  const copy = english ? {
    settings: 'Cookie settings', text: 'We use cookies to improve this site and measure advertising. Measurement tags load only after you agree.',
    privacy: 'Privacy Policy', accept: 'Accept', decline: 'Decline',
  } : {
    settings: 'Cookie設定を変更', text: 'サイトの改善と広告の計測にCookieを使用します。計測タグは同意後に読み込みます。',
    privacy: 'プライバシーポリシー', accept: '同意する', decline: '同意しない',
  };
  const privacyPaths = ['/privacy/', '/en/privacy/', '/ryugaku/privacy/', '/ryugaku/en/privacy/', '/akindo/privacy'];
  const privacy = privacyPaths.includes(source?.dataset.privacy) ? source.dataset.privacy : '/privacy/';
  const bar = document.createElement('aside');
  bar.id = 'spadyLegacyConsent';
  bar.className = 'spady-legacy-consent';
  bar.hidden = true;
  bar.setAttribute('aria-label', copy.settings);
  const paragraph = document.createElement('p');
  paragraph.textContent = copy.text + ' ';
  const policy = document.createElement('a');
  policy.href = privacy;
  policy.textContent = copy.privacy;
  paragraph.append(policy);
  const actions = document.createElement('div');
  actions.className = 'spady-legacy-consent-actions';
  const accept = document.createElement('button');
  const decline = document.createElement('button');
  accept.type = decline.type = 'button';
  accept.textContent = copy.accept;
  decline.textContent = copy.decline;
  accept.dataset.consent = 'granted';
  decline.dataset.consent = 'denied';
  actions.append(accept, decline);
  bar.append(paragraph, actions);
  const settings = document.createElement('div');
  settings.className = 'spady-legacy-settings';
  const reopen = document.createElement('button');
  reopen.type = 'button';
  reopen.textContent = copy.settings;
  settings.append(reopen);
  document.body.append(settings, bar);

  const load = () => {
    if (window.__spadyGtmLoaded) return;
    window.__spadyGtmLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-NV5VRH3G';
    document.head.append(tag);
  };
  let consent = null;
  try { consent = localStorage.getItem('spady_cookie_consent'); } catch {}
  if (consent === 'granted') load();
  else if (consent !== 'denied') bar.hidden = false;
  let reopened = false;
  reopen.addEventListener('click', () => {
    reopened = true;
    bar.hidden = false;
    accept.focus();
  });
  const choose = (value) => {
    let saved = false;
    try { localStorage.setItem('spady_cookie_consent', value); saved = true; } catch {}
    bar.hidden = true;
    if (reopened) reopen.focus();
    if (value === 'granted') load();
    else if (window.__spadyGtmLoaded) {
      function gtag() { window.dataLayer.push(arguments); }
      gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      // A failed storage write must not cause a reload loop.
      if (saved) window.location.reload();
    }
  };
  accept.addEventListener('click', () => choose('granted'));
  decline.addEventListener('click', () => choose('denied'));
})();
