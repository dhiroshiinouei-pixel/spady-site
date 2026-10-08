"""Regression checks for the built corporate site; no network or form submissions.

Run after the Astro build: python3 test/corporate.test.py
Checks generated HTML rather than relying on the component source alone.
"""

from functools import lru_cache
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, unquote, urljoin, urlparse
import json
import os
import re
import shutil
import struct
import subprocess
import unittest
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
ORIGIN = "https://spady.net"
LOCALES = ("", "en", "ko", "zh-hant", "zh-hans")
LEGACY_ROUTES = tuple(
    ("/" + lang if lang else "") + "/" + page
    for lang in LOCALES
    for page in ("", "contact/", "privacy/", "contact/thanks/")
) + (
    "/fullfunnelmarketing/", "/en/fullfunnelmarketing/", "/book/",
    "/ryugaku/", "/ryugaku/privacy/", "/ryugaku/en/", "/ryugaku/en/privacy/",
    "/akindo/", "/akindo/privacy.html",
)
CORE_ROUTES = (
    "/", "/services/", "/about/", "/projects/", "/support/",
    "/news/", "/news/saas-development/", "/contact/", "/privacy/",
    "/legal/", "/terms/", "/cancellation/",
)
TOPICS = {"gbp", "mini-app", "marketing", "billing", "other"}
STATUS_LABELS = {
    "planning": "企画中", "developing": "開発中", "preparing": "公開準備中",
    "available": "提供中", "ended": "提供終了",
}


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.meta = {}
        self.links = []
        self.anchors = []
        self.assets = []
        self.images = []
        self.forms = []
        self.inputs = []
        self.ids = []
        self.scripts = []
        self.controls = []
        self.html_lang = None
        self.h1_count = 0
        self.title = ""
        self.text = ""
        self._script = None
        self._title = False
        self._style = False
        self._control = None
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.html_lang = a.get("lang")
        if a.get("id"):
            self.ids.append(a["id"])
        if tag == "meta":
            self.meta[a.get("name", a.get("property"))] = a.get("content", "")
        if tag == "link":
            self.links.append(a)
            if a.get("rel") in {"stylesheet", "icon", "apple-touch-icon", "modulepreload"}:
                self.assets.append(a.get("href", ""))
        if tag in {"a", "button"}:
            self._control = {"tag": tag, "attrs": a, "text": ""}
            self.controls.append(self._control)
        if tag == "a":
            self.anchors.append(a)
        if tag in {"img", "script", "source", "video", "audio"} and a.get("src"):
            self.assets.append(a["src"])
        if a.get("srcset") and not a["srcset"].startswith("data:"):
            self.assets.extend(part.strip().split()[0] for part in a["srcset"].split(","))
        if tag == "img":
            self.images.append(a)
        if tag == "h1":
            self.h1_count += 1
        if tag == "title":
            self._title = True
        if tag == "style":
            self._style = True
        if tag == "script":
            self._script = {"attrs": a, "text": ""}
            self.scripts.append(self._script)
        if tag == "form":
            self.forms.append(a)
        if tag in {"input", "select", "textarea", "option"}:
            self.inputs.append({"tag": tag, **a})

    def handle_data(self, data):
        if self._script is not None:
            self._script["text"] += data
        elif not self._style:
            self.text += data + " "
        if self._title:
            self.title += data
        if self._control is not None:
            self._control["text"] += data

    def handle_endtag(self, tag):
        if tag == "script":
            self._script = None
        if tag == "style":
            self._style = False
        if tag == "title":
            self._title = False
        if tag in {"a", "button"}:
            self._control = None


def local_file(url):
    parsed = urlparse(url)
    target = DIST / unquote(parsed.path).lstrip("/")
    if parsed.path.endswith("/") or not target.suffix:
        target /= "index.html"
    return target


@lru_cache(maxsize=None)
def document(url):
    return Document(local_file(url).read_text(encoding="utf-8"))


def walk_json(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk_json(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_json(child)


def node_binary():
    explicit = os.environ.get("NODE_BINARY")
    bundled = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
    node = explicit or (str(bundled) if bundled.exists() else shutil.which("node"))
    if not node:
        raise RuntimeError("Node.js 24+ is required to inspect the TypeScript service catalog")
    return node


@lru_cache(maxsize=1)
def catalog_and_paths():
    # Execute the actual catalog and the actual Astro route factory. The extra entry
    # is in memory only: this check does not modify the site's files or run a build.
    script = r"""
import { readFileSync } from 'node:fs';
import { services, statusLabels } from './src/data/services.ts';
const source = readFileSync('./src/pages/services/[slug].astro', 'utf8');
const start = source.indexOf('function getStaticPaths(');
if (start < 0) throw new Error('Service route factory not found');
const opening = source.indexOf('{', start);
let depth = 1, end = opening + 1;
for (; end < source.length && depth; end++) {
  if (source[end] === '{') depth++;
  if (source[end] === '}') depth--;
}
const factory = new Function('services', source.slice(start, end) + ';return getStaticPaths();');
const additional = {...structuredClone(services[0]), id: 'catalog-extension-check',
  name: 'Catalog extension check', detailUrl: '/services/catalog-extension-check/'};
const paths = factory(services);
const extendedPaths = factory([...services, additional]);
console.log(JSON.stringify({ services, statusLabels, paths, extendedPaths }));
"""
    result = subprocess.run(
        [node_binary(), "--input-type=module", "-e", script], cwd=ROOT,
        text=True, capture_output=True, timeout=30, check=True,
    )
    return json.loads(result.stdout)


class CorporateSiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not (DIST / "index.html").exists():
            raise RuntimeError("Build the site before running the corporate regression checks")
        cls.catalog = catalog_and_paths()
        cls.routes = CORE_ROUTES + tuple(s["detailUrl"] for s in cls.catalog["services"])

    def test_each_page_has_distinct_metadata_and_valid_structure(self):
        titles, descriptions = [], []
        for route in self.routes:
            with self.subTest(route=route):
                page = document(route)
                canonical = ORIGIN + route
                self.assertEqual(page.html_lang, "ja")
                self.assertEqual(page.h1_count, 1)
                self.assertIn("main", page.ids)
                self.assertEqual(len(page.ids), len(set(page.ids)), "Duplicate element IDs")
                self.assertTrue(page.title.strip())
                self.assertTrue(page.meta.get("description", "").strip())
                exposed_markup = re.search(r"</?(?:br|span|strong|em)(?:\s[^>]*)?/?>", page.text)
                self.assertIsNone(exposed_markup, "HTML markup escaped into visible copy")
                self.assertEqual([link.get("href") for link in page.links if link.get("rel") == "canonical"], [canonical])
                self.assertEqual(page.meta.get("og:url"), canonical)
                self.assertEqual(page.meta.get("og:title"), page.title)
                self.assertEqual(page.meta.get("twitter:title"), page.title)
                self.assertEqual(page.meta.get("og:description"), page.meta["description"])
                self.assertEqual(page.meta.get("og:image"), page.meta.get("twitter:image"))
                self.assertEqual(page.meta.get("og:image:width"), "1200")
                self.assertEqual(page.meta.get("og:image:height"), "630")
                self.assertTrue(local_file(page.meta["og:image"]).is_file())
                image_bytes = local_file(page.meta["og:image"]).read_bytes()
                self.assertEqual(image_bytes[:8], b"\x89PNG\r\n\x1a\n")
                self.assertEqual(struct.unpack(">II", image_bytes[16:24]), (1200, 630))
                titles.append(page.title)
                descriptions.append(page.meta["description"])
        self.assertEqual(len(titles), len(set(titles)), "Page titles must be distinct")
        self.assertEqual(len(descriptions), len(set(descriptions)), "Page descriptions must be distinct")

    def test_structured_data_does_not_sell_unreleased_products(self):
        for route in self.routes:
            with self.subTest(route=route):
                page = document(route)
                schemas = [json.loads(item["text"]) for item in page.scripts
                           if item["attrs"].get("type") == "application/ld+json"]
                self.assertTrue(schemas, "Missing structured data")
                objects = list(walk_json(schemas))
                schema_types = {t for item in objects for t in
                                (item.get("@type", []) if isinstance(item.get("@type"), list)
                                 else [item.get("@type")])}
                self.assertIn("Organization", schema_types)
                self.assertIn("WebSite", schema_types)
                self.assertFalse({"Product", "Offer", "AggregateOffer"} & schema_types)
                self.assertTrue(any(item.get("url") == ORIGIN + route and item.get("inLanguage") == "ja"
                                    for item in objects))

    def test_all_internal_links_fragments_and_assets_resolve(self):
        for route in self.routes:
            page = document(route)
            for anchor in page.anchors:
                href = anchor.get("href", "")
                with self.subTest(route=route, href=href):
                    self.assertTrue(href, "Anchor without a destination")
                    self.assertFalse(href.startswith("javascript:"))
                    absolute = urljoin(ORIGIN + route, href)
                    parsed = urlparse(absolute)
                    if parsed.scheme not in {"http", "https"} or parsed.netloc not in {"spady.net", "www.spady.net"}:
                        continue
                    target = local_file(absolute)
                    self.assertTrue(target.is_file(), f"Missing route: {absolute}")
                    if parsed.fragment:
                        self.assertIn(unquote(parsed.fragment), document(absolute).ids,
                                      f"Missing fragment: {absolute}")
                    if parsed.path == "/contact/" and "topic" in parse_qs(parsed.query):
                        self.assertIn(parse_qs(parsed.query)["topic"][0], TOPICS)
            for asset in page.assets:
                absolute = urljoin(ORIGIN + route, asset)
                parsed = urlparse(absolute)
                if parsed.scheme in {"http", "https"} and parsed.netloc == "spady.net":
                    with self.subTest(route=route, asset=asset):
                        self.assertTrue(local_file(absolute).is_file())
            for image in page.images:
                with self.subTest(route=route, image=image.get("src")):
                    self.assertIn("alt", image)
                    self.assertRegex(image.get("width", ""), r"^[1-9]\d*$")
                    self.assertRegex(image.get("height", ""), r"^[1-9]\d*$")

    def test_prelaunch_status_and_no_checkout_controls(self):
        for service in self.catalog["services"]:
            with self.subTest(service=service["id"]):
                page = document(service["detailUrl"])
                self.assertIn(STATUS_LABELS[service["status"]], page.text)
                if service["category"] != "product":
                    continue
                self.assertIn(STATUS_LABELS[service["status"]], page.title)
                self.assertIn(service["status"], {"planning", "developing", "preparing"})
                self.assertFalse(service["pricing"]["published"])
                self.assertIn("未定", page.text)
                self.assertIn("検討", page.text)
                self.assertRegex(page.text, r"利用申し込みや決済.*?行っていません|申し込みや決済.*?受け付けていません")
                for control in page.controls:
                    label = re.sub(r"\s+", "", control["text"])
                    self.assertNotRegex(label, r"購入|今すぐ申し込|無料で始め|利用開始|トライアル開始")
                for anchor in page.anchors:
                    self.assertNotRegex(anchor.get("href", ""), r"checkout\.stripe\.com|buy\.stripe\.com|/(?:checkout|subscribe|signup)(?:/|\?|$)")
                self.assertNotRegex(page.text, r"(?:月額|年額)\s*[¥￥]?[\d,]+|[¥￥][\d,]+")

    def test_catalog_is_complete_and_drives_service_routes(self):
        services = self.catalog["services"]
        self.assertEqual(self.catalog["statusLabels"], STATUS_LABELS)
        self.assertEqual(len({service["id"] for service in services}), len(services))
        required = {"id", "name", "category", "summary", "audience", "icon", "status",
                    "features", "detailUrl", "pricing", "contactTopic"}
        paths = self.catalog["paths"]
        for service in services:
            with self.subTest(service=service["id"]):
                self.assertTrue(required <= service.keys())
                self.assertIn(service["status"], STATUS_LABELS)
                self.assertIn(service["contactTopic"], TOPICS)
                self.assertTrue(service["audience"])
                self.assertTrue(service["features"])
                self.assertEqual(service["detailUrl"], f'/services/{service["id"]}/')
                self.assertTrue(local_file(service["detailUrl"]).is_file())
                self.assertIn(service["detailUrl"], [a.get("href") for a in document("/services/").anchors])
                self.assertTrue(any(path["params"].get("slug") == service["id"] and
                                    path["props"].get("service") == service for path in paths))
        extended = self.catalog["extendedPaths"]
        self.assertEqual(len(extended), len(paths) + 1)
        self.assertEqual(extended[-1]["params"]["slug"], "catalog-extension-check")
        self.assertEqual(extended[-1]["props"]["service"]["detailUrl"], "/services/catalog-extension-check/")

    def test_all_29_existing_routes_and_legacy_entrypoints_remain(self):
        self.assertEqual(len(LEGACY_ROUTES), 29)
        for route in LEGACY_ROUTES:
            with self.subTest(route=route):
                self.assertTrue(local_file(route).is_file(), "Existing public page removed")
                self.assertTrue(document(route).title.strip())
        self.assertTrue((DIST / "404.html").is_file())
        redirects = (DIST / "_redirects").read_text()
        self.assertRegex(redirects, r"(?m)^/marketing\s+/fullfunnelmarketing/\s+301$")
        self.assertRegex(redirects, r"(?m)^/marketing/\s+/fullfunnelmarketing/\s+301$")
        for fragment in ("about", "projects", "stories", "profile", "contact"):
            with self.subTest(legacy_home_fragment=fragment):
                self.assertIn(fragment, document("/").ids, "Previously public homepage anchor removed")
        for lang in LOCALES[1:]:
            for route in (f"/{lang}/", f"/{lang}/contact/", f"/{lang}/privacy/", f"/{lang}/contact/thanks/"):
                for anchor in document(route).anchors:
                    parsed = urlparse(urljoin(ORIGIN + route, anchor.get("href", "")))
                    if parsed.netloc == "spady.net" and parsed.fragment:
                        self.assertIn(unquote(parsed.fragment), document(parsed.geturl()).ids)

    def test_sitemap_covers_every_indexable_corporate_page(self):
        sitemap = ET.parse(DIST / "sitemap.xml")
        urls = [node.text for node in sitemap.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
        self.assertEqual(len(urls), len(set(urls)))
        for route in self.routes:
            with self.subTest(route=route):
                if "noindex" in document(route).meta.get("robots", ""):
                    self.assertNotIn(ORIGIN + route, urls)
                else:
                    self.assertIn(ORIGIN + route, urls)
        self.assertIn("Sitemap: https://spady.net/sitemap.xml", (DIST / "robots.txt").read_text())

    def test_actual_inquiry_routes_and_known_operator_information(self):
        contact = document("/contact/")
        self.assertTrue(any(form.get("action") == "/api/contact?lang=ja" and
                            form.get("method", "").lower() == "post" for form in contact.forms))
        self.assertTrue((ROOT / "functions/api/contact.js").is_file())
        fields = {item["name"]: item for item in contact.inputs if item.get("name")}
        for name in ("name", "email", "topic", "message", "consent"):
            self.assertIn("required", fields[name], name)
        self.assertEqual(fields["email"].get("type"), "email")
        self.assertEqual(fields["consent"].get("type"), "checkbox")
        self.assertIn("website", fields)
        self.assertEqual({item["data-topic"] for item in contact.inputs if item.get("data-topic")}, TOPICS)
        for route in ("/about/", "/support/", "/contact/", "/legal/", "/privacy/"):
            page = document(route)
            self.assertNotIn("株式会社Spady", page.text)
            self.assertNotIn("合同会社Spady", page.text)
            if route != "/about/":
                self.assertIn("mailto:info@spady.net", [a.get("href") for a in page.anchors])
        about = document("/about/").text
        for fact in ("井上", "博史", "個人事業", "北海道小樽市銭函", "全国", "前職", "出向"):
            self.assertIn(fact, about)
        self.assertIn("80社以上", about)
        self.assertIn("100以上", about)
        self.assertIn("パスワード", document("/support/").text)
        self.assertIn("認証コード", document("/support/").text)


if __name__ == "__main__":
    unittest.main(verbosity=2)
