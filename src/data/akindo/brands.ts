/** Official source files and usage notes: docs/akindo-brand-assets.md. */
export const serviceBrands = {
  instagram: { file: 'instagram-glyph-gradient-160.png', name: 'Instagram', width: 40, height: 40, padding: 20 },
  line: { file: 'line-brand-icon-160.png', name: 'LINE', width: 40, height: 40, padding: 20 },
  'google-business': { file: 'google-business-profile.svg', name: 'Googleビジネスプロフィール', width: 40, height: 40, padding: 20 },
  'google-sheets': { file: 'google-sheets.svg', name: 'Google スプレッドシート', width: 40, height: 40, padding: 20 },
  freee: { file: 'freee-accounting.svg', name: 'freee会計', width: 144, height: 56.42, padding: 20 },
  square: { file: 'square-wordmark.svg', name: 'Square', width: 120, height: 30.09, padding: 20 },
  stores: { file: 'stores-web-wordmark.svg', name: 'STORES', width: 128, height: 27.58, padding: 20 },
  studio: { file: 'studio-wordmark.svg', name: 'Studio', width: 120, height: 25.5, padding: 20 },
} as const;

export type ServiceBrandId = keyof typeof serviceBrands;

/** Only categories that actually name a service use its brand. */
export const categoryBrands: Record<string, ServiceBrandId | undefined> = {
  line: 'line', google: 'google-business', instagram: 'instagram',
};

/** Natural wrapping for long service names in narrow cards, without forced breaks. */
export function serviceLabelParts(label: string): string[] {
  const names = [
    { name: 'Googleビジネスプロフィール', parts: ['Google', 'ビジネス', 'プロフィール'] },
    { name: 'LINE公式アカウント', parts: ['LINE公式', 'アカウント'] },
    { name: 'Instagram', parts: ['Instagram'] },
  ];
  const service = names.find(item => label.startsWith(item.name));
  return service ? [...service.parts, label.slice(service.name.length)].filter(Boolean) : [label];
}
