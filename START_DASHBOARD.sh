#!/bin/bash

# CoW DAO Governance Dashboard - Start Script
# This script ensures the dashboard starts correctly with proper environment loading

cd "$(dirname "$0")"

echo "🚀 Starting CoW DAO Governance Dashboard..."
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ ERROR: .env file not found!"
    echo ""
    echo "Please create a .env file with your API keys:"
    echo "  cp .env.example .env"
    echo "  nano .env  # Add your API keys"
    echo ""
    exit 1
fi

# Check if required API keys are set
if ! grep -q "VITE_DUNE_API_KEY=.\+" .env; then
    echo "⚠️  WARNING: VITE_DUNE_API_KEY appears to be empty in .env"
    echo "   Treasury and revenue data will not load without this key."
    echo ""
fi

# Kill any existing Vite processes
echo "🧹 Cleaning up old processes..."
pkill -f "node.*vite" 2>/dev/null
sleep 1

# Clear Vite cache
if [ -d "node_modules/.vite" ]; then
    echo "🗑️  Clearing Vite cache..."
    rm -rf node_modules/.vite
fi

echo "✅ Environment ready"
echo ""
echo "📦 Starting development server..."
echo "   This will take a few seconds..."
echo ""

# Start the dev server
npm run dev

# Note: The server will show the URL when ready
# Usually: http://localhost:5173

