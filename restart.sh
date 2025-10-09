#!/bin/bash
# Quick restart script for the dev server

echo "🔄 Restarting CoW DAO Governance Dashboard..."
echo ""

# Find and kill the existing vite process
echo "Stopping current server..."
PID=$(pgrep -f "govdashboard.*vite" | head -1)

if [ -n "$PID" ]; then
    kill $PID
    sleep 2
    echo "✅ Server stopped (PID: $PID)"
else
    echo "ℹ️  No server was running"
fi

echo ""
echo "Starting server with fresh environment..."
echo ""
echo "================================================"
echo "The server will start below. Look for:"
echo "  ➜ Local: http://localhost:XXXX/"
echo ""
echo "Open that URL in your browser!"
echo "================================================"
echo ""

# Start the dev server
npm run dev

