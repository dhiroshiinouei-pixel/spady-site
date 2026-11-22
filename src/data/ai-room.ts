export const aiRoomArticles = [
  {
    category: 'AIの新機能',
    title: 'ChatGPTのライブ音声入力とは？使い方と、予約件数を整理するコツ',
    description: 'ChatGPTで話しながら文字を確認する「ライブ音声入力」の使い方を解説。音声会話との違い、対応端末、店舗の予約件数を表にまとめる指示文の例を紹介します。',
    href: '/ai/live-dictation/',
    image: '/ai-media/live-dictation.webp',
    imageAlt: '青と紫の音声波形が、文字を思わせる光の行へ変わるイメージ',
    featured: true,
  },
  {
    category: '現場の実践ガイド',
    title: '生成AIに任せる最初の仕事の選び方',
    description: '問い合わせ返信を例に、AIに渡す情報の選び方と、送信前に人が確認するポイントを紹介します。',
    href: '/ai-guides/first-workflow/',
    image: '/ai-media/first-workflow.webp',
    imageAlt: 'ノートパソコンの隣に、作業を表す半透明のプレートが並ぶイメージ',
    featured: false,
  },
  {
    category: 'はじめてのAI',
    title: 'MetaのMuseの使い方｜近くのお出かけ先を探してみよう',
    description: 'MetaのAI「Muse」の使い方を初心者向けに解説。「近くで雨の日も楽しめる場所」を探す指示文と、営業時間・料金・予約の要否を確かめるコツを、公式の画面例付きで紹介します。',
    href: '/ai/muse-beginners-guide/',
    image: 'https://about.fb.com/ja/wp-content/uploads/sites/15/2026/10/3_Muse_in-app.jpg?w=960',
    imageAlt: 'Meta公式のMuseのアプリ画面。初回設定、機能紹介、献立を頼んだ会話が並ぶ',
    featured: false,
  },
];
export function getAiRoomArticle(href: string) {
  const matches = aiRoomArticles.filter(article => article.href === href);
  if (matches.length !== 1) throw new Error(`Expected exactly one AI Room article for ${href}`);
  return matches[0];
}
