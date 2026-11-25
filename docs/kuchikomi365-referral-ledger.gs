/** Apps Script受信側。フォーム入力は扱わず、初回検知日時だけF列に保存する。 */
const LEDGER_TAB = '口コミ365_送信・予約管理';
const TARGET_ID = /^sp_[A-Za-z0-9_-]{24}$/;
function doPost(e) {
  const answer = text => ContentService.createTextOutput(text);
  let payload;
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > 256) return answer('forbidden');
    payload = JSON.parse(raw);
  } catch (_) { return answer('forbidden'); }
  if (!payload || typeof payload.ref !== 'string' || !TARGET_ID.test(payload.ref) ||
      !Number.isSafeInteger(payload.ts) || Math.abs(Date.now()-payload.ts) > 300000 ||
      typeof payload.sig !== 'string' || !/^[0-9a-f]{64}$/.test(payload.sig)) return answer('forbidden');

  const props = PropertiesService.getScriptProperties();
  const secret = props.getProperty('REFERRAL_SECRET');
  if (!secret || secret.length < 32) return answer('unconfigured');
  const expected = Utilities.computeHmacSha256Signature(payload.ref+'\n'+payload.ts,secret)
    .map(b=>(b&255).toString(16).padStart(2,'0')).join('');
  let diff = 0;
  for (let i=0;i<64;i++) diff |= expected.charCodeAt(i)^payload.sig.charCodeAt(i);
  if (diff !== 0) return answer('forbidden');
  const spreadsheet = props.getProperty('REFERRAL_SHEET_ID');
  if (!spreadsheet) return answer('unconfigured');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return answer('busy');
  try {
    const tab = SpreadsheetApp.openById(spreadsheet).getSheetByName(LEDGER_TAB);
    if (!tab) return answer('unconfigured');
    const last = Math.min(tab.getLastRow(),1000);
    if (last < 3) return answer('ignored');
    const matches = tab.getRange(3,1,last-2,6).getValues()
      .map((row,index)=>({row,index})).filter(x=>x.row[0] === payload.ref);
    if (matches.length !== 1) return answer('ignored');
    const {row,index}=matches[0];
    if (!String(row[1] || '').trim() || row[5] !== '') return answer('ignored');
    tab.getRange(index+3,6).setValue(new Date(payload.ts));
    return answer('recorded');
  } finally { lock.releaseLock(); }
}
