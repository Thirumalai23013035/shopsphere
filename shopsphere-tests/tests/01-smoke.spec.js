const { test } = require('@playwright/test');
const { expect, collectConsoleErrors, finding, gotoHome } = require('./helpers');

test.describe('Smoke', () => {
  test('home page loads with HTTP 200 and correct title', async ({ page }) => {
    const res = await page.goto('/');
    expect(res.status()).toBe(200);
    await expect(page).toHaveTitle(/ShopSphere/i);
  });

  test('page renders visible content (not blank)', async ({ page }) => {
    await gotoHome(page);
    const text = (await page.locator('body').innerText()).trim();
    expect(text.length, 'body text should not be empty').toBeGreaterThan(20);
  });

  test('no JavaScript console errors on load', async ({ page }, testInfo) => {
    const errors = collectConsoleErrors(page);
    await gotoHome(page);
    errors.forEach((e) => finding(testInfo, 'Console error: ' + e.slice(0, 200)));
    expect(errors, errors.join('\n')).toHaveLength(0);
  });

  test('no failed network requests (4xx/5xx) on load', async ({ page }, testInfo) => {
    const bad = [];
    page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
    await gotoHome(page);
    bad.forEach((b) => finding(testInfo, 'Failed request: ' + b));
    expect(bad, bad.join('\n')).toHaveLength(0);
  });

  test('all images load successfully', async ({ page }, testInfo) => {
    await gotoHome(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    const broken = await page.$$eval('img', (imgs) =>
      imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
    broken.forEach((b) => finding(testInfo, 'Broken image: ' + b));
    expect(broken, 'broken images: ' + broken.join(', ')).toHaveLength(0);
  });

  test('navigation / header is present', async ({ page }) => {
    await gotoHome(page);
    await expect(page.locator('nav, header').first()).toBeVisible();
  });

  test('unknown route is handled gracefully (no server error)', async ({ page }) => {
    const res = await page.goto('/this-route-does-not-exist-12345');
    expect(res.status()).toBeLessThan(500);
  });
});
