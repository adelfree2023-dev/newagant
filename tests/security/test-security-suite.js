/**
 * CoreFlex Security Test Suite
 * suite اختبارات الأمان العسكرية
 * 
 * الميزات:
 * 1. فحص Headers الحماية (Helmet)
 * 2. اختبار Rate Limiting (هجوم وهمي)
 * 3. فحص حقن SQL و XSS
 */

const axios = require('axios'); // We might need to install this or use fetch if node 18+
const assert = require('assert');

// Configuration
const BASE_URL = 'http://localhost:8000/api'; // Direct to API container
// const BASE_URL = 'http://localhost/api'; // Through Nginx

const COLORS = {
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    RESET: '\x1b[0m'
};

function logPass(msg) { console.log(`${COLORS.GREEN}✅ [PASS] ${msg}${COLORS.RESET}`); }
function logFail(msg, err = '') { console.log(`${COLORS.RED}❌ [FAIL] ${msg}${COLORS.RESET}`, err); }
function logInfo(msg) { console.log(`${COLORS.YELLOW}ℹ️ [INFO] ${msg}${COLORS.RESET}`); }

async function testSecurityHeaders() {
    logInfo('Testing Security Headers...');
    try {
        const res = await axios.get(`${BASE_URL}/health`);
        const headers = res.headers;

        // X-Content-Type-Options
        if (headers['x-content-type-options'] === 'nosniff') logPass('X-Content-Type-Options is nosniff');
        else logFail('X-Content-Type-Options missing or invalid');

        // X-Frame-Options
        if (headers['x-frame-options']) logPass(`X-Frame-Options is present: ${headers['x-frame-options']}`);
        else logFail('X-Frame-Options missing');

        // RateLimit Headers (from Nginx or Express)
        if (headers['x-ratelimit-limit']) logPass('Rate Limit Headers Present');

    } catch (error) {
        logFail('Failed to fetch headers', error.message);
    }
}

async function testRateLimiting() {
    logInfo('Testing Rate Limiting (Simulating Attack)...');
    logInfo('Sending 15 requests rapidly...');

    let blocked = false;
    let successCount = 0;

    // Assuming limit is 100 per 15m for General, but Auth is 10. Let's test Auth Login endpoint which is stricter (10).
    const ATTACK_SIZE = 15;

    try {
        const requests = [];
        for (let i = 0; i < ATTACK_SIZE; i++) {
            requests.push(axios.post(`${BASE_URL}/auth/login`, {
                email: `attacker${i}@test.com`,
                password: 'wrongpassword'
            }).catch(e => e.response)); // Catch to handle 401/429
        }

        const responses = await Promise.all(requests);

        responses.forEach((res, index) => {
            if (!res) return;
            if (res.status === 429) {
                blocked = true;
            } else if (res.status === 401) {
                successCount++;
            }
        });

        if (blocked) {
            logPass('Rate Limiting successfully BLOCKED traffic (Received 429 Too Many Requests)');
        } else {
            logFail(`Rate Limiting FAILED to block ${ATTACK_SIZE} requests (Auth Limit should be ~10). Check Redis/Config.`);
        }

    } catch (error) {
        logFail('Rate Limit Test Error', error.message);
    }
}

async function testBasicInjection() {
    logInfo('Testing Input Sanitization (SQLi & XSS)...');

    // 1. SQL Injection Probe
    try {
        const sqlPayload = "' OR '1'='1";
        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: sqlPayload,
            password: 'password'
        }, { validateStatus: false });

        if (res.status === 400 || res.status === 401) {
            logPass(`SQL Injection payload handled correctly (Status: ${res.status})`);
        } else if (res.status === 200) {
            logFail('CRITICAL: SQL Injection successfully bypassed login!');
        } else {
            logInfo(`SQL Injection check returned: ${res.status}`);
        }
    } catch (e) {
        logPass('SQL Injection caused error (good sign if handled)');
    }

    // 2. XSS Probe
    try {
        const xssPayload = "<script>alert(1)</script>";
        // Trying to register with XSS name
        const res = await axios.post(`${BASE_URL}/auth/register`, {
            email: "xss-test@test.com",
            password: "Password123!",
            name: xssPayload,
            phone: "1234567890"
        }, { validateStatus: false });

        // If it returns 201, we check if it reflected the script (usually API returns JSON)
        // Ideally, it should sanitize.
        if (res.data && res.data.user && res.data.user.name) {
            if (res.data.user.name.includes('<script>')) {
                logFail('XSS Probe: Script tag was stored/reflected unsanitized!');
            } else {
                logPass('XSS Probe: Script tag was sanitized/removed.');
            }
        } else {
            logInfo('XSS Probe: Registration failed or returned no data (Safe default)');
        }

    } catch (e) {
        logInfo('XSS Probe error: ' + e.message);
    }
}

async function run() {
    console.log(`${COLORS.YELLOW}🛡️  STARTING SECURITY PROBES...${COLORS.RESET}\n`);
    await testSecurityHeaders();
    console.log('');
    await testRateLimiting();
    console.log('');
    await testBasicInjection();
    console.log(`\n${COLORS.YELLOW}🛡️  SECURITY PROBES COMPLETE.${COLORS.RESET}`);
}

run();
