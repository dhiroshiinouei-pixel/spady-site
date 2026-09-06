"""Check generated public pages, reciprocal language metadata, assets and links."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import json, re, struct, unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
LOCALES = {'ja':'ja','en':'en','zh-hant':'zh-Hant','zh-hans':'zh-Hans','ko':'ko'}
PAGES = ['', 'contact/', 'privacy/', 'contact/thanks/']
def route(lang, page): return ('/' if lang=='ja' else '/'+lang+'/')+page
class Page(HTMLParser):
 def __init__(self, html):
  super().__init__(); self.meta={}; self.links=[]; self.anchors=[]; self.images=[]; self.ids=[]; self.h1=0; self.scripts=[]; self.script=None; self.lang=None; self.form=None
  self.feed(html)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='html': self.lang=a.get('lang')
  if tag=='meta': self.meta[a.get('name',a.get('property'))]=a.get('content')
  if tag=='link': self.links.append(a)
  if tag=='a': self.anchors.append(a)
  if tag=='img': self.images.append(a)
  if tag=='h1': self.h1+=1
  if a.get('id'): self.ids.append(a['id'])
  if tag=='script': self.script={'attrs':a,'text':''}; self.scripts.append(self.script)
  if tag=='form': self.form=a
 def handle_data(self,data):
  if self.script is not None: self.script['text']+=data
 def handle_endtag(self,tag):
  if tag=='script': self.script=None

def file_for(url):
 path=unquote(urlparse(url).path)
 target=DIST / path.lstrip('/')
 if path.endswith('/') or not target.suffix: target=target/'index.html'
 return target

class SeoTests(unittest.TestCase):
 def test_all_localized_pages(self):
  for lang,tag in LOCALES.items():
   for path in PAGES:
    with self.subTest(lang=lang,page=path):
     url='https://spady.net'+route(lang,path);html=file_for(url).read_text();p=Page(html)
     self.assertEqual(p.lang,tag);self.assertEqual(p.h1,1);self.assertEqual(len(p.ids),len(set(p.ids)))
     self.assertEqual([l['href'] for l in p.links if l.get('rel')=='canonical'],[url])
     alternatives={l['hreflang']:l['href'] for l in p.links if l.get('rel')=='alternate'}
     expected={v:'https://spady.net'+route(k,path) for k,v in LOCALES.items()};expected['x-default']='https://spady.net'+route('ja',path)
     self.assertEqual(alternatives,expected)
     self.assertEqual(p.meta['og:url'],url);self.assertTrue(p.meta['description']);self.assertEqual(p.meta['og:title'],p.meta['twitter:title'])
     self.assertEqual(p.meta['og:image'],p.meta['twitter:image']);self.assertEqual(p.meta['og:image:width'],'1200');self.assertEqual(p.meta['og:image:height'],'630')
     self.assertTrue(file_for(p.meta['og:image']).exists())
     self.assertEqual('noindex' in p.meta.get('robots',''),path=='contact/thanks/')
     schemas=[json.loads(s['text']) for s in p.scripts if s['attrs'].get('type')=='application/ld+json']
     self.assertEqual(schemas[0]['@graph'][-1]['inLanguage'],tag)
     self.assertIn('GTM-NV5VRH3G',html)
     if path=='contact/': self.assertEqual(p.form['action'],'/api/contact?lang='+lang)
     for a in p.images:
      self.assertIn('alt',a);self.assertTrue(a.get('width'));self.assertTrue(a.get('height'));self.assertTrue(file_for(a['src']).exists(),a['src'])
     for a in p.anchors:
      href=a.get('href','');parsed=urlparse(href)
      if not href or parsed.netloc and parsed.netloc!='spady.net' or parsed.scheme not in ('','https'): continue
      target=file_for(href) if parsed.path else file_for(url)
      self.assertTrue(target.exists(),href)
      if parsed.fragment:
       dest=p if not parsed.path else Page(target.read_text())
       self.assertIn(unquote(parsed.fragment),dest.ids,href)
 def test_marketing_language_pair(self):
  for lang in ['ja','en']:
   path='/fullfunnelmarketing/' if lang=='ja' else '/en/fullfunnelmarketing/'
   p=Page(file_for(path).read_text())
   alts={a['hreflang']:a['href'] for a in p.links if a.get('rel')=='alternate'}
   self.assertEqual(alts['en'],'https://spady.net/en/fullfunnelmarketing/')
   self.assertEqual(alts['ja'],'https://spady.net/fullfunnelmarketing/')
 def test_sitemap_and_og_image(self):
  root=ET.parse(DIST/'sitemap.xml'); urls=[e.text for e in root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
  self.assertEqual(len(urls),len(set(urls)))
  for url in urls: self.assertTrue(file_for(url).exists(),url)
  for lang in LOCALES:
   for page in PAGES:
    self.assertEqual('https://spady.net'+route(lang,page) in urls,page!='contact/thanks/')
  raw=(DIST/'og.png').read_bytes();self.assertEqual(raw[:8],b'\x89PNG\r\n\x1a\n');self.assertEqual(struct.unpack('>II',raw[16:24]),(1200,630))
 def test_translated_text_has_safe_markup(self):
  for lang in LOCALES:
   data=json.loads((ROOT/'src/i18n'/f'{lang}.json').read_text())
   def walk(value):
    if isinstance(value,dict):
     for v in value.values(): walk(v)
    elif isinstance(value,list):
     for v in value: walk(v)
    else:
     tags=re.findall(r'<[^>]+>',value)
     self.assertTrue(all(tag in ['<br />','<span class="highlight-ink">','</span>'] for tag in tags),value)
   walk(data)
if __name__=='__main__': unittest.main()
