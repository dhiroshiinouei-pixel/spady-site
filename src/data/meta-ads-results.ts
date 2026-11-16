/**
 * 2026-11-15に本人から共有された、過去のMeta広告運用支援の事例。
 * 人材系サービスの指標は「問い合わせ」と本人確認済み。
 * 初期設定サービスの提供実績として扱わず、期間・予算などを補完しない。
 */
export const metaAdsResults = {
  eyebrow: '過去のMeta広告運用支援の事例',
  heading: ['これまでの', '広告支援の実績。'],
  note: '過去のMeta広告運用支援の事例です。本初期設定サービスの成果を示すものではなく、同様の結果を保証するものではありません。',
  cases: [
    {
      industry: '飲食店',
      icon: 'restaurant',
      metric: '予約満席',
      value: '2',
      unit: 'か月先まで',
      before: null,
      accessibleResult: '2か月先まで予約満席',
    },
    {
      industry: 'SaaS',
      icon: 'software',
      metric: 'リード獲得',
      value: '7',
      unit: '倍',
      before: null,
      accessibleResult: 'リード獲得7倍',
    },
    {
      industry: '食品サブスク',
      icon: 'package',
      metric: '登録',
      value: '2.5',
      unit: '倍',
      before: null,
      accessibleResult: '食品サブスクの登録2.5倍',
    },
    {
      industry: '人材系サービス',
      icon: 'people',
      metric: '月間問い合わせ',
      value: '3',
      unit: '件',
      before: '0',
      accessibleResult: '月間の問い合わせ0件から3件',
    },
  ],
} as const;
