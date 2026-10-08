import { services } from '../data/services';
import { locales } from '../i18n';
export const prerender = true;
export function GET() {
 const localized = locales.flatMap(l => ['', 'contact/', 'privacy/'].map(page => `/${l.id === 'ja' ? '' : `${l.id}/`}${page}`));
 // Legal is excluded until its visible publication review has been approved (noindex).
 const paths = [...localized, '/services/', ...services.map(s=>s.detailUrl), '/about/', '/projects/', '/support/', '/terms/', '/cancellation/', '/news/', '/news/saas-development/', '/fullfunnelmarketing/', '/en/fullfunnelmarketing/', '/akindo/', '/ryugaku/', '/ryugaku/en/', '/ryugaku/privacy/', '/ryugaku/en/privacy/', '/book/'];
 const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(paths)].map(path=>`\n  <url><loc>https://spady.net${path}</loc></url>`).join('')}\n</urlset>\n`;
 return new Response(xml, {headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
