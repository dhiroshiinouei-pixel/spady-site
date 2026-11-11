const serviceOrigin = 'https://spady-sales.dhiroshi-inouei.chatgpt.site';
const reply = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const fail = (status, message, code) => reply({ ok: false, message, ...(code ? { code } : {}) }, status);

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return fail(405, 'フォームから予約してください。');
  if (request.headers.get('origin') !== new URL(request.url).origin) return fail(403, 'このサイトから予約してください。');
  if (!/^application\/json(?:;|$)/i.test(request.headers.get('content-type') || '')) return fail(415, '送信形式をご確認ください。');
  let body;
  try {
    const reader = request.body?.getReader(); if (!reader) return fail(400, '入力を確認してください。');
    const chunks = []; let size = 0;
    for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 512) { await reader.cancel(); return fail(413, '入力が長すぎます。'); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || Object.keys(body).sort().join(',') !== 'receipt_id,start' || typeof body.receipt_id !== 'string' || !/^[a-f0-9]{32}$/.test(body.receipt_id) || typeof body.start !== 'string' || body.start.length !== 24 || new Date(body.start).toISOString() !== body.start) return fail(400, '受付情報と日時を確認してください。');
  } catch { return fail(400, '受付情報と日時を確認してください。'); }
  if (!env.SALES_SITES_ACCESS_TOKEN || !env.BOOKING_PROXY_KEY) return fail(503, '予約接続を確認できません。');
  try {
    const response = await fetch(serviceOrigin + '/api/sales/public/meta-setup/book', { method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(45000), headers: { 'Content-Type': 'application/json', Origin: serviceOrigin, 'OAI-Sites-Authorization': `Bearer ${env.SALES_SITES_ACCESS_TOKEN}`, 'X-Spady-Booking-Key': env.BOOKING_PROXY_KEY, 'X-Spady-Visitor-IP': request.headers.get('cf-connecting-ip') || 'unknown' }, body: JSON.stringify(body) });
    if (!response.headers.get('content-type')?.includes('application/json')) return fail(503, '予約の確定を確認できませんでした。');
    const data = await response.json();
    if (response.status !== 200 || data.ok !== true || data.request_id !== body.receipt_id || data.start !== body.start) {
      const status = [400,403,404,409,413,429,503].includes(response.status) ? response.status : 503;
      return fail(status, '予約の確定を確認できませんでした。', status === 409 && data.code === 'slot_unavailable' ? 'slot_unavailable' : undefined);
    }
    return reply({ ok: true, request_id: data.request_id, start: data.start, meeting_url: typeof data.meeting_url === 'string' ? data.meeting_url : '' });
  } catch { return fail(503, '予約の確定を確認できませんでした。同じ日時で再確認してください。'); }
}
