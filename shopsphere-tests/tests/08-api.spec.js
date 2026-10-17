const { test } = require('@playwright/test');
const { expect, finding } = require('./helpers');
const S = require('./selectors');

const API = S.backend;
const list = (j) => (Array.isArray(j) ? j : j.products || j.data || j.items || []);

test.describe('API - backend ' + API, () => {
  test.setTimeout(90_000);

  test('GET /products?limit=8 returns JSON list within limit', async ({ request }, testInfo) => {
    const t = Date.now();
    const r = await request.get(`${API}/products?limit=8`);
    const ms = Date.now() - t;
    finding(testInfo, `GET /products?limit=8 -> ${r.status()} in ${ms}ms`);
    expect(r.status()).toBe(200);
    expect(r.headers()['content-type']).toMatch(/json/);
    const items = list(await r.json());
    expect(items.length).toBeGreaterThan(0);
    expect(items.length, 'limit=8 must return at most 8').toBeLessThanOrEqual(8);
    const p = items[0];
    finding(testInfo, 'Product fields: ' + Object.keys(p).join(', '));
    expect(p.name || p.title, 'product has a name').toBeTruthy();
    expect(p.price !== undefined, 'product has a price').toBeTruthy();
  });

  test('warm response time under 2s', async ({ request }, testInfo) => {
    await request.get(`${API}/products?limit=8`);
    const t = Date.now();
    await request.get(`${API}/products?limit=8`);
    const ms = Date.now() - t;
    finding(testInfo, `Warm response: ${ms}ms`);
    expect(ms).toBeLessThan(2000);
  });

  test('GET /products/categories returns a non-empty list', async ({ request }) => {
    const r = await request.get(`${API}/products/categories`);
    expect(r.status()).toBe(200);
    const j = await r.json();
    expect((Array.isArray(j) ? j : j.categories || []).length).toBeGreaterThan(0);
  });

  test('invalid query params do not cause 5xx', async ({ request }, testInfo) => {
    const bad = ['limit=0', 'limit=-5', 'limit=abc', 'limit=999999', 'page=-1', 'category=%00', 'search=' + 'a'.repeat(3000)];
    const fails = [];
    for (const q of bad) {
      const r = await request.get(`${API}/products?${q}`);
      finding(testInfo, `?${q.slice(0, 30)} -> ${r.status()}`);
      if (r.status() >= 500) fails.push(`${r.status()} ?${q.slice(0, 30)}`);
    }
    expect(fails, fails.join('\n')).toHaveLength(0);
  });

  test('NoSQL-injection style params are handled safely', async ({ request }) => {
    const r = await request.get(`${API}/products?category[$ne]=x&search[$regex]=.*`);
    expect(r.status(), 'operator injection caused server error').toBeLessThan(500);
  });

  test('unknown / malformed product id returns 4xx, not 5xx', async ({ request }, testInfo) => {
    for (const id of ['000000000000000000000000', 'not-an-id', "1'OR'1'='1"]) {
      const r = await request.get(`${API}/products/${encodeURIComponent(id)}`);
      finding(testInfo, `/products/${id} -> ${r.status()}`);
      expect(r.status(), id).toBeLessThan(500);
    }
  });

  test('protected endpoints reject unauthenticated requests', async ({ request }, testInfo) => {
    const paths = ['/orders', '/users', '/cart', '/wishlist', '/admin', '/auth/profile', '/users/profile', '/api/orders', '/api/users'];
    const open = [];
    for (const p of paths) {
      const r = await request.get(API + p).catch(() => null);
      if (!r) continue;
      finding(testInfo, `${p} -> ${r.status()}`);
      if (r.status() === 200 && /json/.test(r.headers()['content-type'] || '')) open.push(p);
    }
    expect(open, 'accessible without auth: ' + open.join(', ')).toHaveLength(0);
  });

  test('write endpoints reject unauthenticated POST/PUT/DELETE on products', async ({ request }, testInfo) => {
    const fails = [];
    const res = [
      await request.post(`${API}/products`, { data: { name: 'hack', price: 1 } }),
      await request.delete(`${API}/products/000000000000000000000000`),
      await request.put(`${API}/products/000000000000000000000000`, { data: { price: 0 } }),
    ];
    res.forEach((r, i) => { finding(testInfo, `write #${i + 1} -> ${r.status()}`); if ([200, 201].includes(r.status())) fails.push(r.url()); });
    expect(fails, 'unauthenticated write succeeded: ' + fails.join(', ')).toHaveLength(0);
  });

  test('login endpoint rejects bad credentials and malformed JSON without 5xx', async ({ request }, testInfo) => {
    for (const p of ['/auth/login', '/users/login', '/api/auth/login']) {
      const r = await request.post(API + p, { data: { email: 'nobody@example.com', password: 'wrong' } });
      if (r.status() === 404) continue;
      finding(testInfo, `${p} bad creds -> ${r.status()}`);
      expect(r.status()).toBeLessThan(500);
      expect([200, 201]).not.toContain(r.status());
      const m = await request.post(API + p, { data: '{bad json', headers: { 'Content-Type': 'application/json' } });
      expect(m.status(), 'malformed JSON').toBeLessThan(500);
      return;
    }
    test.skip(true, 'Login endpoint path not found - check discovery after logging in (apiCalls)');
  });

  test('CORS: backend does not reflect arbitrary origins', async ({ request }, testInfo) => {
    const r = await request.get(`${API}/products?limit=1`, { headers: { Origin: 'https://evil.example' } });
    const h = r.headers();
    finding(testInfo, `access-control-allow-origin: ${h['access-control-allow-origin'] || '(none)'}`);
    expect(h['access-control-allow-origin']).not.toBe('https://evil.example');
  });

  test('API security headers', async ({ request }, testInfo) => {
    const h = (await request.get(`${API}/products?limit=1`)).headers();
    ['x-content-type-options', 'strict-transport-security'].forEach((k) => { if (!h[k]) finding(testInfo, 'API missing header: ' + k); });
    if (h['x-powered-by']) finding(testInfo, 'API discloses X-Powered-By: ' + h['x-powered-by']);
  });

  test('rate limiting: 40 rapid requests', async ({ request }, testInfo) => {
    const codes = await Promise.all(Array.from({ length: 40 }, () => request.get(`${API}/products?limit=1`).then((r) => r.status())));
    const limited = codes.filter((c) => c === 429).length;
    finding(testInfo, limited ? `Rate limiting active (${limited}/40 got 429)` : 'No rate limiting detected (40/40 succeeded) - consider adding express-rate-limit');
    expect(codes.filter((c) => c >= 500)).toHaveLength(0);
  });
});
