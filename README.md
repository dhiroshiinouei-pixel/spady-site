# Spady 公式ホームページ

Astro + Cloudflare Pages。既存の技術・URL・本番連携を維持しています。
**GitHub mainへのpushは本番公開です。レビュー中にpushしないこと。**

リニューアルのページ一覧・引き継いだ機能・未確定事項・公開前手順は [確認資料](docs/renewal-review.md)、法的表示の根拠は [法務確認](docs/legal-review.md) を参照。

## 開発・確認

```sh
npm run dev
npm run check:release
```

`check:release` はAstroビルド、Nodeの機能テスト、Python 3のSEO/URL検査を実行します。Larkや予約先への実送信は行いません。

生成済みサイトのローカル確認：

```sh
python3 -m http.server 4328 --bind 127.0.0.1 --directory dist
```

この静的プレビューにはCloudflare Functionsがないため、実際の問い合わせ・予約送信はできません。送信成功を装う実装はありません。APIの結合確認はCloudflare側の既存接続を保持した環境で行います。

## 主要ソース

- `src/data/services.ts`：サービスカタログ。追加すると一覧・詳細・サイトマップへ反映。
- `src/layouts/CorporateLayout.astro`：新しい企業サイトのヘッダー・フッター・メタ情報。
- `src/pages/services/[slug].astro`：カタログ共通の詳細テンプレート。
- `src/components/corporate/`：店舗の概念図、アイコン、共通CTA。
- `src/styles/corporate.css`：モバイル・タブレット・PCの新デザイン。
- `src/scripts/corporate.ts`：メニュー、ページ内移動、任意の演出と停止。
- `src/layouts/HomeLayout.astro` / `src/i18n/`：既存外国語ページ。条件付きレイアウトのCSS混入を避けるため、レイアウトCSSは実際に描画するhead内で読み込み。
- `functions/api/contact.js`：既存の検証とLark通知。`LARK_WEBHOOK`はサーバーのシークレットのみ。
- `functions/api/booking/[action].js`：既存の予約プロキシ。
- `src/components/SiteConsent.astro` / `public/legacy-consent.js`：同意後のみGTMを読み込み。
- `src/pages/sitemap.xml.ts`：既存URLとサービスカタログから生成。

## 実ブラウザーQAとOGP

任意の開発ツールとして、既存環境のPlaywright・Chrome・sharpを使用します（本番依存には追加していません）。`NODE_PATH`等でツールを参照できる環境で実行してください。

```sh
node scripts/capture-preview.mjs
node scripts/capture-preview.mjs --interactions-only
node scripts/capture-preview.mjs --visuals-only
node scripts/render-social.mjs
```

`PREVIEW_URL`未指定時は `http://127.0.0.1:4328`。画像・結果はGit対象外の `artifacts/renewal-review/` へ保存。
問い合わせのブラウザーテストは通信を模擬応答へ差し替え、実通知を送りません。GTMテストもタグ配信を遮断したうえで、同意前の通信有無を検証します。

## 公開時の注意

- 現在の `/legal/` はレビュー草案・noindex。事業者が個別開示の運用と内容を承認した後に正式表示へ変更し、サイトマップへ追加。
- 自社SaaSは企画段階。未確定の価格・利用開始日・機能・契約条件を作らないこと。
- `available`へ変更する前に個別サービスの条件・専用サイト・契約・サポート導線を確認。
- 旧LPの料金・個別条件を新SaaSへ流用しないこと。
- Git履歴と変更前ソースのアーカイブを保持し、公開後は既存URLとフォームを確認。

## AKINDO Lab｜開業準備

`/akindo/kaigyo/` に登録不要の開業準備MVPを追加しました。現在はテスト公開用の表示・noindexを設定し、5ページをサイトマップから除外しています。構成、データの追加方法、保存仕様と確認手順は [開業準備MVPの説明](docs/akindo-kaigyo.md) を参照してください。既存 `/akindo/` は勉強会ページとして保持しています。

## 素材

素材の出典は [ASSET-SOURCES.md](ASSET-SOURCES.md) に記録。小樽暮らしカレンダーの公式OGP、実際の代表者・勉強会写真を継続使用しています。新ヒーローは店舗業務の概念図で、確定した製品画面ではありません。

## Meta広告 初期設定サポート LP

`/meta-ads-setup/` は買い切り33,000円・45分の操作説明付きの初期設定LPです。2026-11-15の依頼に合わせ、Spadyの既存ロゴを使い、傾いたPCの装飾を外したファーストビューへ更新しています。主CTAは **「相談日時を予約する」**。LINEへ移動せず、ページ内で日付・空き時間を選び、必要な連絡先と確認事項を入力して予約する構成です。

相談枠は平日10:00〜17:00・30分（日本時間）。有料サービスに含まれる45分の操作説明とは別です。Googleカレンダーへの登録と予約ごとのLarkミーティング生成が両方確認された場合だけ、予約日時と参加URLを表示します。ボタン押下・入力・相談情報の受付だけを予約完了として計測しません。

**接続作業は未完了です。** Googleの実空き枠APIは再接続が必要な状態です。Larkの予約ごとの会議生成はバックエンドを実装していますが、アプリ認証情報と会議主催者の接続・検証が必要です。本番の実予約・実会議生成は未確認で、予約可能な完成状態として扱いません。未接続時は架空の予約枠や成功表示を出しません。

設定は `src/data/meta-ads-setup.ts`、UIは `src/components/meta-ads/ConsultationBooking.astro`、予約処理は `src/scripts/meta-ads-booking.ts`。詳細と公開前の必須作業は [LP確認資料](docs/meta-ads-setup-review.md) の先頭を参照してください。既存の法的文書は変更していません。

ローカルの表示・模擬予約確認には、ビルド後 `node test/serve-meta-qa.mjs` を使用します。`http://127.0.0.1:4334/meta-ads-setup/?qa_case=success` は外部に転送しない模擬応答です。実予約の確認とは区別してください。その他のケースは同サーバーの起動ログに記載しています。`scripts/verify-meta-ads.mjs` は新しい予約導線向けに更新済みですが、今回ブラウザー実行していません。
