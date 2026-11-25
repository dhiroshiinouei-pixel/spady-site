import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const script = readFileSync(new URL('../public/kuchikomi365/booking.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../public/kuchikomi365/index.html', import.meta.url), 'utf8');
const origin = 'https://meetings-na2.hubspot.com';
const make = (stored, configured = true, beaconOK = true) => {
  const nodes = new Map(), handlers = {}, observers = new Map(), transmissions = [], tags = [];
  const el = id => {
    if (!nodes.has(id)) nodes.set(id, { id, hidden: true, style: {}, contentWindow: {}, dataset: {}, handlers: {},
      addEventListener(k, fn) { this.handlers[k] = fn; }, focus() { this.focused = true; }, scrollIntoView() { this.scrolled = true; } });
    return nodes.get(id);
  };
  const win = { IntersectionObserver: true, addEventListener(k, fn) { handlers[k] = fn; } };
  const links = ['header', 'hero', 'consult', 'sticky'].map(id => {
    const node = el('link-' + id); node.dataset.cta = id; return node;
  });
  vm.runInNewContext(configured ? script.replace("metaPixelId: ''", "metaPixelId: '1234567890123'")
    .replace("appsScriptUrl: ''", "appsScriptUrl: 'https://script.google.com/macros/s/FIXTURE/exec'") : script, {
    window: win, URL, URLSearchParams, Blob,
    document: { getElementById: el, querySelectorAll: () => links, createElement: () => ({}), head: {append: node => tags.push(node)} },
    localStorage: { getItem: () => stored, setItem() {}, removeItem() {} },
    location: new URL('https://preview.invalid/kuchikomi365/?utm_campaign=test_campaign&utm_term=user%40invalid.example&consultation_details=overwritten'),
    history: { pushState() {} },
    navigator: { sendBeacon: (url, body) => { if (beaconOK) transmissions.push([url,body]); return beaconOK; } },
    fetch: (url, options) => { transmissions.push([url,options.body]); return Promise.resolve(); },
    IntersectionObserver: class { constructor(fn) { this.fn = fn; } observe(node) { observers.set(node.id, this.fn); } },
  });
  return { el, win, links, transmissions, tags,
    observe(id, visible, bottom = 100) { observers.get(id)([{isIntersecting:visible,boundingClientRect:{bottom}}]); },
    message(data, from = origin, source = el('bookingFrame').contentWindow) { handlers.message({data, origin:from, source}); },
    get queue() { return JSON.parse(JSON.stringify(win.fbq?.queue || [])); } };
};
const success = { meetingBookSucceeded:true, meetingsPayload:{ offline:false, bookingResponse:{postResponse:{
  timerange:{start:1795600000000}, contact:{name:'not-forwarded', email:'not-forwarded@example.invalid'},
}}}};
const click = { defaultPrevented:false, button:0, preventDefault() {} };

test('fixed referral both routes, one-decode, no arbitrary parameters; noindex', () => {
  const page = make(null, false);
  const embed = new URL(page.el('bookingFrame').src), fallback = new URL(page.el('fallbackLink').href);
  for (const url of [embed, fallback]) {
    assert.equal(url.origin, origin);
    assert.deepEqual(url.searchParams.getAll('consultation_details'), ['Spady（井上博史）紹介']);
    assert.equal(url.searchParams.get('utm_campaign'), 'test_campaign');
    assert.equal(url.searchParams.has('utm_term'), false);
  }
  assert.equal(embed.searchParams.get('embed'), 'true');
  assert.equal(fallback.searchParams.has('embed'), false);
  assert.match(html, /name="robots" content="noindex,nofollow"/);
  assert.match(html, /id="fallbackLink"[^>]+href="https:\/\/meetings-na2\.hubspot\.com\//);
  assert.equal(page.tags.length, 0);
  assert.equal(page.el('metaConsent').hidden, true);
  page.message(success);
  assert.equal(page.el('bookingSuccess').hidden, false);
  assert.equal(page.transmissions.length, 0);
});

test('CTA, section visibility and exit are not a booking, including after consent', () => {
  const page = make(null);
  page.links[1].handlers.click(click);
  assert.equal(page.el('reserve').scrolled, true);
  assert.equal(page.el('reserve-title').focused, true);
  assert.equal(page.tags.length, 0);
  assert.equal(page.el('metaConsent').hidden, false);
  page.el('acceptMeta').handlers.click();
  page.links[2].handlers.click(click);
  page.observe('reserve', true);
  page.observe('reserve', false);
  page.observe('reserve', true);
  page.el('fallbackLink').handlers.click();
  assert.deepEqual(page.queue.map(args => args[1]), ['1234567890123','PageView','K365_BookingCTAClick','K365_ReservationSectionView','K365_ExternalBookingClick']);
  assert.equal(page.queue[2][2].placement, 'consult');
  assert.equal(page.el('bookingSuccess').hidden, true);
  assert.equal(page.transmissions.length, 0);
});

test('source, exact origin, data shape and online status; dedupe; no field data', async () => {
  const page = make('yes');
  page.message(success,'https://other.hubspot.com');
  page.message(success,origin,{});
  page.message({meetingBookSucceeded:true});
  page.message({...success,meetingBookSucceeded:'true'});
  page.message({...success,meetingsPayload:{...success.meetingsPayload,offline:true}});
  assert.equal(page.el('bookingSuccess').hidden, true);
  assert.equal(page.queue.filter(x => x[1]==='Schedule').length, 0);
  page.message(success);
  page.message(success);
  assert.equal(page.el('bookingSuccess').hidden, false);
  assert.equal(page.queue.filter(x => x[1]==='Schedule').length, 1);
  assert.equal(page.transmissions.length, 1);
  const wire = JSON.parse(await page.transmissions[0][1].text());
  assert.deepEqual(Object.keys(wire).sort(), ['detectedAt','event','page','referral','sessionId']);
});

test('declining Meta does not block booking or duplicate the fetch fallback', () => {
  const page = make(null,true,false);
  page.el('declineMeta').handlers.click();
  page.message(success);
  page.message(success);
  assert.equal(page.tags.length, 0);
  assert.equal(page.el('bookingSuccess').hidden, false);
  assert.equal(page.transmissions.length, 1);
});

test('sticky is absent during booking and consent', () => {
  const page = make(null);
  page.observe('hero-cta', false, -10);
  page.observe('reserve', false);
  page.observe('metaConsent', false);
  assert.equal(page.el('mobileCta').hidden, false);
  page.observe('reserve', true);
  assert.equal(page.el('mobileCta').hidden, true);
  page.observe('reserve', false);
  page.observe('metaConsent', true);
  assert.equal(page.el('mobileCta').hidden, true);
});
