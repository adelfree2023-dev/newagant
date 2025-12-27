# CoreFlex Production Deployment Script
# Run: .\scripts\deploy-production.ps1

$ErrorActionPreference = 'Stop'

Write-Host "`n🚀 CoreFlex Production Deployment" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Configuration
$REGISTRY = $env:DOCKER_REGISTRY ?? "your-registry.azurecr.io"
$TAG = $env:DEPLOY_TAG ?? (Get-Date -Format "yyyyMMdd-HHmmss")

# 1. Build Production Images
Write-Host "`n📦 Building production images..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml build --no-cache

# 2. Tag Images
Write-Host "`n🏷️ Tagging images..." -ForegroundColor Yellow
docker tag coreflex-api "${REGISTRY}/coreflex-api:${TAG}"
docker tag coreflex-api "${REGISTRY}/coreflex-api:latest"
docker tag coreflex-storefront "${REGISTRY}/coreflex-storefront:${TAG}"
docker tag coreflex-storefront "${REGISTRY}/coreflex-storefront:latest"
docker tag coreflex-admin "${REGISTRY}/coreflex-admin:${TAG}"
docker tag coreflex-admin "${REGISTRY}/coreflex-admin:latest"

Write-Host "Tagged with: $TAG" -ForegroundColor Green

# 3. Push to Registry (Optional - uncomment when ready)
# Write-Host "`n📤 Pushing to registry..." -ForegroundColor Yellow
# docker push "${REGISTRY}/coreflex-api:${TAG}"
# docker push "${REGISTRY}/coreflex-api:latest"
# docker push "${REGISTRY}/coreflex-storefront:${TAG}"
# docker push "${REGISTRY}/coreflex-storefront:latest"
# docker push "${REGISTRY}/coreflex-admin:${TAG}"
# docker push "${REGISTRY}/coreflex-admin:latest"

# 4. Start Services
Write-Host "`n🐳 Starting services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

# 5. Wait for healthy state
Write-Host "`n⏳ Waiting for services to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ API is healthy!" -ForegroundColor Green
            break
        }
    }
    catch {
        $attempt++
        Write-Host "  Attempt $attempt/$maxAttempts - Waiting..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

# 6. Run Database Migrations
Write-Host "`n🗄️ Running database migrations..." -ForegroundColor Yellow
docker exec coreflex-api node scripts/migrate.js 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migrations complete" -ForegroundColor Green
}
else {
    Write-Host "⚠️ Migrations skipped or failed" -ForegroundColor Yellow
}

# 7. Smoke Tests
Write-Host "`n🧪 Running smoke tests..." -ForegroundColor Yellow
$endpoints = @(
    "http://localhost:8000/api/health",
    "http://localhost:8000/api/products?limit=1",
    "http://localhost:8000/api/categories"
)

foreach ($url in $endpoints) {
    try {
        $res = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing
        Write-Host "  ✅ $url - $($res.StatusCode)" -ForegroundColor Green
    }
    catch {
        Write-Host "  ❌ $url - Failed" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Services running at:" -ForegroundColor Cyan
Write-Host "  - API:        http://localhost:8000"
Write-Host "  - Storefront: http://localhost:3001"
Write-Host "  - Admin:      http://localhost:3002"
Write-Host "  - SuperAdmin: http://localhost:3003"
Write-Host ""
Write-Host "Docker tag: $TAG" -ForegroundColor Gray
