export async function onRequest(context) {
  const url = new URL(context.request.url);
  let shouldRedirect = false;

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
