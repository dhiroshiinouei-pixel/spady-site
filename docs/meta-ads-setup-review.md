# Meta広告 初期設定サポート LP 確認資料

## 状態

公開URLは `https://spady.net/meta-ads-setup/`。制作後のユーザーからの公開依頼に基づき、既存GitHub main → Cloudflare Pagesの公開経路で反映します。既存ページ・法的文書を上書きせず、課金・外部サービス登録・通知先設定の変更は行いません。

`src/data/meta-ads-setup.ts` で公開URL、`noindex: false`、`form.acceptingInquiries: true` を設定し、サイトマップへ追加しました。本番環境に既存 `LARK_WEBHOOK` シークレットの登録があることを確認しています。秘密値は取得・表示していません。実際の通知を伴う送信テストは未実施で、成功・失敗・未接続の挙動は模擬通信で検証しています。Astro開発サーバーでは受付停止表示を維持します。

相談送信時点で契約・支払いは発生しません。未確定の事業条件は以下の**正式な申込案内・提供開始前の残作業**であり、公開により確定した扱いにはしていません。

## 実装ファイル

- `src/pages/meta-ads-setup.astro` — LP専用の軽量ヘッダー、全12構成、操作画面イメージ、既存フッターリンク、SEO/OGP。
- `src/data/meta-ads-setup.ts` — 価格・説明時間・6つの提供範囲・対象外・FAQ・CTA・連絡先・受付/公開/計測設定。
- `src/components/meta-ads/` — CTA、HTMLフォーム、装飾用SVGアイコン。
- `src/styles/meta-ads-setup.css` — レスポンシブ、フォーカス、注意書き、Cookie表示、追従CTA。
- `src/scripts/meta-ads-setup.ts` — 入力開始/CTA/成功/失敗の計測、受付処理、未接続表示、二重送信防止、追従CTA制御。
- `functions/api/contact.js` — 既存Lark送信基盤に `meta-ads-setup-v1` のサーバー検証を追加。旧フォームの挙動を維持。
- `test/meta-ads-contact.test.mjs` — サーバーの検証・スパム・未接続・通知失敗・制限歴の個別確認を検証。
- `scripts/verify-meta-ads.mjs` — 実ブラウザーで表示・操作・模擬送信・Cookieを確認し、画像を保存。最後に自社用OGPを生成。
- `tsconfig.meta-ads.json` — 新しいTypeScriptデータとブラウザースクリプトのstrict型チェック。
- `public/meta-ads-setup/og.png` — 重要コピーと料金の自社OGP画像。参考サイトの画像は使用していません。

## 起動方法

```sh
cd spady-site-publish
npm run dev -- --host 127.0.0.1 --port 4330
```

確認URL: `http://127.0.0.1:4330/meta-ads-setup/`

静的ビルド確認:

```sh
npm run build
python3 -m http.server 4331 --bind 127.0.0.1 --directory dist
```

この場合は `http://127.0.0.1:4331/meta-ads-setup/`。どちらもCloudflare Pages Functionsは動きません。Astro devは受付停止表示になります。distの静的配信は本番HTMLの確認用であり、送信APIは動かず成功しません。既存の秘密情報をクライアントやローカル設定へコピーしていません。

この環境ではNodeがPATHにないため、検証に以下を使用しました。

- Node: `/Users/hiroshiinoue/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`
- Astro: `node node_modules/astro/astro.js build`
- TypeScript: `node node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc -p tsconfig.meta-ads.json`
- Playwright: `NODE_PATH=/Users/hiroshiinoue/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/verify-meta-ads.mjs`

Playwrightは既存の外部QA環境を利用しています。本番依存の追加はありません。

## 送信・計測の仕様

- 既存 `POST /api/contact` と `LARK_WEBHOOK`（Cloudflare側のシークレット）を再利用。
- 必須項目、選択肢、3つの確認、メール、URL（http/httpsのみ）、文字数、重複項目、Origin、本文サイズをサーバー検証。
- ハニーポットと入力開始時刻（2秒〜24時間）でスパムを軽減。過去/現在の制限「あり」は自動拒否しません。
- LarkのHTTP成功かつアプリケーション応答成功の後だけ `ok: true` と受付IDを返します。
- クライアントは送信中/受付完了後の再送信を禁止。自動再送なし。通信断で受付が不明な場合は成功表示しません。分散ストレージによるリロード・別タブ間の冪等性は追加していません。
- 入力内容は永続ストレージへ保存しません。サーバーログも受付ID・結果のみで、個人情報を記録しません。
- 既存 `SiteConsent.astro`、Cookie同意キー、GTM `GTM-NV5VRH3G` を再利用。新しい計測IDは作成していません。
- 同意時のみ `meta_setup_cta_click` / `meta_setup_form_start` / `meta_setup_inquiry_success` / `meta_setup_inquiry_failure` をdataLayerへ送信。氏名・メール・自由記述・受付ID・UTMはイベントに含めません。成功イベントは実際に受理された応答時に1回のみ。
- スマホの追従CTAは、フォーム表示中・入力フォーカス中・Cookie同意表示中に非表示。

## 公開設定と正式申込・提供開始前のチェックリスト

- [x] **既存送信先の設定確認**：本番Cloudflare Pages `spady-site` に `LARK_WEBHOOK` シークレットの登録を確認。既存基盤を再利用し、相談受付を有効化。
- [ ] **実受信の確認**：実通知を伴うテストは未実施。本LPの追加項目を含む通知が正しく届くことを確認。未受理・未接続・通知先失敗では受付成功にしない実装です。
- [ ] **計測設定**：既存GTM内で新イベントをGA4等へ対応付け。CTA/入力開始/失敗を問い合わせ完了にしない。同意前の発火なし、成功の重複なしを本番接続環境で確認。新規IDは現時点で不要。
- [x] **最終公開URL**：`https://spady.net/meta-ads-setup/` に確定。canonical・絶対OGP URL設定、noindex解除、サイトマップ追加。
- [ ] **操作ガイド**：共通ガイドを別タスクで制作・内容確認。LPに架空のダウンロードリンクはありません。
- [ ] **正式申込み・支払い方法**：対応可否確認後の案内文と受付方法を事業者が確定。
- [ ] **納期**：必要情報・権限・素材がそろった後の進め方、日程案内方法を確定。
- [ ] **キャンセル・返金・作業中断時の条件**：事前確認後にMetaの審査/制限で進められない場合も含めて事業者が確定。
- [ ] **規約との整合**：既存 `/terms/`、`/cancellation/`、`/legal/` と本LPの契約条件を確認。`/legal/` は既存の「公開前確認中の草案」のままです。法的文書は今回改変していません。

## 素材・参照

- 本人写真 `/profile.jpg`、Spadyロゴ `/logo.png` は既存リポジトリの素材を使用。
- 経歴は本人の過去の職務経験として [Spadyについて](https://spady.net/about/) の記載を確認。今回サービスの導入実績やMeta認定とは表現していません。
- 参考: [コスパ広告くん](https://cospa-ad.com/lp/meta-ads/) の料金・提供範囲の整理、[Stellarium](https://ads.stellarium.jp/) の見出し階層と相談導線。文章・画像・ロゴ・ソースは流用していません。
- 操作画面は独自のHTML/CSSイメージ。実画面ではないことを可視表示し、成果数値・実績グラフは使用していません。

## 検証記録

実行後のブラウザー結果は `artifacts/meta-ads-review/results.json`、スクリーンショットは同ディレクトリ（Git対象外）。サーバー検証は外部通知をすべてモック化しています。

本番のLark実通知・本番GTM/GA4の受信確認・Metaの実アカウント操作・実機端末での検証は行っていません。型チェックの範囲は追加TypeScriptファイルで、AstroテンプレートはAstroビルドで確認しています（全テンプレートのastro checkは未実施）。

### 実行結果（2026-11-11）

- Astroビルド成功（既存サイト含む49ページ）。新規LPのJSは約5 KB（gzip約2.6 KB）。
- 追加TypeScriptファイルのstrict型チェック成功。
- Nodeテスト132件成功（既存＋新規）。実通知なし。
- Python SEO検査4件、企業サイト検査8件成功（既存を含む内部リンク・fragment・asset確認）。
- Chromeで320 / 360 / 375 / 390 / 768 / 1024 / 1440pxを確認。意図しない横スクロールなし、主CTAはモバイル冒頭から到達可能。スクリーンショットを目視し、見出し・料金・注意書きの折り返しを調整。
- フォーム必須検証、未接続時に送信しない挙動、503失敗、HTTP 200でも受理IDなしの場合の失敗、送信中/完了後の二重送信防止、成功イベント1回、個人情報が解析/永続ストレージへ残らないことを模擬通信で確認。
- 10問のFAQのEnter/Space操作、ページ内CTA、既存の法的ページのリンク、フォーム入力中とCookie表示中の追従CTA非表示を確認。
- 参考2サイトもPC1440px/スマホ390pxで目視確認。証跡は `artifacts/meta-ads-setup/reference-review/`。
