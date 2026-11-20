/** Public catalog. A new entry automatically gets a detail page and a directory listing. */
export type ServiceStatus = 'planning' | 'developing' | 'preparing' | 'available' | 'ended';
export const statusLabels: Record<ServiceStatus, string> = { planning: '企画中', developing: '開発中', preparing: '公開準備中', available: '提供中', ended: '提供終了' };
export interface Service {
  id: string; name: string; nameParts?: string[]; shortName: string; category: 'product' | 'support';
  summary: string; tagline: string; audience: string[]; status: ServiceStatus;
  icon: 'map' | 'line' | 'ads' | 'web' | 'strategy'; image?: string; imageAlt?: string;
  detailUrl: string; pricing: { published: boolean; note: string }; externalUrl?: string;
  contactTopic: 'gbp' | 'mini-app' | 'marketing' | 'billing' | 'other' | 'ai-training' | 'ai-implementation';
  problems: string[]; features: { title: string; text: string }[];
  flow: { title: string; text: string }[]; faq: { q: string; a: string }[];
  notice?: string; seoTitle?: string; relatedIds?: string[]; trainer?: boolean;
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
  {
    id: 'ai-training', name: 'AI研修・講演会', shortName: 'はじめての生成AIを、明日の仕事に。', category: 'support', status: 'available', icon: 'strategy',
    tagline: '生成AIの基本と、安全に使うための実践を。',
    summary: '北海道・小樽のSpadyが、中小企業・店舗・団体向けに生成AI研修・講演会を提供します。問い合わせの返信やSNS投稿を題材に、AIへの指示と出力の確かめ方を学びます。',
    seoTitle: '中小企業向け生成AI研修・講演会｜北海道・小樽のSpady', detailUrl: '/services/ai-training/', contactTopic: 'ai-training', relatedIds: ['ai-implementation'], trainer: true,
    audience: ['初めて生成AIを使う方', '社内研修を検討する中小企業・店舗', '会員向け講演を企画する団体'], problems: [],
    features: [
      {title:'仕事に合った使いどころを知る',text:'メールの返信案やSNSの下書きなど、身近な仕事でできることと、人が判断する必要があることを整理します。'},
      {title:'架空の題材で試す',text:'架空の予約変更を題材に返信案を作り、日時や案内の漏れ、事実と合っているかを人が確認します。'},
      {title:'入力のルールと確認を学ぶ',text:'演習では実際の顧客名や連絡先は使いません。入力を避ける情報や、AIが作った文章を共有する前の確認点を学びます。'}
    ],
    flow:[{title:'対象と目的を伺う',text:'参加者の経験、人数、希望時期、扱いたい仕事をお聞きします。'},{title:'内容・開催形式を決める',text:'講演中心か演習付きか、開催形式や費用を事前にご案内します。'},{title:'開催する',text:'合意した内容に沿って実施し、学んだことを持ち帰れるように整理します。'}],
    faq:[{q:'初めてでも参加できますか？',a:'はい。初心者を想定し、参加者の経験に合わせて内容を調整します。'},{q:'研修でお客さまの情報を使いますか？',a:'実際のお客さま情報は使わず、架空の事例で練習します。'},{q:'講演だけでも相談できますか？',a:'はい。講演のみ、演習付きの研修とも、対象・目的に合わせてご相談いただけます。'}],
    pricing:{published:false,note:'内容・参加人数・開催形式に応じて個別にお見積もりします。全国からオンラインでご相談いただけます。'}
  },
  {
    id: 'ai-implementation', name: 'AI導入・伴走支援', shortName: '毎日の仕事を、まず一つ整える。', category: 'support', status: 'available', icon: 'web',
    tagline: '試すところから、担当者が使い続けられる形まで。',
    summary: '北海道・小樽のSpadyが中小企業・店舗の生成AI導入を支援します。問い合わせ返信など一つの業務から、AIに任せる作業と人が確認する作業を分け、運用手順とひな形を整えます。',
    seoTitle: '中小企業向け生成AI導入・伴走支援｜北海道・小樽のSpady', detailUrl: '/services/ai-implementation/', contactTopic: 'ai-implementation', relatedIds: ['ai-training'],
    audience: ['使い道を整理したい中小企業・店舗', '試したAIが仕事に定着しないチーム', '返信や下書きの手順をそろえたい事業者'], problems: [],
    features:[
      {title:'繰り返す業務から一つ選ぶ',text:'問い合わせ返信やSNS投稿の下書きなど、現状の作業とつまずきを聞き、試す対象を選びます。'},
      {title:'入力と確認のルールを決める',text:'入力しない情報、AIに下書きを任せる範囲、人が最終確認する箇所を整理します。'},
      {title:'ひな形と手順を作って引き継ぐ',text:'指示文・チェック項目を作り、架空のケースで試します。担当者が手順を再現できるか確認し、必要に応じて作業時間や案内漏れなどを比べる項目を決めます。'}
    ],
    flow:[{title:'現状と目標を確認',text:'対象業務、現在のツール、担当者、情報の取り扱いを伺います。'},{title:'試す範囲を決める',text:'対象業務、支援範囲、見て判断する項目、費用を確認します。'},{title:'試運用して引き継ぐ',text:'担当者がひな形を使って試し、自分たちで更新できる手順を残します。'}],
    faq:[{q:'何から始めるか未定でも相談できますか？',a:'はい。繰り返す作業から候補を整理します。'},{q:'AIがそのままお客さまに返信しますか？',a:'基本の支援では自動送信を前提にせず、人が内容を確認してから送る手順を整えます。'},{q:'特定ツールの契約が必須ですか？',a:'使用するツールは既存の環境や社内ルール、対象業務に合わせてご相談します。'}],
    pricing:{published:false,note:'対象業務・支援範囲・納品物に応じて個別にお見積もりします。全国からオンラインでご相談いただけます。'}
  },
  ...[
    { id: 'meta-ads', name: 'Meta・Instagram広告支援', icon: 'ads' as const, shortName: '届けたい人に、届く広告を。', summary: '事業や店舗の目的に合わせ、Meta広告・Instagram広告の設計から運用の改善まで支援します。', audience: ['広告を始めたい事業者', '広告運用を見直したい店舗・企業'], features: [{title:'目的・導線の整理',text:'広告で何を達成するか、問い合わせや予約までの流れとともに整理します。'},{title:'広告運用・改善支援',text:'訴求や配信の方針を検討し、状況を見ながら改善を進めます。具体的な対応範囲は個別にご案内します。'}] },
    { id: 'line-official-account', name: 'LINE公式アカウント構築支援', icon: 'line' as const, shortName: 'つながりを、次の来店へ。', summary: 'LINE公式アカウントを活用し、案内・問い合わせ・再来店につながる仕組みづくりを個別に支援します。', audience: ['LINEを活用したい店舗・事業者', '顧客との接点を整えたい企業'], features: [{title:'アカウント・導線の設計',text:'利用目的を整理し、必要な案内やメニュー、問い合わせの流れを設計します。'},{title:'構築・運用の支援',text:'店舗や事業に合う運用方法を一緒に考えます。外部ツールの利用範囲はご相談のうえ決定します。'}] },
    { id: 'web-design', name: 'Webサイト・LP制作', icon: 'web' as const, shortName: '伝わることから、動き出す。', summary: '事業やお店の魅力を整理し、スマートフォンで読みやすく、相談や予約へ進みやすいWebサイト・LPを制作します。', audience: ['ホームページを作りたい事業者', 'WebサイトやLPを改善したい店舗・企業'], features: [{title:'情報設計・文章の整理',text:'誰に、何を伝え、どの行動につなげるかを整理してページを設計します。'},{title:'デザイン・制作',text:'見た目と使いやすさの両面から、事業に合ったWebサイトやLPを制作します。'}] },
    { id: 'digital-marketing', name: 'デジタルマーケティング支援', icon: 'strategy' as const, shortName: '点の施策を、ひとつの流れに。', summary: '広告・SNS・Web・LINEをつなぎ、認知から問い合わせ、継続的な関係づくりまでを見据えて支援します。', audience: ['集客の全体像を整理したい事業者', '複数の施策を見直したい店舗・企業'], features: [{title:'現状と課題の整理',text:'集客の流れと運用状況を確認し、取り組むべきことの優先順位を考えます。'},{title:'施策設計・実行の支援',text:'運用できる体制や予算を踏まえ、必要な施策の設計と実行を支援します。'}] }
  ].map(item => ({ ...item, category: 'support' as const, tagline: item.shortName, status: 'available' as const, detailUrl: `/services/${item.id}/`, pricing: { published: false, note: '内容・規模・支援範囲に応じて個別にお見積もりします。費用と契約条件をご確認いただいてからお申し込みいただきます。' }, contactTopic: 'marketing' as const, problems: [], flow: [{title:'ご相談',text:'現在の状況や、お考えのことをお聞かせください。'},{title:'内容・お見積もりのご案内',text:'支援範囲・費用・納期などを個別にご案内します。'},{title:'合意した内容で支援開始',text:'契約内容を確認し、ご納得いただいたうえで進めます。'}], faq: [{q:'小樽以外からも依頼できますか？',a:'はい。全国の店舗・小規模事業者にオンラインで対応しています。'},{q:'相談した時点で契約になりますか？',a:'いいえ。お問い合わせやご相談だけで契約・課金が発生することはありません。'},{q:'必ず成果が出ますか？',a:'売上・検索順位・集客数などの特定の成果を保証するものではありません。状況や目的に合わせて、取り組む内容を一緒に整理します。'}] }))
];
export const products = services.filter(s => s.category === 'product');
export const currentServices = services.filter(s => s.category === 'support').sort((a,b) => Number(a.id.startsWith('ai-')) - Number(b.id.startsWith('ai-')));
export const inquiryUrl = (service: Service) => `/contact/?topic=${service.contactTopic}`;
