const { test } = require('@playwright/test');
const { expect, finding, gotoHome } = require('./helpers');

const VIEWPORTS = [
  { name: 'mobile-small', width: 360, height: 640 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'desktop-fhd', width: 1920, height: 1080 },
];

test.describe('Responsive / cross-device', () => {
  for (const vp of VIEWPORTS) {
    test(`${vp.name} (${vp.width}x${vp.height}): no horizontal scroll, content visible`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoHome(page);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const shot = await page.screenshot({ fullPage: true });
      await testInfo.attach(`screenshot-${vp.name}`, { body: shot, contentType: 'image/png' });
      if (overflow > 1) finding(testInfo, `${vp.name}: page overflows horizontally by ${overflow}px`);
      expect(overflow, 'horizontal overflow').toBeLessThanOrEqual(1);
      await expect(page.locator('nav, header').first()).toBeVisible();
    });
  }

  test('tap targets on mobile are at least 32px', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHome(page);
    const small = await page.$$eval('button, a, input, select', (els) =>
      els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 32 || r.width < 32); }).length);
    if (small > 0) finding(testInfo, `${small} interactive elements smaller than 32px on mobile`);
  });
});
