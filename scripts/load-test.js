/**
 * k6 Load Testing Script for CoreFlex API
 * 
 * Installation: https://k6.io/docs/getting-started/installation/
 * Run: k6 run scripts/load-test.js
 * 
 * Options:
 *  k6 run --vus 50 --duration 30s scripts/load-test.js
 *  k6 run --out json=results.json scripts/load-test.js
 */

import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const productListTrend = new Trend('product_list_duration');
const categoryTrend = new Trend('category_duration');

// Configuration
export const options = {
    // Ramping up from 0 to 50 users over 30 seconds
    stages: [
        { duration: '10s', target: 20 },  // Ramp up
        { duration: '30s', target: 50 },  // Stay at 50
        { duration: '10s', target: 0 },   // Ramp down
    ],

    // Thresholds for pass/fail
    thresholds: {
        http_req_duration: ['p(95)<500'],  // 95% of requests should be below 500ms
        errors: ['rate<0.1'],              // Error rate should be below 10%
        'product_list_duration': ['p(95)<300'],
        'category_duration': ['p(95)<200'],
    },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8000/api';

export default function () {
    // 1. Health Check
    group('Health Check', () => {
        const res = http.get(`${BASE_URL}/health`);
        check(res, {
            'health status is 200': (r) => r.status === 200,
        });
        errorRate.add(res.status !== 200);
    });

    sleep(0.5);

    // 2. Product List
    group('Product List', () => {
        const start = Date.now();
        const res = http.get(`${BASE_URL}/products?limit=10`);
        productListTrend.add(Date.now() - start);

        check(res, {
            'products status is 200': (r) => r.status === 200,
            'products has data': (r) => r.json('success') === true,
        });
        errorRate.add(res.status !== 200);
    });

    sleep(0.3);

    // 3. Categories
    group('Categories', () => {
        const start = Date.now();
        const res = http.get(`${BASE_URL}/categories`);
        categoryTrend.add(Date.now() - start);

        check(res, {
            'categories status is 200': (r) => r.status === 200,
        });
        errorRate.add(res.status !== 200);
    });

    sleep(0.3);

    // 4. Search
    group('Search', () => {
        const res = http.get(`${BASE_URL}/search?q=test`);
        check(res, {
            'search status is 200': (r) => r.status === 200,
        });
        errorRate.add(res.status !== 200);
    });

    sleep(0.5);

    // 5. Store Config
    group('Store Config', () => {
        const res = http.get(`${BASE_URL}/store/config`);
        check(res, {
            'config status is 200': (r) => r.status === 200,
        });
    });

    sleep(1);
}

// Summary handler
export function handleSummary(data) {
    console.log('\n📊 Load Test Summary');
    console.log('====================');
    console.log(`Total Requests: ${data.metrics.http_reqs.values.count}`);
    console.log(`Avg Duration: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`);
    console.log(`p95 Duration: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);
    console.log(`Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%`);

    return {
        'stdout': JSON.stringify(data.metrics, null, 2),
        'load-test-results.json': JSON.stringify(data, null, 2),
    };
}
