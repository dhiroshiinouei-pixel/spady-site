# Homepage assets

- `public/home/coastal-neighborhood.png`: Original AI-generated conceptual illustration created for Spady. Not a photograph of an actual location.
- `public/home/calendar.svg`: Bootstrap Icons calendar3, https://icons.getbootstrap.com/icons/calendar3/ — MIT; geometry unchanged, fill set to green.
- `public/home/megaphone.svg`: Bootstrap Icons megaphone, https://icons.getbootstrap.com/icons/megaphone/ — MIT; geometry unchanged, fill set to blue. License included in `public/home/bootstrap-icons-LICENSE.txt`.
- `public/home/line.svg`: Simple Icons LINE, https://github.com/simple-icons/simple-icons/blob/develop/icons/line.svg — CC0 1.0, geometry unchanged, brand green fill. LINE is the trademark of its respective owner. Icon used solely to identify the LINE contact link. https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md
- Other photographs and logos: existing Spady site assets, retained for the same business and activities.

## September 6, 2026 social previews
- `/home/otaru-calendar-og.jpg`: exact official OGP image from https://otaru.spady.net/assets/og-image-20260713.jpg, as specified in the live calendar og:image metadata. Reused at the owner's explicit request.
- `/og.png`: original generated Spady social card, using the provided brand logo and existing coastal illustration as references. Headline: 地域の魅力に、次のきっかけを。 Dimensions: 1200×630.

- `/home/threads.svg`: Threads brand icon from Simple Icons 16.0.0 (CC0-1.0), https://github.com/simple-icons/simple-icons/blob/16.0.0/icons/threads.svg. Matches the approved button preview.

## 2026-10-08 corporate renewal
- `public/home/spady-social.png` / `.svg`: Spadyロゴ（既存所有素材）と今回の3Dブランドビジュアルを使ったオリジナルのOGP。`scripts/render-social.mjs`で1200×630にレンダリング。実在顧客や製品画面の描写ではありません。
- `ProductArt.astro` / `Icon.astro`: 今回制作したSVG・CSSの概念図。Google・LINEの公式マーク、確定済み製品UIを模したものではありません。
- 小樽暮らしカレンダーの画像は従来どおり、同サービスの公開済みOGP画像を使用しています。

## 2026-10-08 3D visual revision
- `public/home/spady-sculpture.webp` / `spady-sculpture-600.webp`: Spady向けに新規生成した赤い曲線・ガラス・陶器の3Dコンセプト。既存ロゴの変更ではありません。
- `public/home/gbp-sculpture.webp` / `line-sculpture.webp`: 自社サービスの構想を表すオリジナル3Dコンセプト画像。公式サービスのロゴや実装済みの製品画面ではありません。
- Built-in image generationで制作。透過PNG原本と生成プロンプトは `design/3d-source/` に保存。WebPへの変換はサイズ・エンコードの最適化のみ。本文ではレスポンシブ画像・遅延読み込みを使用。
- TSG公式サイト https://www.tsg-jpn.co.jp/ は立体的な素材と余白のアートディレクションの参照のみ。画像・キャラクター・コードは流用していません。
