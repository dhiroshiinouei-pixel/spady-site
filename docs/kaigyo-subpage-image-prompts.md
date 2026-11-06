# 下層ページの追加イラスト（2026-11-07）

内蔵 image_gen.imagegen で3点を新規生成。実在する店舗・利用者の写真ではなく、開業準備を説明するためのコンセプトイラストです。FAVTOWNの素材、外部ストック写真、ロゴは使用していません。画像内に文字・ロゴがなく、各用途に合った構成と自然な人体であることを目視確認しました。

原寸は `design/kaigyo-generated/`、配信用は `public/akindo/kaigyo-assets/illustrations/` に保存。`scripts/prepare-kaigyo-illustrations.mjs` で幅1200/640pxのWebPへ縮小・圧縮のみ実施（画像内容の再編集なし）。既存の原本と配信画像は上書きしていません。

チェックリストは既存 `planning-desk-v2` を再利用し、スマートフォンでも表示します。各ページのSVGアイコンは既存の `ToolGlyph.astro` を同じ線・配色で拡張。文字ラベルと併用し、装飾SVGは支援技術から隠しています。

## 最終生成プロンプトと保存先

### diagnosis-planning-v3

- 原寸：`design/kaigyo-generated/diagnosis-planning-v3.png`
- 配信：`public/akindo/kaigyo-assets/illustrations/diagnosis-planning-v3.webp`（1200×800）
- 小画面：`public/akindo/kaigyo-assets/illustrations/diagnosis-planning-v3-640.webp`（640×427）

```text
Use case: illustration-story. Asset type: original supporting editorial illustration for AKINDO Lab, a practical Japanese small-business preparation website. Style/medium: sophisticated Japanese illustrated magazine art, fine confident dark ink outlines, subtle printed paper grain, adult human proportions, detailed but calm. Warm cream #f7f6f0, forest #244c3d, mustard #ecc04b, restrained muted coral, pale natural wood. Warm morning daylight. Composition landscape 3:2, clear central focal point, coherent perspective, recognizable even as a compact website image. Entire illustration without UI or text overlays. No letters, no numbers, no logos, no watermark; blank signs and screens with abstract shapes only. Original invented conceptual scene, not a real business photograph. Primary request: A Japanese independent shop owner, adult woman in a simple forest-green cardigan, calmly comparing three paper idea cards on a wooden table in a bright modest home workspace. One card shows a simple small storefront sketch, another a calendar grid, another an unlettered payment terminal drawing. She has one hand holding a card, her other hand rests beside an open notebook with a few blank checkboxes. A small laptop sits open off to the side, showing only three colored abstract blocks. Add a tiny plant and warm cup. Her engaged expression conveys choosing only what her own business needs, without overwhelm. A thoughtfully arranged practical planning moment, no consultant or implied testimonial. Hands anatomically natural; objects spaced clearly; make cards and owner the main subjects.
```

### tools-workbench-v3

- 原寸：`design/kaigyo-generated/tools-workbench-v3.png`
- 配信：`public/akindo/kaigyo-assets/illustrations/tools-workbench-v3.webp`（1200×800）
- 小画面：`public/akindo/kaigyo-assets/illustrations/tools-workbench-v3-640.webp`（640×427）

```text
Use case: illustration-story. Asset type: original supporting editorial illustration for AKINDO Lab, a practical Japanese small-business preparation website. Style/medium: sophisticated Japanese illustrated magazine art, fine confident dark ink outlines, subtle printed paper grain, adult human proportions, detailed but calm. Warm cream #f7f6f0, forest #244c3d, mustard #ecc04b, restrained muted coral, pale natural wood. Warm morning daylight. Composition landscape 3:2, clear central focal point, coherent perspective, recognizable even as a compact website image. Entire illustration without UI or text overlays. No letters, no numbers, no logos, no watermark; blank signs and screens with abstract shapes only. Original invented conceptual scene, not a real business photograph. Primary request: A welcoming small independent shop counter, arranged like a calm practical workbench of business tools. Center a small open laptop displaying a simple unlettered storefront outline and colored blocks. To one side a compact card payment terminal and plain bank card; to the other a standing phone with a simple unbranded calendar grid and two speech-bubble shapes. In front an open cream ledger with short unlettered lines and a pen, a small blank calendar, a neatly wrapped parcel. A tiny plant and pale wooden shelves softly anchor the real shop setting. No people. Make each object distinct and useful, not a cluttered pile or abstract floating icons; sensible scale and perspective. Calm minimal warm arrangement that communicates accounting, reservations, payment, communication and online shop working together.
```

### salon-preparation-v3

- 原寸：`design/kaigyo-generated/salon-preparation-v3.png`
- 配信：`public/akindo/kaigyo-assets/illustrations/salon-preparation-v3.webp`（1200×800）
- 小画面：`public/akindo/kaigyo-assets/illustrations/salon-preparation-v3-640.webp`（640×427）

```text
Use case: illustration-story. Asset type: original supporting editorial illustration for AKINDO Lab, a practical Japanese small-business preparation website. Style/medium: sophisticated Japanese illustrated magazine art, fine confident dark ink outlines, subtle printed paper grain, adult human proportions, detailed but calm. Warm cream #f7f6f0, forest #244c3d, mustard #ecc04b, restrained muted coral, pale natural wood. Warm morning daylight. Composition landscape 3:2, clear central focal point, coherent perspective, recognizable even as a compact website image. Entire illustration without UI or text overlays. No letters, no numbers, no logos, no watermark; blank signs and screens with abstract shapes only. Original invented conceptual scene, not a real business photograph. Primary request: Inside an intimate one-person Japanese salon before opening, an adult Japanese woman owner in a forest-green apron thoughtfully prepares a small wooden reception counter. She arranges a neatly folded towel with one natural hand while checking an open appointment notebook with the other nearby. On the counter: a simple unbranded payment terminal, a standing smartphone with an abstract calendar grid, a few tidy capped bottles and a small vase. In the softly drawn background a simple salon chair and oval mirror, one plant and warm cream curtains. Show the achievable daily preparation behind welcoming a client; no client and no treatment being performed. Balanced wide composition with owner on one side and the useful tools on the other, clear central countertop scene, natural adult anatomy, quiet professional warmth.
```
