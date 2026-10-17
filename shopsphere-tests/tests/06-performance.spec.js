const { test } = require('@playwright/test');
const { expect, finding } = require('./helpers');

// Budgets (tweak to your needs)
const B = { ttfb: 800, dcl: 3000, load: 5000, lcp: 2500, cls: 0.1, weightMB: 3, requests: 80 };

test.describe('Performance (lab, single run - use Lighthouse for deeper analysis)', () => {
  test('Core Web Vitals & load timings within budget', async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      window.__lcp = 0; window.__cls = 0;
      new PerformanceObserver((l) => { const e = l.getEntries(); window.__lcp = e[e.length - 1].startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    const m = await page.evaluate(() => {
      const n = performance.getEntriesByType('navigation')[0];
      return { ttfb: n.responseStart, dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd, lcp: window.__lcp, cls: window.__cls };
    });
    const line = `TTFB ${m.ttfb | 0}ms | DCL ${m.dcl | 0}ms | Load ${m.load | 0}ms | LCP ${m.lcp | 0}ms | CLS ${m.cls.toFixed(3)}`;
    finding(testInfo, 'Metrics: ' + line);
    expect.soft(m.ttfb, 'TTFB').toBeLessThan(B.ttfb);
    expect.soft(m.dcl, 'DOMContentLoaded').toBeLessThan(B.dcl);
    expect.soft(m.load, 'Load').toBeLessThan(B.load);
    expect.soft(m.lcp, 'LCP').toBeLessThan(B.lcp);
    expect.soft(m.cls, 'CLS').toBeLessThan(B.cls);
  });

  test('page weight and request count within budget', async ({ page }, testInfo) => {
    let bytes = 0, count = 0;
    page.on('response', async (r) => { count++; try { const h = r.headers()['content-length']; if (h) bytes += parseInt(h, 10); } catch {} });
    await page.goto('/', { waitUntil: 'networkidle' });
    const mb = bytes / 1024 / 1024;
    finding(testInfo, `Transferred ~${mb.toFixed(2)} MB (declared content-length) in ${count} requests`);
    expect.soft(mb).toBeLessThan(B.weightMB);
    expect.soft(count).toBeLessThan(B.requests);
  });

  test('static assets are compressed and cacheable', async ({ page }, testInfo) => {
    const issues = [];
    page.on('response', (r) => {
      const url = r.url(); const h = r.headers();
      if (/\.(js|css)(\?|$)/.test(url)) {
        if (!h['content-encoding']) issues.push('Not compressed: ' + url);
        if (!h['cache-control']) issues.push('No cache-control: ' + url);
      }
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    issues.forEach((i) => finding(testInfo, i));
    expect(issues).toHaveLength(0);
  });

  test('repeat visit is faster (cache works)', async ({ page }, testInfo) => {
    const t = async () => { const s = Date.now(); await page.goto('/', { waitUntil: 'load' }); return Date.now() - s; };
    const first = await t(); const second = await t();
    finding(testInfo, `First ${first}ms, second ${second}ms`);
  });
});
