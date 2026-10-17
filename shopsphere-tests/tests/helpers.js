const { expect } = require('@playwright/test');

async function isVisible(page, selector, timeout = 2500) {
  try { await page.locator(selector).first().waitFor({ state: 'visible', timeout }); return true; }
  catch { return false; }
}

function collectConsoleErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  return errors;
}

// Non-fatal observation: shows up in the generated report under "Findings".
function finding(testInfo, msg) { testInfo.annotations.push({ type: 'finding', description: msg }); }

async function gotoHome(page) { await page.goto('/', { waitUntil: 'networkidle' }); }

async function internalLinks(page) {
  return page.$$eval('a[href]', (as) => {
    const out = new Set();
    for (const a of as) {
      try {
        const u = new URL(a.href);
        if (u.origin === location.origin) { u.hash = ''; out.add(u.pathname + u.search); }
      } catch {}
    }
    return [...out];
  });
}

module.exports = { expect, isVisible, collectConsoleErrors, finding, gotoHome, internalLinks };
