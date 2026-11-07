# AKINDO Lab 開業準備：公式ブランド素材

確認日：2026-11-07

公式の配布ページ・ブランドキット・製品サイトから取得した素材の記録です。サービスを識別するために使用し、提携・推奨・協賛を示すものではありません。会計や予約など、特定の製品を示さないカテゴリには汎用アイコンを使います。

配信用素材は `public/akindo/kaigyo-assets/brands/`、大きな原本や未使用素材は `design/akindo/brand-sources/` に保管します。後者は公開サイトの出力に含めません。第三者のロゴ配布サイト、生成画像、描き直したロゴは使っていません。

## 掲載用素材

| サービス | 配信用ファイル | 公式の出典と原本 |
| --- | --- | --- |
| Instagram | `instagram-glyph-gradient-160.png` | [Meta Brand Resource Center](https://www.meta.com/brand/resources/instagram/instagram-brand/) の `IG_brand_asset_pack_2023.zip` → `01 Static Glyph/01 Gradient Glyph/Instagram_Glyph_Gradient.png` |
| LINE公式アカウント | `line-brand-icon-160.png` | [LINE ロゴガイドライン](https://www.line.me/ja/logo) の [LINE_Brand_icon.zip](https://www.line.me/static/logo/top/LINE_Brand_icon.zip) → `LINE_Brand_icon.png` |
| freee会計 | `freee-accounting.svg` | [freee Resources](https://brand.freee.co.jp/resources/) → 公開ロゴ配布フォルダ → RGB／プロダクト／freee会計 → [freee_kaikei_color.svg](https://drive.google.com/file/d/1UijX6QJIvta78y0-75HyLik0nKZTwJfX/view) |
| Square | `square-wordmark.svg` | [Square 公式プレス素材](https://squareup.com/us/en/press/logo) の [Square_Logo.zip](https://assets.ctfassets.net/2d5q1td6cyxq/3xNJXOyxBSmmJ1lUafqHGJ/0d3bcea3bf9426dbf9a54f424e3d1fab/Square_Logo.zip) → `Black/Square_Logo_2025_Black.svg` |
| STORES 予約 | `stores-web-wordmark.svg` | [STORES 予約 公式サイト](https://stores.fun/reserve) のヘッダー原本 [logo_stores_color.svg](https://stores.fun/images/logo_stores_color.svg)。使用条件は [ブランドキット](https://stores.fun/brand-assets) を参照 |
| Studio | `studio-wordmark.svg` | [Studio ブランドページ](https://studio.design/ja/brandbook) のヘッダー原本 [s-80x17_b5c1ab9c-6742-40f1-8fad-48d23bafba5b.svg](https://storage.googleapis.com/studio-design-asset-files/projects/BVqXjjLVWR/s-80x17_b5c1ab9c-6742-40f1-8fad-48d23bafba5b.svg) |
| Googleビジネスプロフィール | `google-business-profile.svg` | [公式製品ページ](https://business.google.com/jp/business-profile/) の [192px.svg](https://www.gstatic.com/images/branding/productlogos/google_my_business/v7/192px.svg)。原本を使用。個別承認は未取得（下記参照） |
| Google スプレッドシート | `google-sheets.svg` | [公式製品ページ](https://workspace.google.com/products/sheets/) の [2026 Q3版192px.svg](https://www.gstatic.com/images/branding/productlogos/sheets_2026q3/v1/web/192px.svg)。原本を使用。個別承認は未取得（下記参照） |

### 加工と寸法

- InstagramのグラデーションPNGとLINEのPNGは、原本を保管したうえで配信用に幅160pxへ等比縮小しています。色・形・透明部分を変更せず、切り抜き、描き直し、影の追加はしません。
- 配信用SVGは原本のままです。viewBoxは freee会計 `510.43 × 200`、Square `2000 × 501.43`、STORES `450.168 × 97`、Studio `80 × 17`。
- `object-fit: contain` と縦横比を維持し、周囲に空白を確保します。フィルターによる単色化、装飾背景への組み込み、回転、変形はしません。

### ブランドごとの確認事項

- **Instagram**：公式Static Glyphを使用します。自社ブランドより目立たせず、提携を示唆しません。現在取得できた公式ページでは数値による最小サイズ・余白を確認できませんでした。アイコン32px以上、四辺に幅の半分以上の余白を取る方針は、このサイト独自の設計基準であり、確認済みの公式規定とは区別します。
- **LINE**：[LY for Businessのロゴページ](https://www.lycbiz.com/jp/logo/) は、LINE公式アカウントの紹介にサービスロゴまたはLINEアプリアイコンを使えると案内しています。LINE@の旧アイコンは使いません。ブランドアイコンはモバイルで高さ40px以上、PCで20px以上。今回の表示は40px以上とし、四辺にアイコン幅の半分の余白を確保します。LINE原本は1001 × 1000pxです。
- **freee会計**：公式Resourcesから公開されている製品ロゴです。電卓・ツバメ・文字を分離せず、全体を表示します。具体的な最小サイズ・余白の数値は未確認です。
- **Square**：公式プレス素材は編集・報道用途です。今回の中立的なサービス紹介に使い、提携バッジにはしません。2025年版プレスロゴの数値による余白条件は未確認です。別途公開されている開発者向け連携ロゴの規定とは混同しません。
- **STORES**：メインロゴは基準サイズXに対し四辺X/2以上、シンボルはX/6以上の余白。公開ページの最小サイズは印刷用の数値であり、画面用の数値は示されていません。囲み、影、色変更、反転、変形、要素の追加は禁止されています。STORESのロゴとサービス名「STORES 予約」を並べ、ロゴに「予約」を描き足しません。
- **Studio**：現行の `/Studio` ロゴを公式ブランドページから取得しました。数値による余白・最小サイズや独立した公開配布キットは未確認です。公式ページ上の原本であることと、個別の利用許諾を取得したことは区別します。

## 使用許諾の確認事項

Googleの現在の公開案内は [Partner Marketing Hub](https://partnermarketinghub.withgoogle.com/brands/google/branding-guidelines/how-to-show-googles-brand/) に移行し、製品アイコンについて承認フォームでの申請を案内しています。今回の2素材は、公開UIでサービスを識別する解説に使用します。原本の出典は確認済みですが、この用途についてGoogleの個別承認は取得していません。出典確認と使用承認を混同せず、取得済みとは表示しません。提携・公式認定・推奨・協賛も表示しません。

## 未使用素材

| 素材 | 確認済みの出典 | 今回の扱い |
| --- | --- | --- |
| Shopify | [Shopify公式ブランド素材](https://www.shopify.com/brand-assets) | ガイドラインに書面許諾条件があるため、ロゴを取得・掲載せずサービス名を文字で表示 |
| LINE公式アカウント日本語ロゴ | [LY for Business](https://www.lycbiz.com/jp/logo/) の [LOA_forDigital_202604.zip](https://www.lycbiz.com/sites/default/files/media/jp/logo/img/line-official-account/LOA_forDigital_202604.zip) → `for Digital/Combination Logo/SVG/LINE_OACombinationLogo_1line_PrimaryBlack_JP_RGB.svg` | `line-official-account-wordmark.svg` を保管。カードではLINEブランドアイコンを使用。盾部分だけを切り出さない |
| Instagram黒グリフ | 同じ公式ZIPの `01 Static Glyph/03 Black Glyph/Instagram_Glyph_Black.svg` | `instagram-glyph-black.svg` を保管。現在はグラデーション版を使用 |
| STORESキット原本 | [stores-brand-kit.zip](https://stores.fun/downloads/stores-brand-kit.zip) → `stores_logo/stores_logo.svg`、`stores_symbol/stores_symbol.svg` | `stores-wordmark.svg`、`stores-symbol.svg` を保管。組み込まれた大きな余白を削らず、カードには公式Web用ロゴを使用 |

## 原本の照合情報

| 原本 | SHA-256 |
| --- | --- |
| InstagramグラデーションPNG | `21f86b55f986848665ce54ab354ff6b43b7705e6c421d90c04369882b5956766` |
| Instagram黒SVG | `a036f8197b3856b02d1e236e08dd1b50a4ed68cb148686beb274eabf29794d51` |
| LINEブランドPNG | `5e93437eb5ec0dcdece92d1562fcd435d1d521cca5c013d2d9e15b544a1d8a39` |
| GoogleビジネスプロフィールSVG | `9dfa724a7e8b1066a83cbd487cf6b4177cb477d3589322c98eeb2d4dc5847bb9` |
| Google スプレッドシートSVG | `3dd989706d03cf9ed780beb45af592bb46aa777edcc18543ea0764463ec936d2` |

PNG縮小版のハッシュは原本とは異なります。配布元の規約やロゴは更新されるため、差し替え時には上記公式ページで再確認してください。
