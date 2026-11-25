(() => {
  'use strict';
  const select = document.getElementById('lpLanguage');
  if (!select) return;
  const languages = ['ja', 'en', 'zh-Hans', 'zh-Hant'];
  const key = 'spady-k365-language-v1';
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  const requested = new URL(location.href).searchParams.get('lang');
  function match(value) {
    const parts = String(value || '').toLowerCase().split(/[-_]/);
    if (parts[0] === 'ja' || parts[0] === 'en') return parts[0];
    if (parts[0] !== 'zh') return '';
    if (parts.includes('hant')) return 'zh-Hant';
    if (parts.includes('hans')) return 'zh-Hans';
    return parts.some(region => ['tw', 'hk', 'mo'].includes(region)) ? 'zh-Hant' : 'zh-Hans';
  }
  const auto = (navigator.languages?.length ? navigator.languages : [navigator.language])
    .map(match).find(Boolean);
  const first = match(requested) || match(saved) || auto || 'ja';
  const strings = [];
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (parent && !parent.closest('script,style') && /[ぁ-龯]/u.test(node.data)) {
      strings.push([node, null, node.data]);
    }
  }
  for (const el of document.querySelectorAll('[alt],[title],[aria-label],meta[name="description"],meta[property="og:title"],meta[property="og:description"]')) {
    for (const attr of ['alt', 'title', 'aria-label', ...(el.tagName === 'META' ? ['content'] : [])]) {
      const value = el.getAttribute(attr);
      if (value && /[ぁ-龯]/u.test(value)) strings.push([el, attr, value]);
    }
  }
  let sequence = 0;
  const cache = new Map();
  async function apply(language, manual = false) {
    if (!languages.includes(language)) return;
    const ticket = ++sequence;
    const before = document.documentElement.lang;
    try {
      if (language !== 'ja' && !cache.has(language)) {
        const response = await fetch('./i18n-' + language + '.json');
        if (!response.ok) throw Error('Translation unavailable');
        const dictionary = await response.json();
        if (!dictionary || typeof dictionary !== 'object' || typeof dictionary['本文へ移動'] !== 'string') {
          throw Error('Translation unavailable');
        }
        cache.set(language, dictionary);
      }
      if (ticket !== sequence) return;
      const dictionary = cache.get(language);
      for (const [target, attr, original] of strings) {
        const word = original.trim();
        const translated = dictionary && Object.hasOwn(dictionary, word) ? dictionary[word] : null;
        const value = typeof translated === 'string' ? original.replace(word, () => translated) : original;
        if (attr) target.setAttribute(attr, value);
        else target.data = value;
      }
      document.documentElement.lang = language;
      select.value = language;
      if (manual) {
        try { localStorage.setItem(key, language); } catch {}
        try {
          const url = new URL(location.href);
          url.searchParams.set('lang', language);
          history.replaceState(history.state, '', url);
        } catch {}
      }
    } catch {
      if (ticket === sequence) select.value = before;
    }
  }
  select.addEventListener('change', () => apply(select.value, true));
  select.hidden = false;
  apply(first);
})();
