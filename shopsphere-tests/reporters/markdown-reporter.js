// Custom Playwright reporter: writes reports/TEST_REPORT.md after every run.
const fs = require('fs');
const path = require('path');

const CATEGORY = {
  '01-smoke': 'Smoke',
  '02-functional': 'Functional',
  '03-negative-validation': 'Negative / Validation',
  '04-responsive': 'Responsive / Cross-device',
  '05-accessibility': 'Accessibility',
  '06-performance': 'Performance',
  '07-security': 'Security',
  '08-api': 'API',
};
const strip = (s = '') => s.replace(/\u001b\[[0-9;]*m/g, '');

class MarkdownReporter {
  constructor() { this.results = new Map(); this.start = Date.now(); }
  onBegin(config) { this.baseURL = config.projects[0]?.use?.baseURL || process.env.BASE_URL; }
  onTestEnd(test, result) {
    const file = path.basename(test.location.file).replace('.spec.js', '');
    const project = test.parent.project()?.name || '';
    this.results.set(test.id, {
      category: CATEGORY[file] || file,
      title: test.title,
      project,
      status: result.status === 'passed' && test.outcome() === 'flaky' ? 'flaky' : result.status,
      duration: result.duration,
      error: strip(result.error?.message || '').split('\n').slice(0, 4).join(' ').slice(0, 300),
      annotations: test.annotations,
    });
  }
  onEnd(result) {
    const all = [...this.results.values()];
    const count = (st) => all.filter((r) => r.status === st).length;
    const passed = count('passed'), failed = count('failed') + count('timedOut'), skipped = count('skipped'), flaky = count('flaky');
    const executed = passed + failed + flaky;
    const rate = executed ? ((passed + flaky) / executed * 100).toFixed(1) : '0.0';
    const L = [];
    L.push('# ShopSphere - Test Report', '');
    L.push(`- **Target:** ${this.baseURL}`);
    L.push(`- **Date:** ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`);
    L.push(`- **Duration:** ${((Date.now() - this.start) / 1000).toFixed(1)} s`);
    L.push(`- **Overall status:** ${result.status === 'passed' ? 'PASSED' : 'FAILED'}`, '');
    L.push('## Summary', '', '| Total | Passed | Failed | Flaky | Skipped | Pass rate (executed) |', '|---|---|---|---|---|---|');
    L.push(`| ${all.length} | ${passed} | ${failed} | ${flaky} | ${skipped} | ${rate}% |`, '');

    L.push('## Results by test type', '', '| Type | Passed | Failed | Skipped |', '|---|---|---|---|');
    for (const cat of [...new Set(all.map((r) => r.category))]) {
      const rs = all.filter((r) => r.category === cat);
      const f = (s) => rs.filter((r) => s.includes(r.status)).length;
      L.push(`| ${cat} | ${f(['passed', 'flaky'])} | ${f(['failed', 'timedOut'])} | ${f(['skipped'])} |`);
    }
    L.push('');

    const fails = all.filter((r) => ['failed', 'timedOut'].includes(r.status));
    L.push('## Failed tests (defects to investigate)', '');
    if (!fails.length) L.push('None.', '');
    else {
      L.push('| # | Type | Test | Browser | Reason |', '|---|---|---|---|---|');
      fails.forEach((r, i) => L.push(`| ${i + 1} | ${r.category} | ${r.title} | ${r.project} | ${r.error.replace(/\|/g, '/')} |`));
      L.push('');
    }

    const skips = all.filter((r) => r.status === 'skipped');
    L.push('## Skipped tests (need selector / route tuning)', '');
    if (!skips.length) L.push('None.', '');
    else {
      L.push('| Type | Test | Why skipped |', '|---|---|---|');
      skips.forEach((r) => {
        const why = r.annotations.find((a) => a.type === 'skip')?.description || 'skipped';
        L.push(`| ${r.category} | ${r.title} | ${why} |`);
      });
      L.push('');
    }

    L.push('## Findings (non-blocking observations)', '');
    const seen = new Set(); const rows = [];
    all.forEach((r) => r.annotations.filter((a) => a.type === 'finding').forEach((a) => {
      const k = r.category + a.description; if (seen.has(k)) return; seen.add(k);
      rows.push(`| ${r.category} | ${(a.description || '').replace(/\|/g, '/')} |`);
    }));
    if (!rows.length) L.push('None.', ''); else { L.push('| Type | Finding |', '|---|---|', ...rows, ''); }

    L.push('## Not covered by this automated run', '',
      '- Load / stress testing: run `npm run load` (k6)',
      '- Lighthouse audit (performance, SEO, best practices): run `npm run lighthouse`',
      '- Authenticated flows, payment, order placement (need test credentials - add to tests)',
      '- Manual exploratory, usability and UAT testing',
      '- Full penetration test (OWASP ZAP / Burp)', '');
    L.push('---', 'Detailed traces, screenshots and videos: `reports/html/index.html` (run `npm run html-report`).');

    fs.mkdirSync('reports', { recursive: true });
    fs.writeFileSync('reports/TEST_REPORT.md', L.join('\n'));
    console.log('\nReport written: reports/TEST_REPORT.md');
  }
}
module.exports = MarkdownReporter;
