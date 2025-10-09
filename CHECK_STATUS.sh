#!/bin/bash
# Quick status check for CoW DAO Governance Dashboard

echo "🔍 CoW DAO Governance Dashboard - Status Check"
echo "================================================"
echo ""

# Check if server is running
echo "1️⃣ Checking Server Status..."
if lsof -i :3001 > /dev/null 2>&1; then
    echo "   ✅ Server is running on port 3001"
    echo "   📍 URL: http://localhost:3001"
else
    if lsof -i :3000 > /dev/null 2>&1; then
        echo "   ✅ Server is running on port 3000"
        echo "   📍 URL: http://localhost:3000"
    else
        echo "   ❌ Server is NOT running"
        echo "   💡 Run: npm run dev"
    fi
fi
echo ""

# Check .env file
echo "2️⃣ Checking Environment Variables..."
if [ -f .env ]; then
    echo "   ✅ .env file exists"
    
    # Check Dune key
    if grep -q "^VITE_DUNE_API_KEY=.\+" .env; then
        echo "   ✅ Dune API key is set"
    else
        echo "   ❌ Dune API key is EMPTY"
        echo "   💡 Add your key from: https://dune.com/settings/api"
    fi
    
    # Check CoinGecko key
    if grep -q "^VITE_COINGECKO_API_KEY=.\+" .env; then
        echo "   ✅ CoinGecko API key is set"
    else
        echo "   ⚠️  CoinGecko API key is empty (optional)"
    fi
    
    # Check Etherscan key
    if grep -q "^VITE_ETHERSCAN_API_KEY=.\+" .env; then
        echo "   ✅ Etherscan API key is set"
    else
        echo "   ⚠️  Etherscan API key is empty (optional)"
    fi
else
    echo "   ❌ .env file NOT found"
    echo "   💡 Run: cp .env.example .env"
fi
echo ""

# Check if server needs restart
echo "3️⃣ Checking Server Age..."
if pgrep -f "govdashboard.*vite" > /dev/null 2>&1; then
    SERVER_PID=$(pgrep -f "govdashboard.*vite" | head -1)
    ENV_TIME=$(stat -f "%m" .env 2>/dev/null || echo "0")
    SERVER_TIME=$(stat -f "%B" /proc/$SERVER_PID 2>/dev/null || ps -o lstart= -p $SERVER_PID | xargs -I {} date -j -f "%c" "{}" "+%s" 2>/dev/null || echo "0")
    
    if [ "$ENV_TIME" -gt "$SERVER_TIME" ]; then
        echo "   ⚠️  .env was modified AFTER server started"
        echo "   💡 Restart server to load new API keys"
        echo "      Press Ctrl+C, then run: npm run dev"
    else
        echo "   ✅ Server is using current .env file"
    fi
else
    echo "   ℹ️  Cannot determine server age"
fi
echo ""

# Test API connectivity
echo "4️⃣ Testing API Connectivity..."

# Test Snapshot
if curl -s -X POST https://hub.snapshot.org/graphql \
    -H "Content-Type: application/json" \
    -d '{"query": "{ proposals(first: 1) { id } }"}' \
    --max-time 5 2>/dev/null | grep -q "id"; then
    echo "   ✅ Snapshot API is reachable"
else
    echo "   ❌ Cannot reach Snapshot API"
fi

# Test if local server responds
if curl -s http://localhost:3001 --max-time 2 > /dev/null 2>&1; then
    echo "   ✅ Local server responds on port 3001"
elif curl -s http://localhost:3000 --max-time 2 > /dev/null 2>&1; then
    echo "   ✅ Local server responds on port 3000"
else
    echo "   ❌ Local server not responding"
fi
echo ""

# Summary
echo "📊 Summary"
echo "================================================"

# Determine the correct URL
if lsof -i :3001 > /dev/null 2>&1; then
    PORT=3001
elif lsof -i :3000 > /dev/null 2>&1; then
    PORT=3000
else
    PORT="NOT_RUNNING"
fi

if [ "$PORT" != "NOT_RUNNING" ]; then
    echo "🌐 Your dashboard is at: http://localhost:$PORT"
    echo ""
    echo "Next steps:"
    echo "1. Open http://localhost:$PORT in your browser"
    echo "2. Press F12 to open Developer Console"
    echo "3. Look for these messages:"
    echo "   • [SnapshotService] Received X proposals"
    echo "   • [DuneService] Received X rows"
    echo ""
    echo "If you see 'Dune API key not set' warning:"
    echo "   → Edit .env and add your Dune API key"
    echo "   → Restart the server (Ctrl+C, then npm run dev)"
else
    echo "❌ Server is not running"
    echo ""
    echo "To start the server:"
    echo "   npm run dev"
fi
echo ""
echo "For more help, see:"
echo "  • ISSUE_FOUND.md - Common issues and fixes"
echo "  • QUICK_START.md - 2-minute setup guide"
echo "  • SETUP_GUIDE.md - Detailed documentation"

