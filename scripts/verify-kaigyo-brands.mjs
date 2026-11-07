// Optional browser QA; uses the external Playwright installation used by verify-kaigyo.mjs.
import {createRequire} from 'node:module';
import {mkdir, writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const base = (process.env.PREVIEW_URL || 'http://127.0.0.1:4328').replace(/\/$/, '');
const out = new URL(base.startsWith('https:') ? '../artifacts/kaigyo-public-review/brands/' : '../artifacts/kaigyo-review/brands/', import.meta.url).pathname;
await mkdir(out, {recursive: true});
const browser = await chromium.launch({headless: true, channel: 'chrome'});
const context = await browser.newContext({reducedMotion: 'reduce'});
const page = await context.newPage();
const errors = [];
const checks = [];
const screenshots = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

async function ready() {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll('.service-mark img')].map(async image => {
      image.loading = 'eager';
      try { await image.decode(); } catch { /* Report the exact failing asset below. */ }
    }));
  });
}

async function visit(route) {
  const response = await page.goto(`${base}/akindo/kaigyo/${route}`);
  assert.equal(response?.status(), 200, route);
  await ready();
}

async function inspect(label, width, requiredBrands = []) {
  await ready();
  const result = await page.evaluate(() => {
    const issues = [];
    const marks = [];
    for (const mark of document.querySelectorAll('.service-mark')) {
      const rect = mark.getBoundingClientRect();
      if (!rect.width || !rect.height || getComputedStyle(mark).visibility === 'hidden') continue;
      const brand = mark.getAttribute('data-service-brand');
      const image = mark.querySelector('img');
      if (!image) { issues.push(`${brand}: missing image`); continue; }
      const ir = image.getBoundingClientRect();
      const style = getComputedStyle(image);
      const markStyle = getComputedStyle(mark);
      const padding = ['Top', 'Right', 'Bottom', 'Left'].map(side => parseFloat(markStyle[`padding${side}`]));
      marks.push({brand, src: image.getAttribute('src'), width: ir.width, height: ir.height, padding, naturalWidth: image.naturalWidth});
      if (!image.complete || !image.naturalWidth) issues.push(`${brand}: image did not load (${image.src})`);
      if (style.filter !== 'none' || style.clipPath !== 'none' || style.maskImage !== 'none') issues.push(`${brand}: image filter, clip or mask`);
      if (parseFloat(style.borderRadius) !== 0 || style.objectFit !== 'contain') issues.push(`${brand}: rounded clipping or non-contain object-fit`);
      if (image.naturalWidth && Math.abs(ir.width / ir.height - image.naturalWidth / image.naturalHeight) > 0.02) issues.push(`${brand}: changed aspect ratio`);
      if (brand === 'line' && (ir.width < 39.9 || ir.height < 39.9 || padding.some(value => value < 19.9))) issues.push('line: minimum 40px image / 20px padding not preserved');
      for (let ancestor = mark; ancestor && ancestor !== document.body && ancestor !== document.documentElement; ancestor = ancestor.parentElement) {
        const cs = getComputedStyle(ancestor);
        const ar = ancestor.getBoundingClientRect();
        if (cs.filter !== 'none' || cs.clipPath !== 'none' || cs.maskImage !== 'none') issues.push(`${brand}: ancestor applies filter, clip or mask`);
        if (['hidden', 'clip', 'scroll', 'auto'].includes(cs.overflowX) && (ir.left < ar.left - 1 || ir.right > ar.right + 1)) issues.push(`${brand}: horizontally clipped by ${ancestor.className}`);
        if (['hidden', 'clip', 'scroll', 'auto'].includes(cs.overflowY) && (ir.top < ar.top - 1 || ir.bottom > ar.bottom + 1)) issues.push(`${brand}: vertically clipped by ${ancestor.className}`);
      }
    }
    return {overflow: document.documentElement.scrollWidth > innerWidth + 1, marks, issues};
  });
  checks.push({label, width, ...result});
  assert.equal(result.overflow, false, `${label} at ${width}px: horizontal overflow`);
  assert.equal(result.issues.length, 0, `${label} at ${width}px:\n${result.issues.join('\n')}`);
  for (const brand of requiredBrands) assert(result.marks.some(mark => mark.brand === brand), `${label}: missing visible ${brand} mark`);
}

async function capture(selector, name, width) {
  const locator = page.locator(selector);
  assert(await locator.isVisible(), `${name}: screenshot target not visible`);
  await locator.screenshot({path: `${out}${name}-${width}.png`, animations: 'disabled', style: '.k-header,.k-skip{visibility:hidden!important}'});
  screenshots.push(`${name}-${width}.png`);
}

async function answerDiagnosis(width) {
  for (const pairs of [
    [['business', 'salon'], ['reservation', 'yes']],
    [['payment', 'yes'], ['online', 'no']],
    [['staff', 'solo'], ['line', 'yes']],
    [['skill', 'guide'], ['budget', 'small']],
  ]) {
    for (const [name, value] of pairs) await page.locator(`input[name="${name}"][value="${value}"]`).check();
    if (pairs[0][0] === 'staff') {
      await inspect('diagnosis-line-question', width, ['line']);
      await capture('[data-diagnosis-question="line"]', 'diagnosis-line-question', width);
    }
    await page.locator('[data-diagnosis-next]').click();
  }
  assert(await page.locator('[data-diagnosis-results]').isVisible());
}

try {
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({width, height: 1000});
    await visit('');
    await inspect('home', width, ['instagram', 'line', 'google-business']);
    await capture('.category-cards', 'home-categories', width);

    await visit('checklist/#discovery');
    assert.equal(await page.locator('[data-phase]:visible').getAttribute('id'), 'discovery');
    await inspect('checklist-discovery', width, ['instagram', 'line', 'google-business']);
    await capture('#discovery', 'checklist-discovery', width);

    await visit('tools/');
    await inspect('tools', width, ['instagram', 'line', 'google-business']);
    await capture('.tool-filters', 'tools-filters', width);
    for (let index = 0; index < 3; index++) {
      const card = page.locator('.tool-result:visible').nth(index);
      const id = await card.getAttribute('id');
      await capture(`#${id}`, `tools-card-${index + 1}-${id}`, width);
    }
    await page.locator('[data-category="line"]').click();
    assert.equal(await page.locator('[data-category="line"]').getAttribute('aria-pressed'), 'true');
    await inspect('tools-line-selected', width, ['line']);
    await capture('.tool-filters', 'tools-filters-line-selected', width);

    await visit('start/salon/');
    await inspect('salon', width, ['instagram', 'line', 'google-business']);
    for (const section of ['line', 'google', 'instagram']) await capture(`#${section}`, `salon-${section}`, width);

    await visit('diagnosis/');
    await answerDiagnosis(width);
    await inspect('diagnosis-result', width, ['instagram', 'line', 'google-business']);
    await capture('[data-diagnosis-results]', 'diagnosis-result', width);
  }
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log(JSON.stringify({base, checks: checks.length, screenshots: screenshots.length, errors, out}));
} finally {
  await writeFile(`${out}brand-qa-report.json`, JSON.stringify({base, checks, screenshots, errors}, null, 2));
  await browser.close();
}
