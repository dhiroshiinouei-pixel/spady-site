// Delivery optimization only; preserves the original generated PNG artwork.
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const target = new URL('../public/akindo/kaigyo-assets/illustrations/', import.meta.url);
await mkdir(target, {recursive: true});
for (const slug of ['diagnosis-planning-v3', 'tools-workbench-v3', 'salon-preparation-v3']) {
  const source = new URL(`../design/kaigyo-generated/${slug}.png`, import.meta.url).pathname;
  for (const width of [1200, 640]) {
    const destination = new URL(`${slug}${width === 640 ? '-640' : ''}.webp`, target).pathname;
    const info = await sharp(source).resize({width, withoutEnlargement: true}).webp({quality: 85, effort: 6}).toFile(destination);
    console.log(`${slug}: ${info.width} × ${info.height}, ${Math.round(info.size / 1024)} KiB`);
  }
}
