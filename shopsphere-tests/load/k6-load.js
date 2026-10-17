// Load test. Install k6: https://grafana.com/docs/k6/latest/set-up/install-k6/
// Run:  k6 run load/k6-load.js          (or)   k6 run -e BASE_URL=https://... load/k6-load.js
// Be considerate: this is your own site on Vercel free tier - keep VUs modest.
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'https://shopsphere-weld-nu.vercel.app';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // ramp-up
    { duration: '1m', target: 25 },   // load
    { duration: '30s', target: 50 },  // peak / stress
    { duration: '20s', target: 0 },   // ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],      // <1% errors
    http_req_duration: ['p(95)<1500'],   // 95% under 1.5s
    checks: ['rate>0.99'],
  },
};

const PAGES = ['/', '/products', '/login', '/register', '/cart', '/wishlist'];
const API = __ENV.API_URL || 'https://shopsphere-backend-lta8.onrender.com';

export default function () {
  for (const p of PAGES) {
    const res = http.get(BASE + p);
    check(res, { [`${p} status < 400`]: (r) => r.status < 400, [`${p} < 2s`]: (r) => r.timings.duration < 2000 });
    sleep(1);
  }
  const api = http.get(`${API}/products?limit=8`);
  check(api, { 'API /products ok': (r) => r.status === 200, 'API < 2s': (r) => r.timings.duration < 2000 });
  sleep(1);
}
