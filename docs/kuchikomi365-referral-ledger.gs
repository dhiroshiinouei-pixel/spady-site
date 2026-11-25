/** Apps Script受信側。フォーム入力は扱わず、初回検知日時だけF列に保存する。 */
const LEDGER_TAB = '口コミ365_送信・予約管理';
const OWNER_EMAIL = 'info@spady.net';
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
  let notifyStore = '';
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
    // Commit before releasing the lock so a concurrent duplicate cannot send twice.
    SpreadsheetApp.flush();
    if (props.getProperty('REFERRAL_OWNER_EMAIL_ENABLED') === 'true' &&
        Object.prototype.toString.call(row[4]) === '[object Date]' &&
        Number.isFinite(row[4].getTime()) && row[4].getTime() <= payload.ts) {
      notifyStore = String(row[1]).replace(/[\r\n\t]+/g, ' ').trim().slice(0, 180);
    }
  } finally { lock.releaseLock(); }
  if (notifyStore) {
    try {
      MailApp.sendEmail({
        to: OWNER_EMAIL,
        subject: '【口コミ365】LPで予約を検知（本部未確認）',
        body: '送付先：' + notifyStore + '\n' +
          '台帳の送付先です。転送などで、実際の予約店舗と異なる場合があります。下記を確認し、必要に応じて今のLINEで本部へお送りください。\n\n' +
          'お世話になっております。Spadyの井上です。\n' +
          '弊社の紹介ページから「' + notifyStore + '」様宛のリンクで予約完了の反応がありました。\n' +
          '該当するご予約がありましたら、Spadyからの紹介としてお取り扱いいただけますでしょうか。',
      });
    } catch (_) {
      // The booking signal remains in the ledger; never automatically contact HQ.
      console.warn('Referral owner email failed; check the ledger.');
    }
  }
  return answer('recorded');
}
