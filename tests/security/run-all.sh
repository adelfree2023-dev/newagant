#!/bin/bash
# MILITARY-GRADE SECURITY TEST SUITE - LINUX MASTER SCRIPT
# تشغيل جميع اختبارات الأمان على السيرفر

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================================${NC}"
echo -e "${CYAN}   🛡️  COREFLEX SECURITY TESTING SUITE (LINUX)  🛡️${NC}"
echo -e "${CYAN}========================================================${NC}"
echo -e "Date: $(date)"
echo -e "${CYAN}========================================================${NC}\n"

# 1. Infrastructure Checks (Simulated for Bash)
echo -e "${MAGENTA}▶ PHASE 1: INFRASTRUCTURE INTEGRITY${NC}"
containers=("coreflex-api" "coreflex-postgres" "coreflex-redis" "coreflex-storefront" "coreflex-admin" "coreflex-nginx")
for container in "${containers[@]}"; do
    if [ "$(docker inspect -f '{{.State.Status}}' $container 2>/dev/null)" == "running" ]; then
        echo -e "${GREEN}✅ [PASS] Container $container is RUNNING${NC}"
    else
        echo -e "${RED}❌ [FAIL] Container $container is NOT running${NC}"
    fi
done

# API Health Check
echo -e "\nChecking API Health..."
HEALTH=$(curl -s http://localhost:8000/health)
if [[ $HEALTH == *"ok"* ]] || [[ $HEALTH == *"connected"* ]]; then
    echo -e "${GREEN}✅ [PASS] API Health Check Passed${NC}"
else
    echo -e "${RED}❌ [FAIL] API Health Check FAILED${NC}"
fi
echo -e "--------------------------------------------------------\n"

# 2. Vulnerability Scanning (npm audit)
echo -e "${MAGENTA}▶ PHASE 2: AUTOMATED VULNERABILITY SCANNING${NC}"
services=("api" "storefront" "admin")
for service in "${services[@]}"; do
    echo -e "Scanning $service..."
    cd ../../$service
    if [ -f "package.json" ]; then
        npm audit --audit-level=high
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ [PASS] $service is clean.${NC}"
        else
            echo -e "${YELLOW}⚠️ [WARN] $service has vulnerabilities or audit failed.${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ [WARN] Service directory not found: $service${NC}"
    fi
    cd - > /dev/null
done
echo -e "--------------------------------------------------------\n"

# 3. Security Probes (Node.js)
echo -e "${MAGENTA}▶ PHASE 3: ACTIVE SECURITY PROBES${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing test dependencies..."
    npm init -y > /dev/null
    npm install axios > /dev/null
fi
node test-security-suite.js
echo -e "--------------------------------------------------------\n"

echo -e "${GREEN}✅ ALL TESTS EXECUTED.${NC}"
echo "Review the output above for any [FAIL] indicators."
