# AKINDO Lab 開業準備：オリジナル画像の制作記録

制作日: 2026-11-06

## 制作方法と表示上の扱い

- 内蔵 `image_gen.imagegen` を使用。CLI/API キー経由ではありません。
- 3点とも今回新規生成した、架空の商店・準備作業・サロンを描く**コンセプトイラスト**です。実在店舗・実績・利用者写真として扱いません。
- FAVTOWN の写真、イラスト、ロゴ、その他の素材は使用していません。
- ユーザー提供写真の改変・上書きはしていません。
- 出力を目視確認し、画像内に読める文字・ブランドロゴがなく、自然な人体と用途を伝える構成であることを確認しました。
- 原寸 PNG は下記 `design/` にコピー保存。内蔵ツールの元出力は削除していません。
- 配信用 WebP は Sharp による幅変更・圧縮のみ（再描画なし）。幅1200pxと640px、品質85、effort 6。デスクトップ1200×800、モバイル640×427。
- コード側では `srcset` と `sizes` を設定し、写真ではなくイラストであることが伝わる代替テキストを使用します。

## 成果物

| 用途 | 配信用 | モバイル用 | 原寸保存 |
|---|---|---|---|
| 商いの街／トップ | `public/akindo/kaigyo-assets/illustrations/merchant-town-v2.webp` | `public/akindo/kaigyo-assets/illustrations/merchant-town-v2-640.webp` | `design/kaigyo-generated/merchant-town-v2.png` |
| 準備ノート／チェックリスト・診断 | `public/akindo/kaigyo-assets/illustrations/planning-desk-v2.webp` | `public/akindo/kaigyo-assets/illustrations/planning-desk-v2-640.webp` | `design/kaigyo-generated/planning-desk-v2.png` |
| ひとりサロン | `public/akindo/kaigyo-assets/illustrations/salon-scene-v2.webp` | `public/akindo/kaigyo-assets/illustrations/salon-scene-v2-640.webp` | `design/kaigyo-generated/salon-scene-v2.png` |

## 最終プロンプト

### 1. merchant-town-v2

```text
Use case: illustration-story
Asset type: main website hero illustration for a friendly, practical Japanese small-business preparation service.
Primary request: an original polished editorial illustration of an intimate small Japanese neighborhood shopping street coming to life, with three modest independent storefronts: a one-person salon, a tiny coffee shop, and a craft shop. Adult Japanese owners are preparing to open: one owner opens a door, one sets down a small outdoor plant, another welcomes a customer. A few customers walk naturally along the pavement. Show ordinary achievable small businesses, warm human connection, a calm optimistic morning.
Style/medium: sophisticated contemporary Japanese illustrated magazine, fine confident dark-ink outlines, subtle printed paper grain, carefully drawn architecture and expressive adult people, flat textured shapes. Warm, elegant, lived-in, not childish clip art, not a photograph.
Composition/framing: landscape 3:2, complete balanced scene of three side-by-side compact storefronts in gentle slightly oblique perspective; storefronts and people fill most of the image with a clean pale surrounding margin. Human scale, enough useful detail to recognize a salon chair and mirror, cafe counter, and craft display through windows. No floating UI panels. Image will be displayed whole without overlaid text.
Color palette: warm cream #f7f6f0 ground, deep forest #244c3d and dark ink outlines, mustard #ecc04b awnings and accents, restrained muted coral and pale natural wood.
Lighting/mood: warm natural daylight, welcoming, quiet activity, trustworthy and practical.
Text: no text at all; all hanging shop signs blank; no letters, no numerals.
Constraints: original invented conceptual scene; no identifiable real stores, no logos, no trademarks, no watermark; no English/Japanese lettering; not a recreation of any existing brand/site illustration. Natural hands/anatomy, adult people. Cohesive professional art suitable for a Japanese web service.
```

### 2. planning-desk-v2

```text
Use case: illustration-story
Asset type: supporting website illustration for a practical Japanese small-business opening-preparation service.
Primary request: an original polished editorial illustration of a small-business owner's hands calmly planning at a natural-wood desk. An open notebook occupies the center, with a few simple unlettered hand-drawn check boxes, two subtly checked in ink, alongside loose blank pastel memo cards. On the desk: a small cream calculator with blank keys and blank display, a few yen-like coins without recognizable lettering or numerals, a small desk calendar with a blank abstract date grid, a good pen, cup of tea and tiny leafy plant. The owner's two anatomically natural adult hands are visible entering the bottom of the scene, one holding the pen above the notebook. Suggest manageable preparation, not paperwork overload.
Style/medium: sophisticated contemporary Japanese illustrated magazine, confident fine dark-ink outlines, subtle printed paper grain, hand-drawn natural objects, warm flat textured colors. Detailed and quietly beautiful, not photorealistic, not childish clipart.
Composition/framing: landscape 3:2, slightly oblique overhead view, balanced desk still-life filling most of image with a clean cream margin, one clear notebook focal point, ample breathing room.
Color palette: warm cream #f7f6f0 ground, deep forest #244c3d and dark ink lines, mustard #ecc04b accents, restrained muted coral, natural pale wood. Match a warm neighborhood storefront editorial illustration.
Lighting/mood: gentle natural morning daylight, approachable, practical, hopeful.
Text: absolutely no text; no letters or numerals in notebook, calendar, calculator, or coins. Checkboxes can be blank or ticked; no chart or floating UI.
Constraints: no logos, no trademarks, no watermark, no photographic realism. This is a conceptual original scene, not any real user's progress. Objects and hands must be anatomically and spatially coherent.
```

### 3. salon-scene-v2

```text
Use case: illustration-story
Asset type: industry-guide hero illustration for a Japanese small-business opening-preparation website, matching a refined editorial illustration series.
Primary request: an original inviting editorial scene inside a modest one-person beauty and nail salon in Japan. An adult Japanese woman owner in an understated forest-green apron is warmly consulting a seated adult Japanese woman client at a small natural-wood consultation table. Both are relaxed and listening, natural expressions and hands, professional without a luxury feeling. This is a small achievable business. Behind them: a simple beauty chair with mirror, neatly arranged bottles, one leafy plant, a compact reception counter holding an open appointment notebook and a resting mobile phone. A tall window lets in warm daylight; a subtle mustard fabric accent and cream plaster walls.
Style/medium: sophisticated contemporary Japanese illustrated magazine, fine confident dark-ink outlines, subtle textured printing/paper grain, carefully drawn interior architecture and expressive adult people, warm hand-drawn flat textured color. More editorial narrative than childish clipart; no photographic realism.
Composition/framing: landscape 3:2, eye-level slightly oblique wide view of the whole intimate salon, owner and client central, helpful recognizable surroundings, balanced with calm breathing room. Human scale, coherent perspective. Friendly face-to-face consultation; no medical procedure, no needles, no invasive treatment.
Color palette: warm cream #f7f6f0, deep forest #244c3d, mustard #ecc04b, restrained muted coral and pale natural wood, dark ink. Quiet harmonious warmth.
Lighting/mood: warm natural daylight; welcoming, trustworthy, ordinary and achievable.
Text: no text anywhere. No letters/numerals on bottles, notebook or mobile screen; blank shapes only.
Constraints: original invented conceptual scene, no identifiable real salon, no logos, no brands, no watermark, no real-business claim. Natural adult anatomy, no oversize cartoon heads.
```
