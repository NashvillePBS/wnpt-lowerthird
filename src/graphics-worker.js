/* graphics.wnpt.app: the studio's static files, plus one small API the sign generator uses.
 *
 * POST /api/shortlink  { url, path?, title? }  ->  { shortURL, path }  (a wnpt.tv link in Short.io)
 * GET  /api/shortlink/status                   ->  { configured: true|false }
 *
 * Every request to this hostname already passes Cloudflare Access, and this Worker checks the Access
 * JWT again before it spends the Short.io key (the hub does the same): no session, no link. The key is
 * the Worker secret SHORTIO_API_KEY, set with `wrangler secret put` by Shane (shane.md); it never
 * reaches the browser. Everything that is not /api/* is served from the repository's files.
 */

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

let jwksCache = { keys: null, at: 0 };
async function jwks(teamDomain) {
  if (jwksCache.keys && Date.now() - jwksCache.at < 10 * 60 * 1000) return jwksCache.keys;
  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error('certs ' + res.status);
  const body = await res.json();
  jwksCache = { keys: body.keys || [], at: Date.now() };
  return jwksCache.keys;
}
const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0));

// Verifies the Access JWT (RS256) against the team's keys, the application's audience and the clock.
async function verifyAccess(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const m = /(?:^|;\s*)CF_Authorization=([^;]+)/.exec(cookie);
  const token = request.headers.get('Cf-Access-Jwt-Assertion') || (m && m[1]);
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  let header, payload;
  try { header = JSON.parse(new TextDecoder().decode(b64url(parts[0]))); payload = JSON.parse(new TextDecoder().decode(b64url(parts[1]))); } catch { return null; }
  const now = Math.floor(Date.now() / 1000);
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (payload.iss !== `https://${env.TEAM_DOMAIN}` || !aud.includes(env.POLICY_AUD) || !(payload.exp > now)) return null;
  const keys = await jwks(env.TEAM_DOMAIN);
  const jwk = keys.find(k => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
  return ok ? { email: payload.email || null } : null;
}

const PATH_RE = /^[a-z0-9][a-z0-9-]{0,62}$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    if (url.pathname === '/api/shortlink/status' && request.method === 'GET') {
      return json({ configured: !!env.SHORTIO_API_KEY, domain: env.SHORTIO_DOMAIN || null });
    }
    if (url.pathname === '/api/shortlink' && request.method === 'POST') {
      const who = await verifyAccess(request, env);
      if (!who) return json({ error: 'Sign in to Nashville PBS first.' }, 401);
      if (!env.SHORTIO_API_KEY) return json({ error: 'Short links are not set up yet (SHORTIO_API_KEY missing). The QR code uses the full address instead.' }, 503);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Bad request.' }, 400); }
      let target = String(body.url || '').trim();
      if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(target)) target = 'https://' + target;
      let parsed;
      try { parsed = new URL(target); } catch { return json({ error: 'That web address does not look right.' }, 400); }
      if (!/^https?:$/.test(parsed.protocol)) return json({ error: 'Only http and https links.' }, 400);
      const path = String(body.path || '').trim().toLowerCase();
      if (path && !PATH_RE.test(path)) return json({ error: 'A short link name is letters, numbers and hyphens, 63 at most.' }, 400);
      const payload = { domain: env.SHORTIO_DOMAIN, originalURL: parsed.toString(), title: String(body.title || 'Graphics studio sign').slice(0, 120) };
      if (path) payload.path = path;
      const res = await fetch('https://api.short.io/links', {
        method: 'POST',
        headers: { Authorization: env.SHORTIO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      if (res.status === 409 || (res.status === 400 && /exist|duplicate|taken/i.test(text))) return json({ error: 'That short link name is already taken. Pick another, or leave it empty.' }, 409);
      if (!res.ok) return json({ error: 'Short.io answered ' + res.status + '.', detail: text.slice(0, 200) }, 502);
      let link = {};
      try { link = JSON.parse(text); } catch { /* keep {} */ }
      if (!link.shortURL) return json({ error: 'Short.io returned no link.' }, 502);
      return json({ shortURL: link.shortURL, path: link.path || path || null, by: who.email });
    }
    return json({ error: 'Not found.' }, 404);
  }
};
