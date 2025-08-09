#!/bin/bash

# FLUX AI Capital Development Server Script
# This script kills any process on port 4321 and starts the dev server

PORT=4321
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 FLUX AI Capital Development Server${NC}"
echo "======================================="

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}Checking port $port...${NC}"
    
    # Find PID using the port
    local pid=$(lsof -ti:$port)
    
    if [ ! -z "$pid" ]; then
        echo -e "${RED}Found process $pid using port $port${NC}"
        echo "Killing process..."
        kill -9 $pid
        sleep 1
        echo -e "${GREEN}✓ Process killed${NC}"
    else
        echo -e "${GREEN}✓ Port $port is available${NC}"
    fi
}

# Kill any process on the development port
kill_port $PORT

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local from .env.example...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✓ .env.local created${NC}"
    echo -e "${YELLOW}Please update .env.local with your configuration${NC}"
fi

# Check if database exists
if [ ! -f "prisma/dev.db" ]; then
    echo -e "${YELLOW}Setting up database...${NC}"
    npm run db:generate
    npm run db:push
    echo -e "${GREEN}✓ Database setup complete${NC}"
fi

# Start development server
echo ""
echo -e "${GREEN}Starting development server on port $PORT...${NC}"
echo "======================================="
echo -e "${GREEN}➜ Local:   http://localhost:$PORT${NC}"
echo -e "${GREEN}➜ Dashboard: http://localhost:$PORT/dashboard${NC}"
echo "======================================="
echo ""

# Run the development server
npm run dev