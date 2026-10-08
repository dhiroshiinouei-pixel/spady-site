export async function onRequest(context) {
  const url = new URL(context.request.url);
  let shouldRedirect = false;
  // Historical WordPress privacy permalink, documented in the legacy audit.
  if (url.pathname === '/' && url.searchParams.get('page_id') === '601') {
    url.pathname = '/privacy/';
    url.searchParams.delete('page_id');
    shouldRedirect = true;
  }

  const legacyPaths = { '/特定商取引法に基づく表記': '/legal/', '/お問い合わせフォーム': '/contact/' };
  try {
    const oldPath = decodeURIComponent(url.pathname).replace(/\/$/, '');
    if (Object.hasOwn(legacyPaths, oldPath)) { url.pathname = legacyPaths[oldPath]; shouldRedirect = true; }
  } catch { /* malformed escapes stay on the ordinary routing path */ }

  if (url.hostname === 'www.spady.net') {
    url.hostname = 'spady.net';
    shouldRedirect = true;
  }

  if (url.pathname === '/akindo') {
    url.pathname = '/akindo/';
    shouldRedirect = true;
  }

  if (shouldRedirect) {
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
