const PREVIEW = 'https://feat-kuchikomi365-referral-b.spady-site.pages.dev';
const REF = /^sp_[A-Za-z0-9_-]{24}$/;
const WEB_APP = /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/;
const reply = status => new Response(null,{status,headers:{'Cache-Control':'no-store'}});
const encoder = new TextEncoder();

export async function onRequestPost({request,env}) {
  if (new URL(request.url).origin !== PREVIEW || request.headers.get('Origin') !== PREVIEW) return reply(403);
  if (request.headers.get('Sec-Fetch-Site') && request.headers.get('Sec-Fetch-Site') !== 'same-origin') return reply(403);
  const {K365_REFERRAL_WEBAPP: destination,K365_REFERRAL_SECRET: secret} = env;
  if (!WEB_APP.test(destination || '') || !secret || secret.length < 32) return reply(503);
  if (!/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type') || '')) return reply(415);
  try {
    // Cap the body before parsing and accept only the anonymous ID.
    const reader = request.body?.getReader();
    if (!reader) return reply(400);
    const utf8 = new TextDecoder('utf-8',{fatal:true});
    let text = '', size = 0;
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 256) { await reader.cancel(); return reply(413); }
      text += utf8.decode(part.value,{stream:true});
    }
    text += utf8.decode();
    let data;
    try { data = JSON.parse(text); } catch { return reply(400); }
    if (!data || Object.keys(data).length !== 1 || typeof data.ref !== 'string' || !REF.test(data.ref)) return reply(400);
    const ref = data.ref, ts = Date.now();
    const key = await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    const bytes = await crypto.subtle.sign('HMAC',key,encoder.encode(ref+'\n'+ts));
    const sig = Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');
    const resp = await fetch(destination,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ref,ts,sig}),signal:AbortSignal.timeout(10000)});
    if (!resp.ok) return reply(503);
    const outcome = await resp.text();
    return reply(outcome === 'recorded' || outcome === 'ignored' ? 204 : 503);
  } catch { return reply(503); }
}
