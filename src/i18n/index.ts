import ja from './ja.json';
import en from './en.json';
import zhHant from './zh-hant.json';
import zhHans from './zh-hans.json';
import ko from './ko.json';

export const locales = [
  { id: 'ja', tag: 'ja', label: '日本語', og: 'ja_JP' },
  { id: 'en', tag: 'en', label: 'English', og: 'en_US' },
  { id: 'zh-hant', tag: 'zh-Hant', label: '繁體中文', og: 'zh_TW' },
  { id: 'zh-hans', tag: 'zh-Hans', label: '简体中文', og: 'zh_CN' },
  { id: 'ko', tag: 'ko', label: '한국어', og: 'ko_KR' },
] as const;
export type Locale = typeof locales[number]['id'];
export type Page = '' | 'contact/' | 'contact/thanks/' | 'privacy/';
const dictionaries: Record<Locale, typeof ja> = { ja, en, 'zh-hant': zhHant, 'zh-hans': zhHans, ko };
export const messages = (lang: Locale = 'ja') => dictionaries[lang];
export const pathFor = (lang: Locale, page: Page = '') => `${lang === 'ja' ? '/' : `/${lang}/`}${page}`;
export const marketingPath = (lang: Locale) => lang === 'ja' ? '/fullfunnelmarketing/' : '/en/fullfunnelmarketing/';
export const absolute = (path: string) => new URL(path, 'https://spady.net').href;
export const calendarPath = (lang: Locale) => `https://otaru.spady.net/${lang === 'ja' ? '' : `${lang}/`}`;
