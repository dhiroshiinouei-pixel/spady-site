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

## 素材

素材の出典は [ASSET-SOURCES.md](ASSET-SOURCES.md) に記録。小樽暮らしカレンダーの公式OGP、実際の代表者・勉強会写真を継続使用しています。新ヒーローは店舗業務の概念図で、確定した製品画面ではありません。
