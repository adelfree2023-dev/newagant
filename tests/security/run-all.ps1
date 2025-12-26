# MILITARY-GRADE SECURITY TEST SUITE - MASTER SCRIPT
# تشغيل جميع اختبارات الأمان المركزية

$ErrorActionPreference = "Continue"
$scriptDir = Split-Path $MyInvocation.MyCommand.Path

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   🛡️  COREFLEX SECURITY TESTING SUITE  🛡️" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)"
Write-Host "========================================================`n"

# 1. Infrastructure Checks
Write-Host "▶ PHASE 1: INFRASTRUCTURE INTEGRITY" -ForegroundColor Magenta
& "$scriptDir\test-infrastructure.ps1"
Write-Host "--------------------------------------------------------`n"

# 2. Vulnerability Scanning
Write-Host "▶ PHASE 2: AUTOMATED VULNERABILITY SCANNING" -ForegroundColor Magenta
& "$scriptDir\run-vulnerability-scan.ps1"
Write-Host "--------------------------------------------------------`n"

# 3. Security Probes (Node.js)
Write-Host "▶ PHASE 3: ACTIVE SECURITY PROBES (Rate Limit & Injection)" -ForegroundColor Magenta
# Check if axios is installed, if not, try to install it strictly in this folder or rely on pre-install.
# For simplicity in this env, we assume we can run it or use a temp approach.
# We will use 'npm install axios' in the scripts folder just in case.

$probeScript = "$scriptDir\test-security-suite.js"
Push-Location $scriptDir
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies for test suite..." -ForegroundColor Gray
    npm init -y | Out-Null
    npm install axios | Out-Null
}
node test-security-suite.js
Pop-Location
Write-Host "--------------------------------------------------------`n"

Write-Host "✅ ALL TESTS EXECUTED." -ForegroundColor Green
Write-Host "Review the output above for any [FAIL] indicators."
