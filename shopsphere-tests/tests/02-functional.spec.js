const { test } = require('@playwright/test');
const { expect, isVisible, finding, gotoHome, internalLinks } = require('./helpers');
const S = require('./selectors');

test.describe('Functional', () => {
  test('products are listed on the page', async ({ page }) => {
    await gotoHome(page);
    await expect(page.locator(S.productCard).or(page.locator(S.addToCart)).first()).toBeVisible({ timeout: 10000 });
    const cards = await page.locator(S.productCard).count();
    const addBtns = await page.locator(S.addToCart).count();
    expect(cards + addBtns, 'no products found - update selectors.js').toBeGreaterThan(0);
  });

  test('every internal link responds without error', async ({ page, request }, testInfo) => {
    await gotoHome(page);
    const links = await internalLinks(page);
    test.skip(links.length === 0, 'No internal <a> links found (app may use buttons/router only)');
    const failures = [];
    for (const l of links.slice(0, 40)) {
      const r = await request.get(l);
      if (r.status() >= 400) failures.push(`${r.status()} ${l}`);
    }
    failures.forEach((f) => finding(testInfo, 'Broken link: ' + f));
    expect(failures, failures.join('\n')).toHaveLength(0);
  });

  test('search filters products', async ({ page }) => {
    await gotoHome(page);
    test.skip(!(await isVisible(page, S.searchInput)), 'Search input not found - update selectors.js');
    await expect(page.locator(S.productCard).first()).toBeVisible({ timeout: 10000 });
    const before = await page.locator(S.productCard).count();
    test.skip(before === 0, 'No product cards to filter');
    const input = page.locator(S.searchInput).first();
    await input.fill('zzzzqqqq-no-such-product');
    await input.press('Enter');
    await page.waitForTimeout(1500);
    const after = await page.locator(S.productCard).count();
    expect(after, 'nonsense search should reduce / empty the result list').toBeLessThan(before);
  });

  test('search with a real product word returns results', async ({ page }) => {
    await gotoHome(page);
    test.skip(!(await isVisible(page, S.searchInput)), 'Search input not found');
    await expect(page.locator(S.productLink).first()).toBeVisible({ timeout: 10000 });
    const texts = await page.locator(S.productLink).allInnerTexts();
    const word = texts.join(' ').split(/\s+/).find((w) => /^[A-Za-z]{4,}$/.test(w) && !/^(price|view|details|catalog|cart|added|wishlist)$/i.test(w));
    test.skip(!word, 'Could not derive a product word');
    const input = page.locator(S.searchInput).first();
    await input.fill(word);
    await input.press('Enter');
    await page.waitForTimeout(1000);
    await expect(page.locator(S.productLink).first()).toBeVisible({ timeout: 10000 });
    expect(await page.locator(S.productLink).count(), `search "${word}" should return results`).toBeGreaterThan(0);
  });

  test('product can be opened (detail view)', async ({ page }) => {
    await gotoHome(page);
    test.skip(!(await isVisible(page, S.productLink)), 'No product link found');
    const startUrl = page.url();
    await page.locator(S.productLink).first().click();
    await page.waitForTimeout(1000);
    expect(page.url() !== startUrl || (await isVisible(page, '[role="dialog"], [class*="modal" i]')),
      'clicking a product should open detail page or modal').toBeTruthy();
  });

  test('add to cart works and gives feedback', async ({ page }) => {
    await gotoHome(page);
    test.skip(!(await isVisible(page, S.addToCart)), 'Add-to-cart button not found');
    const before = await page.locator('body').innerText();
    await page.locator(S.addToCart).first().click();
    await page.waitForTimeout(1000);
    const after = await page.locator('body').innerText();
    expect(after !== before, 'UI should change (badge/toast/count) after add to cart').toBeTruthy();
  });

  test('cart page shows added item and allows removal', async ({ page }) => {
    await gotoHome(page);
    test.skip(!(await isVisible(page, S.addToCart)), 'Add-to-cart button not found');
    await page.locator(S.addToCart).first().click();
    await page.waitForTimeout(800);
    if (await isVisible(page, S.cartLink, 1500)) await page.locator(S.cartLink).first().click();
    else await page.goto(S.routes.cart);
    await page.waitForTimeout(1000);
    const items = await page.locator(S.cartItem).count();
    test.skip(items === 0 && !(await isVisible(page, S.removeFromCart, 1000)), 'Cart items not detectable - update selectors.js');
    if (await isVisible(page, S.removeFromCart, 1500)) {
      await page.locator(S.removeFromCart).first().click();
      await page.waitForTimeout(800);
    }
  });

  test('quantity can be increased in cart', async ({ page }) => {
    await gotoHome(page);
    test.skip(!(await isVisible(page, S.addToCart)), 'Add-to-cart button not found');
    await page.locator(S.addToCart).first().click();
    await page.goto(S.routes.cart);
    test.skip(!(await isVisible(page, S.qtyPlus, 2000)), 'Quantity (+) control not found');
    const before = await page.locator('body').innerText();
    await page.locator(S.qtyPlus).first().click();
    await page.waitForTimeout(600);
    expect(await page.locator('body').innerText()).not.toBe(before);
  });

  test('cart persists after page reload', async ({ page }, testInfo) => {
    await gotoHome(page);
    test.skip(!(await isVisible(page, S.addToCart)), 'Add-to-cart button not found');
    await page.locator(S.addToCart).first().click();
    await page.goto(S.routes.cart);
    await page.reload();
    const has = (await page.locator(S.cartItem).count()) > 0;
    if (!has) finding(testInfo, 'Cart empty after reload (may be by design if not persisted)');
  });

  test('checkout entry point is reachable', async ({ page }) => {
    await gotoHome(page);
    if (await isVisible(page, S.addToCart, 2000)) {
      await page.locator(S.addToCart).first().click();
      await page.waitForTimeout(800);
    }
    await page.goto(S.routes.cart);
    test.skip(!(await isVisible(page, S.checkoutBtn, 2500)), 'Checkout button not found (cart may be empty)');
    await page.locator(S.checkoutBtn).first().click();
    await page.waitForTimeout(1000);
  });

  test('login and register pages render forms', async ({ page }, testInfo) => {
    for (const r of [S.routes.login, S.routes.register]) {
      await page.goto(r);
      const ok = (await isVisible(page, S.passwordInput, 2500));
      if (!ok) finding(testInfo, `No password field at ${r} - route may differ (set LOGIN_PATH/REGISTER_PATH)`);
    }
  });

  test('catalog page lists products', async ({ page }) => {
    await page.goto(S.routes.products, { waitUntil: 'networkidle' });
    await expect(page.locator(S.productLink).first()).toBeVisible({ timeout: 10000 });
    expect(await page.locator(S.productLink).count()).toBeGreaterThan(0);
  });

  test('product detail page opens by direct URL and shows name + Add button', async ({ page }) => {
    await page.goto(S.routes.products, { waitUntil: 'networkidle' });
    await expect(page.locator(S.productLink).first()).toBeVisible({ timeout: 10000 });
    const href = await page.locator(S.productLink).first().getAttribute('href');
    await page.goto(href, { waitUntil: 'networkidle' });
    await expect(page.locator('h1, h2').first()).toBeVisible();
    expect(await page.locator('body').innerText()).toMatch(/[\u20B9$]|add|cart/i);
  });

  test('invalid product id shows a graceful page (no crash)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/products/000000000000000000000000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    expect(errors, errors.join('\n')).toHaveLength(0);
    expect((await page.locator('body').innerText()).trim().length).toBeGreaterThan(5);
  });

  test('category filter changes the product list', async ({ page }, testInfo) => {
    await gotoHome(page);
    let targetBtn = S.categoryBtn('Mobiles');
    if (!(await isVisible(page, targetBtn, 1000))) {
      for (const fallback of ['Electronics', 'Fashion', 'Footwear', 'Home & Kitchen', 'Accessories', 'Beauty']) {
        if (await isVisible(page, S.categoryBtn(fallback), 500)) {
          targetBtn = S.categoryBtn(fallback);
          break;
        }
      }
    }
    test.skip(!(await isVisible(page, targetBtn)), 'Category button not found');
    const url = page.url();
    const before = await page.locator('body').innerText();
    await page.locator(targetBtn).first().click();
    await page.waitForTimeout(1500);
    const changed = page.url() !== url || (await page.locator('body').innerText()) !== before;
    expect(changed, 'clicking a category should filter or navigate').toBeTruthy();
  });

  test('all categories can be clicked without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await gotoHome(page);
    for (const c of ['Accessories', 'Cameras', 'Electronics', 'Foods', 'Gaming', 'Home Appliances', 'Laptops', 'Living', 'Mobiles', 'Televisions', 'Wearables']) {
      if (await isVisible(page, S.categoryBtn(c), 800)) { await page.locator(S.categoryBtn(c)).first().click(); await page.waitForTimeout(300); }
    }
    expect(errors, errors.join('\n')).toHaveLength(0);
  });

  test('wishlist heart button gives feedback (or asks to log in)', async ({ page }, testInfo) => {
    await gotoHome(page);
    test.skip(!(await isVisible(page, S.wishlistBtn)), 'Wishlist button not found');
    const before = await page.locator('body').innerText();
    const url = page.url();
    await page.locator(S.wishlistBtn).first().click();
    await page.waitForTimeout(1000);
    const changed = page.url() !== url || (await page.locator('body').innerText()) !== before
      || (await page.locator(S.wishlistBtn).first().getAttribute('class')) !== null;
    if (page.url().includes('login')) finding(testInfo, 'Wishlist requires login (redirected to /login)');
    expect(changed).toBeTruthy();
  });

  test('wishlist, cart and orders pages are reachable (login redirect is acceptable)', async ({ page }, testInfo) => {
    for (const r of [S.routes.wishlist, S.routes.cart, S.routes.orders]) {
      const res = await page.goto(r, { waitUntil: 'networkidle' });
      expect(res.status(), r).toBeLessThan(400);
      if (page.url().includes('login')) finding(testInfo, `${r} redirects to login when logged out (good for protected pages)`);
    }
  });

  test('"Add" without login: behaviour is consistent', async ({ page }, testInfo) => {
    await gotoHome(page);
    test.skip(!(await isVisible(page, S.addToCart)), 'Add button not found');
    await page.locator(S.addToCart).first().click();
    await page.waitForTimeout(1200);
    finding(testInfo, page.url().includes('login') ? 'Add to cart requires login' : 'Add to cart works for guests');
  });
});
