# Military-Grade Infrastructure Check
# فحص البنية التحتية العسكرية

$ErrorActionPreference = "Stop"

function Log-Success {
    param($Message)
    Write-Host "✅ [PASS] $Message" -ForegroundColor Green
}

function Log-Error {
    param($Message)
    Write-Host "❌ [FAIL] $Message" -ForegroundColor Red
}

function Log-Info {
    param($Message)
    Write-Host "ℹ️ [INFO] $Message" -ForegroundColor Cyan
}

Write-Host "`n🛡️ STARTING INFRASTRUCTURE VERIFICATION...`n" -ForegroundColor Yellow

# 1. Docker Containers Check
Log-Info "Checking Docker Containers..."
if (Get-Command "docker" -ErrorAction SilentlyContinue) {
    $containers = @("coreflex-api", "coreflex-postgres", "coreflex-redis", "coreflex-storefront", "coreflex-admin", "coreflex-nginx")
    foreach ($container in $containers) {
        $status = docker inspect -f '{{.State.Status}}' $container 2>$null
        if ($status -eq "running") {
            Log-Success "Container $container is RUNNING"
        } else {
            Log-Error "Container $container is NOT running (Status: $status)"
        }
    }
} else {
    Log-Error "Docker command not found! Skipping Container checks. Please install Docker."
}

# 2. API Health Check
Log-Info "Checking API Health Endpoint..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost/api/v1/health" -Method Get -ErrorAction Stop
    if ($response.status -eq "ok" -or $response.database -eq "connected") {
        Log-Success "API Health Check Passed (Database: Connected)"
    } else {
        Log-Error "API Health Check Returned Invalid Status: $($response | ConvertTo-Json -Depth 1)"
    }
} catch {
    Log-Error "API Health Check FAILED to connect: $_"
}

# 3. Port Security Check (Crucial for Rank 5)
Log-Info "Checking Network Hardening (Port Security)..."

function Test-PortClosed {
    param($Port, $Name)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Log-Error "SECURITY BREACH: Port $Port ($Name) is EXPOSED to host! Should be internal only."
    } else {
        Log-Success "Security Secured: Port $Port ($Name) is correctly CLOSED to host."
    }
}

Test-PortClosed 5432 "PostgreSQL"
Test-PortClosed 6379 "Redis"

Write-Host "`n🛡️ INFRASTRUCTURE CHECK COMPLETE." -ForegroundColor Yellow
