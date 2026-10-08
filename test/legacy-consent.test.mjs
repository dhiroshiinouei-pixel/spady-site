import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../public/legacy-consent.js', import.meta.url), 'utf8');
function setup(saved = null, { storageThrows = false, lang = 'ja', privacy = '/akindo/privacy' } = {}) {
  const nodes = [];
  const make = (tag) => {
    const node = { tag, dataset: {}, children: [], events: {},
      append(...children) { this.children.push(...children); },
      setAttribute(key, value) { this[key] = value; },
      addEventListener(name, handler) { this.events[name] = handler; },
      focus() { this.focused = true; },
    };
    nodes.push(node);
    return node;
  };
  const body = make('body');
  const head = make('head');
  let reloads = 0;
  const window = { location: { reload() { reloads++; } } };
  const document = { body, head, currentScript: { dataset: { lang, privacy } }, createElement: make,
    getElementById(id) { return nodes.find(node => node.id === id); },
  };
  const localStorage = { getItem() { return saved; }, setItem(key, value) {
    assert.equal(key, 'spady_cookie_consent');
    if (storageThrows) throw Error('storage blocked');
    saved = value;
  } };
  const context = { window, document, localStorage };
  runInNewContext(source, context);
  return {
    nodes, window, head, context,
    bar: document.getElementById('spadyLegacyConsent'),
    accept: nodes.find(node => node.dataset.consent === 'granted'),
    decline: nodes.find(node => node.dataset.consent === 'denied'),
    settings: nodes.find(node => node.className === 'spady-legacy-settings').children[0],
    get reloads() { return reloads; },
  };
}

test('preserved pages do not request GTM before consent, including after rejection', () => {
  const state = setup();
  assert.equal(state.head.children.length, 0);
  assert.equal(state.bar.hidden, false);
  assert.equal(state.window.dataLayer, undefined);
  state.decline.events.click();
  assert.equal(state.head.children.length, 0);
  assert.equal(state.bar.hidden, true);
  state.settings.events.click();
  assert.equal(state.bar.hidden, false);
  assert.equal(state.accept.focused, true);
  state.accept.events.click();
  state.accept.events.click();
  assert.equal(state.head.children.length, 1);
  assert.equal(state.head.children[0].src, 'https://www.googletagmanager.com/gtm.js?id=GTM-NV5VRH3G');
  assert.equal(state.settings.focused, true);
});

test('the existing site preference is respected across Japanese and English legacy pages', () => {
  assert.equal(setup('granted').head.children.length, 1);
  assert.equal(setup('denied').head.children.length, 0);
  const english = setup('denied', { lang: 'en', privacy: '/ryugaku/en/privacy/' });
  assert.equal(english.accept.textContent, 'Accept');
  assert.equal(english.nodes.find(node => node.tag === 'a').href, '/ryugaku/en/privacy/');
});

test('revoking accepted consent sends the denied state and reloads only after saving', () => {
  const state = setup('granted');
  state.decline.events.click();
  assert.equal(state.reloads, 1);
  const update = state.window.dataLayer.at(-1);
  assert.equal(update[0], 'consent');
  assert.equal(update[1], 'update');
  for (const key of ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization']) assert.equal(update[2][key], 'denied');
  const blocked = setup('granted', { storageThrows: true });
  blocked.decline.events.click();
  assert.equal(blocked.reloads, 0);
});

test('duplicate script execution does not duplicate controls or tracking', () => {
  const state = setup('granted');
  const count = state.nodes.length;
  runInNewContext(source, state.context);
  assert.equal(state.nodes.length, count);
  assert.equal(state.head.children.length, 1);
});

test('legacy pages have no unconditional GTM script or noscript iframe left', () => {
  for (const path of ['../public/akindo/index.html', '../public/akindo/privacy.html', '../src/layouts/RyugakuBase.astro']) {
    const html = readFileSync(new URL(path, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /googletagmanager\.com/);
    assert.match(html, /src="\/legacy-consent\.js"[^>]*defer/);
    assert.match(html, /href="\/legacy-consent\.css"/);
  }
  const existingLP = readFileSync(new URL('../src/layouts/Base.astro', import.meta.url), 'utf8');
  assert.match(existingLP, /getItem\('spady_cookie_consent'\) === 'granted'\) window\.__loadGTM\(\)/);
  assert.doesNotMatch(existingLP, /googletagmanager\.com\/ns\.html/);
});
