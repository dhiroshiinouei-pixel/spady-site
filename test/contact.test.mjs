import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/contact.js';

const values = { name: '動作確認', email: 'test@example.com', topic: 'その他', message: 'フォームのテスト', consent: 'yes', form_version: 'inquiry-v2' };
const env = { LARK_WEBHOOK: 'https://open.larksuite.com/open-apis/bot/v2/hook/test-only' };
function request(overrides = {}, options = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ ...values, ...overrides })) if (value !== null) form.append(key, value);
  return new Request('https://spady.net/api/contact', { method: 'POST', body: form, headers: { Accept: 'application/json', Origin: 'https://spady.net', ...options } });
}

test('contact handler validates before delivery and confirms Lark application success', async t => {
  let calls = [];
  const mockResponse = (body = { code: 0 }, status = 200) => {
    calls = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => { calls.push({ url, options }); return Response.json(body, { status }); });
  };
  await t.test('new inquiry sends one text notification and reports success', async () => {
    mockResponse(); const result = await onRequestPost({ request: request(), env });
    assert.equal(result.status, 200); assert.equal((await result.json()).ok, true); assert.equal(calls.length, 1);
    const payload = JSON.parse(calls[0].options.body);
    assert.equal(payload.msg_type, 'text'); assert.match(payload.content.text, /フォームのテスト/); assert.match(payload.content.text, /test@example.com/);
  });
  await t.test('legacy English and study-abroad forms do not need new consent or date fields', async () => {
    mockResponse({ StatusCode: 0 });
    const result = await onRequestPost({ request: request({ form_version: null, consent: null, message: null, pref1: null, topic: 'LINE setup' }), env });
    assert.equal(result.status, 200); assert.equal(calls.length, 1);
  });
  for (const [name, overrides] of [
    ['missing name', { name: '  ' }], ['invalid email', { email: 'wrong' }], ['missing topic', { topic: '' }],
    ['missing inquiry body', { message: '' }], ['missing new consent', { consent: null }], ['overlong text', { message: 'a'.repeat(4001) }],
  ]) await t.test(name, async () => {
    mockResponse(); const result = await onRequestPost({ request: request(overrides), env });
    assert.equal(result.status, 400); assert.equal(calls.length, 0); assert.equal((await result.json()).ok, false);
  });
  await t.test('honeypot does not contact Lark', async () => {
    mockResponse(); const result = await onRequestPost({ request: request({ website: 'bot.example' }), env });
    assert.equal(result.status, 200); assert.equal(calls.length, 0);
  });
  await t.test('cross-origin submission is rejected', async () => {
    mockResponse(); const result = await onRequestPost({ request: request({}, { Origin: 'https://other.example' }), env });
    assert.equal(result.status, 403); assert.equal(calls.length, 0);
  });
  await t.test('streamed body limit rejects oversized payload', async () => {
    mockResponse();
    const body = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('message=' + 'a'.repeat(26000))); } });
    const oversized = new Request('https://spady.net/api/contact', { method: 'POST', body, duplex: 'half', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' } });
    const result = await onRequestPost({ request: oversized, env });
    assert.equal(result.status, 413); assert.equal(calls.length, 0);
  });
  await t.test('missing webhook is never reported as successful', async () => {
    mockResponse(); const result = await onRequestPost({ request: request(), env: {} });
    assert.equal(result.status, 503); assert.equal(calls.length, 0);
  });
  for (const [name, body, status] of [
    ['Lark application rejection', { code: 19001 }, 200], ['legacy rejection', { StatusCode: 1 }, 200],
    ['ambiguous upstream response', {}, 200], ['HTTP failure', { code: 0 }, 503], ['conflicting status codes', { code: 0, StatusCode: 1 }, 200],
  ]) await t.test(name, async () => {
    mockResponse(body, status); const result = await onRequestPost({ request: request(), env });
    assert.equal(result.status, 502); assert.equal((await result.json()).ok, false); assert.equal(calls.length, 1);
  });
  await t.test('network failure remains an error without an automatic duplicate send', async () => {
    let count = 0; t.mock.method(globalThis, 'fetch', async () => { count++; throw new Error('offline'); });
    const result = await onRequestPost({ request: request(), env }); assert.equal(result.status, 502); assert.equal(count, 1);
  });
  await t.test('non-JavaScript form redirects to completion only after delivery', async () => {
    mockResponse(); const result = await onRequestPost({ request: request({}, { Accept: 'text/html' }), env });
    assert.equal(result.status, 303); assert.equal(result.headers.get('location'), '/contact/thanks/');
  });
});
