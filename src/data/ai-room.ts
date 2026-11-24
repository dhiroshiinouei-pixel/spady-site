export const aiRoomArticles = [
  {
    category: 'AIの使い方',
    title: 'Chat・Work・Codexの違いは？ChatGPTの使い分けを図解',
    description: 'ChatGPTのChat・Work・Codexの違いを図解。店舗の予約データを例に、相談、資料作成、既存サイトの修正をどう使い分けるか、指示文と切り替え方まで解説します。',
    href: '/ai/chat-work-codex/',
    image: '/ai-media/chat-work-codex.webp',
    imageAlt: '吹き出し、資料、コードのアイコンでChat・Work・Codexを比較した図',
    featured: false,
  },
  {
    category: 'AIの新機能',
    title: 'ChatGPTのGPT-6.2とは？通常チャット・Work・Codexの違い',
    description: '通常チャットに登場したGPT-6.2を初心者向けに図解。Chat・Work・CodexとSol・Astraの違い、公式比較テスト、画像を添付して試すための指示文を紹介します。',
    href: '/ai/gpt-6-2/',
    image: '/ai-media/gpt-6-2.webp',
    imageAlt: '画像を添付したチャットと確認項目のチェックを描いたGPT-6.2のイメージ',
    featured: false,
  },
  {
    category: 'AIの新機能',
    title: 'ChatGPT Spaceとは？Plusで始める使い方と共有の注意点',
    description: 'ChatGPT Spaceとは？Plusへの提供開始をきっかけに、通常のチャットやProjectsとの違い、最初のページの作り方、無料プランへの共有制限を初心者向けに解説。すぐ使える指示文付き。',
    href: '/ai/chatgpt-space/',
    image: '/ai-media/chatgpt-space.webp',
    imageAlt: '青紫の光でつながる左のチャットと右の文書を描いたChatGPT Spaceのイメージ',
    featured: false,
  },
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
