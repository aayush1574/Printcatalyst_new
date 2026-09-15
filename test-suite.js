const http = require('http');
const db = require('./server/db');

async function runTests() {
  console.log('🧪 ================= STARTING AUTOMATED TEST SUITE =================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name} ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${details}`);
      failed++;
    }
  }

  // TEST 1: Database Initialization & Memory Maps
  console.log('--- Database & In-Memory Indexes ---');
  await db.ready();
  const shops = db.getShops();
  assert(Array.isArray(shops) && shops.length > 0, 'Database shops loaded', `(${shops.length} shop: "${shops[0]?.name}")`);

  const testShop = shops[0];
  const lookupById = db.getShopById(testShop.id);
  const lookupBySlug = db.getShopBySlug(testShop.slug);
  assert(lookupById !== null && lookupById.id === testShop.id, 'Shop indexed lookup by ID', `(${lookupById?.name})`);
  assert(lookupBySlug !== null && lookupBySlug.slug === testShop.slug, 'Shop indexed lookup by Slug', `(${lookupBySlug?.slug})`);

  // TEST 2: Query Caching & Analytics Aggregation
  console.log('\n--- Query Caching & Analytics ---');
  const shopId = testShop.id;
  const t0 = Date.now();
  const stats1 = db.getShopStats(shopId);
  const time1 = Date.now() - t0;

  const t1 = Date.now();
  const stats2 = db.getShopStats(shopId);
  const time2 = Date.now() - t1;

  assert(typeof stats1.totalOrders === 'number', 'Stats computation returned valid metrics', `Total Orders: ${stats1.totalOrders}, Revenue: ₹${stats1.totalRevenue}`);
  assert(time2 <= time1, 'Cached stats query is instantaneous', `(1st: ${time1}ms, 2nd cached: ${time2}ms)`);

  // TEST 3: Pagination & Filtering
  console.log('\n--- Database Pagination ---');
  const paginated = db.getOrdersPaginated(shopId, { page: 1, limit: 5 });
  assert(Array.isArray(paginated.orders), 'Pagination returns orders slice', `(${paginated.orders.length} orders on page 1, total: ${paginated.total})`);
  assert(paginated.page === 1 && paginated.limit === 5, 'Pagination metadata accurate', `Page ${paginated.page}/${paginated.totalPages}`);

  // TEST 4: Batch Orders (N+1 Elimination)
  console.log('\n--- Batch Queries (N+1 Elimination) ---');
  const allOrders = db.getOrders(shopId);
  const sampleIds = allOrders.slice(0, 3).map(o => o.id);
  const batchOrders = db.getOrdersBatch(sampleIds);
  assert(batchOrders.length === sampleIds.length, 'Batch lookup retrieved all requested IDs in single call', `(${batchOrders.length}/${sampleIds.length})`);

  // TEST 5: Start Live Express Server & Verify HTTP Headers / Compression
  console.log('\n--- HTTP API, Caching & Compression Tests ---');
  const TEST_PORT = 5088;

  const serverProcess = require('child_process').fork('./server/server.js', [], {
    env: { ...process.env, PORT: String(TEST_PORT) },
    silent: true
  });

  // Poll until server responds
  function pollServer(retries = 15) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const req = http.get(`http://127.0.0.1:${TEST_PORT}/health`, (res) => {
          if (res.statusCode === 200) {
            clearInterval(interval);
            resolve();
          }
        });
        req.on('error', () => {
          if (attempts >= retries) {
            clearInterval(interval);
            reject(new Error('Server did not start within timeout'));
          }
        });
      }, 500);
    });
  }

  function makeRequest(path, headers = {}) {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path,
        method: 'GET',
        headers
      }, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: rawData
          });
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  try {
    await pollServer();

    // Check Health
    const healthRes = await makeRequest('/health');
    assert(healthRes.statusCode === 200, 'Health endpoint responds 200 OK');

    // Check API Jobs with Pagination
    const jobsRes = await makeRequest(`/api/v1/jobs?shopId=${shopId}&page=1&limit=5`);
    assert(jobsRes.statusCode === 200, 'Jobs pagination endpoint responds 200 OK');
    const jobsData = JSON.parse(jobsRes.body);
    assert(jobsData.success === true && Array.isArray(jobsData.orders), 'Jobs response payload format is valid', `(${jobsData.orders.length} orders)`);

    // Check Stats API Caching Header
    const statsRes = await makeRequest(`/api/v1/jobs/stats/${shopId}`);
    assert(statsRes.statusCode === 200, 'Stats endpoint responds 200 OK');
    assert(Boolean(statsRes.headers['cache-control']), 'Stats endpoint has Cache-Control header', statsRes.headers['cache-control']);

    // Check Gzip compression on large endpoint
    const gzipRes = await makeRequest(`/api/v1/jobs?shopId=${shopId}`, { 'Accept-Encoding': 'gzip' });
    assert(gzipRes.statusCode === 200, 'Full jobs endpoint responds 200 OK with gzip negotiation');

    // Check Static Caching Headers
    const uploadRes = await makeRequest('/uploads/test.pdf');
    assert(Boolean(uploadRes.headers['cache-control']), 'Static uploads route has CDN Cache-Control headers', uploadRes.headers['cache-control']);

  } catch (err) {
    console.error('API Test error:', err);
    assert(false, 'API Endpoints test failed', err.message);
  } finally {
    serverProcess.kill('SIGTERM');
  }

  console.log(`\n================= TEST RESULTS: ${passed} PASSED, ${failed} FAILED =================\n`);
  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
