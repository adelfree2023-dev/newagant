# CoreFlex Platform 🏭

> مصنع انتاج مواقع وتطبيقات - Multi-tenant E-commerce Platform

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/adelfree2023-dev/newagant.git
cd newagant

# Start all services
docker compose up -d

# Check status
docker compose ps
```

## 📦 Services

| Service | Port | URL |
|---------|------|-----|
| Landing | 3000 | http://localhost:3000 |
| Storefront | 3001 | http://localhost:3001 |
| Admin | 3002 | http://localhost:3002 |
| API | 8000 | http://localhost:8000 |
| PostgreSQL | 5432 | - |
| Redis | 6379 | - |

## 🏗️ Project Structure

```
newagant/
├── docker-compose.yml
├── nginx/
│   └── nginx.conf
├── api/                 # Backend API
├── landing/             # Marketing + Wizard
├── storefront/          # Customer store
├── admin/               # Tenant admin panel
└── docs/                # Documentation
```

## 🔧 Development

```bash
# Start in dev mode
docker compose -f docker-compose.dev.yml up

# View logs
docker compose logs -f api

# Rebuild specific service
docker compose up -d --build api
```

## 📄 License

Private - All rights reserved.
