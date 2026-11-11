/** Persist Meta setup inquiries through the existing private booking service. */
const serviceOrigin = 'https://spady-sales.dhiroshi-inouei.chatgpt.site';
const MAX_BYTES = 24 * 1024;
const fields = ['id','form_version','topic','company','name','email','industry','restriction_current','restriction_history','site_url','message','form_started_at','website','pixel_scope','no_recovery','consent'];
const reply = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const failure = (status, message) => reply({ ok: false, message }, status);

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return failure(405, 'フォームから送信してください。');
  if (request.headers.get('origin') !== new URL(request.url).origin) return failure(403, 'このサイトのフォームから送信してください。');
  const contentType = request.headers.get('content-type') || '';
  if (!/^(multipart\/form-data|application\/x-www-form-urlencoded)(;|$)/i.test(contentType)) return failure(415, '送信形式をご確認ください。');
  if (Number(request.headers.get('content-length')) > MAX_BYTES) return failure(413, '入力内容が長すぎます。');
  let body;
  try {
    const reader = request.body?.getReader();
    if (!reader) return failure(400, '入力内容をご確認ください。');
    let size = 0; const chunks = [];
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); return failure(413, '入力内容が長すぎます。'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const form = await new Response(bytes, { headers: { 'Content-Type': contentType } }).formData();
    const seen = new Set(); body = {};
    for (const [key, value] of form) {
      if (seen.has(key) || typeof value !== 'string' || !fields.includes(key)) return failure(400, '入力内容の形式をご確認ください。');
      seen.add(key); body[key] = value;
    }
    if (body.form_version !== 'meta-ads-setup-v1' || !/^[a-f0-9]{32}$/.test(body.id || '') || body.website) return failure(400, '入力内容をご確認ください。ページを再読み込みしてお試しください。');
  } catch { return failure(400, '入力内容をご確認ください。'); }
  if (!env.SALES_SITES_ACCESS_TOKEN || !env.BOOKING_PROXY_KEY) return failure(503, '現在、受付の接続を確認中です。受付は完了していません。');
  try {
    const upstream = await fetch(serviceOrigin + '/api/sales/public/meta-setup', {
      method: 'POST', body: JSON.stringify(body), redirect: 'manual', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json', Origin: serviceOrigin, 'OAI-Sites-Authorization': `Bearer ${env.SALES_SITES_ACCESS_TOKEN}`, 'X-Spady-Booking-Key': env.BOOKING_PROXY_KEY, 'X-Spady-Visitor-IP': request.headers.get('cf-connecting-ip') || 'unknown' },
    });
    if (!upstream.headers.get('content-type')?.includes('application/json')) return failure(503, '受付の完了を確認できませんでした。同じ画面から再度お試しください。');
    const result = await upstream.json();
    if (!upstream.ok || result.ok !== true || result.request_id !== body.id) {
      const status = [400,403,409,413,429,503].includes(upstream.status) ? upstream.status : 503;
      return failure(status, status === 400 && typeof result.error === 'string' ? result.error.slice(0, 300) : '受付の完了を確認できませんでした。同じ画面から再度お試しください。');
    }
    return reply({ ok: true, request_id: result.request_id });
  } catch { return failure(503, '受付の完了を確認できませんでした。同じ画面から再度お試しください。'); }
}
