# Spady ホームページ

Astro + Cloudflare Pages。GitHub main への push で既存の spady-site に公開。

## ページ
- /: 総合ホームページ
- /fullfunnelmarketing/: 従来の集客・採用LP
- /contact/: 問い合わせフォーム
- /contact/thanks/: 送信完了（noindex）
- /akindo/, /en/, /ryugaku/: 既存ページを維持

## 主要ソース
- src/layouts/HomeLayout.astro: 共通ナビ・メタ情報
- src/pages/index.astro: ホームページ
- src/styles/home.css, motion.css: レイアウトと演出
- src/scripts/home-motion.ts: スクロール・押下・回転演出。OSの動きを減らす設定と停止ボタンに対応
- functions/api/contact.js: フォーム検証とLark通知

## Lark
既存Pages環境のシークレット LARK_WEBHOOK を使用。通知先URLをソースへ保存しない。
LarkのHTTPステータスと応答内の code / StatusCode を確認し、失敗時はエラーを返す。
新しい問い合わせフォームは問い合わせ内容・同意を必須とする。既存英語・留学フォームのフィールド形式も受け付ける。
送信内容をアクセスログへ記録しない。

## 検証
npm run build
node --test test/contact.test.mjs

## アセット
public/home/coastal-neighborhood.png は海辺の街を着想源にしたAI生成の概念イラスト（実在の景観写真ではありません）。
public/home のアイコンの出典は ASSET-SOURCES.md に記載。
