/** Meta consultation readiness only; credentials and account IDs never cross the boundary. */
const origin = 'https://spady-sales.dhiroshi-inouei.chatgpt.site';
const reply = (value, status = 200) => Response.json(value, {status, headers: {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function onRequest({request, env}) {
  if (request.method !== 'GET') return reply({ok:false}, 405);
  if (!env.SALES_SITES_ACCESS_TOKEN || !env.BOOKING_PROXY_KEY) return reply({ok:false}, 503);
  try {
    const response = await fetch(origin + '/api/sales/public/meta-setup/info', {
      method:'GET', redirect:'manual', signal:AbortSignal.timeout(15000),
      headers:{'OAI-Sites-Authorization':`Bearer ${env.SALES_SITES_ACCESS_TOKEN}`,'X-Spady-Booking-Key':env.BOOKING_PROXY_KEY,'X-Spady-Visitor-IP':request.headers.get('cf-connecting-ip') || 'unknown'},
    });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return reply({ok:false}, 503);
    const data = await response.json();
    if (typeof data.calendar !== 'boolean' || typeof data.meetingReady !== 'boolean' || data.duration !== 30 || data.timezone !== 'Asia/Tokyo' || data.meetingProvider !== 'lark') return reply({ok:false}, 503);
    return reply({calendar:data.calendar, duration:30, timezone:'Asia/Tokyo', meetingProvider:'lark', meetingReady:data.meetingReady});
  } catch { return reply({ok:false}, 503); }
}
