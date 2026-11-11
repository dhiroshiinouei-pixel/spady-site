/** Local-only UI fixture. Never forwards requests or stores form contents. */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const host = '127.0.0.1';
const port = 4334;
const root = resolve(new URL('../dist/', import.meta.url).pathname);
// State contains only opaque receipts and selected ISO timestamps. No names/emails/messages.
const receipts = new Set();
const attempted = new Map();
const confirmed = new Map();
const unavailable = new Map();
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon', '.woff2':'font/woff2', '.json':'application/json' };
const headers = { 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'X-Spady-QA':'local-mock-only', 'Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'none'; form-action 'self'; object-src 'none'; base-uri 'self'" };
function reply(res, status, body) { res.writeHead(status, { ...headers, 'Content-Type':'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); }
function fixtureDays() {
  const day = new Date(); day.setUTCDate(day.getUTCDate() + 2); day.setUTCHours(0,0,0,0);
  const days = [];
  while (days.length < 5) {
    if (![0,6].includes(day.getUTCDay())) {
      const date = day.toISOString().slice(0,10);
      days.push({ date, slots:['10:00','11:30','14:00','16:30'].map(time => new Date(`${date}T${time}:00+09:00`).toISOString()) });
    }
    day.setUTCDate(day.getUTCDate() + 1);
  }
  return days;
}
async function bodyBuffer(req) {
  const chunks=[]; let size=0;
  for await (const chunk of req) { size+=chunk.length; if(size>32768) throw new Error('too_large'); chunks.push(chunk); }
  return Buffer.concat(chunks);
}
const server=http.createServer(async(req,res)=>{
  if (![`${host}:${port}`,`localhost:${port}`].includes(req.headers.host || '')) return reply(res,403,{ok:false,message:'Local QA only'});
  const url=new URL(req.url,`http://${host}:${port}`);
  let scenario='success';
  try { const referer=new URL(req.headers.referer || url.href); if ([host,'localhost'].includes(referer.hostname)) scenario=referer.searchParams.get('qa_case') || 'success'; } catch {}
  try {
    if (url.pathname==='/api/meta-ads-setup' && req.method==='POST') {
      const bytes=await bodyBuffer(req);
      const webRequest=new Request(url.href,{method:'POST',headers:req.headers,body:bytes});
      const form=await webRequest.formData();
      const id=form.get('id');
      if (typeof id!=='string'||!/^[a-f0-9]{32}$/.test(id)) return reply(res,400,{ok:false});
      receipts.add(id);
      return reply(res,200,{ok:true,request_id:id});
    }
    if(url.pathname==='/api/booking/availability' && req.method==='GET') {
      if(scenario==='unavailable') return reply(res,503,{ok:false,message:'Local mock: calendar disconnected'});
      const days=fixtureDays().map(day=>({...day,slots:day.slots.filter(start=>![...unavailable.values()].includes(start))}));
      return reply(res,200,{days,timezone:'Asia/Tokyo',durationMinutes:30});
    }
    if(url.pathname==='/api/meta-ads-booking' && req.method==='POST') {
      const body=JSON.parse((await bodyBuffer(req)).toString());
      if(!body || Object.keys(body).sort().join(',')!=='receipt_id,start' || !receipts.has(body.receipt_id) || typeof body.start!=='string') return reply(res,400,{ok:false});
      const id=body.receipt_id, start=body.start;
      if(confirmed.has(id)) return confirmed.get(id)===start ? reply(res,200,{ok:true,request_id:id,start,meeting_url:''}) : reply(res,409,{ok:false});
      if(scenario==='retry' && !attempted.has(id)) { attempted.set(id,start); return reply(res,503,{ok:false,message:'Local mock: outcome not confirmed'}); }
      if(attempted.has(id) && attempted.get(id)!==start) return reply(res,409,{ok:false});
      if(scenario==='conflict' && !unavailable.has(id)) { unavailable.set(id,start); return reply(res,409,{ok:false,code:'slot_unavailable'}); }
      if(unavailable.get(id)===start) return reply(res,409,{ok:false,code:'slot_unavailable'});
      confirmed.set(id,start); return reply(res,200,{ok:true,request_id:id,start,meeting_url:''});
    }
    if (url.pathname === '/__responsive.html' && ['GET','HEAD'].includes(req.method)) {
      const width=Number(url.searchParams.get('width'));
      if (![320,360,375,390,768,1024,1440].includes(width)) return reply(res,400,{ok:false,message:'Choose a supported QA viewport width'});
      const html=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LP responsive preview — ${width}px</title><style>html,body{margin:0;padding:0;width:${width}px;min-width:${width}px;background:#fff}iframe{display:block;border:0;width:${width}px;height:1500px}</style></head><body><iframe title="LP responsive preview" width="${width}" height="1500" src="/meta-ads-setup/?qa_case=success"></iframe></body></html>`;
      res.writeHead(200,{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':headers['Content-Security-Policy'].replace("frame-src 'none'","frame-src 'self'")});
      res.end(req.method==='HEAD'?undefined:html);return;
    }
    if(url.pathname.startsWith('/api/')) return reply(res,404,{ok:false,message:'No external API forwarding in QA'});
    if(!['GET','HEAD'].includes(req.method)) return reply(res,405,{ok:false});
    let path=resolve(root,'.'+decodeURIComponent(url.pathname));
    if(path!==root && !path.startsWith(root+sep)) return reply(res,403,{ok:false});
    const fileStat=await stat(path);
    if(fileStat.isDirectory()) path=resolve(path,'index.html');
    const bytes=await readFile(path);
    res.writeHead(200,{...headers,'Content-Type':types[extname(path)]||'application/octet-stream'});
    res.end(req.method==='HEAD' ? undefined : bytes);
  } catch(error) { reply(res,error?.message==='too_large' ? 413 : 404,{ok:false,message:'Local QA request failed'}); }
});
server.listen(port,host,()=>console.log(`Local mock QA: http://${host}:${port}/meta-ads-setup/?qa_case=success (also retry, conflict, unavailable). No external network or personal-data logs.`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>process.exit(0)));
