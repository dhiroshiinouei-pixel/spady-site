/**
 * Spady - 口コミ365予約検知メール（Google Apps Script）
 * Google Apps Script に貼り付け、ウェブアプリとしてデプロイします。
 * 実行ユーザー：自分、アクセス：全員（外部ページからの通知を受信するため）
 * 顧客の氏名・メールアドレスは通知しません。
 *
 * 注意：ページ内のHubSpot埋め込みから検知したイベントの通知です。
 * HubSpot側の予約確定や紹介報酬の帰属を証明するものではありません。
 */
const NOTIFY_EMAIL = 'info@spady.net';
const REFERRAL = 'Spady（井上博史）紹介';

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.event !== 'hubspot.meeting_booked' || data.referral !== REFERRAL) {
      return ContentService.createTextOutput('ignored');
    }
    if (!NOTIFY_EMAIL || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(NOTIFY_EMAIL)) {
      return ContentService.createTextOutput('notify_email_not_configured');
    }
    const id = String(data.sessionId || '').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,100);
    if (id.length < 10) return ContentService.createTextOutput('missing_session_id');
    const cache = CacheService.getScriptCache();
    const key = 'k365_' + id;
    if (cache.get(key)) return ContentService.createTextOutput('duplicate');

    // 公開ウェブアプリは第三者が呼び出せるため誤送信を減らす簡易上限。
    // 不正送信の完全防止・実予約の証明にはなりません。
    const lock = LockService.getScriptLock();
    lock.waitLock(3000);
    try {
      if (cache.get(key)) return ContentService.createTextOutput('duplicate');
      const day = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd');
      const prop = PropertiesService.getScriptProperties();
      const countKey = 'sent_' + day;
      const count = Number(prop.getProperty(countKey) || 0);
      if (count >= 50) return ContentService.createTextOutput('rate_limited');
      cache.put(key, '1', 21600);
      prop.setProperty(countKey, String(count + 1));
    } finally { lock.releaseLock(); }

    const time = String(data.detectedAt || '不明').slice(0,100);
    const page = String(data.page || '').slice(0,300);
    const source = String(data.utm_source || '').slice(0,100);
    const campaign = String(data.utm_campaign || '').slice(0,150);
    const body =
      'Spady専用ページで口コミ365の商談予約完了イベントを検知しました。\n\n' +
      '紹介元: ' + REFERRAL + '\n' +
      '検知時刻（UTC）: ' + time + '\n' +
      '送客元: ' + source + '\n' +
      'キャンペーン: ' + campaign + '\n' +
      'ページ: ' + page + '\n\n' +
      '注意: HubSpot側の確定予約データと照合した通知ではありません。\n' +
      '顧客名・顧客メールは含まれません。本部の予約実績と照合してください。';
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: '【口コミ365】Spady紹介の商談予約を検知',
      body: body,
      name: 'Spady予約通知'
    });
    return ContentService.createTextOutput('ok');
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput('error');
  }
}