// Render free-tier backends sleep when idle (first request can take 30-60s).
// Wake it up once before tests so timing/timeouts aren't misreported.
const S = require('./tests/selectors');

module.exports = async () => {
  const url = S.backend + '/products?limit=1';
  const start = Date.now();
  for (let i = 0; i < 12; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (r.status < 500) { console.log(`Backend awake after ${((Date.now() - start) / 1000).toFixed(1)}s (HTTP ${r.status})`); return; }
    } catch {}
    console.log('Waiting for backend to wake up...');
    await new Promise((r) => setTimeout(r, 5000));
  }
  console.log('WARNING: backend did not respond in time - API/product tests may fail.');
};
