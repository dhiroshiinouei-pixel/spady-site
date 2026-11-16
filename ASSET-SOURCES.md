# Homepage assets

## AKINDO Lab 開業準備：公式サービスロゴ（2026-11-07）

- Instagram、LINE、Googleビジネスプロフィール、Google スプレッドシート、freee会計、Square、STORES、Studioの公式サイト・配布素材をサービスの識別に使用。
- 配信用素材は `public/akindo/kaigyo-assets/brands/`。PNGのみ幅160pxへ等比縮小し、SVGは原本のままです。色・形の変更、生成・トレースは行っていません。
- 取得元、原本の保管先、確認した使用条件、未取得の承認は [公式ブランド素材の記録](docs/akindo-brand-assets.md) を参照。
- 一般的な準備・機能には引き続きオリジナルの図解を使い、サービスを表す代用アイコンとは区別しています。

## AKINDO Lab 開業準備：全下層ページの画像・アイコン追加（2026-11-07）

- 診断の準備風景、開業ツールの作業台、サロンの開店準備の3点を内蔵imagegenで新規生成。実在店舗・利用者の写真ではないコンセプトイラストです。
- 原寸PNGは `design/kaigyo-generated/*-v3.png`、配信用1200px/640px WebPは `public/akindo/kaigyo-assets/illustrations/*-v3*.webp`。
- 正確な生成プロンプト・保存先・使用方法は [下層ページの制作記録](docs/kaigyo-subpage-image-prompts.md) を参照。
- `ToolGlyph.astro` は既存の配色・線幅に合わせてオリジナルSVGを拡張。全20チェック項目、診断の質問・結果、ツール選び、サロンの準備段階で文字と併用しています。

## 2026-11-06 AKINDO Lab 開業準備

- `public/akindo/kaigyo-assets/seminar.webp`：既存の所有素材 `public/akindo/assets/akindo-venue-20260722.jpg` を960×720のWebPにリサイズ。内容や人物の編集なし。
- `public/akindo/kaigyo-assets/social.svg` / `.png`：今回の独自タイポグラフィとチェックリストの概念図で作成した1200×630のOGP。実データではなく「利用イメージ」と明記。
- ヒーローの進捗カード・小さな商店の線画：オリジナルのHTML/CSS/インラインSVG。既存 `corporate/Icon.astro` も再利用。
- FAVTOWNは情報整理と視覚的な階層の参考のみ。素材・文章・コードは転用していません。新規の外部ストック写真・Webフォントは使用していません。初回実装後の改訂で追加した生成画像は、以下の制作記録に記載しています。

## 2026-10-22 AKINDO hero video

- `public/akindo/assets/akindo-hero-20261022.mp4`: User-provided `217753715.mp4`, used at the owner's request for the AKINDO first-view background. Original H.264 video samples retained without re-encoding; audio removed and MP4 metadata moved to the start for progressive playback. 960 x 600, 10.621 seconds, 2,096,689 bytes.
- `public/akindo/assets/akindo-hero-poster-20261022.jpg`: A frame at 1.0 second from the same supplied video, used before playback and as the reduced-motion / unavailable-playback fallback. No generated imagery.

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

## AKINDO Lab 開業準備：画像・図解の改善（2026-11-06）

- `public/akindo/kaigyo-assets/illustrations/`：内蔵imagegenで新規制作した商店街、準備ノート、サロンのコンセプトイラスト3点。1200px / 640px のWebPで配信。実在店舗・実績写真ではありません。
- 原寸PNG、正確な生成プロンプト、生成方法・用途は [制作記録](docs/kaigyo-image-prompts.md) に保存。
- `PreparationSketch.astro`、`ToolGlyph.astro`、`BusinessFlow.astro`：このサービスのために実装したオリジナルSVG・HTML図解。FAVTOWNの素材・装飾の転用なし。
- 既存の実際の勉強会写真 `seminar.webp` は引き続き「AKINDO Labの思想」で使用。

## Meta広告 初期設定サポート LP（2026-11-11）

- `public/meta-ads-setup/og.png`: Spady向けに独自制作した文字主体のOGP。`scripts/verify-meta-ads.mjs` 内のHTMLをローカルChromeで画像化。既存 `public/logo.png` を使用。
- LP本人写真: 既存 `public/profile.jpg` を継続使用。`/about/` と同じ代表者本人素材。
- 初期設定・広告入稿・操作説明の画面図: `src/pages/meta-ads-setup.astro` の独自HTML/CSS/SVG。実際のMeta管理画面や実績ではなく、画面イメージと可視表示。
- 参考2サイトの文章・画像・ロゴ・ソースコードは使用していません。

## Meta広告 LP：ファーストビュー・運用事例（2026-11-15）

- `public/meta-ads-setup/seminar-marketing.jpg`：今回ユーザーが添付した `1000011979.jpg`（1280×959）の原本を使用。マーケティングのセミナー風景であり、本サービスはオンライン提供であることをキャプションに明記。人物・背景の生成や編集なし。
- Spadyロゴは既存 `public/logo.png`、代表者紹介は既存 `public/profile.jpg` を継続使用。傾いた管理画面モックは現行ページに掲載していません。
- 4業種のMeta広告運用事例はユーザーが2026-11-15に提供した内容。人材系サービスの指標は同日の追記で「問い合わせ」と確認。顧客名・広告費・実施期間・証言・グラフは補完していません。
- `https://tsunaguinc.com/` は公開HTML・配信コンテンツによる情報階層の参考。見出し・実績数字・相談導線を早い位置で提示する構成を参照し、文章・画像・ロゴ・コードは転用していません。先方のコンバージョン実績はユーザーからの情報であり、解析データを独自検証したものではありません。

## Meta広告 LP：AKINDO Labの活動紹介（2026-11-15）

- `public/meta-ads-setup/akindo-lab-seminar.jpg`：ユーザー添付の `1000016043.jpg`（1280×960、109,982 bytes）をそのまま使用。画面にAKINDO Labが表示された実際の開催風景。人物・背景の編集や生成はしていません。
- 小樽での自主開催、参加者のThreadsフォロワーが1,000人以上増加した事例、予約が取れるようになったとの参加者報告は今回ユーザーが提供した情報。参加者全員の成果・平均値・Meta広告の運用成果・今回の初期設定サービスの実績としては掲載しません。未提供の期間・参加人数・本人の直接引用は追加していません。

## Meta広告 LP：サービス・操作・流れ・準備物の図解（2026-11-16）

- `ServiceVisual.astro`：6つの作業/提供物を表す独自SVGとHTML/CSS。文字はHTML、図内の内容は本文でも説明。実際のMeta管理画面・既存ガイドの画像ではありません。
- `LessonSection.astro`：管理画面の説明イメージ。数字の実績やMeta公式UIを再現しておらず、「操作画面のイメージ」と明示。
- `ProcessSection.astro`、`PreparationItems.astro`、`Icon.astro`：カレンダー、人物、書類、素材、コード、カード等の一般的な独自ピクトグラム。第三者サービスの認定マークや公式ロゴとして制作したものではありません。
- この改訂で新たな写真や生成人物を追加していません。本人提供のセミナー写真と既存本人写真を継続使用。参考サイトの画像・文章・コードの転用なし。

## Meta広告 LP：公式サービスアイコン・背景写真（2026-11-16）

- Facebook： [Meta Brand Resource Center — Facebook logo](https://www.meta.com/brand/resources/facebook/logo/) の現行配布 `Facebook-Brand-Asset-Pack.zip` → `Facebook Brand Asset Pack/Logo/Primary Logo/Facebook_Logo_Primary.png` を取得。原本は `design/meta-ads/brand-sources/facebook-logo-primary.png`（2084×2084、SHA-256 `2adfd474d91fd20c51084309ed000c1ae6cc7f5f70af14d375930f5a71301308`）。配信用 `public/meta-ads-setup/brands/facebook-logo-primary-160.png` は160×160へ等比縮小したものです。
- Instagram： [Meta Brand Resource Center — Instagram](https://www.meta.com/brand/resources/instagram/instagram-brand/) の公式 `IG_brand_asset_pack_2023.zip` に由来する既存 `public/akindo/kaigyo-assets/brands/instagram-glyph-gradient-160.png` を、`public/meta-ads-setup/brands/instagram-glyph-gradient-160.png` へ同一内容で配置。原本と取得履歴は [公式ブランド素材の記録](docs/akindo-brand-assets.md) を参照。
- `ServiceVisual.astro` と `PreparationItems.astro` のFacebookページ・Instagramの説明に上記原本由来の画像を使用。表示サイズは図内32×32px、準備物一覧28～32px、周囲16px以上の余白を確保し、色変更・変形・影・描き直しはしていません。サービス識別用であり、Spadyの認定・提携を示すマークではありません。
- ファーストビューの背景は既存 `public/meta-ads-setup/akindo-lab-seminar.jpg` を再配置。画像そのものの新たな加工はせず、CSSの `object-fit` / `object-position` と、文字を読みやすくするオーバーレイのみ使用。写真の原本・出典は前節のAKINDO Lab活動紹介と同じです。
