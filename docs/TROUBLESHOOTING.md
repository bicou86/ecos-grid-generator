# Troubleshooting Guide - ECOS Platform

## Issue: Homepage shows "0 cas cliniques" and "0 fiches"

### Root Cause
The backend and/or frontend servers were not running, preventing data from being loaded.

### Solution

**Step 1: Start Backend Server**

```bash
cd /Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/backend
DB_HOST=localhost DB_PASSWORD=ecos_secure_password_2025 node server-simple.js > backend.log 2>&1 &
```

**Step 2: Start Frontend Server**

```bash
cd /Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/frontend
npm run dev > frontend.log 2>&1 &
```

**Step 3: Verify Servers are Running**

```bash
# Check backend (should return healthy status)
curl http://localhost:3000/health

# Check frontend (should return HTML)
curl http://localhost:3001 | head -20
```

**Step 4: Verify Data**

```bash
# Check cases count
curl http://localhost:3000/api/v1/stats

# Check fiches count
curl http://localhost:3000/api/v1/fiches/stats
```

Expected output:
- Cases: 674
- Fiches: 317

**Step 5: Access Frontend**

Open your browser and navigate to: http://localhost:3001

You should now see:
- 674 cas cliniques
- 317 fiches de révision
- Statistics displayed correctly

---

## Quick Start Script

Create a file `start-servers.sh`:

```bash
#!/bin/bash

echo "🚀 Starting ECOS Platform servers..."

# Start backend
cd backend
DB_HOST=localhost DB_PASSWORD=ecos_secure_password_2025 node server-simple.js > backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID) - http://localhost:3000"

# Wait for backend to be ready
sleep 2

# Start frontend
cd ../frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID) - http://localhost:3001"

echo ""
echo "📊 Verifying data..."
sleep 3

# Check data
CASES=$(curl -s http://localhost:3000/api/v1/stats | grep -o '"totalCases":[0-9]*' | grep -o '[0-9]*')
FICHES=$(curl -s http://localhost:3000/api/v1/fiches/stats | grep -o '"total_fiches":"[0-9]*"' | grep -o '[0-9]*')

echo "   Cases: $CASES"
echo "   Fiches: $FICHES"
echo ""
echo "🎉 Platform ready!"
echo "   Frontend: http://localhost:3001"
echo "   Backend API: http://localhost:3000/api/v1"
```

Make it executable:

```bash
chmod +x start-servers.sh
./start-servers.sh
```

---

## Stop Servers

```bash
# Kill all node processes (use with caution)
pkill -9 node

# Or kill specific processes
kill <BACKEND_PID>
kill <FRONTEND_PID>
```

---

## Common Issues

### Issue: Port already in use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or kill all node processes
pkill -9 node
```

### Issue: Database connection error

**Error:** `Database connection error`

**Solution:**
```bash
# Check if PostgreSQL is running
docker-compose ps

# Start database
docker-compose up -d

# Verify connection
DB_HOST=localhost DB_PASSWORD=ecos_secure_password_2025 psql -h localhost -U ecos_user -d ecos_platform -c "SELECT COUNT(*) FROM clinical_cases;"
```

### Issue: Frontend showing old data

**Solution:**
```bash
# Clear browser cache
# Or hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Restart frontend server
pkill -f vite
cd frontend
npm run dev
```

### Issue: API returns 404

**Solution:**
```bash
# Check backend logs
tail -100 backend/backend.log

# Verify routes are loaded
curl http://localhost:3000/api/v1/stats
curl http://localhost:3000/api/v1/fiches/stats
```

---

## Verification Checklist

Before using the platform, verify:

- [ ] Docker containers running (PostgreSQL)
- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 3001
- [ ] Backend health check returns "healthy"
- [ ] Stats API returns 674 cases
- [ ] Fiches stats API returns 317 fiches
- [ ] Homepage displays correct numbers
- [ ] Fiches page loads and shows list
- [ ] Case catalog shows clinical cases

---

## Database Verification

```bash
# Connect to database
DB_HOST=localhost DB_PASSWORD=ecos_secure_password_2025 psql -h localhost -U ecos_user -d ecos_platform

# Check data
SELECT COUNT(*) FROM clinical_cases;     -- Should be 674
SELECT COUNT(*) FROM fiches;              -- Should be 317
SELECT COUNT(*) FROM fiche_sections;      -- Should be 1847+
SELECT COUNT(*) FROM fiche_tags;          -- Should be 6000+
```

---

## Platform URLs

- **Frontend Homepage**: http://localhost:3001
- **Fiches List**: http://localhost:3001/fiches
- **Case Catalog**: http://localhost:3001/catalog
- **Backend Health**: http://localhost:3000/health
- **API Documentation**: http://localhost:3000/api/v1
- **Database Admin**: http://localhost:8080 (Adminer)

---

## Log Files

View logs for debugging:

```bash
# Backend logs
tail -f backend/backend.log

# Frontend logs
tail -f frontend/frontend.log

# Combined logs
tail -f backend/backend.log frontend/frontend.log
```

---

## Reset Everything

If all else fails, complete reset:

```bash
# Stop all servers
pkill -9 node

# Stop Docker
docker-compose down

# Restart Docker
docker-compose up -d

# Wait for database
sleep 5

# Restart backend
cd backend
DB_HOST=localhost DB_PASSWORD=ecos_secure_password_2025 node server-simple.js > backend.log 2>&1 &

# Wait and restart frontend
sleep 3
cd ../frontend
npm run dev > frontend.log 2>&1 &

# Wait and verify
sleep 5
curl http://localhost:3000/health
curl http://localhost:3001 | head -5
```

---

**Last Updated**: October 14, 2025
