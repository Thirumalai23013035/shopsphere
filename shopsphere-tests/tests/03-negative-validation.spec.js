const { test } = require('@playwright/test');
const { expect, isVisible, finding } = require('./helpers');
const S = require('./selectors');

test.describe('Negative & validation', () => {
  test.beforeEach(async ({ page }) => { await page.goto(S.routes.login); });

  test('login with empty fields is rejected', async ({ page }) => {
    test.skip(!(await isVisible(page, S.passwordInput)), 'Login form not found - set LOGIN_PATH');
    const url = page.url();
    await page.locator(S.submitBtn).first().click();
    await page.waitForTimeout(800);
    expect(page.url()).toBe(url);
  });

  test('login with wrong credentials shows an error', async ({ page }) => {
    test.skip(!(await isVisible(page, S.passwordInput)), 'Login form not found');
    await page.locator(S.emailInput).first().fill('nobody@example.com');
    await page.locator(S.passwordInput).first().fill('WrongPass#123');
    await page.locator(S.submitBtn).first().click();
    await page.waitForTimeout(1500);
    expect(page.url()).not.toMatch(/dashboard|account|profile|orders/i);
    expect(await isVisible(page, S.errorMsg, 3000), 'an error message should be shown').toBeTruthy();
  });

  test('SQL-injection payload does not log in or crash', async ({ page }) => {
    test.skip(!(await isVisible(page, S.passwordInput)), 'Login form not found');
    const statuses = [];
    page.on('response', (r) => statuses.push(r.status()));
    await page.locator(S.emailInput).first().fill("' OR '1'='1' --");
    await page.locator(S.passwordInput).first().fill("' OR '1'='1");
    await page.locator(S.submitBtn).first().click();
    await page.waitForTimeout(1500);
    expect(statuses.filter((s) => s >= 500), 'server returned 5xx for injection payload').toHaveLength(0);
    expect(page.url()).not.toMatch(/dashboard|account|profile|orders/i);
  });

  test('XSS payload in search is not executed', async ({ page }) => {
    await page.goto('/');
    test.skip(!(await isVisible(page, S.searchInput)), 'Search input not found');
    let fired = false;
    page.on('dialog', async (d) => { fired = true; await d.dismiss(); });
    const input = page.locator(S.searchInput).first();
    await input.fill('<img src=x onerror=alert(1)><script>alert(2)</script>');
    await input.press('Enter');
    await page.waitForTimeout(1500);
    expect(fired, 'XSS alert dialog fired - output is not sanitised').toBeFalsy();
  });

  test('register rejects invalid email / weak password', async ({ page }) => {
    await page.goto(S.routes.register);
    test.skip(!(await isVisible(page, S.passwordInput)), 'Register form not found - set REGISTER_PATH');
    const url = page.url();
    if (await isVisible(page, S.nameInput, 1000)) await page.locator(S.nameInput).first().fill('Test User');
    await page.locator(S.emailInput).first().fill('not-an-email');
    await page.locator(S.passwordInput).first().fill('1');
    await page.locator(S.submitBtn).first().click();
    await page.waitForTimeout(1000);
    expect(page.url()).toBe(url);
  });

  test('empty cart shows an empty state', async ({ page }, testInfo) => {
    await page.context().clearCookies();
    await page.goto(S.routes.cart);
    await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
    await page.reload();
    const txt = (await page.locator('body').innerText()).toLowerCase();
    if (!/empty|no items|nothing|add/.test(txt)) finding(testInfo, 'Empty cart has no obvious empty-state message');
  });

  test('very long input does not break the form', async ({ page }) => {
    test.skip(!(await isVisible(page, S.emailInput)), 'Email input not found');
    const statuses = [];
    page.on('response', (r) => statuses.push(r.status()));
    await page.locator(S.emailInput).first().fill('a'.repeat(5000) + '@x.com');
    await page.locator(S.passwordInput).first().fill('b'.repeat(5000));
    await page.locator(S.submitBtn).first().click();
    await page.waitForTimeout(1200);
    expect(statuses.filter((s) => s >= 500)).toHaveLength(0);
  });
});
