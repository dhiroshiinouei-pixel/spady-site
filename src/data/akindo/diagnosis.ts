export type DiagnosisQuestionId = 'business' | 'reservation' | 'payment' | 'online' | 'staff' | 'line' | 'skill' | 'budget';
export type DiagnosisAnswers = Record<DiagnosisQuestionId, string>;
export type DiagnosisPriority = 'first' | 'useful' | 'later';

export interface DiagnosisQuestion {
  id: DiagnosisQuestionId;
  title: string;
  help: string;
  options: { value: string; label: string; description?: string }[];
}

export const diagnosisSteps = [
  { title: '商いのかたち', description: 'まずは、どんな商いを始めるか教えてください。', questionIds: ['business', 'reservation'] },
  { title: 'お金と販売', description: 'お客さまが買う場面を思い浮かべてみましょう。', questionIds: ['payment', 'online'] },
  { title: '運営とつながり', description: '日々の運営と、お客さまとの接点について。', questionIds: ['staff', 'line'] },
  { title: '無理のない進め方', description: '設定の得意・不得意と、使える予算に合わせて整理します。', questionIds: ['skill', 'budget'] },
] satisfies { title: string; description: string; questionIds: DiagnosisQuestionId[] }[];

export const diagnosisQuestions: DiagnosisQuestion[] = [
  {
    id: 'business', title: 'どのような事業ですか？', help: 'いちばん近いものを選んでください。',
    options: [
      { value: 'salon', label: 'ひとりサロン・施術' },
      { value: 'food', label: '飲食店・実店舗' },
      { value: 'school', label: '教室・スクール' },
      { value: 'visiting', label: '訪問サービス' },
      { value: 'online', label: 'ネットショップ・オンライン' },
      { value: 'other', label: 'その他・これから決める' },
    ],
  },
  {
    id: 'reservation', title: '予約は必要ですか？', help: '来店予約だけでなく、相談やレッスンの日程調整も含みます。',
    options: [
      { value: 'yes', label: '必要', description: '日時を決めて来店・利用してもらう' },
      { value: 'no', label: '必要ない', description: '予約なしで販売・提供する' },
      { value: 'unsure', label: 'まだ決めていない' },
    ],
  },
  {
    id: 'payment', title: '店頭または対面で決済しますか？', help: '現金、カード、QRコードなど、対面で代金を受け取る場面です。',
    options: [
      { value: 'yes', label: '対面で決済する' },
      { value: 'no', label: '対面での決済はない', description: 'オンライン決済や請求書などを使う' },
      { value: 'unsure', label: 'まだ決めていない' },
    ],
  },
  {
    id: 'online', title: '商品をオンラインで販売しますか？', help: '通販や物販サイトが必要かを確認します。',
    options: [
      { value: 'yes', label: '開業時から販売する' },
      { value: 'later', label: 'いずれ販売したい' },
      { value: 'no', label: '販売する予定はない' },
    ],
  },
  {
    id: 'staff', title: 'スタッフはいますか？', help: '予約や顧客情報を誰と共有するかに関わります。',
    options: [
      { value: 'solo', label: 'ひとりで運営する' },
      { value: 'team', label: 'スタッフがいる・採用予定', description: '開業時から複数人で運営する' },
      { value: 'later', label: '開業後に検討する' },
    ],
  },
  {
    id: 'line', title: 'LINEを使いたいですか？', help: 'お客さまとの連絡や、再来店のお知らせなどに使います。',
    options: [
      { value: 'yes', label: '開業時から使いたい' },
      { value: 'unsure', label: '必要かどうか知りたい' },
      { value: 'no', label: '今のところ使わない' },
    ],
  },
  {
    id: 'skill', title: 'Webの設定は得意ですか？', help: '苦手でも大丈夫。最初から全部を整える必要はありません。',
    options: [
      { value: 'confident', label: '自分で設定できる' },
      { value: 'guide', label: '手順があればできそう' },
      { value: 'support', label: '必要なところは相談したい' },
    ],
  },
  {
    id: 'budget', title: '毎月使えるIT予算はどのくらいですか？', help: 'ソフトやWebサービスの月額費用の目安です。各サービスの料金を示すものではありません。',
    options: [
      { value: 'small', label: 'できるだけ抑えたい', description: '月3,000円未満を目安に' },
      { value: 'balanced', label: '必要なものに使いたい', description: '月3,000〜10,000円程度を目安に' },
      { value: 'flexible', label: '運営の効率化にも使いたい', description: '月10,000円以上も検討できる' },
      { value: 'undecided', label: 'まだ決めていない' },
    ],
  },
];

export interface DiagnosisRecommendation {
  id: string;
  title: string;
  reason: string;
  priority: DiagnosisPriority;
}

export interface DiagnosisResult {
  recommendations: DiagnosisRecommendation[];
  nextAction: { title: string; description: string };
  guidance: { title: string; description: string }[];
}

export const diagnosisPriorityLabels: Record<DiagnosisPriority, { title: string; description: string }> = {
  first: { title: '最初に必要', description: '開業前に、方法や運用を決めておきたいこと。' },
  useful: { title: 'あると便利', description: 'お客さまと運営の状況に合わせて整えること。' },
  later: { title: '開業後でもよい', description: '必要性が見えてから検討できること。' },
};

/** Only recognised option values are accepted, including when called outside the UI. */
export function isCompleteDiagnosis(answers: Partial<DiagnosisAnswers>): answers is DiagnosisAnswers {
  return diagnosisQuestions.every((question) => question.options.some((option) => option.value === answers[question.id]));
}

/** Deterministic guidance only: no API, pricing assumptions, or personal data. */
export function getDiagnosisResult(answers: DiagnosisAnswers): DiagnosisResult {
  const recommendations: DiagnosisRecommendation[] = [];
  const add = (id: string, title: string, priority: DiagnosisPriority, reason: string) => recommendations.push({ id, title, priority, reason });
  const localBusiness = ['salon', 'food', 'school', 'visiting'].includes(answers.business);

  add('accounting', '会計方法', 'first', '売上と経費の記録を始められるよう、帳簿の付け方と領収書の保管方法を決めましょう。');
  if (answers.payment === 'yes') {
    add('payment', '対面の決済方法', 'first', '対面で代金を受け取るため、現金・カードなどの受付方法と入金の流れを確認しましょう。');
  } else if (answers.payment === 'unsure') {
    add('payment', '代金の受け取り方', 'first', '購入から支払いまでの流れを先に決めると、決済端末が必要かどうか判断できます。');
  } else {
    add('payment', 'オンライン決済・請求の方法', 'first', '対面決済を使わないため、オンライン決済や請求書・振込の案内方法を決めましょう。');
  }
  if (answers.reservation === 'yes') {
    add('booking', '予約の受付方法', 'first', '予約が必要な商いです。受付窓口、空き枠、変更・キャンセルの連絡方法をひとつの流れに整えましょう。');
  } else if (answers.reservation === 'unsure') {
    add('booking', '予約が必要な場面の整理', 'useful', '提供時間や一日に対応できる人数を書き出して、事前予約が必要か確認しましょう。');
  }
  if (answers.online === 'yes') {
    add('shop', 'ネットショップ', 'first', '開業時から通販を行うため、商品、決済、送料、返品条件、必要な表示を確認しましょう。');
  } else if (answers.online === 'later') {
    add('shop', 'ネットショップ', 'later', '販売する商品や配送の準備が具体的になってから、販売方法と運営費用を比較しましょう。');
  }
  if (localBusiness) {
    add('google', 'Googleビジネスプロフィール', 'first', '地域で探すお客さまとの接点です。事業が掲載対象となるか、住所の公開方法も含めて公式の条件を確認しましょう。');
  } else {
    add('google', 'Googleでの見つけてもらい方', 'useful', 'オンライン専業などはビジネスプロフィールの掲載対象外となる場合があります。まず案内ページで事業内容を伝えましょう。');
  }
  if (answers.staff === 'team') {
    add('customer', '顧客情報とスタッフの共有ルール', 'first', '複数人で扱う情報の範囲、閲覧権限、連絡の担当を決めましょう。採用・雇用に関する手続きは別途確認が必要です。');
  } else {
    add('customer', 'シンプルな顧客管理', 'useful', answers.staff === 'later'
      ? 'ひとりで使いやすい記録方法から始め、スタッフを迎える前に共有範囲と権限を見直しましょう。'
      : '対応履歴や次回の予定を、必要な情報だけ記録できる方法から始めましょう。');
  }
  if (answers.line === 'yes') {
    add('line', 'LINE公式アカウント', 'first', '開業時から使う予定なので、プロフィール、あいさつ、問い合わせ・予約への案内を準備しましょう。');
  } else if (answers.line === 'unsure') {
    add('line', 'LINE公式アカウント', 'useful', '再来店の案内や継続的な連絡が必要かを考えてから導入しましょう。最初は窓口を増やしすぎなくても大丈夫です。');
  } else {
    add('line', 'LINE公式アカウント', 'later', '今は利用予定がないため、現在の連絡窓口を整え、お客さまからの要望が出てから検討できます。');
  }
  add('website', 'ホームページ・案内ページ', answers.business === 'online' ? 'first' : 'useful',
    answers.business === 'online'
      ? 'オンラインの事業では、サービス内容、運営者、料金や申し込み方法を確認できる場所を開業前に用意しましょう。'
      : 'メニュー、営業時間、場所、連絡先を一か所で確認できるページがあると、SNSからの案内がしやすくなります。');
  add('instagram', 'Instagram', 'useful', ['salon', 'food'].includes(answers.business)
    ? '空間やメニュー、仕上がりを伝えたい商いと相性を考えやすい接点です。投稿数よりも、プロフィールから予約までの流れを整えましょう。'
    : 'お客さまがInstagramを利用するかを確認し、続けられる発信内容がある場合に取り入れましょう。');
  add('advertising', '広告', 'later', '案内ページと予約・購入の流れを確認してから、目的と上限予算を決めて検討しましょう。');
  add('crm', '高機能CRM・複雑な自動化', 'later', 'まずは日々の運営を試して、繰り返し発生する作業や管理上の課題が見えてから考えましょう。');

  const budgetGuidance: Record<string, string> = {
    small: '月額費用を抑えるなら、最初に必要な機能だけを選びましょう。無料枠がある場合も、利用条件、従量課金、決済手数料、将来の移行費用は公式サイトで確認してください。',
    balanced: '予約・決済・会計など、日々使うものから予算を配分しましょう。機能が重複する契約を避け、月額費用に加えて手数料や初期費用も確認してください。',
    flexible: '予算に余裕があっても、最初は必要な運用から。設定にかかる時間やサポートも比較し、自動化は実際の業務が決まってから追加しましょう。',
    undecided: '「毎月必ずかかる費用」「売上に応じた手数料」「初期設定の費用」を分けて書き出すと、無理のない上限を決めやすくなります。',
  };
  const skillGuidance: Record<string, string> = {
    confident: 'ひとつ設定したら、お客さまの立場で問い合わせや予約を試しましょう。各ツールの設定より、ツール同士をつなぐ案内の確認が大切です。',
    guide: '一度に全部を設定せず、公式の設定ガイドを見ながらひとつずつ。分からない箇所をメモし、開業前に動作を確かめましょう。',
    support: '目的と使いたい窓口を決めたら、設定や連携など必要な部分だけ相談できます。依頼時は月額費用、管理権限、引き継ぎ方法も確認しましょう。',
  };

  return {
    recommendations,
    nextAction: answers.business === 'other'
      ? { title: '誰に、何を届けるかを書いてみる', description: '道具を契約する前に、お客さま・提供内容・受け取り方を一文にしてみましょう。チェックリストの最初の項目から進められます。' }
      : { title: 'お客さまの利用の流れを書いてみる', description: '「見つける → 問い合わせる → 予約・購入する → 支払う」の順に、使う窓口を書き出しましょう。必要な道具を絞り込めます。' },
    guidance: [
      { title: '予算に合わせて', description: budgetGuidance[answers.budget] ?? budgetGuidance.undecided },
      { title: '設定の進め方', description: skillGuidance[answers.skill] ?? skillGuidance.guide },
    ],
  };
}
