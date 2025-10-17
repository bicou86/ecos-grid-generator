# 🚀 ECOS Platform - Quick Reference

## Services Status

| Service | Status | URL |
|---------|--------|-----|
| Backend API | ✅ Running | http://localhost:3000 |
| PostgreSQL | ✅ Running | localhost:5432 |
| Redis | ✅ Running | localhost:6379 |
| Adminer | ✅ Running | http://localhost:8080 |

## Database Stats

- **Total Cases**: 674
- **Categories**: 8
- **Specialties**: 15

## Quick Commands

### Start Services
```bash
# Start Docker services
docker-compose -f docker-compose-simple.yml up -d

# Start API server
cd backend && DB_HOST=localhost DB_PASSWORD=ecos_secure_password_2025 npm start
```

### API Test Commands
```bash
# Health check
curl http://localhost:3000/health

# Get stats
curl http://localhost:3000/api/v1/stats

# List cases
curl "http://localhost:3000/api/v1/cases?limit=5"

# Get categories
curl http://localhost:3000/api/v1/categories

# Filter by category
curl "http://localhost:3000/api/v1/cases?category=amboss"
```

### Database Access
```bash
# Connect to PostgreSQL
docker exec -it ecos_postgres psql -U postgres -d ecos_platform

# Count cases
docker exec ecos_postgres psql -U postgres -d ecos_platform -c "SELECT COUNT(*) FROM clinical_cases;"
```

## Key Files

- `backend/server-simple.js` - API server
- `import_cases_to_db.py` - Data import script
- `API_DOCUMENTATION.md` - Complete API docs
- `DEPLOYMENT_SUCCESS.md` - Deployment summary

## Database Credentials

- **Host**: localhost
- **Port**: 5432
- **Database**: ecos_platform
- **User**: postgres
- **Password**: ecos_secure_password_2025

## API Endpoints

1. `GET /health` - Health check
2. `GET /api/v1/stats` - Platform statistics
3. `GET /api/v1/categories` - List categories
4. `GET /api/v1/specialties` - List specialties
5. `GET /api/v1/cases` - List cases (with filters)
6. `GET /api/v1/cases/:id` - Get single case

## Ports

- **3000** - Backend API
- **5432** - PostgreSQL
- **6379** - Redis
- **8080** - Adminer
