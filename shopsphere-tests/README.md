# ShopSphere Test Suite

Automated testing for https://shopsphere-weld-nu.vercel.app/ using **Playwright** (+ axe-core), **k6** and **Lighthouse**.
54 automated tests across 8 types. A Markdown report is generated after every run.

## 1. Prerequisites
- Node.js 18+ (https://nodejs.org) - check with `node -v`
- Optional: k6 for load testing (https://grafana.com/docs/k6/latest/set-up/install-k6/)

## 2. One-time setup
```bash
cd shopsphere-tests
npm run setup          # installs packages + Chromium browser
```
(For Firefox/Safari engines too: `npm run setup:all-browsers`)

## 3. Step 1 - Discover your app (do this first)
The app is a single-page app, so the tests need to know your real buttons, routes and API calls.
```bash
npm run discover
```
This prints and saves `reports/discovery.json` (links, buttons, inputs, CSS classes, API calls).
Open `tests/selectors.js` and adjust selectors/routes if needed. You can also set routes without editing code:
```bash
# Windows PowerShell
$env:LOGIN_PATH="/signin"; npm test
# Mac/Linux
LOGIN_PATH=/signin npm test
```
Tests that can't find an element are **skipped with a reason** (shown in the report), never silently passed.

## 4. Run the tests
| Goal | Command |
|---|---|
| Everything (Chromium) + report | `npm test` |
| Watch the browser | `npm run test:headed` |
| All browsers (Chrome, Firefox, Safari, mobile) | `npm run test:all-browsers` |
| Only smoke | `npm run test:smoke` |
| Only security | `npm run test:security` |
| One file | `npx playwright test tests/05-accessibility.spec.js --project=chromium` |
| Debug step by step | `npx playwright test --debug` |
| Test another URL (e.g. localhost) | `BASE_URL=http://localhost:3000 npm test` |

## 5. Reports
- **`reports/TEST_REPORT.md`** - summary, results by test type, failures, skipped, findings (auto-generated)
- **`reports/html/index.html`** - interactive report with screenshots, videos, traces (`npm run html-report`)
- `reports/results.json` - machine-readable results

## 6. Other test types
```bash
npm run lighthouse      # performance / SEO / best-practices / a11y score -> reports/lighthouse.report.html
npm run load            # k6 load test (10 -> 25 -> 50 virtual users) with pass/fail thresholds
```
Security deep-scan (free): OWASP ZAP baseline
```bash
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://shopsphere-weld-nu.vercel.app -r zap-report.html
```
Dependency vulnerabilities (run inside your project repo, not here): `npm audit`

## 7. What each file covers
| File | Test type | Examples |
|---|---|---|
| 01-smoke | Smoke | page loads, no console errors, no broken images/requests, 404 handling |
| 02-functional | Functional / E2E | product list, search, product detail, add to cart, cart edit/remove, checkout entry, link check |
| 03-negative-validation | Negative / input validation | empty login, wrong password, SQL injection, XSS, invalid register, long input |
| 04-responsive | Responsive / compatibility | 5 viewports, horizontal overflow, tap targets, screenshots (+ 3 browsers via `--project`) |
| 05-accessibility | Accessibility | axe-core WCAG 2.1 A/AA, lang, h1, alt text, keyboard focus |
| 06-performance | Performance | TTFB, LCP, CLS, load time, page weight, compression, caching |
| 07-security | Security | HTTPS, security headers, exposed files, secrets in JS, cookies, mixed content, CORS |
| 08-api | API | auto-discovers backend calls, status/time/JSON checks, auth on protected routes |
| load/k6-load.js | Load / stress | ramp to 50 users, p95 < 1.5s, < 1% errors |

## 8. Reading results
- **Failed** = real defect (or wrong selector - check the error and screenshot)
- **Skipped** = element/route not found -> fix `selectors.js`
- **Findings** = non-blocking observations (missing headers, slow assets, a11y warnings)
- `retries: 1` is set; a test that passes on retry is marked **flaky**

## 9. Extending: logged-in and checkout flows
Create a test account on the site, then add a test like:
```js
test('login success', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type=email]', process.env.TEST_EMAIL);
  await page.fill('input[type=password]', process.env.TEST_PASSWORD);
  await page.click('button[type=submit]');
  await expect(page).not.toHaveURL(/login/);
});
```
Run with `TEST_EMAIL=... TEST_PASSWORD=... npm test`. Never commit real credentials. Don't automate real payments; use the payment provider's test mode.

## 10. Notes
- Only run load/security tests against sites you own (this is your project, so fine). Keep load modest on Vercel's free tier.
- Automated tests complement, not replace, manual exploratory and UAT testing.
