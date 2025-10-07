#!/bin/bash

echo "🛑 Stopping everything..."

# Stop Node.js processes (more thorough)
pkill -f "nest start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "yarn start:dev" 2>/dev/null || true
pkill -f "yarn dev" 2>/dev/null || true

# Stop Docker containers
docker stop $(docker ps -q) 2>/dev/null || true

echo "✅ Everything stopped!"
