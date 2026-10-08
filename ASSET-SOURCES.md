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

## 2026-10-08 crystal / real-time 3D revision

- `src/vendor/three/three.core.min.js` / `three.module.min.js`: Three.js r180のMITライセンス原本を同梱。著作権表示・ライセンス全文は `src/vendor/three/LICENSE` に保持。出典：https://github.com/mrdoob/three.js/tree/r180 。実行時に外部CDNへ接続する構成ではありません。
- `src/scripts/crystal-geometry.ts` / `crystal-material.ts` / `crystal-scene.ts`: Spady向けに制作したオリジナルの89面の結晶ジオメトリと描画処理。屈折、色の分離、最大3回の内部反射を扱うシェーダを使用し、WebGLで実際に回転させています。実在する宝石やTSGのモデルを複製したものではありません。
- `public/home/crystal-hero.webp` / `crystal-map.webp` / `crystal-line.webp`: 上記WebGLシーンの実際のレンダリングから作成した静止画フォールバック。生成AI画像ではありません。WebGLを使用できない場合や初期表示にも結晶のビジュアルを保持するための素材です。
- `src/scripts/home-play.ts` のミッション内SVGキャラクター：今回制作したオリジナル。タップへの反応とまばたきを実装。TSGの画像・キャラクター・コードは流用していません。
- `public/home/spady-social.png` / `.svg`: OGPを新しいクリスタルのレンダリング素材に更新。Spadyの既存ロゴとオリジナルの文字組みを組み合わせ、`scripts/render-social.mjs` で1200×630に出力します。
- 前節の赤いS状の3D画像・生成プロンプトは制作履歴として保持していますが、今回の新トップページでは使用していません。今回の結晶素材と、以前の生成AIによる3Dコンセプト画像は制作方法が異なります。
- TSG公式サイト https://www.tsg-jpn.co.jp/ は、結晶の質感・多色使い・親しみのある動きの参考として確認。参照先の素材を本サイトの配信ファイルへ転用していません。
