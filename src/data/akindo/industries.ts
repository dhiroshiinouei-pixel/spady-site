export type Industry = {
  slug: string;
  name: string;
  description: string;
  href: string;
  status: 'published' | 'preparing';
};

export const industries: Industry[] = [
  { slug: 'salon', name: 'ひとりサロン', description: '予約・接客・再来店を、一人でも回る流れに。', href: '/akindo/kaigyo/start/salon/', status: 'published' },
  { slug: 'restaurant', name: '小さな飲食店', description: 'お店の準備から、見つけてもらう導線まで。', href: '/akindo/kaigyo/checklist/', status: 'preparing' },
  { slug: 'bodywork', name: '整体・施術所', description: 'サービスに合う手続きと予約方法を確認。', href: '/akindo/kaigyo/checklist/', status: 'preparing' },
  { slug: 'school', name: '教室・スクール', description: '体験の申込みから、続けて通える仕組みへ。', href: '/akindo/kaigyo/checklist/', status: 'preparing' },
  { slug: 'visit', name: '訪問サービス', description: '対応エリアと問い合わせの窓口を整える。', href: '/akindo/kaigyo/checklist/', status: 'preparing' },
  { slug: 'shop', name: 'ネットショップ', description: '商品を届ける準備と、買える場所を用意。', href: '/akindo/kaigyo/checklist/', status: 'preparing' },
];
