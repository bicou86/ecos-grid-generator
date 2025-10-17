#!/bin/bash

# ECOS Platform - Server Startup Script
# This script starts both backend and frontend servers

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🚀 ECOS Platform - Starting Servers${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo ""

# Change to project root
cd "$(dirname "$0")"

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if database container is running
if ! docker-compose ps | grep -q postgres; then
    echo -e "${YELLOW}📦 Starting database container...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Database container started${NC}"
    sleep 3
fi

# Kill existing node processes (cleanup)
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
pkill -f "node.*server-simple" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

# Start Backend
echo -e "${BLUE}🔧 Starting backend server...${NC}"
cd backend
DB_HOST=localhost DB_PASSWORD=ecos_secure_password_2025 node server-simple.js > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to initialize...${NC}"
for i in {1..10}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend started successfully (PID: $BACKEND_PID)${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Backend failed to start. Check backend/backend.log${NC}"
        exit 1
    fi
    sleep 1
done

# Start Frontend
echo -e "${BLUE}⚛️  Starting frontend server...${NC}"
cd frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo -e "${YELLOW}⏳ Waiting for frontend to initialize...${NC}"
for i in {1..15}; do
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${RED}❌ Frontend failed to start. Check frontend/frontend.log${NC}"
        exit 1
    fi
    sleep 1
done

echo ""
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   📊 Verifying Data...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"

# Verify data
CASES=$(curl -s http://localhost:3000/api/v1/stats 2>/dev/null | grep -o '"totalCases":[0-9]*' | grep -o '[0-9]*' | head -1)
FICHES=$(curl -s http://localhost:3000/api/v1/fiches/stats 2>/dev/null | grep -o '"total_fiches":"[0-9]*"' | grep -o '[0-9]*' | head -1)

if [ -n "$CASES" ] && [ -n "$FICHES" ]; then
    echo -e "   ${GREEN}✅ Clinical Cases: $CASES${NC}"
    echo -e "   ${GREEN}✅ Fiches: $FICHES${NC}"
else
    echo -e "   ${RED}❌ Could not verify data. Check API endpoints.${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   🎉 Platform Ready!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}📱 Frontend:${NC}        http://localhost:3001"
echo -e "${GREEN}🔌 Backend API:${NC}     http://localhost:3000/api/v1"
echo -e "${GREEN}🏥 Health Check:${NC}    http://localhost:3000/health"
echo -e "${GREEN}📚 Fiches:${NC}          http://localhost:3001/fiches"
echo -e "${GREEN}📋 Cases:${NC}           http://localhost:3001/catalog"
echo ""
echo -e "${YELLOW}💡 To stop servers: pkill -9 node${NC}"
echo -e "${YELLOW}📝 Backend logs:  tail -f backend/backend.log${NC}"
echo -e "${YELLOW}📝 Frontend logs: tail -f frontend/frontend.log${NC}"
echo ""
