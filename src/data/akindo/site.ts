export const kaigyoBase = '/akindo/kaigyo/';
export const updatedAt = '2026-11-07';
// Switch only after the user approves a full launch; also remove the matching public/_headers rule.
export const kaigyoTestRelease = true;
// Reused verbatim from the existing public/akindo/index.html. Never infer a LINE URL.
export const lineUrl = 'https://s.lmes.jp/landing-qr/2002523511-OZpWpGdr?uLand=QjL9jt';
export const kaigyoPages = [
  { label: '開業準備', href: kaigyoBase },
  { label: 'やること', href: `${kaigyoBase}checklist/` },
  { label: '道具を探す', href: `${kaigyoBase}tools/` },
  { label: '業種別', href: `${kaigyoBase}#industries` },
  { label: '学ぶ', href: '/akindo/' },
];
export const kaigyoPaths = [kaigyoBase, `${kaigyoBase}checklist/`, `${kaigyoBase}diagnosis/`, `${kaigyoBase}tools/`, `${kaigyoBase}start/salon/`];
