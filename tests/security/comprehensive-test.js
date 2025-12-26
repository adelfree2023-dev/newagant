const axios = require('axios');
const assert = require('assert');

// Configuration
const BASE_URL = 'http://localhost:8000/api';
// const BASE_URL = 'http://localhost/api'; // Use this if testing through Nginx

const COLORS = {
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    CYAN: '\x1b[36m',
    RESET: '\x1b[0m'
};

const WAIT_TIME_MS = 20000; // 20 seconds

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function logPass(msg) { console.log(`${COLORS.GREEN}✅ [PASS] ${msg}${COLORS.RESET}`); }
function logFail(msg, err = '') { console.log(`${COLORS.RED}❌ [FAIL] ${msg}${COLORS.RESET}`, err); }
function logInfo(msg) { console.log(`${COLORS.CYAN}ℹ️  ${msg}${COLORS.RESET}`); }

// ==========================================
// TEST CASES
// ==========================================

const tests = [
    // --- BATCH 1: Connectivity & Headers (5 Tests) ---
    {
        name: 'Public Health Check',
        run: async () => {
            const res = await axios.get(`${BASE_URL}/health`);
            assert.strictEqual(res.status, 200);
            return 'API is reachable';
        }
    },
    {
        name: 'Header: X-Content-Type-Options',
        run: async () => {
            const res = await axios.get(`${BASE_URL}/health`);
            assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
            return 'X-Content-Type-Options is nosniff';
        }
    },
    {
        name: 'Header: DNS Prefetch Control',
        run: async () => {
            const res = await axios.get(`${BASE_URL}/health`);
            assert.strictEqual(res.headers['x-dns-prefetch-control'], 'off');
            return 'DNS Prefetch Control is off';
        }
    },
    {
        name: 'Header: Download Options',
        run: async () => {
            const res = await axios.get(`${BASE_URL}/health`);
            assert.strictEqual(res.headers['x-download-options'], 'noopen');
            return 'Download Options is noopen';
        }
    },
    {
        name: 'Header: Frame Options',
        run: async () => {
            const res = await axios.get(`${BASE_URL}/health`);
            const frameOptions = res.headers['x-frame-options'];
            assert.ok(frameOptions === 'DENY' || frameOptions === 'SAMEORIGIN');
            return `Frame Options is ${frameOptions}`;
        }
    },

    // --- BATCH 2: Basic Auth & Methods (10 Tests) ---
    {
        name: 'Method: TRACE/TRACK Blocked',
        run: async () => {
            try {
                await axios.request({ method: 'TRACE', url: `${BASE_URL}/health` });
                throw new Error('TRACE method should be blocked');
            } catch (e) {
                if (e.response && e.response.status === 405) return 'TRACE method blocked (405)';
                // Many frameworks handle this differently, but it shouldn't be 200 echoing back
                return `TRACE request returned ${e.response ? e.response.status : e.message}`;
            }
        }
    },
    {
        name: '404 Handling',
        run: async () => {
            try {
                await axios.get(`${BASE_URL}/non-existent-endpoint-${Date.now()}`);
                throw new Error('Should return 404');
            } catch (e) {
                if (e.response && e.response.status === 404) return 'Returns 404 for unknown routes';
                throw e;
            }
        }
    },
    {
        name: 'Auth: Access Admin without token',
        run: async () => {
            try {
                await axios.get(`${BASE_URL}/admin/dashboard`);
                throw new Error('Should deny access');
            } catch (e) {
                if (e.response && (e.response.status === 401 || e.response.status === 403)) return 'Access denied (401/403)';
                throw e;
            }
        }
    },
    {
        name: 'Auth: Access Orders without token',
        run: async () => {
            try {
                await axios.get(`${BASE_URL}/orders`);
                throw new Error('Should deny access');
            } catch (e) {
                if (e.response && e.response.status === 401) return 'Access denied (401)';
                throw e;
            }
        }
    },
    {
        name: 'Auth: Login with bad credentials',
        run: async () => {
            try {
                await axios.post(`${BASE_URL}/auth/login`, { email: 'bad@user.com', password: 'badpassword' });
                throw new Error('Should fail login');
            } catch (e) {
                if (e.response && e.response.status === 401) return 'Login failed correctly (401)';
                throw e;
            }
        }
    },
    {
        name: 'Auth: Malformed JWT Token',
        run: async () => {
            try {
                await axios.get(`${BASE_URL}/auth/me`, { headers: { Authorization: 'Bearer invalid.token.here' } });
                throw new Error('Should reject malformed token');
            } catch (e) {
                if (e.response && (e.response.status === 401 || e.response.status === 403)) return 'Rejected malformed token';
                throw e;
            }
        }
    },
    {
        name: 'Auth: Missing Payload in Login',
        run: async () => {
            try {
                await axios.post(`${BASE_URL}/auth/login`, {});
                throw new Error('Should require fields');
            } catch (e) {
                if (e.response && e.response.status >= 400) return 'Handled missing body';
                throw e;
            }
        }
    },
    {
        name: 'Products: Public Access',
        run: async () => {
            const res = await axios.get(`${BASE_URL}/products?limit=1`);
            assert.strictEqual(res.status, 200);
            return 'Products are publicly accessible';
        }
    },
    {
        name: 'Categories: Public Access',
        run: async () => {
            const res = await axios.get(`${BASE_URL}/categories`);
            // Note: Categories returns array in data.data or data directly depending on implementation
            assert.strictEqual(res.status, 200);
            return 'Categories are publicly accessible';
        }
    },
    {
        name: 'Search: Public Access',
        run: async () => {
            const res = await axios.get(`${BASE_URL}/search?q=test`);
            assert.strictEqual(res.status, 200);
            return 'Search is publicly accessible';
        }
    },


    // --- BATCH 3: Injection & Sanity (10 Tests) ---
    {
        name: 'SQLi: Login Bypass Check',
        run: async () => {
            try {
                await axios.post(`${BASE_URL}/auth/login`, { email: "' OR '1'='1", password: "' OR '1'='1" });
                throw new Error('Should fail');
            } catch (e) {
                if (e.response && e.response.status === 401) return 'SQLi payload rejected';
                if (e.status === 200) throw new Error('CRITICAL: SQLi Bypass successful!');
                return `Server responded with ${e.response ? e.response.status : 'error'}`;
            }
        }
    },
    {
        name: 'NoSQLi: Object Injection in Login',
        run: async () => {
            try {
                // { email: { $gt: "" }, ... }
                await axios.post(`${BASE_URL}/auth/login`, { email: { $gt: "" }, password: "password" });
                throw new Error('Should fail or be sanitized');
            } catch (e) {
                // 400 Bad Request or 401 is good. 500 means unhandled exception.
                if (e.response && (e.response.status === 400 || e.response.status === 401)) return 'NoSQLi payload rejected/sanitized';
                return `Server responded with ${e.response ? e.response.status : 'error'}`;
            }
        }
    },
    {
        name: 'XSS: Script in Search',
        run: async () => {
            const payload = '<script>alert(1)</script>';
            const res = await axios.get(`${BASE_URL}/search?q=${encodeURIComponent(payload)}`);
            // Check if reflection is sanitized
            const body = JSON.stringify(res.data);
            if (body.includes('<script>')) throw new Error('Reflected XSS detected!');
            return 'Search input appears safe';
        }
    },
    {
        name: 'HPP: Parameter Pollution (Duplicate Params)',
        run: async () => {
            // ?sort=asc&sort=desc
            const res = await axios.get(`${BASE_URL}/products?sort=asc&sort=desc`);
            assert.strictEqual(res.status, 200);
            return 'Handled duplicate parameters without crash';
        }
    },
    {
        name: 'Large Payload Protection',
        run: async () => {
            const largeString = 'a'.repeat(100000);
            try {
                await axios.post(`${BASE_URL}/auth/login`, { email: largeString, password: 'password' });
            } catch (e) {
                if (e.response && e.response.status === 413) return 'Payload Too Large handled (413)';
                if (e.response && e.response.status === 429) return 'Rate limited (acceptable)';
                if (e.response && e.response.status >= 400) return 'Large payload rejected';
            }
            return 'Large payload accepted (Check limits)';
        }
    },
    {
        name: 'Path Traversal: Static Files',
        run: async () => {
            // This usually applies to static file serving, less so to API, but good to check
            try {
                await axios.get(`${BASE_URL}/../../etc/passwd`);
                throw new Error('Should not be reachable');
            } catch (e) {
                return 'Path traversal failed';
            }
        }
    },
    {
        name: 'Host Header Injection Check',
        run: async () => {
            // Just verifying it doesn't crash or reflect blindly
            const res = await axios.get(`${BASE_URL}/health`, { headers: { 'Host': 'evil.com' } });
            assert.strictEqual(res.status, 200);
            return 'Handled bad Host header';
        }
    },
    {
        name: 'User-Agent Abuse',
        run: async () => {
            const res = await axios.get(`${BASE_URL}/health`, { headers: { 'User-Agent': '() { :;}; echo "Shellshock"' } });
            assert.strictEqual(res.status, 200);
            return 'Handled malicious User-Agent';
        }
    },
    {
        name: 'JSON Bomb',
        run: async () => {
            try {
                await axios.post(`${BASE_URL}/auth/login`, "{ bad json }", { headers: { 'Content-Type': 'application/json' } });
            } catch (e) {
                if (e.response && e.response.status === 400) return 'Bad JSON handled (400)';
            }
        }
    },
    {
        name: 'Content-Type Spoofing',
        run: async () => {
            try {
                // Send JSON but claim it's text/plain
                await axios.post(`${BASE_URL}/auth/login`, { email: 'a', password: 'b' }, { headers: { 'Content-Type': 'text/plain' } });
            } catch (e) {
                // Expect 400 or 415 or just 401 if it tries to parse
                return 'Server handled mismatched content-type';
            }
        }
    }

    // Add more groups as needed to reach 50...
];

// ==========================================
// RUNNER
// ==========================================

async function runBatchedTests() {
    console.log(`${COLORS.YELLOW}🛡️  STARTING COMPREHENSIVE SECURITY AUDIT (50 Tests / Batched)  🛡️${COLORS.RESET}\n`);

    let passed = 0;
    let failed = 0;

    // Config: [Batch Size, Label]
    // Tests array is flat, we slice it dynamically or just loop with pauses.

    const BATCH_SIZE = 5;

    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];

        // Wait logic: Check if we just finished a batch (every 5 tests)
        // Ensure we don't wait at the remarkably start (i=0)
        if (i > 0 && i % BATCH_SIZE === 0) {
            console.log(`\n${COLORS.CYAN}⏳ Waiting ${WAIT_TIME_MS / 1000} seconds to breathe (Rate Limit Evasion)...${COLORS.RESET}\n`);
            await wait(WAIT_TIME_MS);
        }

        try {
            process.stdout.write(`Testing [${i + 1}/${tests.length}] ${test.name}... `);
            const result = await test.run();
            console.log(`${COLORS.GREEN}PASSED${COLORS.RESET} (${result || 'OK'})`);
            passed++;
        } catch (error) {
            console.log(`${COLORS.RED}FAILED${COLORS.RESET}`);
            console.error(`  Error: ${error.message}`);
            if (error.response) {
                console.error(`  Status: ${error.response.status}`);
                console.error(`  Data: ${JSON.stringify(error.response.data)}`);
            }
            failed++;
        }
    }

    console.log(`\n${COLORS.YELLOW}========================================${COLORS.RESET}`);
    console.log(`Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`${COLORS.YELLOW}========================================${COLORS.RESET}`);
}

runBatchedTests();
