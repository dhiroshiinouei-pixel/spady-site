# Meta広告 初期設定サポート LP 確認資料

## 追加改訂：指定のファーストビューと運用事例（2026-11-15）

- 過去の依頼画像に合わせ、見出しを「はじめの設定、プロにお任せ。」へ変更。元Metaマーケティングプロ・広告代理店80社以上のサポート経験を上部で明確に表示。王冠や公式認定バッジ、傾いたPCは使用していない。
- 実際のSpadyロゴと、今回提供されたマーケティングのセミナー写真を使用。写真は活動風景であり、サービスはオンライン提供と明記。
- 冒頭直後に、過去のMeta広告運用事例4件を掲載。飲食店は2か月先まで予約満席、SaaSはリード獲得7倍、食品サブスクは登録2.5倍、人材系サービスは月間問い合わせ0件から3件。人材の指標は本人に確認済み。
- 事例は今回の33,000円の初期設定サービスの成果や、同様の結果の保証ではないことを併記。未提供の顧客名・広告費・実施期間を補完していない。
- 参考 `https://tsunaguinc.com/` の公開配信内容で、強い見出し、実績数字、早い相談CTAを確認。既存の青・紺を維持し、文章・素材・コードは複製していない。先方のCVデータは独自検証していない。
- 33,000円、45分、提供範囲、ページ内カレンダー予約、L Message認定代理店の紹介欄を維持。予約連携の接続状況は下記の未完了事項を参照。

関連ファイル：`src/components/meta-ads/Hero.astro`、`PastResults.astro`、`src/data/meta-ads-results.ts`、`src/pages/meta-ads-setup.astro`、`src/styles/meta-ads-setup.css`、`public/meta-ads-setup/seminar-marketing.jpg`。

実画面の目視・レスポンシブ・予約UI操作は、今回もブラウザー接続エラーのため未実施。コードレビューは実ブラウザー検証の代用として報告しない。

今回の検証：Astroビルド49ページ、LPのTypeScript型チェック、`git diff --check`、生成したLPの22リンク・4画像・canonical・見出し・CTA遷移先・価格/時間/4事例の静的確認、既存SEOテスト4件が成功。予約処理・連携バックエンドはこの追加改訂では変更していない。本番実予約は未検証。

---

## 現行作業：ページ内予約・Spadyロゴ・ファーストビュー更新（2026-11-15）

最新依頼は「Spadyのロゴを使用」「傾いたPCを外してデザインを見直す」「LINEへ移動せず、その場でカレンダー予約」「予約完了後に日時とLarkミーティングを生成」です。**以下が現行の情報です。後半のLINE導線・旧フォーム導線の記録は履歴であり、現行版の仕様・検証結果ではありません。**

### 今回の変更

- 既存 `/logo.png` を使用。傾斜したPCモックを外してファーストビューを整理。過去の職務経験の注記、45分の操作説明、33,000円（税込）、サービス範囲は維持。
- 主CTAを「相談日時を予約する」とし、すべて `#consultation` へ接続。LINEへの予約リンクと案内を撤去。
- 日付・空き時間を選択してから、会社名・氏名・メール・業種・現在と過去の制限・必要な同意を入力。Webサイトと相談内容は任意。
- 相談枠は平日10:00〜17:00・30分（日本時間）。有料サービスに含まれる45分の操作説明とは別。実空き枠をGoogleカレンダーから取得し、予約確定時にも空き状況を確認。
- 相談情報を既存受付APIで保存した後、受付IDと日時で予約。相談情報の受付だけを「予約完了」と表示・計測しない。
- Googleカレンダー登録と予約ごとのLark会議生成が両方確認された場合だけ成功。LPもHTTP 200・受付ID・開始/終了日時・Lark参加URLを検証し、確定日時と参加リンクを表示。
- 二重送信を防止し、結果不明時は同一ID・日時で再確認。409 `slot_unavailable` の場合だけ日時を選び直す。503 `manual_review_required` は自動再試行・日時変更を停止し、受付IDを画面に表示して `info@spady.net` への確認を案内。
- 個人情報・受付ID・選択日時をアクセス解析やブラウザーの永続ストレージへ保存しない。既存Cookie同意後のGTMのみ再利用し、クリック・操作開始・失敗・実予約成功を分離。

### 主な関連ファイル

- `src/pages/meta-ads-setup.astro` / `src/styles/meta-ads-setup.css`：ロゴ、ファーストビュー、最終予約セクション。
- `src/data/meta-ads-setup.ts`：価格、45分、相談時間、CTA、APIパス、計測名。
- `src/components/meta-ads/Cta.astro` / `ConsultationBooking.astro`：ページ内CTA、カレンダー、入力・確認・確定結果。旧 `LineReservation.astro` は削除。
- `src/scripts/meta-ads-setup.ts` / `meta-ads-booking.ts`：同意付き計測、追従CTA制御、予約操作と状態管理。
- `functions/api/meta-ads-booking-info.js`：Meta相談専用の接続状態。認証情報・アカウントIDは返さない。
- `functions/api/meta-ads-booking.js`：開始・終了日時、Lark参加URL、再選択・手動確認コードの検証。
- `functions/api/meta-ads-setup.js` / `functions/api/booking/[action].js`：既存の相談受付・空き枠取得を再利用。
- `test/meta-ads-booking-info.test.mjs` / `meta-ads-booking-proxy.test.mjs` / `meta-ads-proxy.test.mjs`：接続・受付・予約の成功条件と情報境界。
- `test/serve-meta-qa.mjs`：localhost限定の模擬受付・模擬予約。`success` / `retry` / `conflict` / `unavailable` / `lark_unavailable` / `missing_meeting` / `empty` / `intake_failure` / `manual_review`。実通知・実会議・実予定は作成しない。
- `scripts/verify-meta-ads.mjs`：上記のローカル模擬環境専用のブラウザーQA手順。今回実行していない。

連携バックエンドは隣接する `spady-sales` 側で変更。一般予約の固定Lark URL方式は維持し、Meta相談に予約ごとの会議生成を追加。

### 実施済みと未実施の検証

- LP TypeScript型チェック：成功。
- 受付・予約・接続状態proxyのNodeテスト：42件成功。不正・未確認応答、URL/日時不一致、HTTP 202、手動確認コードの境界を確認。
- `git diff --check`、ローカル模擬サーバーの構文チェック：成功。
- Astroビルド：成功（49ページ）。SEO・内部リンク等の静的検証も成功。
- Googleの実availability API：**「Googleカレンダーに再接続してください」** の応答を確認。本人に再接続を依頼済み。
- ブラウザーの目視・操作・レスポンシブ確認：**未実施**。CUA操作エラーで開始できず。旧版の画像・検証結果を今回の確認済み証拠にしない。
- 本番の実予約、Google予定、予約ごとのLark会議、招待、Sheets記録とLark通知の一連の確認：**未実施**。
- 更新した `scripts/verify-meta-ads.mjs` のブラウザー実行：**未実施**。

### 公開前・予約受付開始前の必須作業

- [ ] **Googleカレンダー再接続**：本人認可後、実空き枠取得・平日10〜17時・競合チェックを確認。
- [ ] **Lark会議生成の接続**：アプリ認証情報と主催者をサーバー側へ設定。実行時の値は未設定・未検証。必要権限を確認し予約ごとの会議生成を実検証。秘密値はチャットに貼らず、設定UIで扱う。
- [ ] **本番結合確認**：Googleの日時・Lark参加URL・招待・Sheets記録・Lark通知を実予約で確認。未接続・競合・結果不明時の挙動も確認。
- [ ] **表示確認**：320・360・390・768・1024・1440px等で、ロゴ、見出し、CTA、カレンダー、入力・エラー・完了表示、固定UIとCookie表示を確認。
- [ ] **計測設定**：`meta_setup_cta_click` / `meta_setup_booking_start` / `meta_setup_booking_success` / `meta_setup_booking_failure` の集計先を確認。成功は実予約完了のみ。
- [x] **公開URL**：既存 `https://spady.net/meta-ads-setup/` を継続。本資料作成時点で今回の変更を公開済みとする証拠はない。
- [ ] **操作ガイドの準備**：共通ガイドは別タスクで制作・確認。
- [ ] **正式申込・支払い方法、納期、キャンセル・返金・作業中断時の条件、規約との整合**：未確定条件を事業者が確定。今回の制作で法的文書を改変していない。

実接続・実予約を確認するまでは、予約可能な完成品として扱わない。未接続時は架空枠を表示せず、予約未完了を案内する。

---

## 以下は2026-11-11のLINE導線と、それ以前のフォーム導線の履歴

**以下の「現在」「今回」は記録当時の状態です。2026-11-15の仕様・実接続・公開・ブラウザー確認の根拠として使わないでください。**


## 現在の導線：LINEで予約する

公開URLは `https://spady.net/meta-ads-setup/`。最新の依頼「フォーム送信ではなく、LINEで予約する」に合わせ、ヘッダー・ファーストビュー・料金・最終案内・スマホ追従の主CTAを **「LINEで予約する」** に統一しました。既存GitHub main → Cloudflare Pagesの公開経路を使用します。

遷移先は既存のSpady公式LINEで使用している `https://s.lmes.jp/landing-qr/2002523511-OZpWpGdr?uLand=O4rFry` です。企業サイトのお問い合わせ・ホーム・集客支援ページと同じURLを使用し、AKINDO Lab用の登録先は流用しません。

LP内の入力フォームとカレンダー選択画面を撤去し、LINEでの連絡から相談日時を調整する案内へ変更します。リンクのクリックや友だち追加を予約確定として表示・計測しません。LINE上の自動予約、Google Calendar登録、Sheets記録、Lark通知の接続を新たに行った扱いにはしません。

相談・日時調整の時点で契約・支払いは発生しません。LINE構築・LP制作などの追加サービス購入は引き続き任意です。33,000円（税込）、45分の操作説明、提供範囲、法的文書、支払い条件は変更していません。

## 今回の主な変更ファイル

- `src/pages/meta-ads-setup.astro` — フォームをLINE予約案内へ変更。ご利用の流れ・相談案内の文言を調整。
- `src/data/meta-ads-setup.ts` — CTA・LINE URL・流れ・注記・計測設定を集約。
- `src/components/meta-ads/Cta.astro` — 全主CTAのリンクを共通化。
- `src/components/meta-ads/LineReservation.astro` — 公式LINEでの相談・日時調整の案内。
- `src/styles/meta-ads-setup.css` — LINE案内とCTAのレスポンシブ表示。
- `src/scripts/meta-ads-setup.ts` — 同意時のLINE CTAクリック計測と追従CTA制御。フォーム送信・予約APIを呼び出さない。
- `scripts/verify-meta-ads.mjs` — 表示幅、LINEリンク、フォーム不在、FAQ、Cookie、CTA計測の確認用。外部LINEへの実送信やOGPの再生成を行わない。
- `README.md` / 本資料 — 現在のLINE導線と旧フォーム実装の履歴を区別。

以前の `ConsultationForm.astro` と `src/scripts/meta-ads-booking.ts` は削除しました。`functions/api/meta-ads-setup.js`、`functions/api/meta-ads-booking.js`、既存一般予約APIとそのテストは保持しますが、現在のLPから呼び出す導線はありません。

## 起動方法

```sh
npm run dev -- --host 127.0.0.1 --port 4330
```

確認URL: `http://127.0.0.1:4330/meta-ads-setup/`。静的ビルドは `npm run build`、ビルド後は `python3 -m http.server 4331 --bind 127.0.0.1 --directory dist` で確認できます。LINEへの外部リンクはプレビューでも本番URLを参照します。クリックだけでは予約確定や通知送信は発生しません。

この環境で利用するNode: `/Users/hiroshiinoue/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`

```sh
node node_modules/astro/astro.js build
node node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc -p tsconfig.meta-ads.json
```

## 現在の計測

- 既存 `SiteConsent.astro`、Cookie同意キー、GTM `GTM-NV5VRH3G` を再利用。新しい計測IDは作成しません。
- 同意かつ既存GTMの読み込み時だけ `meta_setup_cta_click` を送信。固定値 `service: meta_ads_setup`、`destination: line`、配置名のみを付与。
- 配置名は `header` / `hero` / `pricing` / `final` / `sticky`。氏名・メール・自由記述・受付ID・URLパラメータ・UTMを送信しません。
- フォーム入力開始・受付成功・受付失敗のイベントは現在のLPから発火しません。LINEリンクのクリックを予約完了や問い合わせ完了へ転用しません。
- スマホ追従CTAはファーストビュー・最終案内・Cookie同意画面の表示中に非表示。LP上で個人情報を入力・永続保存する処理はありません。

## 現在の残作業

- [ ] **LINE側の実予約確認**：公式LINEへ移動後、実際に相談日時を調整・確定する運用を確認。友だち追加だけでは予約は確定しません。
- [ ] **計測設定**：既存GTMでCTAクリックを必要な集計先へ対応付け。LINE側の予約完了を計測する場合は、実際の完了を確認できる別の連携設計が必要です。
- [x] **最終公開URL**：`https://spady.net/meta-ads-setup/`。canonical・OGP URL・サイトマップに設定済み。
- [ ] **操作ガイド**：共通ガイドを別タスクで制作・内容確認。架空のダウンロードリンクはありません。
- [ ] **正式申込み・支払い方法**：対応可否確認後の案内文と受付方法を事業者が確定。
- [ ] **納期**：必要情報・権限・素材がそろった後の進め方と日程案内方法を確定。
- [ ] **キャンセル・返金・作業中断時の条件**：Metaの審査・制限で進められない場合も含めて事業者が確定。
- [ ] **規約との整合**：既存 `/terms/`、`/cancellation/`、`/legal/` とサービス条件を確認。`/legal/` は既存の「公開前確認中の草案」のまま。今回の変更で法的文書を改変していません。

## 今回のLINE導線変更の検証

変更前のフォーム・カレンダーのテスト結果を、今回のLINE予約導線の検証済み証拠として扱いません。

- Astroビルド・LPのTypeScript型チェック：成功。
- SEO検査4件、企業サイト・リンク検査8件：成功。実ブラウザーで主CTA5箇所のLINE URL一致、フォーム0件を確認。
- ブラウザー内のレスポンシブ確認用iframeで320・390・768・1440px幅のLINE案内、390px幅のファーストビューを目視確認。各幅で横スクロールなし。手順番号と320px幅の見出しの折り返しを修正し、320px幅で再確認済み。実機検証とは別の確認です。
- 既存公式LINEリンクのHTTP 200応答を確認。
- `scripts/verify-meta-ads.mjs` はLINE導線に合わせて更新し、Node構文確認に成功。この更新時に同スクリプトのPlaywright実行は行っていない。
- LINE内での実予約、友だち追加、メッセージ送信、GTM/GA4での実受信確認：未実施。
- 実機端末での検証、全Astroテンプレートの `astro check`：未実施。

---

## 以下は旧フォーム・カレンダー導線の履歴

**以下はLINE切り替え前の実装・検証記録です。現在のLP利用者にGoogle Calendar・Sheets・Larkが自動連携されることを示すものではありません。旧フォーム用のAPI・管理基盤は維持しますが、今回の変更では呼び出しません。**

## 状態

公開URLは `https://spady.net/meta-ads-setup/`。既存GitHub main → Cloudflare Pagesの公開経路を使用。追加依頼により、実績表示・45分への変更・既存予約連携・専用受付シートへの記録を実装。今回の更新では、提供された参考画像に合わせたファーストビューと、受付完了後にLP内で相談日時を選ぶ導線を追加。法的文書・支払い条件は変更しません。

`src/data/meta-ads-setup.ts` で公開URL、`noindex: false`、`form.acceptingInquiries: true` を設定し、サイトマップへ追加しました。受付は既存予約サービスの永続保存と通知ジョブへ接続します。秘密値をクライアントへ配置しません。Google本人再認可は未完了です。実予約・実通知・新しいシートへの実記録も未検証で、再認可と記録先設定後の疎通確認が必要です。Astro開発サーバーでは受付停止表示を維持します。

相談送信時点で契約・支払いは発生しません。未確定の事業条件は以下の**正式な申込案内・提供開始前の残作業**であり、公開により確定した扱いにはしていません。

## サービス情報の更新

- 2026-11-11のユーザー指示により、管理画面の操作説明は **45分** に変更。以前の60分指定を更新し、本文・料金内訳・流れ・SEO・OGPを統一。
- ファーストビューに「元Metaマーケティングプロ」「広告代理店80社以上のサポート経験」を表示。「L Message（LINE拡張ツール）認定代理店」はSpady紹介欄に記載し、広告・LINE・Webの相談領域を明示。追加サービスは任意・別見積もり。経歴・認定の事実は今回の本人申告に基づき、Metaでの過去の職務と本サービスを区別。Meta公式・認定サービスとは表示しない。

### 今回のファーストビュー更新

- ユーザー提供画像をデザインの参考とし、「はじめの設定、プロにお任せ。」を紺・青のHTMLテキストと黄色の下線で表示。見出し・料金・提供内容・CTAを画像に埋め込まず、画面幅に合わせて配置。
- 対象者の帯、経験パネル、3つの提供内容、33,000円（税込）、買い切り・月額契約不要、大きな相談CTAを明確に分離。L Messageの認定情報は引き続きSpady紹介欄に掲載。
- 参考画像内の「60分」「広告効果を高めるアドバイス」は採用せず、確定仕様の **45分** と **共通の操作ガイド** を維持。Meta公式と誤認しやすい冠・認定風バッジも使用しない。
- 管理画面は独自のHTML/CSSによるノートPCのイメージ。「操作画面のイメージ」「実際のMeta管理画面とは異なります」と明示。スマホでは料金と相談CTAを先に置き、画面イメージは後に配置。

## 実装ファイル

- `src/pages/meta-ads-setup.astro` — LP専用の軽量ヘッダー、全12構成、操作画面イメージ、既存フッターリンク、SEO/OGP。
- `src/data/meta-ads-setup.ts` — 価格・説明時間・6つの提供範囲・対象外・FAQ・CTA・連絡先・受付/公開/計測設定。
- `src/components/meta-ads/` — CTA、HTMLフォーム、装飾用SVGアイコン。
- `src/styles/meta-ads-setup.css` — レスポンシブ、フォーカス、注意書き、Cookie表示、追従CTA。
- `src/scripts/meta-ads-setup.ts` — 入力開始/CTA/成功/失敗の計測、受付処理、未接続表示、二重送信防止、追従CTA制御。
- `functions/api/meta-ads-setup.js` — 既存の非公開予約サービスへ転送する専用API。Origin・サイズ・重複入力・受付ID・応答を検証。従来の `functions/api/contact.js` は他フォームと互換性を維持。
- `src/scripts/meta-ads-booking.ts` — 受付成功後の空き枠取得、日時選択、予約確定、結果不明時の同日時再確認、空き枠競合時の再選択。
- `functions/api/meta-ads-booking.js` — 受付IDと選択日時だけを非公開予約サービスへ転送。HTTP 200・受付ID・日時・成功フラグがすべて一致する場合のみ確定を返却。
- `test/meta-ads-booking-proxy.test.mjs` — 予約APIの入力・通信・秘密情報の境界、HTTP 202等を確定としない挙動、409の再選択許可条件を検証。
- `test/serve-meta-qa.mjs` — localhost限定の静的配信・模擬受付・模擬予約サーバー。外部転送・個人情報の保存やログ出力なし。
- `test/meta-ads-proxy.test.mjs` — 専用APIの入力境界、秘密情報の非公開、未確認応答で成功しないことを検証。
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

- `POST /api/meta-ads-setup` → 既存Spady Salesの `public/meta-setup`。既存の `SALES_SITES_ACCESS_TOKEN` / `BOOKING_PROXY_KEY` をサーバー側のみで利用。
- Spady Salesの専用受付レコードとLark・Sheetsジョブを同じD1トランザクションで保存。一般の営業メールや顧客への追客処理は呼び出しません。
- 必須項目、選択肢、3つの確認、メール、URL（http/httpsのみ）、文字数、重複項目、Origin、本文サイズをサーバー検証。
- ハニーポットと入力開始時刻（2秒〜24時間）でスパムを軽減。過去/現在の制限「あり」は自動拒否しません。
- 受付の永続保存が確認できた後だけ `ok: true` と受付IDを返します。外部通知・Sheets記録は別のジョブで処理するため、受付成功は通知の実受信を意味しません。
- クライアントは送信中/受付完了後の再送信を禁止。自動再送なし。同じ画面での再送は同一受付IDを使い、D1側でも二重受付を防止。シートは先に行番号を確定し、RAW更新で同一行へ記録。Larkの結果不明は盲目的に再通知しません。リロード・別タブは別IDになります。
- 入力内容をブラウザーの永続ストレージや解析へ保存しません。ご依頼に基づきサーバーの受付台帳・Google Sheets・Larkへ記録します。サーバーログへ本文やメールアドレスを出力しません。
- 受付完了後は別ページへ移動せず、LP内でGoogle Calendarの空き枠を読み込み、日付・時刻を選択して相談を予約。平日10〜17時・日本時間、初期設定前の相談30分です。45分の操作説明とは分離。接続切れ・空きなしは、受付済みであることを保ち、再確認またはメールでの日程調整を案内。
- `POST /api/meta-ads-booking` には受付IDと選択日時のみを送り、氏名・メールを再送しません。予約確定はHTTP 200・`ok: true`・受付ID・選択日時の一致がすべて確認できた場合のみ表示。HTTP 202等は確定としません。
- 通信失敗など結果不明時は日時変更を止め、同じ日時の再確認に限定。HTTP 409かつ `slot_unavailable` が明示された場合だけ、空き枠を再取得して別日時を選択可能にします。受付完了と予約確定を別の状態として表示。
- 会議URLはHTTPSかつGoogle Meet / Larkの許可ホストのみ表示。ブラウザーの永続ストレージへ予約日時や受付IDを保存しません。
- 既存 `SiteConsent.astro`、Cookie同意キー、GTM `GTM-NV5VRH3G` を再利用。新しい計測IDは作成していません。
- 同意時のみ `meta_setup_cta_click` / `meta_setup_form_start` / `meta_setup_inquiry_success` / `meta_setup_inquiry_failure` をdataLayerへ送信。氏名・メール・自由記述・受付ID・UTMはイベントに含めません。成功イベントは実際に受理された応答時に1回のみ。
- スマホの追従CTAは、フォーム表示中・入力フォーカス中・Cookie同意表示中に非表示。

## 公開設定と正式申込・提供開始前のチェックリスト

- [x] **既存接続基盤**：本番Cloudflare Pagesの予約プロキシと、Spady Salesの永続保存・通知を再利用。
- [ ] **Google再認可・記録先の接続**：既存カレンダーの認可失効を確認。管理者用 `/meta-ads-admin` でGoogle再接続後、専用シートを指定し、空き状況・シート記録の疎通を確認。
- [ ] **実受信の確認**：実通知を伴うテストは未実施。本LPの追加項目を含む通知が正しく届くことを確認。永続保存されなければ受付成功にせず、通知先の失敗は保存済みジョブで管理します。
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

### 今回の更新の検証（2026-11-11）

- `test/meta-ads-booking-proxy.test.mjs`：33件成功。すべて外部通信をモック化。Origin・method・Content-Type・本文512バイト境界・受付ID/日時・追加個人情報の拒否・必須binding・HTML/不正JSON応答・秘密情報非公開・結果不明・409のコード制限・HTTP 200以外の成功防止を確認。
- `test/serve-meta-qa.mjs` のNode構文確認、`git diff --check` 成功。QAサーバーは `http://127.0.0.1:4334/meta-ads-setup/?qa_case=success`。`qa_case=retry` / `conflict` / `unavailable` で再確認・競合・未接続を再現でき、CSPで外部への通信を禁止。
- 今回のファーストビューは、ブラウザーの実測1280px幅と、ローカル専用iframeで実測320 / 360 / 375 / 390 / 768 / 1024 / 1440px幅を目視確認。見出し・経験欄・提供内容・料金・CTAの表示を確認し、各iframeのclientWidthとscrollWidthが一致することを検証。実機検証ではありません。
- ブラウザーのviewport指定は反映されなかったため、`/__responsive.html?width=390` 等の同一origin iframeを使用。確認用ルートはテストサーバー内だけにあり、本番distへ含めていません。
- 実ブラウザーで相談受付→日時選択→予約確定、503結果不明→日時変更ロック→同日時再確認成功、409競合→別枠選択成功、空き状況503→受付済み・日程未確定表示を確認。実APIへは送信しないローカル模擬応答を使用。
- 受付成功後は入力欄を折り畳み、予約結果を画面中央へ表示。受付・予約ともHTTP 200と同一IDが確認できた場合だけ成功表示。
- Astroビルド、追加TypeScript型チェック、SEO4件・既存サイト/リンク8件の検査が成功。予約バックエンドは専用のD1テストでGoogle固定IDによる復帰、共有予約ロック、同一Sheet行の更新、通知ジョブの重複防止を確認。すべて外部APIは模擬応答。
- Google本人再認可は未完了。実際のGoogleカレンダーへの予約、招待メール、Sheetsへの記録、Larkの実受信は未確認です。

### 変更前の版の実行結果（2026-11-11・今回のhero/予約UIには未適用）

- Astroビルド成功（既存サイト含む49ページ）。新規LPのJSは約7.0 KB（gzip約3.4 KB）。
- 追加TypeScriptファイルのstrict型チェック成功。
- Nodeテスト136件成功（既存＋新規）。実通知なし。
- Python SEO検査4件、企業サイト検査8件成功（既存を含む内部リンク・fragment・asset確認）。
- Chromeで320 / 360 / 375 / 390 / 768 / 1024 / 1440pxを確認。意図しない横スクロールなし、主CTAはモバイル冒頭から到達可能。スクリーンショットを目視し、見出し・料金・注意書きの折り返しを調整。
- フォーム必須検証、未接続時に送信しない挙動、503失敗、HTTP 200でも受理IDなしの場合の失敗、送信中/完了後の二重送信防止、成功イベント1回、個人情報が解析/永続ストレージへ残らないことを模擬通信で確認。
- 10問のFAQのEnter/Space操作、ページ内CTA、既存の法的ページのリンク、フォーム入力中とCookie表示中の追従CTA非表示を確認。
- 参考2サイトもPC1440px/スマホ390pxで目視確認。証跡は `artifacts/meta-ads-setup/reference-review/`。

### 連携バックエンド（2026-11-11）

- 既存Spady Salesのバージョン58へ反映。管理画面: `https://spady-sales.dhiroshi-inouei.chatgpt.site/meta-ads-admin`。公開範囲は管理者本人のみを維持。
- 専用台帳は作成済み。Google Sheets ID: `1OhZuiDTTkNAjmHUKJdjLRyBGADWnR2x6Z9yKpXZrF4U`、タブ: `相談受付`。ヘッダーのみで、架空の申込みは記録していません。
- vinextビルド・全体TypeScriptチェック成功。依存パッケージは全て指定バージョンと一致し、新規追加なし。
- MiniflareとD1で専用受付、同意・制限入力、受付と通知ジョブの原子的保存、再送、Google再認可、Sheetsヘッダー・権限確認、RAW記録と応答消失後の同一行再試行、Lark失敗・結果不明を検証。外部リクエストはすべてモック。
- 既存Nodeテストは11件成功、1ファイル（domain.test.mjs）はNode直接実行時の既存拡張子なしimport解決で実行不可。専用連携テストとビルドは成功。
- Google本人再認可、Sheetsへの実記録、Larkの実受信、実予約は未確認。
