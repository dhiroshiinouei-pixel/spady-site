/** Cloudflare Pages form endpoint. LARK_WEBHOOK stays in Pages secrets. */
const MAX_BODY_BYTES = 24 * 1024;
const fields = { name: 100, company: 100, email: 200, topic: 100, message: 4000, pref1: 200, pref2: 200, pref3: 200, consent: 10, form_version: 40 };

const localeCopy = {
  ja: { tag:'ja', title:'送信できませんでした', back:'お問い合わせページへ戻る', error:'送信の完了を確認できませんでした。入力内容を確認して再度お試しいただくか、LINEからご連絡ください。' },
  en: { tag:'en', title:'Your message could not be sent', back:'Return to contact', error:'We could not confirm delivery. Please check your entries and try again, or contact us on LINE.' },
  'zh-hant': { tag:'zh-Hant', title:'訊息未能送出', back:'返回聯絡頁面', error:'無法確認訊息是否送達。請檢查填寫內容後重試，或透過 LINE 聯絡我們。' },
  'zh-hans': { tag:'zh-Hans', title:'消息未能发送', back:'返回联系页面', error:'无法确认消息是否送达。请检查填写内容后重试，或通过 LINE 联系我们。' },
  ko: { tag:'ko', title:'메시지를 보내지 못했습니다', back:'문의 페이지로 돌아가기', error:'전송 완료를 확인하지 못했습니다. 입력 내용을 확인한 후 다시 시도하거나 LINE으로 문의해 주세요.' },
};
function language(request) {
  const value = new URL(request.url).searchParams.get('lang');
  return Object.hasOwn(localeCopy, value) ? value : 'ja';
}
function reply(request, status, body) {
  const lang = language(request);
  const copy = localeCopy[lang];
  const contact = `${lang === 'ja' ? '' : `/${lang}`}/contact/`;
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (status !== 200 && lang !== 'ja') body = { ...body, message: copy.error };
  if ((request.headers.get('accept') || '').includes('application/json')) {
    return Response.json(body, { status, headers });
  }
  if (status === 200) return new Response(null, { status: 303, headers: { ...headers, Location: `${contact}thanks/` } });
  // Only fixed, server-owned messages and allowlisted language paths are rendered.
  return new Response(`<!doctype html><html lang="${copy.tag}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${copy.title}｜Spady</title><body style="font-family:system-ui,sans-serif;max-width:640px;margin:12vh auto;padding:24px;line-height:2"><h1>${copy.title}</h1><p>${body.message}</p><p><a href="${contact}">${copy.back}</a></p></body></html>`, { status, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' } });
}

async function readForm(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid_body');
  const chunks = []; let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new Error('body_too_large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new Response(bytes, { headers: { 'Content-Type': request.headers.get('content-type') } }).formData();
}

export async function onRequestPost({ request, env }) {
  const requestId = crypto.randomUUID();
  const failure = (status, message) => reply(request, status, { ok: false, message, request_id: requestId });
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return failure(403, 'このサイトのお問い合わせページから送信してください。');
  const contentType = request.headers.get('content-type') || '';
  if (!/^(multipart\/form-data|application\/x-www-form-urlencoded)(;|$)/i.test(contentType)) return failure(415, '送信形式を確認できませんでした。お問い合わせページから再度お試しください。');
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) return failure(413, '入力内容が長すぎます。文章を短くして再度お試しください。');

  let form;
  try { form = await readForm(request); }
  catch (error) { return failure(error.message === 'body_too_large' ? 413 : 400, '送信内容を確認できませんでした。入力内容を確認して再度お試しください。'); }
  if (form.get('website')) return reply(request, 200, { ok: true });

  const data = {};
  for (const [name, limit] of Object.entries(fields)) {
    const entries = form.getAll(name);
    if (entries.length > 1 || entries.some(value => typeof value !== 'string')) return failure(400, '入力内容の形式をご確認ください。');
    const value = (entries[0] || '').trim();
    if (value.length > limit) return failure(400, '入力できる文字数を超えています。文章を短くしてお試しください。');
    data[name] = name === 'message' ? value : value.replace(/[\r\n\t]+/g, ' ');
  }
  if (!data.name || !data.email || !data.topic) return failure(400, 'お名前、メールアドレス、ご相談の種類をご入力ください。');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return failure(400, 'メールアドレスの形式をご確認ください。');
  if (data.form_version === 'inquiry-v2' && (!data.message || data.consent !== 'yes')) return failure(400, 'お問い合わせ内容とプライバシーポリシーへの同意をご確認ください。');
  if (!env.LARK_WEBHOOK) {
    console.error(JSON.stringify({ event: 'contact_configuration_missing', request_id: requestId }));
    return failure(503, '現在フォームを利用できません。お手数ですが、LINEからご連絡ください。');
  }
  const text = [
    '【Spady HPからのお問い合わせ・無料相談】',
    `受付番号：${requestId}`, `表示言語：${language(request)}`, `お名前：${data.name}`, `事業・会社名：${data.company || '（未記入）'}`,
    `メール：${data.email}`, `ご相談内容：${data.topic}`,
    ...(data.pref1 || data.pref2 || data.pref3 ? [`第1希望：${data.pref1 || '（未記入）'}`, `第2希望：${data.pref2 || '（未記入）'}`, `第3希望：${data.pref3 || '（未記入）'}`] : []),
    '--- お問い合わせ内容 ---', data.message || '（未記入）',
    `受付フォーム：${data.form_version === 'inquiry-v2' ? 'お問い合わせページ' : '集客支援・留学事業ページ'}`,
  ].join('\n');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(env.LARK_WEBHOOK, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg_type: 'text', content: { text } }), signal: controller.signal,
    });
    if (!response.ok) throw new Error('upstream_http');
    const result = await response.json();
    const codes = [result.code, result.StatusCode].filter(code => code !== undefined);
    if (!codes.length || codes.some(code => code !== 0)) throw new Error('upstream_rejected');
    console.log(JSON.stringify({ event: 'contact_delivered', request_id: requestId }));
    return reply(request, 200, { ok: true, request_id: requestId });
  } catch {
    console.error(JSON.stringify({ event: 'contact_delivery_failed', request_id: requestId }));
    return failure(502, '送信の完了を確認できませんでした。少し時間をおいてお試しいただくか、LINEからご連絡ください。');
  } finally { clearTimeout(timeout); }
}
