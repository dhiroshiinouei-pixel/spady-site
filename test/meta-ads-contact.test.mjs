import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/contact.js';

// Every notification is mocked. These tests never send personal data to a real service.
const env = { LARK_WEBHOOK: 'https://notification.invalid/test-only' };
const values = {
  company: 'テスト教室', name: '相談テスト', email: 'test@example.invalid',
  topic: 'Meta広告 初期設定サポート', form_version: 'meta-ads-setup-v1',
  industry: '学習塾', restriction_current: 'なし', restriction_history: 'なし',
  site_url: '', message: '', pixel_scope: 'yes', no_recovery: 'yes', consent: 'yes', website: '',
};
function request(overrides = {}, { headers = {}, append = [] } = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ ...values, form_started_at: String(Date.now() - 5000), ...overrides })) {
    if (value !== null) form.append(key, value);
  }
  for (const [key, value] of append) form.append(key, value);
  return new Request('https://spady.net/api/contact', {
    method: 'POST', body: form,
    headers: { Accept: 'application/json', Origin: 'https://spady.net', ...headers },
  });
}

test('Meta setup consultation validates scope and only confirms an accepted notification', async t => {
  let calls = [];
  let upstreamBody = { code: 0 };
  let upstreamStatus = 200;
  let networkFailure = false;
  const logs = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    if (networkFailure) throw new Error('offline');
    return Response.json(upstreamBody, { status: upstreamStatus });
  });
  t.mock.method(console, 'log', value => logs.push(value));
  t.mock.method(console, 'error', value => logs.push(value));
  const reset = () => { calls = []; upstreamBody = { code: 0 }; upstreamStatus = 200; networkFailure = false; };
  const expectFailure = async (req, expectedStatus = 400, selectedEnv = env) => {
    const response = await onRequestPost({ request: req, env: selectedEnv });
    assert.equal(response.status, expectedStatus);
    const body = await response.json();
    assert.equal(body.ok, false);
    assert.ok(body.request_id);
    assert.doesNotMatch(body.message, /LINE/);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    return body;
  };

  await t.test('required fields suffice and optional URL and message may remain empty', async () => {
    reset();
    const response = await onRequestPost({ request: request(), env });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true); assert.ok(body.request_id); assert.equal(calls.length, 1);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const payload = JSON.parse(calls[0].options.body);
    assert.equal(payload.msg_type, 'text');
    assert.match(payload.content.text, /Meta広告 初期設定サポート/);
    assert.match(payload.content.text, /業種：学習塾/);
    assert.match(payload.content.text, /現在の広告アカウント等の制限：なし/);
    assert.match(payload.content.text, /過去の停止・制限・ペナルティ：なし/);
    assert.match(payload.content.text, /アカウントの状況を個別確認/);
    assert.match(payload.content.text, /この受付では契約・支払いは発生しません/);
    assert.ok(calls[0].options.signal instanceof AbortSignal);
  });
  for (const [current, past] of [['なし', 'あり'], ['あり', 'なし'], ['あり', 'あり'], ['分からない', '分からない']]) {
    await t.test(`restriction status ${current}/${past} is accepted for individual review`, async () => {
      reset();
      const response = await onRequestPost({ request: request({ restriction_current: current, restriction_history: past }), env });
      assert.equal(response.status, 200); assert.equal((await response.json()).ok, true); assert.equal(calls.length, 1);
      const text = JSON.parse(calls[0].options.body).content.text;
      assert.ok(text.includes(`現在の広告アカウント等の制限：${current}`));
      assert.ok(text.includes(`過去の停止・制限・ペナルティ：${past}`));
    });
  }
  for (const industry of ['スクール', 'ジム・フィットネス', 'その他']) {
    await t.test(`accepts industry ${industry} and optional website/message`, async () => {
      reset();
      const response = await onRequestPost({ request: request({ industry, site_url: 'https://example.invalid/landing/', message: '設定について相談します。' }), env });
      assert.equal(response.status, 200); assert.equal(calls.length, 1);
      assert.match(JSON.parse(calls[0].options.body).content.text, /https:\/\/example\.invalid\/landing\//);
    });
  }
  const invalidEntries = [
    ['missing company', { company: null }], ['blank company', { company: '　 ' }],
    ['missing name', { name: null }], ['missing email', { email: null }], ['invalid email', { email: 'bad-address' }],
    ['missing topic', { topic: null }], ['changed topic', { topic: '復旧依頼' }],
    ['missing industry', { industry: null }], ['unexpected industry', { industry: '未選択' }],
    ['missing current restriction', { restriction_current: null }], ['unexpected current restriction', { restriction_current: 'yes' }],
    ['missing past restriction', { restriction_history: null }], ['unexpected past restriction', { restriction_history: 'no' }],
    ['missing Pixel confirmation', { pixel_scope: null }], ['incorrect Pixel confirmation', { pixel_scope: 'no' }],
    ['missing recovery confirmation', { no_recovery: null }], ['missing privacy consent', { consent: null }],
    ['relative URL', { site_url: '/landing/' }], ['script URL', { site_url: 'javascript:alert(1)' }],
    ['file URL', { site_url: 'file:///tmp/page' }], ['URL with credentials', { site_url: 'https://user:secret@example.invalid/' }],
    ['overlong company', { company: 'あ'.repeat(101) }], ['overlong name', { name: 'あ'.repeat(101) }],
    ['overlong email', { email: `${'a'.repeat(190)}@example.invalid` }], ['overlong message', { message: 'a'.repeat(4001) }],
    ['overlong URL', { site_url: `https://example.invalid/${'a'.repeat(2048)}` }],
    ['missing timestamp', { form_started_at: null }], ['invalid timestamp', { form_started_at: 'not-a-date' }],
    ['future timestamp', { form_started_at: String(Date.now() + 60000) }],
    ['expired timestamp', { form_started_at: String(Date.now() - 25 * 60 * 60 * 1000) }],
    ['honeypot', { website: 'spam.invalid' }],
  ];
  for (const [name, overrides] of invalidEntries) {
    await t.test(name, async () => {
      reset(); await expectFailure(request(overrides)); assert.equal(calls.length, 0);
    });
  }
  await t.test('an immediate submission is rejected', async () => {
    reset(); await expectFailure(request({ form_started_at: String(Date.now()) })); assert.equal(calls.length, 0);
  });
  for (const key of ['company', 'email', 'consent', 'form_version', 'website', 'unknown_field']) {
    await t.test(`duplicate ${key} does not send or report success`, async () => {
      reset();
      const append = key === 'unknown_field' ? [[key, 'one'], [key, 'two']] : [[key, values[key]]];
      await expectFailure(request({}, { append })); assert.equal(calls.length, 0);
    });
  }
  for (const key of ['message', 'unknown_file']) {
    await t.test(`file in ${key} is rejected`, async () => {
      reset(); await expectFailure(request({ [key]: new Blob(['test'], { type: 'text/plain' }) })); assert.equal(calls.length, 0);
    });
  }
  await t.test('cross-origin post is rejected', async () => {
    reset(); await expectFailure(request({}, { headers: { Origin: 'https://other.invalid' } }), 403); assert.equal(calls.length, 0);
  });
  await t.test('unsupported request content type is rejected', async () => {
    reset();
    await expectFailure(new Request('https://spady.net/api/contact', {
      method: 'POST', body: '{}', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }), 415); assert.equal(calls.length, 0);
  });
  await t.test('declared oversized body is rejected', async () => {
    reset(); await expectFailure(request({}, { headers: { 'Content-Length': '25000' } }), 413); assert.equal(calls.length, 0);
  });
  await t.test('streamed oversized body is rejected without relying on Content-Length', async () => {
    reset();
    const req = new Request('https://spady.net/api/contact', {
      method: 'POST', body: `form_version=meta-ads-setup-v1&message=${'a'.repeat(25000)}`,
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    await expectFailure(req, 413); assert.equal(calls.length, 0);
  });
  await t.test('missing notification secret clearly reports an unconnected form', async () => {
    reset(); const body = await expectFailure(request(), 503, {}); assert.match(body.message, /送信先が接続されていません/); assert.equal(calls.length, 0);
  });
  for (const [name, body, status] of [
    ['application rejection', { code: 19001 }, 200], ['legacy rejection', { StatusCode: 1 }, 200],
    ['ambiguous response', {}, 200], ['string success code', { code: '0' }, 200],
    ['conflicting response codes', { code: 0, StatusCode: 1 }, 200], ['HTTP error', { code: 0 }, 503],
  ]) {
    await t.test(name, async () => {
      reset(); upstreamBody = body; upstreamStatus = status;
      await expectFailure(request(), 502); assert.equal(calls.length, 1);
    });
  }
  await t.test('network failure is not retried or reported as accepted', async () => {
    reset(); networkFailure = true; await expectFailure(request(), 502); assert.equal(calls.length, 1);
  });
  await t.test('legacy StatusCode confirmation is supported', async () => {
    reset(); upstreamBody = { StatusCode: 0 };
    const response = await onRequestPost({ request: request(), env });
    assert.equal(response.status, 200); assert.equal((await response.json()).ok, true);
  });
  await t.test('HTML fallback confirms receipt only after application acceptance', async () => {
    reset(); const response = await onRequestPost({ request: request({}, { headers: { Accept: 'text/html' } }), env });
    assert.equal(response.status, 200); assert.equal(calls.length, 1);
    assert.match(await response.text(), /ご相談を受け付けました/);
  });
  await t.test('HTML failure links back to the consultation and never echoes user HTML', async () => {
    reset(); const response = await onRequestPost({ request: request({ company: '<script>alert(1)</script>', consent: '' }, { headers: { Accept: 'text/html' } }), env });
    assert.equal(response.status, 400); assert.equal(calls.length, 0);
    const html = await response.text(); assert.match(html, /\/meta-ads-setup\/#consultation/);
    assert.doesNotMatch(html, /<script>|ご相談を受け付けました/);
  });
  await t.test('operational logs omit submitted personal fields', () => {
    assert.ok(logs.length > 0);
    assert.doesNotMatch(logs.join('\n'), /test@example\.invalid|テスト教室|相談テスト|設定について相談します/);
    for (const value of logs) assert.deepEqual(Object.keys(JSON.parse(value)).sort(), ['event', 'request_id']);
  });
});
