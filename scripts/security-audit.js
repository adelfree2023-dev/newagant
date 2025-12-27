#!/usr/bin/env node

/**
 * Security Audit Script
 * Run: node scripts/security-audit.js
 * 
 * Performs automated security checks on the codebase
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    CYAN: '\x1b[36m',
    RESET: '\x1b[0m'
};

function log(color, msg) {
    console.log(`${color}${msg}${COLORS.RESET}`);
}

async function runAudit() {
    log(COLORS.CYAN, '\n🔒 Starting Security Audit...\n');
    log(COLORS.CYAN, '='.repeat(50));

    const results = {
        passed: [],
        warnings: [],
        failed: []
    };

    // 1. Check for npm vulnerabilities (API)
    log(COLORS.YELLOW, '\n📦 Checking API dependencies...');
    try {
        execSync('cd api && npm audit --audit-level=high', { encoding: 'utf8' });
        log(COLORS.GREEN, '✅ API: No high/critical vulnerabilities');
        results.passed.push('API npm audit');
    } catch (e) {
        if (e.stdout && e.stdout.includes('found 0 vulnerabilities')) {
            log(COLORS.GREEN, '✅ API: No vulnerabilities found');
            results.passed.push('API npm audit');
        } else {
            log(COLORS.YELLOW, '⚠️ API: Vulnerabilities found (run npm audit for details)');
            results.warnings.push('API npm audit');
        }
    }

    // 2. Check for npm vulnerabilities (Storefront)
    log(COLORS.YELLOW, '\n📦 Checking Storefront dependencies...');
    try {
        execSync('cd storefront && npm audit --audit-level=high', { encoding: 'utf8' });
        log(COLORS.GREEN, '✅ Storefront: No high/critical vulnerabilities');
        results.passed.push('Storefront npm audit');
    } catch (e) {
        log(COLORS.YELLOW, '⚠️ Storefront: Check npm audit for details');
        results.warnings.push('Storefront npm audit');
    }

    // 3. Check for hardcoded secrets
    log(COLORS.YELLOW, '\n🔑 Checking for hardcoded secrets...');
    const secretPatterns = [
        /password\s*=\s*['"][^'"]+['"]/gi,
        /api_key\s*=\s*['"][^'"]+['"]/gi,
        /secret\s*=\s*['"][^'"]+['"]/gi
    ];

    let foundSecrets = false;
    const checkDirs = ['api/src', 'storefront/app', 'admin/app'];

    for (const dir of checkDirs) {
        if (!fs.existsSync(dir)) continue;

        const files = fs.readdirSync(dir, { recursive: true });
        for (const file of files) {
            if (typeof file !== 'string') continue;
            if (!file.endsWith('.js') && !file.endsWith('.ts') && !file.endsWith('.tsx')) continue;

            try {
                const content = fs.readFileSync(path.join(dir, file), 'utf8');
                for (const pattern of secretPatterns) {
                    if (pattern.test(content)) {
                        log(COLORS.RED, `  ⚠️ Potential secret in ${dir}/${file}`);
                        foundSecrets = true;
                    }
                }
            } catch (e) {
                // Skip unreadable files
            }
        }
    }

    if (!foundSecrets) {
        log(COLORS.GREEN, '✅ No obvious hardcoded secrets found');
        results.passed.push('Hardcoded secrets check');
    } else {
        results.warnings.push('Hardcoded secrets check');
    }

    // 4. Check for .env files in git
    log(COLORS.YELLOW, '\n📄 Checking if .env files are in .gitignore...');
    try {
        const gitignore = fs.readFileSync('.gitignore', 'utf8');
        if (gitignore.includes('.env')) {
            log(COLORS.GREEN, '✅ .env files are ignored');
            results.passed.push('.env in gitignore');
        } else {
            log(COLORS.RED, '❌ .env NOT in .gitignore!');
            results.failed.push('.env in gitignore');
        }
    } catch (e) {
        log(COLORS.YELLOW, '⚠️ .gitignore not found');
        results.warnings.push('.gitignore check');
    }

    // 5. Check for security headers in API
    log(COLORS.YELLOW, '\n🛡️ Checking security middleware in API...');
    try {
        const indexFile = fs.readFileSync('api/src/index.js', 'utf8');
        const checks = {
            helmet: indexFile.includes('helmet'),
            cors: indexFile.includes('cors'),
            rateLimit: indexFile.includes('rateLimit') || indexFile.includes('rate-limit'),
            xss: indexFile.includes('xss')
        };

        Object.entries(checks).forEach(([name, found]) => {
            if (found) {
                log(COLORS.GREEN, `  ✅ ${name} middleware configured`);
                results.passed.push(`${name} middleware`);
            } else {
                log(COLORS.YELLOW, `  ⚠️ ${name} middleware not found`);
                results.warnings.push(`${name} middleware`);
            }
        });
    } catch (e) {
        log(COLORS.YELLOW, '⚠️ Could not read API index file');
    }

    // Summary
    log(COLORS.CYAN, '\n' + '='.repeat(50));
    log(COLORS.CYAN, '📊 SECURITY AUDIT SUMMARY\n');
    log(COLORS.GREEN, `✅ Passed: ${results.passed.length}`);
    log(COLORS.YELLOW, `⚠️ Warnings: ${results.warnings.length}`);
    log(COLORS.RED, `❌ Failed: ${results.failed.length}`);
    log(COLORS.CYAN, '='.repeat(50));

    // Exit with error if any failures
    if (results.failed.length > 0) {
        process.exit(1);
    }
}

runAudit();
