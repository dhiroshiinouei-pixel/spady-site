/**
 * 2026-11-15に本人から共有されたAKINDO Labの活動・参加者の個別事例。
 * 数値の期間・平均・対象人数や、Meta広告との因果関係は補完しない。
 */
export const metaAdsActivity = {
  eyebrow: '地域での活動',
  heading: ['小樽で自主開催する、', 'AKINDO Lab。'],
  description: 'Spadyは、小樽で「AKINDO Lab」を自主開催しています。参加者の変化や、寄せられた報告をご紹介します。',
  image: {
    src: '/meta-ads-setup/akindo-lab-seminar.jpg',
    alt: '小樽で自主開催しているAKINDO Labの会場風景',
    caption: '小樽で開催するAKINDO Labの様子',
    width: 1280,
    height: 960,
  },
  followers: {
    label: '参加者のThreadsフォロワー',
    value: '1,000',
    unit: '人以上',
    change: '増加した事例',
    accessibleResult: '参加者のThreadsフォロワーが1,000人以上増加した事例',
  },
  reservation: {
    label: '参加者からの報告',
    text: '予約が取れるようになった、という報告も寄せられています。',
  },
  note: '参加者の個別の事例・報告です。本初期設定サービスの成果を示すものではなく、同様の成果を保証するものではありません。',
  link: {
    label: 'AKINDO Labについて',
    href: '/akindo/',
  },
} as const;
