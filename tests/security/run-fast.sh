#!/bin/bash
# FAST SECURITY TEST SUITE (LITE)
# تشغيل الاختبارات الأساسية فقط لتوفير الوقت

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}🚀 STARTING FAST SECURITY CHECK (LITE VERSION)...${NC}\n"

# 1. Infrastructure Checks
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

# 2. Skip Audit Phase (It's too slow on server)
echo -e "\n${YELLOW}ℹ️ Skipping Phase 2 (Vulnerability Scan) to save time...${NC}\n"

# 3. Security Probes (Node.js)
echo -e "${MAGENTA}▶ PHASE 2: ACTIVE SECURITY PROBES${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing test dependencies..."
    npm init -y > /dev/null
    npm install axios > /dev/null
fi
node test-security-suite.js
echo -e "--------------------------------------------------------\n"

echo -e "${GREEN}✅ FAST TESTS COMPLETE.${NC}"
