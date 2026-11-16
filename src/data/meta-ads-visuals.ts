/** 説明図の補助コピー。提供範囲の詳細は meta-ads-setup.ts の supports を参照。 */
import { metaAdsSetup as service } from './meta-ads-setup';

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
    notes: ['コードのお渡しだけでは、Webサイト上の計測は始まりません。', `${service.pixelLectureNote}${service.pixelLectureCondition}`],
  },
  {
    kind: 'lesson',
    title: '画面を共有して、一緒に操作',
    notes: ['納品後の継続サポートは含まれません。追加の支援は別途ご相談ください。'],
  },
  {
    kind: 'check',
    title: '配信前に、一つずつ確認',
    notes: ['計測は、設定済み・未設定の範囲をご説明します。標準の配信前チェックに、Pixel実装テスト・コンバージョン計測の検証は含みません。レクチャーで行う作業・確認の範囲は事前にご案内します。'],
  },
  {
    kind: 'guide',
    title: '後から、基本操作を振り返る',
    notes: ['共通の操作ガイドです。個別マニュアルの制作・無期限の更新対応は含みません。'],
  },
] as const;

export type SupportVisualKind = (typeof supportVisuals)[number]['kind'];
