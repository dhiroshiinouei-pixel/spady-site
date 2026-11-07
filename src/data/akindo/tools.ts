import type { ServiceBrandId } from './brands';

export type ToolCategoryId = 'accounting' | 'banking' | 'payment' | 'reservation' | 'line' | 'website' | 'google' | 'instagram' | 'crm' | 'shop';

export type ToolCategory = {
  id: ToolCategoryId;
  name: string;
  description: string;
  bestFor: string;
  timing: string;
  icon: 'map' | 'line' | 'web' | 'ads' | 'flow';
};

export type ToolItem = {
  slug: string;
  brand?: ServiceBrandId;
  name: string;
  category: ToolCategoryId;
  shortDescription: string;
  bestFor: string[];
  notFor: string[];
  timing: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  pricingNote: string;
  freePlan: boolean | null;
  officialUrl: string | null;
  affiliateUrl: string | null;
  sponsored: boolean;
  /** Official URL/service overview verification date; not a price or plan audit. */
  lastVerified: string | null;
  status: 'published' | 'draft' | 'checking';
};

export const toolCategories: ToolCategory[] = [
  { id: 'accounting', name: '会計', description: '売上と経費を、日々記録する。', bestFor: 'お金の流れを整理したい方', timing: '最初の支出が生まれる前', icon: 'web' },
  { id: 'banking', name: '銀行・カード', description: '生活と事業のお金を分ける。', bestFor: '入出金を見通したい方', timing: '取引を始める前', icon: 'flow' },
  { id: 'payment', name: '決済', description: 'お客さまの「払いたい」に応える。', bestFor: '店頭や対面で販売する方', timing: '開業前・審査期間も確認', icon: 'line' },
  { id: 'reservation', name: '予約', description: '空き時間と予約をひとつに。', bestFor: '施術・相談・教室を営む方', timing: '予約の受付を始める前', icon: 'web' },
  { id: 'line', name: 'LINE', description: '来店後も、ほどよくつながる。', bestFor: '再来店やお知らせを届けたい方', timing: '開業前から少しずつ', icon: 'line' },
  { id: 'website', name: 'ホームページ', description: 'メニューと予約先をまとめる。', bestFor: '信頼できる案内先が必要な方', timing: '開業告知を出す前', icon: 'web' },
  { id: 'google', name: 'Google', description: '近くで探している人に届ける。', bestFor: '対面でサービスを提供する方', timing: '営業場所や時間が決まったら', icon: 'map' },
  { id: 'instagram', name: 'Instagram', description: '商いの雰囲気や得意を伝える。', bestFor: '写真や短い動画で伝えたい方', timing: '準備の様子を伝えるときから', icon: 'ads' },
  { id: 'crm', name: '顧客管理', description: '次の接客に役立つ記録を残す。', bestFor: '一人ひとりに合わせたい方', timing: '最初のお客さまを迎える前', icon: 'flow' },
  { id: 'shop', name: 'ネットショップ', description: '注文から発送までを整える。', bestFor: '商品をオンラインで販売する方', timing: '商品・送料・配送が決まったら', icon: 'web' },
];

const pricingNote = '料金・手数料・無料プランの有無や条件は、公式サイトで確認してください。';
const verified = '2026-11-06';
const base = { affiliateUrl: null, sponsored: false, freePlan: null, pricingNote } as const;

/** Candidates, not rankings. Add a record to add a tool to the catalog. */
export const tools: ToolItem[] = [
  { ...base, slug: 'freee', brand: 'freee', name: 'freee会計', category: 'accounting', shortDescription: '日々の取引の記録から申告準備までを支える、クラウド会計の選択肢。', bestFor: ['売上や経費をまとめて管理したい方', '銀行・カードの明細連携を検討している方'], notFor: ['税理士などと、すでに別の会計方法を決めている方'], timing: '開業準備の支出を記録するときから', difficulty: 'medium', officialUrl: 'https://www.freee.co.jp/accounting/individual/', lastVerified: verified, status: 'published' },
  { ...base, slug: 'business-account', name: '事業用の銀行口座・カード', category: 'banking', shortDescription: '事業の入出金を生活費と分けて管理するための準備。まずは利用中の金融機関の条件から確認しましょう。', bestFor: ['事業のお金を分けて把握したい方', '会計との連携や入金先を整理したい方'], notFor: ['新しい口座やカードを作ること自体が目的になっている方'], timing: '売上の入金や仕入れを始める前', difficulty: 'medium', pricingNote: '口座の事業利用可否、開設条件、振込手数料、カード年会費を各金融機関で確認。特定の金融商品は推奨していません。', officialUrl: null, lastVerified: null, status: 'checking' },
  { ...base, slug: 'square', brand: 'square', name: 'Square', category: 'payment', shortDescription: 'キャッシュレス決済やPOSレジを整えるための選択肢。利用する決済手段から確認できます。', bestFor: ['店頭・対面で支払いを受けたい方', '決済と売上管理をまとめたい方'], notFor: ['対面決済を行わず、既存の販売先で決済が完結する方'], timing: '開業前に、審査・機器・入金条件を確認', difficulty: 'medium', officialUrl: 'https://squareup.com/jp/ja', lastVerified: verified, status: 'published' },
  { ...base, slug: 'stores-reserve', brand: 'stores', name: 'STORES 予約', category: 'reservation', shortDescription: '予約ページを用意し、お客さまの申込みと空き時間を管理するための選択肢。', bestFor: ['DMの往復を減らして予約を受けたい方', 'サービスごとに予約枠を分けたい方'], notFor: ['予約を受け付けない商い', '現在の予約方法で無理なく運営できている方'], timing: '開業告知で予約を受け付ける前', difficulty: 'medium', officialUrl: 'https://stores.fun/reserve', lastVerified: verified, status: 'published' },
  { ...base, slug: 'line-official', brand: 'line', name: 'LINE公式アカウント', category: 'line', shortDescription: '友だちになったお客さまへ、お知らせや再来店のきっかけを届けるための窓口。', bestFor: ['来店後のお知らせを届けたい方', '問い合わせの窓口を整理したい方'], notFor: ['配信や返信を続ける時間がまだ取れない方'], timing: '案内内容と返信のルールが決まったら', difficulty: 'easy', officialUrl: 'https://www.lycbiz.com/jp/service/line-official-account/', lastVerified: verified, status: 'published' },
  { ...base, slug: 'studio', brand: 'studio', name: 'Studio', category: 'website', shortDescription: 'メニュー・場所・予約先をまとめたWebサイトを、コードを書かずに制作する選択肢。', bestFor: ['自分で案内ページを作り更新したい方', '文章や写真をまとめる時間を確保できる方'], notFor: ['制作や更新の時間が取れず、運用を任せたい方'], timing: 'メニューと予約の窓口が決まったら', difficulty: 'medium', officialUrl: 'https://studio.design/ja', lastVerified: verified, status: 'published' },
  { ...base, slug: 'google-business', brand: 'google-business', name: 'Googleビジネスプロフィール', category: 'google', shortDescription: 'Google検索やマップ上で、店舗の基本情報や写真を案内するための窓口。', bestFor: ['来店型・訪問型など対面でサービスを提供する方'], notFor: ['オンラインのみで営業する事業など、利用条件を満たさない方'], timing: '所在地・サービス範囲・営業時間が決まったら', difficulty: 'medium', officialUrl: 'https://business.google.com/jp/business-profile/', lastVerified: verified, status: 'published' },
  { ...base, slug: 'instagram', brand: 'instagram', name: 'Instagram', category: 'instagram', shortDescription: '写真や動画で、お店の雰囲気・メニュー・仕事への姿勢を伝えるための窓口。', bestFor: ['写真や動画で商いの魅力を伝えたい方', '投稿から予約先への流れを作りたい方'], notFor: ['無理なく続けられる発信方法がほかにある方'], timing: '準備中から。まずはプロフィールと予約先を整理', difficulty: 'easy', pricingNote: '機能・広告料金などは公式情報で確認してください。公式ビジネスページはログインが必要な場合があります。', officialUrl: 'https://business.instagram.com/', lastVerified: verified, status: 'checking' },
  { ...base, slug: 'customer-sheet', brand: 'google-sheets', name: 'Google スプレッドシート', category: 'crm', shortDescription: '必要な項目だけで管理表を作る選択肢。専用の顧客管理機能が必要か考える出発点にも。', bestFor: ['少ない件数から記録項目を整理したい方', '共有範囲や管理方法を自分で設定できる方'], notFor: ['細かな権限管理や予約との自動連携が必要な方', '機微な情報を扱い、専門的な管理要件がある方'], timing: '保存する情報と閲覧できる人を決めたあと', difficulty: 'medium', officialUrl: 'https://workspace.google.com/intl/ja/products/sheets/', lastVerified: verified, status: 'published' },
  { ...base, slug: 'shopify', name: 'Shopify', category: 'shop', shortDescription: 'オンラインストアを用意し、商品・注文・販売をまとめて管理するための選択肢。', bestFor: ['自分のネットショップで商品を販売したい方', '発送や問い合わせ対応まで準備できる方'], notFor: ['対面サービスのみで商品を販売しない方', 'まずは少量の販売で需要を確かめたい方'], timing: '商品・送料・返品条件・配送体制が決まったら', difficulty: 'medium', officialUrl: 'https://www.shopify.com/jp', lastVerified: verified, status: 'published' },
];
