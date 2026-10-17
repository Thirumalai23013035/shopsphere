const { test } = require('@playwright/test');
const { expect, finding, gotoHome } = require('./helpers');

test.describe('Security (basic automated checks - not a substitute for a pentest)', () => {
  test('served over HTTPS and HTTP redirects to HTTPS', async ({ request, baseURL }) => {
    expect(baseURL.startsWith('https://')).toBeTruthy();
    const httpUrl = baseURL.replace('https://', 'http://');
    const r = await request.get(httpUrl, { maxRedirects: 0 }).catch(() => null);
    if (r) expect([301, 302, 307, 308]).toContain(r.status());
  });

  test('security headers present', async ({ request }, testInfo) => {
    const r = await request.get('/');
    const h = r.headers();
    const checks = {
      'strict-transport-security': 'HSTS',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'Clickjacking protection (or CSP frame-ancestors)',
      'content-security-policy': 'CSP',
      'referrer-policy': 'Referrer-Policy',
      'permissions-policy': 'Permissions-Policy',
    };
    const missing = [];
    for (const [k, label] of Object.entries(checks)) if (!h[k]) missing.push(`${k} (${label})`);
    missing.forEach((m) => finding(testInfo, 'Missing header: ' + m));
    // Hard-fail only on the essentials
    expect.soft(h['strict-transport-security'], 'HSTS').toBeTruthy();
    expect.soft(h['x-content-type-options'], 'nosniff').toBeTruthy();
    expect.soft(h['x-frame-options'] || /frame-ancestors/.test(h['content-security-policy'] || ''), 'clickjacking protection').toBeTruthy();
    if (h['server'] || h['x-powered-by']) finding(testInfo, `Server info disclosed: ${h['server'] || ''} ${h['x-powered-by'] || ''}`);
  });

  test('sensitive files are not exposed', async ({ request }) => {
    const probes = [
      ['/.env', /DB_|SECRET|API_KEY|PASSWORD|MONGO/i],
      ['/.git/config', /\[core\]|repositoryformatversion/i],
      ['/package.json', /"dependencies"|"scripts"/i],
      ['/server.js', /require\(|express/i],
      ['/config.json', /password|secret|apikey/i],
    ];
    const leaked = [];
    for (const [p, rx] of probes) {
      const r = await request.get(p);
      if (r.status() === 200 && rx.test(await r.text())) leaked.push(p);
    }
    expect(leaked, 'exposed files: ' + leaked.join(', ')).toHaveLength(0);
  });

  test('no secrets hard-coded in JavaScript bundles', async ({ page, request }, testInfo) => {
    await gotoHome(page);
    const scripts = await page.$$eval('script[src]', (s) => s.map((x) => x.src));
    const patterns = {
      'AWS access key': /AKIA[0-9A-Z]{16}/,
      'Private key': /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
      'Stripe live secret': /sk_live_[0-9a-zA-Z]{10,}/,
      'MongoDB URI with credentials': /mongodb(\+srv)?:\/\/[^\s"']+:[^\s"']+@/,
      'Generic secret assignment': /(secret|password|passwd)["']?\s*[:=]\s*["'][^"']{8,}["']/i,
      'Google API key': /AIza[0-9A-Za-z_\-]{35}/,
    };
    const hits = [];
    for (const src of scripts) {
      const body = await (await request.get(src)).text();
      for (const [name, rx] of Object.entries(patterns)) if (rx.test(body)) hits.push(`${name} in ${src.split('/').pop()}`);
    }
    hits.forEach((h) => finding(testInfo, 'Possible secret: ' + h));
    expect(hits, hits.join('\n')).toHaveLength(0);
  });

  test('cookies use Secure / HttpOnly / SameSite flags', async ({ page, context }, testInfo) => {
    await gotoHome(page);
    const cookies = await context.cookies();
    cookies.forEach((c) => {
      if (!c.secure) finding(testInfo, `Cookie "${c.name}" missing Secure`);
      if (!c.httpOnly) finding(testInfo, `Cookie "${c.name}" missing HttpOnly`);
      if (c.sameSite === 'None') finding(testInfo, `Cookie "${c.name}" SameSite=None`);
    });
  });

  test('auth tokens are not stored in localStorage (XSS-exposure risk)', async ({ page }, testInfo) => {
    await gotoHome(page);
    const keys = await page.evaluate(() => Object.keys(localStorage));
    const tokenKeys = keys.filter((k) => /token|jwt|auth|session/i.test(k));
    if (tokenKeys.length) finding(testInfo, 'Token-like keys in localStorage: ' + tokenKeys.join(', '));
  });

  test('no mixed content (http resources on https page)', async ({ page }) => {
    const insecure = [];
    page.on('request', (r) => { if (r.url().startsWith('http://')) insecure.push(r.url()); });
    await gotoHome(page);
    expect(insecure, insecure.join('\n')).toHaveLength(0);
  });

  test('CORS does not allow any origin with credentials', async ({ request }, testInfo) => {
    const r = await request.get('/', { headers: { Origin: 'https://evil.example' } });
    const h = r.headers();
    if (h['access-control-allow-origin'] === '*' || h['access-control-allow-origin'] === 'https://evil.example')
      finding(testInfo, 'Permissive CORS: ' + h['access-control-allow-origin']);
    expect(h['access-control-allow-credentials'] === 'true' && h['access-control-allow-origin'] === 'https://evil.example').toBeFalsy();
  });
});
