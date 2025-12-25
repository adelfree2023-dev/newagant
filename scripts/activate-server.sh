#!/bin/bash
# ====================================
# CoreFlex Server Activation Script
# ====================================
# تشغيل هذا الملف على السيرفر لتفعيل المشروع
#
# الاستخدام: sudo bash activate-server.sh

set -e  # Exit on error

echo "======================================"
echo "CoreFlex Server Activation Script"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root (sudo)${NC}"
  exit 1
fi

# Configuration
PROJECT_DIR="/root/newagant"
BACKUP_DIR="/root/backups"

echo ""
echo -e "${YELLOW}Step 1: Navigating to project directory${NC}"
cd $PROJECT_DIR || { echo -e "${RED}Project directory not found!${NC}"; exit 1; }
echo -e "${GREEN}✓ In project directory: $PROJECT_DIR${NC}"

echo ""
echo -e "${YELLOW}Step 2: Creating backup of current state${NC}"
mkdir -p $BACKUP_DIR
BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
docker exec coreflex-db pg_dump -U coreflex -d coreflex > "$BACKUP_DIR/${BACKUP_NAME}.sql" 2>/dev/null || echo "No existing database to backup"
echo -e "${GREEN}✓ Backup created (if database existed)${NC}"

echo ""
echo -e "${YELLOW}Step 3: Pulling latest code from GitHub${NC}"
git fetch origin main
git reset --hard origin/main
echo -e "${GREEN}✓ Code updated${NC}"

echo ""
echo -e "${YELLOW}Step 4: Checking .env file${NC}"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠ Created .env from .env.example - PLEASE UPDATE WITH REAL VALUES${NC}"
  else
    echo -e "${RED}No .env or .env.example found!${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✓ .env file exists${NC}"
fi

echo ""
echo -e "${YELLOW}Step 5: Stopping existing containers${NC}"
docker compose down --remove-orphans 2>/dev/null || true
echo -e "${GREEN}✓ Containers stopped${NC}"

echo ""
echo -e "${YELLOW}Step 6: Starting PostgreSQL first${NC}"
docker compose up -d postgres
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Wait for PostgreSQL to be healthy
for i in {1..30}; do
  if docker exec coreflex-db pg_isready -U coreflex > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
    break
  fi
  echo "Waiting for PostgreSQL... ($i/30)"
  sleep 2
done

echo ""
echo -e "${YELLOW}Step 7: Applying database schema${NC}"
if [ -f database/schema.sql ]; then
  docker exec -i coreflex-db psql -U coreflex -d coreflex < database/schema.sql
  echo -e "${GREEN}✓ Schema applied${NC}"
else
  echo -e "${RED}schema.sql not found!${NC}"
fi

echo ""
echo -e "${YELLOW}Step 8: Applying seed data${NC}"
if [ -f database/seed.sql ]; then
  docker exec -i coreflex-db psql -U coreflex -d coreflex < database/seed.sql
  echo -e "${GREEN}✓ Seed data applied${NC}"
else
  echo -e "${YELLOW}⚠ seed.sql not found (optional)${NC}"
fi

echo ""
echo -e "${YELLOW}Step 9: Starting Redis${NC}"
docker compose up -d redis
sleep 3
echo -e "${GREEN}✓ Redis started${NC}"

echo ""
echo -e "${YELLOW}Step 10: Building and starting all services${NC}"
docker compose up -d --build
echo -e "${GREEN}✓ All services started${NC}"

echo ""
echo -e "${YELLOW}Step 11: Waiting for services to be ready${NC}"
sleep 15

echo ""
echo -e "${YELLOW}Step 12: Checking service status${NC}"
echo ""
docker compose ps
echo ""

echo ""
echo -e "${YELLOW}Step 13: Testing API health${NC}"
API_HEALTH=$(curl -s http://localhost:8000/api/health 2>/dev/null || echo "error")
if echo "$API_HEALTH" | grep -q "ok"; then
  echo -e "${GREEN}✓ API is healthy: $API_HEALTH${NC}"
else
  echo -e "${RED}✗ API health check failed: $API_HEALTH${NC}"
  echo "Checking API logs..."
  docker logs coreflex-api --tail 50
fi

echo ""
echo "======================================"
echo -e "${GREEN}Activation Complete!${NC}"
echo "======================================"
echo ""
echo "Service URLs:"
echo "  - Landing:     http://$(hostname -I | awk '{print $1}'):3000"
echo "  - Storefront:  http://$(hostname -I | awk '{print $1}'):3001"
echo "  - Admin:       http://$(hostname -I | awk '{print $1}'):3002"
echo "  - Super Admin: http://$(hostname -I | awk '{print $1}'):3003"
echo "  - API:         http://$(hostname -I | awk '{print $1}'):8000"
echo ""
echo "To check logs:"
echo "  docker compose logs -f api"
echo "  docker compose logs -f storefront"
echo ""
echo -e "${YELLOW}IMPORTANT: Update .env with production values!${NC}"
echo ""
