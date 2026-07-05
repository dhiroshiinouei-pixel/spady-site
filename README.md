# Spady LP（spady.net）

Astro製の1ページLP。Cloudflare Pagesでホスティングし、
フォーム送信はPages Functions（/api/contact）経由でLarkに通知します。

公開URL: https://spady-site.pages.dev

## 構成
- `src/pages/index.astro` … LP本体
- `src/pages/privacy.astro` … プライバシーポリシー
- `src/pages/404.astro` … 404ページ
- `src/layouts/Base.astro` … 共通レイアウト（ヘッダー・フッター・OGP）
- `src/styles/global.css` … デザイントークン（色・フォント）
- `functions/api/contact.js` … フォーム→Lark転送（要環境変数 LARK_WEBHOOK）
- `public/` … 画像（ロゴ・実績ロゴ・写真・OGP）

## ローカル開発
```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ に出力
```

## デプロイ（Cloudflare Pages）
1. このフォルダをGitHubリポジトリにpush
2. Cloudflare → Workers & Pages → Create → Pages → Connect to Git
3. Framework preset: Astro／Build command: `npm run build`／Output: `dist`
4. Settings → Environment variables に `LARK_WEBHOOK`（Larkカスタムボットの
   Webhook URL）を追加して再デプロイ
5. Custom domains で spady.net を接続

## 更新のしかた（月1運用）
- 文言修正：該当ファイルをAIに渡して「ここを直して」と依頼 → push → 自動デプロイ
- よく触る箇所：勉強会の次回日程（index.astro内「LOCAL」セクション）
