/**
 * フォーム送信 → Lark通知
 *
 * Cloudflare Pages にデプロイすると /api/contact で動作します。
 * 環境変数 LARK_WEBHOOK に、Larkカスタムボットの Webhook URL を設定してください。
 * （Pagesの設定 → 環境変数 → LARK_WEBHOOK）
 */
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.formData();

    // ハニーポット（botはこの不可視欄を埋めるので破棄）
    if (data.get('website')) {
      return new Response('ok');
    }

    const name = (data.get('name') || '').toString().slice(0, 100);
    const company = (data.get('company') || '').toString().slice(0, 100);
    const email = (data.get('email') || '').toString().slice(0, 200);
    const topic = (data.get('topic') || '').toString().slice(0, 100);
    const message = (data.get('message') || '').toString().slice(0, 2000);

    if (!name || !email || !topic) {
      return new Response(JSON.stringify({ ok: false, error: 'missing fields' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const text = [
      '【HPから無料相談の申込み】',
      `お名前：${name}`,
      `事業・会社名：${company || '（未記入）'}`,
      `メール：${email}`,
      `ご相談内容：${topic}`,
      '--- 詳しい状況 ---',
      message || '（未記入）',
    ].join('\n');

    if (env.LARK_WEBHOOK) {
      const larkRes = await fetch(env.LARK_WEBHOOK, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ msg_type: 'text', content: { text } }),
      });
      if (!larkRes.ok) {
        return new Response(JSON.stringify({ ok: false, error: 'lark failed' }), {
          status: 502,
          headers: { 'content-type': 'application/json' },
        });
      }
    } else {
      // 環境変数未設定のまま公開しないよう、明示的にエラーを返す
      return new Response(JSON.stringify({ ok: false, error: 'LARK_WEBHOOK not set' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    // JS経由（fetch）ならJSON、JS無効環境なら簡易HTMLで応答
    const accept = request.headers.get('accept') || '';
    if (accept.includes('application/json')) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response(
      '<!doctype html><meta charset="utf-8"><title>送信完了</title><body style="font-family:sans-serif;background:#101619;color:#fff;display:grid;place-items:center;min-height:100vh;text-align:center"><div><p>送信しました。2営業日以内にご連絡します。</p><a href="/" style="color:#ffd75e">トップへ戻る</a></div></body>',
      { headers: { 'content-type': 'text/html;charset=utf-8' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
