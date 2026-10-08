import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const sharp=require('sharp');
const logo=(await readFile(new URL('../public/logo.png',import.meta.url))).toString('base64');
// Original typographic artwork, rendered as PNG for social sharing.
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#f8f7f3"/><rect x="0" y="0" width="1200" height="8" fill="#ed2038"/>
<image href="data:image/png;base64,${logo}" x="64" y="57" width="100" height="100"/>
<g font-family="Hiragino Sans, Hiragino Kaku Gothic ProN, sans-serif" fill="#203032">
<text x="193" y="109" font-size="23" font-weight="600">店舗・小規模事業者のための</text><text x="193" y="143" font-size="23" font-weight="600">デジタルサービス</text>
<text x="64" y="278" font-size="56" font-weight="700" letter-spacing="-3">お店の集客と運営を、</text>
<text x="64" y="366" font-size="56" font-weight="700" letter-spacing="-3" fill="#2157be">もっとシンプルに。</text>
<path d="M66 389h494" stroke="#c9d4dd" stroke-width="5"/>
<text x="67" y="463" font-size="21">難しいデジタルを、現場で使える形に。</text>
<text x="67" y="555" font-size="18" fill="#607270">自社SaaSの企画・開発 ／ 広告・LINE・Web制作の支援</text>
<text x="1022" y="578" font-size="18" fill="#50605f">spady.net</text>
</g>
<rect x="736" y="84" width="400" height="430" rx="160" fill="#e8eff4"/>
<ellipse cx="936" cy="299" rx="150" ry="160" fill="none" stroke="#a4bccb"/>
<circle cx="811" cy="212" r="10" fill="#ed2038"/>
<g transform="translate(827 225)"><rect x="10" y="40" width="200" height="135" fill="#fffdf4"/><rect x="0" width="220" height="49" rx="12" fill="#f15a5d"/><path d="M44 0h44v37q0 12-12 12H56q-12 0-12-12zM132 0h44v37q0 12-12 12h-20q-12 0-12-12z" fill="#fffdf4"/><rect x="30" y="78" width="82" height="54" fill="#d0e0e7" stroke="#214656" stroke-width="5"/><rect x="135" y="76" width="53" height="99" fill="#214656"/><rect x="141" y="82" width="41" height="41" fill="#d0e0e7"/></g>
<g fill="white" stroke="#d3dfe5"><rect x="734" y="158" width="163" height="66" rx="12"/><rect x="969" y="390" width="164" height="66" rx="12"/></g>
<g font-family="Hiragino Sans, sans-serif" font-size="17" font-weight="600" fill="#2157be"><text x="765" y="199">見つけてもらう</text><text x="1000" y="431">また来てもらう</text></g>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile(new URL('../public/home/spady-social.png',import.meta.url).pathname);
await writeFile(new URL('../public/home/spady-social.svg',import.meta.url),svg);
console.log('Social image generated: 1200 × 630');
