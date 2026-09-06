import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://spady.net',
  vite: { cacheDir: './.astro/vite-cache' },
  build: {
    // プレビュー確認をしやすくするため、CSSをHTMLに埋め込む。
    // 本番でファイル分離したい場合は 'auto' に戻す。
    inlineStylesheets: 'always',
  },
});
