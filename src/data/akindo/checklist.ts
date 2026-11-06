export type ChecklistStatus = 'not_started' | 'in_progress' | 'completed';
export type PhaseId = 'concept' | 'finance' | 'sales' | 'discovery' | 'launch' | 'after';
export type ChecklistItem = {
  id: string;
  step: number;
  phase: PhaseId;
  title: string;
  shortDescription: string;
  detail: string;
  requiredLevel: 'required' | 'recommended' | 'optional';
  estimatedTime: string;
  relatedToolSlugs: string[];
  guideHref: string | null;
  targetIndustries: string[];
  notes: string[];
};
export type ChecklistPhase = { id: PhaseId; label: string; description: string; items: string[] };

export const phases: ChecklistPhase[] = [
  { id: 'concept', label: '商いを決める', description: '誰に、何を、いくらで届けるか。商いの軸を整えます。', items: ['誰に何を提供するか', '屋号', '価格', '開業予定日'] },
  { id: 'finance', label: '手続きとお金', description: '必要な確認と、お金を記録する仕組みから。', items: ['開業届', '事業用口座', '会計', '保険・許認可の確認'] },
  { id: 'sales', label: '売る準備', description: '予約からお支払いまで、お客さまを迎える準備。', items: ['決済', '予約', '電話・メール', '顧客管理'] },
  { id: 'discovery', label: '見つけてもらう準備', description: '営業情報と予約先をそろえ、見つけてもらえる状態へ。', items: ['Google', 'Instagram', 'LINE', 'ホームページ'] },
  { id: 'launch', label: '開業を知らせる', description: '告知を出す前に、お客さまの動きを一度たどります。', items: ['告知', '初回キャンペーン', '口コミ・広告', 'リピート導線'] },
  { id: 'after', label: '開業後に整える', description: '小さく振り返り、無理なく続くやり方を見つけます。', items: ['改善', 'リピート', '日々の運用'] },
];

export const checklistItems: ChecklistItem[] = [
  {
    id: 'business', step: 1, phase: 'concept', title: '事業内容を決める',
    shortDescription: '最初に提供するサービスと価格を、ひとつの紙にまとめる。',
    detail: '「何を提供するか」「どのくらいの時間がかかるか」「いくらで提供するか」を書き出しましょう。材料費や準備・片付けの時間も含め、無理なく続けられる範囲から始めます。最初からメニューを増やしすぎる必要はありません。',
    requiredLevel: 'required', estimatedTime: '30〜60分', relatedToolSlugs: [], guideHref: null, targetIndustries: ['all'], notes: ['完了の目安：最初に提供するメニューと価格の案が決まっている。'],
  },
  {
    id: 'audience', step: 2, phase: 'concept', title: '顧客と提供価値を決める',
    shortDescription: 'どんな人の、どんな困りごとを解決するかを言葉にする。',
    detail: '年齢や性別だけでなく、「いつ、何に困っている人か」を考えてみましょう。その人が利用したあと、どう変われるのかを一文にします。身近な想定顧客に伝えて、内容が伝わるか聞いてみるのも一歩です。',
    requiredLevel: 'required', estimatedTime: '30分', relatedToolSlugs: [], guideHref: null, targetIndustries: ['all'], notes: ['完了の目安：「○○に困っている人に、○○を届ける」と説明できる。'],
  },
  {
    id: 'name', step: 3, phase: 'concept', title: '屋号を決める',
    shortDescription: '覚えやすく、検索しやすい名前と表記を決める。',
    detail: '声に出して伝わるか、スマートフォンで入力しやすいかを確認します。同じ名前の事業や商標がないかも調べ、SNS・ホームページ・名刺で使う表記をそろえましょう。必要に応じて商標の専門家へ確認してください。',
    requiredLevel: 'recommended', estimatedTime: '30〜60分', relatedToolSlugs: [], guideHref: null, targetIndustries: ['all'], notes: ['完了の目安：正式表記、読み方、SNSで使う名前の候補がそろっている。'],
  },
  {
    id: 'opening-date', step: 4, phase: 'concept', title: '開業予定日を決める',
    shortDescription: '仮の日付を置き、準備と確認の時間を逆算する。',
    detail: '物件、設備、必要な手続き、予約受付の準備にどのくらいかかるかを書き出します。まずは仮の開業日を置き、確認が終わってから告知の日程を決めましょう。試運転や予備日も確保しておくと安心です。',
    requiredLevel: 'required', estimatedTime: '20分', relatedToolSlugs: [], guideHref: null, targetIndustries: ['all'], notes: ['完了の目安：開業予定日と、その前に終えることの順番が決まっている。'],
  },
  {
    id: 'permits', step: 5, phase: 'finance', title: '必要な許認可を確認する',
    shortDescription: '契約や設備購入の前に、提供するサービスの条件を確認する。',
    detail: '予定しているサービス、施術・販売方法、場所を具体的に整理して、地域の行政窓口や保健所などへ相談します。物件の使い方や設備の条件もあわせて確認しましょう。事業に応じた保険の必要性と補償範囲は保険の窓口へ相談してください。',
    requiredLevel: 'required', estimatedTime: '確認先の整理に30分', relatedToolSlugs: [], guideHref: '/akindo/kaigyo/start/salon/#permissions', targetIndustries: ['all'], notes: ['必要な資格・届出・許認可は、業種、提供内容、地域によって異なります。', '完了の目安：確認先へ相談し、必要な条件と手続きが分かっている。'],
  },
  {
    id: 'tax', step: 6, phase: 'finance', title: '開業届と税務を確認する',
    shortDescription: '自分に必要な届出と申告方法を、公式情報や専門家に確認する。',
    detail: '個人事業か法人か、どんな収入や取引があるかによって、確認する内容が変わります。開業に関する届出、申告方法、帳簿の付け方を税務署や税理士へ相談し、自分に必要な手続きと期限を整理しましょう。',
    requiredLevel: 'required', estimatedTime: '確認事項の整理に30分', relatedToolSlugs: ['freee'], guideHref: null, targetIndustries: ['all'], notes: ['ここでは個別の税務判断を行いません。最新の公式案内と専門家の助言をご確認ください。', '完了の目安：必要な手続き、期限、相談先を確認できている。'],
  },
  {
    id: 'bank', step: 7, phase: 'finance', title: '事業用銀行口座を準備する',
    shortDescription: '生活費と事業のお金を分けて、入出金を追いやすくする。',
    detail: '事業で使う口座を決め、振込・引き落とし・決済サービスの入金先を整理します。屋号の扱い、必要書類、手数料、会計との連携可否は金融機関の公式案内で確認してください。既存口座を使う場合も、事業利用の条件を確認しましょう。',
    requiredLevel: 'recommended', estimatedTime: '比較・確認に30分', relatedToolSlugs: ['business-account'], guideHref: null, targetIndustries: ['all'], notes: ['口座開設や審査にかかる日数は金融機関によって異なります。', '完了の目安：事業の入出金に使う口座と管理方法が決まっている。'],
  },
  {
    id: 'card', step: 8, phase: 'finance', title: '事業用カードを検討する',
    shortDescription: '経費の支払いをまとめる必要があるか考える。',
    detail: '材料や備品、月額サービスなど、事業の支払いを一覧にします。カードを分けると記録がしやすくなるか、年会費や引き落とし日も含めて検討しましょう。カードを増やすこと自体が目的ではありません。不要なら「今回は導入しない」と決めて完了にできます。',
    requiredLevel: 'optional', estimatedTime: '20分', relatedToolSlugs: ['business-account'], guideHref: null, targetIndustries: ['all'], notes: ['完了の目安：事業の支払い方法を決めている。申込条件や費用は公式案内で確認。'],
  },
  {
    id: 'accounting', step: 9, phase: 'finance', title: '会計方法を決める',
    shortDescription: '売上・経費・領収書を、ためずに記録する方法を用意する。',
    detail: '会計ソフトを使うか、専門家に依頼するか、自分が続けられる方法を決めます。領収書の保管場所、売上の入力方法、毎週確認する時間を先に決めましょう。必要な帳簿や保存方法は税務署・税理士へ確認してください。',
    requiredLevel: 'required', estimatedTime: '30〜60分', relatedToolSlugs: ['freee'], guideHref: null, targetIndustries: ['all'], notes: ['完了の目安：試しに1件の売上と経費を記録し、見返せる。'],
  },
  {
    id: 'payment', step: 10, phase: 'sales', title: '決済方法を決める',
    shortDescription: 'お客さまが使う支払い方法と、お金を受け取る流れを整える。',
    detail: '現金、カード、QRコード、銀行振込など、必要な支払い方法を選びます。手数料、入金日、端末、通信環境、取消・返金の操作も比較してください。導入後はテストの手順を公式案内で確認し、案内から会計まで一度練習しましょう。',
    requiredLevel: 'required', estimatedTime: '比較・設定に60分〜', relatedToolSlugs: ['square'], guideHref: null, targetIndustries: ['all'], notes: ['審査・端末の到着などに別途時間がかかる場合があります。', '完了の目安：受け付ける方法、案内方法、入金の確認方法が決まっている。'],
  },
  {
    id: 'booking', step: 11, phase: 'sales', title: '予約方法を決める',
    shortDescription: '受付窓口、空き時間、変更・キャンセルの扱いをそろえる。',
    detail: '予約が必要な事業は、受付窓口を絞り、メニューごとの所要時間や準備時間を設定します。変更やキャンセルの連絡方法も案内しましょう。予約不要の事業は、来店・注文・問い合わせの受付方法を決めれば完了にできます。',
    requiredLevel: 'recommended', estimatedTime: '30〜60分', relatedToolSlugs: ['stores-reserve'], guideHref: null, targetIndustries: ['salon', 'bodywork', 'school', 'visit'], notes: ['完了の目安：お客さまの立場で予約を試し、受付と変更の連絡を確認できる。'],
  },
  {
    id: 'contact', step: 12, phase: 'sales', title: '電話とメールを準備する',
    shortDescription: '連絡先と返信する時間を決め、取りこぼしを防ぐ。',
    detail: '事業用の連絡先を決め、通知が届く端末で送受信を確認します。電話が必要かも含めて考え、対応できる時間を案内しましょう。ログインには安全なパスワードと利用できる認証機能を設定し、回復方法を確認します。',
    requiredLevel: 'required', estimatedTime: '30分', relatedToolSlugs: [], guideHref: null, targetIndustries: ['all'], notes: ['完了の目安：外部からの連絡が届き、返信できることを確認している。'],
  },
  {
    id: 'customers', step: 13, phase: 'sales', title: '顧客情報の管理方法を決める',
    shortDescription: '必要な情報だけを、安全に保管して見返せるようにする。',
    detail: '予約や接客に必要な項目を絞り、何のために使うかを説明できるようにします。保管先、閲覧できる人、保存期間、削除方法を決めてください。紙や表計算から始める場合も、持ち出しや共有範囲、端末のロックを確認しましょう。',
    requiredLevel: 'required', estimatedTime: '30〜60分', relatedToolSlugs: ['customer-sheet'], guideHref: null, targetIndustries: ['all'], notes: ['このチェックリストには顧客情報を入力・保存しません。', '完了の目安：情報の利用目的と管理ルールが決まっている。'],
  },
  {
    id: 'google', step: 14, phase: 'discovery', title: 'Googleビジネスプロフィールを整える',
    shortDescription: '対象となる事業か確認し、営業時間と案内先をそろえる。',
    detail: 'まずGoogleの公式ガイドで、自分の事業が登録対象か確認します。対象となる場合は、名称、営業場所やサービス提供地域、営業時間、連絡先、予約先を整理しましょう。自宅住所の扱いなど、表示設定も公式のルールに沿って確認してください。',
    requiredLevel: 'recommended', estimatedTime: '情報整理に30分', relatedToolSlugs: ['google-business'], guideHref: null, targetIndustries: ['salon', 'restaurant', 'bodywork', 'school', 'visit'], notes: ['確認手続きや表示までの時間は状況によって異なります。対象外ならその判断をもって完了にできます。'],
  },
  {
    id: 'instagram', step: 15, phase: 'discovery', title: 'Instagramを整える',
    shortDescription: 'プロフィールから、サービスと予約先が分かる状態にする。',
    detail: '誰向けの事業か、場所や対応地域、営業時間、予約方法をプロフィールにまとめます。メニュー・価格・利用の流れが分かる投稿を先に用意しましょう。毎日の投稿より、見た人が次に進める導線と、続けられる更新頻度を大切にします。',
    requiredLevel: 'optional', estimatedTime: '30〜60分', relatedToolSlugs: ['instagram'], guideHref: null, targetIndustries: ['all'], notes: ['完了の目安：初めて見た人が、提供内容と予約・問い合わせ先を確認できる。不要なら導入しない判断でも構いません。'],
  },
  {
    id: 'line', step: 16, phase: 'discovery', title: 'LINE公式アカウントを準備する',
    shortDescription: '友だち追加のあと、何ができるかを明確にする。',
    detail: 'LINEで受け付けることを決め、あいさつメッセージに営業時間と予約・問い合わせ先を載せます。すべてをLINE内で完結させる必要はありません。自分で友だち追加から予約まで試して、返信できない時間の案内も確認しましょう。',
    requiredLevel: 'optional', estimatedTime: '30〜60分', relatedToolSlugs: ['line-official'], guideHref: null, targetIndustries: ['all'], notes: ['メッセージ配信の条件・料金は公式サイトで確認してください。不要なら導入しない判断でも完了にできます。'],
  },
  {
    id: 'website', step: 17, phase: 'discovery', title: 'ホームページまたは案内ページを準備する',
    shortDescription: 'メニュー、料金、場所、予約先を一か所で案内する。',
    detail: 'まずは1ページでも、提供内容、料金、営業時間、アクセスや対応地域、運営者、予約・問い合わせ先が分かれば役立ちます。スマートフォンで文字とボタンを確認しましょう。取引方法に応じた表示や個人情報の取り扱いは、公式情報・専門家に確認します。',
    requiredLevel: 'recommended', estimatedTime: '内容整理に60分〜', relatedToolSlugs: ['studio'], guideHref: null, targetIndustries: ['all'], notes: ['完了の目安：第三者にページを見てもらい、予約・問い合わせ先まで迷わず進める。'],
  },
  {
    id: 'announcement', step: 18, phase: 'launch', title: '開業告知を作る',
    shortDescription: 'いつ、どこで、何を始めるか。申し込み先と一緒に伝える。',
    detail: '開業日、サービス、対象となる方、場所・対応地域、料金、予約先をまとめます。SNSやLINE、紙の案内で表記をそろえ、リンクとQRコードを実機で確認してください。キャンペーンを行う場合は対象・期間・条件を明記し、無理のない内容にします。',
    requiredLevel: 'recommended', estimatedTime: '30〜60分', relatedToolSlugs: ['instagram', 'line-official'], guideHref: null, targetIndustries: ['all'], notes: ['完了の目安：告知文と画像がそろい、予約・問い合わせ先の動作を確認している。'],
  },
  {
    id: 'journey', step: 19, phase: 'launch', title: '問い合わせから予約までの流れを確認する',
    shortDescription: 'お客さまになったつもりで、最初から最後まで試す。',
    detail: 'InstagramやGoogleから案内ページ、予約、受付連絡、お支払いまで順に確認します。予約不要の事業は注文や問い合わせで試してください。営業時間外の連絡、予約変更、キャンセルのときにも迷わないか確認し、家族や知人に一度試してもらいましょう。',
    requiredLevel: 'required', estimatedTime: '30分', relatedToolSlugs: ['stores-reserve', 'line-official'], guideHref: null, targetIndustries: ['all'], notes: ['実際の課金を伴うテストはサービスの公式手順を確認してください。', '完了の目安：お客さま側・運営側の両方で連絡と受付を確認できる。'],
  },
  {
    id: 'improvement', step: 20, phase: 'after', title: '開業後の改善方法を決める',
    shortDescription: '予約数とお客さまの反応を、小さく振り返る時間をつくる。',
    detail: '週に一度、どこで知ってもらったか、問い合わせから予約につながったか、再来店につながったかを振り返ります。数字だけでなく、お客さまから聞かれたことも改善のヒントです。一度に変えることを絞り、お礼や次回案内の流れを無理なく整えましょう。',
    requiredLevel: 'recommended', estimatedTime: '初回20分・週1回', relatedToolSlugs: ['customer-sheet', 'line-official'], guideHref: null, targetIndustries: ['all'], notes: ['完了の目安：確認する項目、振り返る曜日、次回案内の方法が決まっている。'],
  },
];
