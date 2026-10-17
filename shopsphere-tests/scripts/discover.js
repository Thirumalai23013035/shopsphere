// Crawls the live app and prints routes, buttons, inputs and API calls so you can tune tests/selectors.js
const { chromium } = require('@playwright/test');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'https://shopsphere-weld-nu.vercel.app';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const api = new Set();
  page.on('request', (r) => { if (['xhr', 'fetch'].includes(r.resourceType())) api.add(`${r.method()} ${r.url()}`); });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => ({
    title: document.title,
    links: [...document.querySelectorAll('a[href]')].map((a) => ({ text: a.innerText.trim().slice(0, 40), href: a.getAttribute('href') })),
    buttons: [...document.querySelectorAll('button')].map((b) => ({ text: b.innerText.trim().slice(0, 40), aria: b.getAttribute('aria-label'), cls: b.className })),
    inputs: [...document.querySelectorAll('input,select,textarea')].map((i) => ({ type: i.type, name: i.name, placeholder: i.placeholder, id: i.id })),
    headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => h.innerText.trim().slice(0, 60)),
    productLikeClasses: [...new Set([...document.querySelectorAll('[class]')].flatMap((e) => [...e.classList]).filter((c) => /product|card|cart|item/i.test(c)))],
    localStorageKeys: Object.keys(localStorage),
  }));
  info.apiCalls = [...api];

  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/discovery.json', JSON.stringify(info, null, 2));
  console.log(JSON.stringify(info, null, 2));
  console.log('\nSaved to reports/discovery.json');
  await browser.close();
})();
