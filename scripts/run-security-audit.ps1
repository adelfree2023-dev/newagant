# Security Audit Script
# Run: .\scripts\run-security-audit.ps1

$ErrorActionPreference = 'Continue'

Write-Host "`n🔒 CoreFlex Security Audit" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# 1. Run npm audit on all services
Write-Host "`n📦 Checking API vulnerabilities..." -ForegroundColor Yellow
Set-Location api
npm audit --audit-level=high
Set-Location ..

Write-Host "`n📦 Checking Storefront vulnerabilities..." -ForegroundColor Yellow
Set-Location storefront
npm audit --audit-level=high
Set-Location ..

Write-Host "`n📦 Checking Admin vulnerabilities..." -ForegroundColor Yellow
Set-Location admin
npm audit --audit-level=high
Set-Location ..

# 2. Check for exposed secrets
Write-Host "`n🔑 Scanning for exposed secrets..." -ForegroundColor Yellow
$patterns = @("password=", "api_key=", "secret=", "DB_PASSWORD=")
$found = $false

foreach ($pattern in $patterns) {
    $matches = Get-ChildItem -Recurse -Include *.js,*.ts,*.tsx -File | 
               Select-String -Pattern $pattern -SimpleMatch
    if ($matches) {
        Write-Host "  ⚠️ Found potential secret: $pattern" -ForegroundColor Red
        $found = $true
    }
}

if (-not $found) {
    Write-Host "  ✅ No obvious secrets found" -ForegroundColor Green
}

# 3. Check Docker images with Trivy (if installed)
Write-Host "`n🐳 Checking Docker images with Trivy..." -ForegroundColor Yellow
$trivyInstalled = Get-Command trivy -ErrorAction SilentlyContinue
if ($trivyInstalled) {
    trivy image newagant-api:latest --severity HIGH,CRITICAL 2>$null
    trivy image newagant-storefront:latest --severity HIGH,CRITICAL 2>$null
} else {
    Write-Host "  ⚠️ Trivy not installed. Install with: scoop install trivy" -ForegroundColor Yellow
}

# 4. Summary
Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "✅ Security audit complete!" -ForegroundColor Green
Write-Host "Review any warnings above." -ForegroundColor Cyan
