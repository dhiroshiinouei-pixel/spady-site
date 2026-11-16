/** 説明図の補助コピー。提供範囲の詳細は meta-ads-setup.ts の supports を参照。 */
export const supportVisuals = [
  {
    kind: 'accounts',
    title: 'アカウントをつなぐ',
    notes: ['Facebook個人アカウントとFacebookページは、お客様が事前にご用意ください。'],
  },
  {
    kind: 'ad',
    title: '素材を、最初の広告へ',
    notes: ['画像または動画1点と広告文は、お客様にご用意いただきます。', '公開・費用が発生する操作は、お客様の承認後に行います。'],
  },
  {
    kind: 'pixel',
    title: '',
    notes: ['コードのお渡しだけでは、Webサイト上の計測は始まりません。', 'サイトへの設置・イベント設定・動作確認は別料金です。GTMへの実装も標準範囲外です。'],
  },
  {
    kind: 'lesson',
    title: '画面を共有して、一緒に操作',
    notes: ['納品後の継続サポートは含まれません。追加の支援は別途ご相談ください。'],
  },
  {
    kind: 'check',
    title: '配信前に、一つずつ確認',
    notes: ['計測は、設定済み・未設定の範囲をご説明します。Pixel実装テスト・コンバージョン計測の検証は含みません。'],
  },
  {
    kind: 'guide',
    title: '後から、基本操作を振り返る',
    notes: ['共通の操作ガイドです。個別マニュアルの制作・無期限の更新対応は含みません。'],
  },
] as const;

export type SupportVisualKind = (typeof supportVisuals)[number]['kind'];
