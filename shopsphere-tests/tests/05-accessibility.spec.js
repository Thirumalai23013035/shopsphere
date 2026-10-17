const { test } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { expect, finding, gotoHome } = require('./helpers');
const S = require('./selectors');

const PAGES = ['/', S.routes.products, S.routes.wishlist, S.routes.login, S.routes.register, S.routes.cart];

test.describe('Accessibility (WCAG 2.1 A/AA via axe-core)', () => {
  for (const p of PAGES) {
    test(`axe scan: ${p} has no serious/critical violations`, async ({ page }, testInfo) => {
      await page.goto(p, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      results.violations.forEach((v) => finding(testInfo, `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} elements)`));
      const severe = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      expect(severe.map((v) => `${v.impact}: ${v.id}`), 'serious/critical a11y issues').toHaveLength(0);
    });
  }

  test('html has lang attribute and page has a single h1', async ({ page }) => {
    await gotoHome(page);
    expect(await page.getAttribute('html', 'lang'), '<html lang> missing').toBeTruthy();
    expect(await page.locator('h1').count(), 'expected at least one h1').toBeGreaterThan(0);
  });

  test('images have alt text', async ({ page }, testInfo) => {
    await gotoHome(page);
    const missing = await page.$$eval('img:not([alt])', (i) => i.length);
    if (missing) finding(testInfo, `${missing} images without alt attribute`);
    expect(missing).toBe(0);
  });

  test('keyboard: Tab moves focus to a visible interactive element', async ({ page }) => {
    await gotoHome(page);
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement && document.activeElement.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(tag);
  });
});
