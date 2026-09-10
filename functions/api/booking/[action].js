const origin = 'https://spady-sales.dhiroshi-inouei.chatgpt.site';
const routes = {info:'GET', availability:'GET', book:'POST', inquiry:'POST'};
const reply = (value,status=200) => Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function onRequest({request,env,params}) {
  const action=params.action;
  if (!Object.hasOwn(routes,action)) return reply({error:'見つかりません'},404);
  if (request.method!==routes[action]) return reply({error:'操作を確認してください'},405);
  if (request.method==='POST' && (request.headers.get('origin')!=='https://spady.net' || !request.headers.get('content-type')?.includes('application/json'))) return reply({error:'操作元を確認できません'},403);
  if (!env.SALES_SITES_ACCESS_TOKEN || !env.BOOKING_PROXY_KEY) return reply({error:'予約の接続を確認中です。時間をおいてお試しください。'},503);
  let body;
  if (request.method==='POST') {
    if (Number(request.headers.get('content-length')||0)>12000) return reply({error:'入力が長すぎます'},413);
    body=await request.text();
    if (body.length>12000) return reply({error:'入力が長すぎます'},413);
    try {JSON.parse(body)} catch {return reply({error:'入力を確認してください'},400)}
  }
  try {
    const upstream=await fetch(`${origin}/api/sales/public/${action}`,{
      method:request.method,body,redirect:'manual',signal:AbortSignal.timeout(45000),
      headers:{'Content-Type':'application/json','Origin':origin,'OAI-Sites-Authorization':`Bearer ${env.SALES_SITES_ACCESS_TOKEN}`,
        'X-Spady-Booking-Key':env.BOOKING_PROXY_KEY,'X-Spady-Visitor-IP':request.headers.get('cf-connecting-ip')||'unknown'}
    });
    if(!upstream.headers.get('content-type')?.includes('application/json')) return reply({error:'予約サービスに接続できません。時間をおいてお試しください。'},503);
    const data=await upstream.json();
    // Only booking response fields cross the public boundary.
    const allowed=action==='info'?['calendar','duration','timezone','meetingProvider','meetingReady','meetingUrl']:action==='availability'?['days']:['message','id'];
    if(!upstream.ok) return reply({error:typeof data.error==='string'?data.error:'受付を完了できませんでした'},upstream.status);
    return reply(Object.fromEntries(allowed.filter(k=>k in data).map(k=>[k,data[k]])));
  } catch {return reply({error:'結果を確認できませんでした。同じ内容で再度お試しいただくと、受付済みの場合はその結果を表示します。'},503)}
}
