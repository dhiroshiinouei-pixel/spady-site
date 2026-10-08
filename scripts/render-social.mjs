import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const logo = (await readFile(new URL('../public/logo.png', import.meta.url))).toString('base64');
const sculpture = (await sharp(await readFile(new URL('../public/home/crystal-hero.webp', import.meta.url))).png().toBuffer()).toString('base64');

// Original typographic composition using the unchanged Spady logo and the
// original 3D concept asset. Keep copy in SVG text so future updates are simple.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><radialGradient id="light"><stop stop-color="#e4ddf8"/><stop offset="1" stop-color="#fcfcfa" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="630" fill="#fcfcfa"/>
  <ellipse cx="940" cy="355" rx="300" ry="245" fill="url(#light)"/>
  <image href="data:image/png;base64,${sculpture}" x="563" y="7" width="630" height="630"/>
  <image href="data:image/png;base64,${logo}" x="65" y="55" width="77" height="77"/>
  <g font-family="Hiragino Sans, Hiragino Kaku Gothic ProN, sans-serif" fill="#242c42">
    <text x="64" y="272" font-size="67" font-weight="700" letter-spacing="-3.3">お店の毎日を、</text>
    <text x="64" y="362" font-size="74" font-weight="700" letter-spacing="-3.3" fill="#5262bb">シンプルに。</text>
    <text x="68" y="429" font-size="20" font-weight="500" letter-spacing="-.25">集客と店舗運営を支えるデジタルサービス</text>
    <text x="68" y="568" font-size="21" font-weight="600" letter-spacing=".2">spady.net</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(new URL('../public/home/spady-social.png', import.meta.url).pathname);
await writeFile(new URL('../public/home/spady-social.svg', import.meta.url), svg);
console.log('Social image generated: 1200 × 630');
