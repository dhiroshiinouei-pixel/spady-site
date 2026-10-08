/** Public catalog. A new entry automatically gets a detail page and a directory listing. */
export type ServiceStatus = 'planning' | 'developing' | 'preparing' | 'available' | 'ended';
export const statusLabels: Record<ServiceStatus, string> = { planning: '企画中', developing: '開発中', preparing: '公開準備中', available: '提供中', ended: '提供終了' };
export interface Service {
  id: string; name: string; nameParts?: string[]; shortName: string; category: 'product' | 'support';
  summary: string; tagline: string; audience: string[]; status: ServiceStatus;
  icon: 'map' | 'line' | 'ads' | 'web' | 'strategy'; image?: string; imageAlt?: string;
  detailUrl: string; pricing: { published: boolean; note: string }; externalUrl?: string;
  contactTopic: 'gbp' | 'mini-app' | 'marketing' | 'billing' | 'other';
  problems: string[]; features: { title: string; text: string }[];
  flow: { title: string; text: string }[]; faq: { q: string; a: string }[];
  notice?: string;
}
export const services: Service[] = [
  {
    id: 'google-business-profile', name: 'Googleビジネスプロフィール管理SaaS', nameParts: ['Google', 'ビジネスプロフィール', '管理SaaS'], shortName: '店舗情報の運用を、続けやすく。', category: 'product',
    tagline: '情報更新も、口コミへの対応も。日々の運用を支える仕組みへ。',
    summary: 'Googleビジネスプロフィールの店舗情報や口コミを、日々の業務の中で管理しやすくするクラウドサービスを企画しています。',
    audience: ['飲食店', '美容室・サロン', '整体院', '小売店', 'その他の店舗・小規模事業者'],
    status: 'planning', icon: 'map', detailUrl: '/services/google-business-profile/',
    pricing: { published: false, note: '料金・提供開始時期は未定です。決まり次第、このページでご案内します。' }, contactTopic: 'gbp',
    problems: ['営業時間や店舗情報の更新に手間がかかる。', '口コミの確認や返信に、まとまった時間を取りにくい。', '忙しくなると、日常的な運用が後回しになる。', '何から取り組めばよいか、判断しにくい。'],
    features: [
      { title: '口コミの確認・管理', text: '届いた口コミを確認し、対応状況を把握しやすくする機能を検討しています。' },
      { title: '返信の作成支援', text: '店舗らしい言葉で返信を考える作業を支援する仕組みを検討しています。自動返信の提供を約束するものではありません。' },
      { title: '店舗情報の管理', text: '営業時間や基本情報を整理し、更新の手間を減らす方法を検討しています。' },
      { title: '継続的な運用の支援', text: '日々の確認や対応を続けやすくする画面・運用フローを検討しています。' }
    ],
    flow: [ { title: 'サービス内容・料金を確認', text: '正式公開時に、利用条件や対応範囲を確認できるページを用意する構想です。' }, { title: '利用登録・店舗の連携', text: '必要な権限を確認し、店舗情報を連携する流れを検討しています。' }, { title: '日常の運用に活用', text: '導入後の案内や問い合わせ窓口を含め、無理なく使い続けられる体験を目指します。' } ],
    faq: [ { q: '今すぐ利用できますか？', a: '現在は企画・開発準備段階で、利用申し込みや決済の受付は行っていません。' }, { q: '料金と提供開始日は決まっていますか？', a: 'いずれも未定です。正式に決まり次第、サービス内容とあわせて掲載します。' }, { q: '掲載されている機能はすべて提供されますか？', a: 'いいえ。掲載内容は開発検討中の構想です。技術的な検証や店舗のニーズ、外部サービスの仕様により、内容を変更する場合があります。' }, { q: 'Googleの公式サービスですか？', a: 'いいえ。Spadyが独立して企画するサービスです。Googleによる提供、認定、推奨を受けたサービスではありません。' }, { q: '検索順位や口コミの増加は保証されますか？', a: '保証するものではありません。店舗情報の管理や日常的な運用を支援するサービスを目指しています。' } ],
    notice: '本サービスはSpadyが独立して企画しているもので、Googleが直接提供するサービスではありません。Googleによる認定・推奨を示すものでもありません。Google、GoogleマップおよびGoogleビジネスプロフィールはGoogle LLCの商標です。'
  },
  {
    id: 'line-mini-app', name: 'LINEミニアプリを活用した店舗向けサービス', nameParts: ['LINEミニアプリを活用した', '店舗向けサービス'], shortName: '来店前から、その次の来店まで。', category: 'product',
    tagline: 'お客さまとの接点と、店舗の業務を。使い慣れたLINEから。',
    summary: '予約・会員向けサービス・来店管理などを視野に、LINEミニアプリを活用した店舗向けサービスの構想を進めています。',
    audience: ['予約を受け付ける店舗', '会員向けサービスを提供する店舗', '再来店につなげたい小規模事業者'],
    status: 'planning', icon: 'line', detailUrl: '/services/line-mini-app/', pricing: { published: false, note: '料金・提供開始時期・対応機能は未定です。正式な内容は公開前にご案内します。' }, contactTopic: 'mini-app',
    problems: ['予約や来店の情報が複数の場所に分かれている。', '顧客管理を日々の業務に組み込みにくい。', '会員向けの案内を、使いやすい形で届けたい。', '接客以外の事務作業を、少しでも減らしたい。'],
    features: [ { title: '予約受付・予約管理', text: 'お客さまの予約と店舗側の管理をつなぐ用途を検討しています。対応業種や予約方式は未定です。' }, { title: '顧客・来店情報の管理', text: '店舗での対応に役立つ情報を、必要な範囲で管理する用途を検討しています。' }, { title: '会員向けサービス', text: '会員証や会員向け案内など、継続的な接点につながる用途を検討しています。' }, { title: '店舗業務の効率化', text: '日々の確認・入力の負担を減らす仕組みを検討しています。既存システムとの連携範囲は未定です。' } ],
    flow: [ { title: '対応する用途を確認', text: '店舗に合うか判断できるよう、対応業種・機能・条件を公開前に整理します。' }, { title: '利用登録・初期設定', text: '店舗の情報や利用する機能を設定する流れを検討しています。必要なアカウント等の条件は未定です。' }, { title: 'お客さまへの案内・運用', text: '店頭などでの案内から日々の利用までを、分かりやすく支える構想です。' } ],
    faq: [ { q: 'LINE公式アカウント構築支援との違いは？', a: 'LINE公式アカウント構築支援は、現在提供している個別の受託サービスです。このページは、Spadyが今後開発する自社サービスの構想を紹介しています。' }, { q: '今すぐ申し込めますか？', a: '現在は構想段階のため、サービスの利用申し込みや決済は受け付けていません。店舗の課題やご要望に関するお問い合わせは受け付けています。' }, { q: '記載された用途はすべて実現できますか？', a: '現時点では確定していません。外部プラットフォームの仕様・審査要件や技術検証を踏まえ、提供範囲を決めていきます。' }, { q: 'LINEヤフー株式会社の公式サービスですか？', a: 'いいえ。Spadyが独立して企画する店舗向けサービスです。LINEヤフー株式会社による公式提供・認定・推奨を示すものではありません。' } ],
    notice: '本ページはSpadyによる独立したサービス構想のご案内です。LINEヤフー株式会社による公式提供・認定・推奨を示すものではありません。LINEおよびLINEミニアプリはLINEヤフー株式会社の商標または登録商標です。'
  },
  ...[
    { id: 'meta-ads', name: 'Meta・Instagram広告支援', icon: 'ads' as const, shortName: '届けたい人に、届く広告を。', summary: '事業や店舗の目的に合わせ、Meta広告・Instagram広告の設計から運用の改善まで支援します。', audience: ['広告を始めたい事業者', '広告運用を見直したい店舗・企業'], features: [{title:'目的・導線の整理',text:'広告で何を達成するか、問い合わせや予約までの流れとともに整理します。'},{title:'広告運用・改善支援',text:'訴求や配信の方針を検討し、状況を見ながら改善を進めます。具体的な対応範囲は個別にご案内します。'}] },
    { id: 'line-official-account', name: 'LINE公式アカウント構築支援', icon: 'line' as const, shortName: 'つながりを、次の来店へ。', summary: 'LINE公式アカウントを活用し、案内・問い合わせ・再来店につながる仕組みづくりを個別に支援します。', audience: ['LINEを活用したい店舗・事業者', '顧客との接点を整えたい企業'], features: [{title:'アカウント・導線の設計',text:'利用目的を整理し、必要な案内やメニュー、問い合わせの流れを設計します。'},{title:'構築・運用の支援',text:'店舗や事業に合う運用方法を一緒に考えます。外部ツールの利用範囲はご相談のうえ決定します。'}] },
    { id: 'web-design', name: 'Webサイト・LP制作', icon: 'web' as const, shortName: '伝わることから、動き出す。', summary: '事業やお店の魅力を整理し、スマートフォンで読みやすく、相談や予約へ進みやすいWebサイト・LPを制作します。', audience: ['ホームページを作りたい事業者', 'WebサイトやLPを改善したい店舗・企業'], features: [{title:'情報設計・文章の整理',text:'誰に、何を伝え、どの行動につなげるかを整理してページを設計します。'},{title:'デザイン・制作',text:'見た目と使いやすさの両面から、事業に合ったWebサイトやLPを制作します。'}] },
    { id: 'digital-marketing', name: 'デジタルマーケティング支援', icon: 'strategy' as const, shortName: '点の施策を、ひとつの流れに。', summary: '広告・SNS・Web・LINEをつなぎ、認知から問い合わせ、継続的な関係づくりまでを見据えて支援します。', audience: ['集客の全体像を整理したい事業者', '複数の施策を見直したい店舗・企業'], features: [{title:'現状と課題の整理',text:'集客の流れと運用状況を確認し、取り組むべきことの優先順位を考えます。'},{title:'施策設計・実行の支援',text:'運用できる体制や予算を踏まえ、必要な施策の設計と実行を支援します。'}] }
  ].map(item => ({ ...item, category: 'support' as const, tagline: item.shortName, status: 'available' as const, detailUrl: `/services/${item.id}/`, pricing: { published: false, note: '内容・規模・支援範囲に応じて個別にお見積もりします。費用と契約条件をご確認いただいてからお申し込みいただきます。' }, contactTopic: 'marketing' as const, problems: [], flow: [{title:'ご相談',text:'現在の状況や、お考えのことをお聞かせください。'},{title:'内容・お見積もりのご案内',text:'支援範囲・費用・納期などを個別にご案内します。'},{title:'合意した内容で支援開始',text:'契約内容を確認し、ご納得いただいたうえで進めます。'}], faq: [{q:'小樽以外からも依頼できますか？',a:'はい。全国の店舗・小規模事業者にオンラインで対応しています。'},{q:'相談した時点で契約になりますか？',a:'いいえ。お問い合わせやご相談だけで契約・課金が発生することはありません。'},{q:'必ず成果が出ますか？',a:'売上・検索順位・集客数などの特定の成果を保証するものではありません。状況や目的に合わせて、取り組む内容を一緒に整理します。'}] }))
];
export const products = services.filter(s => s.category === 'product');
export const currentServices = services.filter(s => s.category === 'support');
export const inquiryUrl = (service: Service) => `/contact/?topic=${service.contactTopic}`;
