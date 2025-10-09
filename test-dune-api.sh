#!/bin/bash
# Test Dune API key validity

echo "🔍 Testing Dune API Key..."
echo ""

# Load the API key from .env
DUNE_KEY=$(grep "^VITE_DUNE_API_KEY=" .env | sed 's/^VITE_DUNE_API_KEY=//' | tr -d '\r\n')

if [ -z "$DUNE_KEY" ]; then
    echo "❌ No Dune API key found in .env"
    echo "💡 Add your key: VITE_DUNE_API_KEY=your_key_here"
    exit 1
fi

echo "✅ Found API key: ${DUNE_KEY:0:10}...${DUNE_KEY: -4}"
echo ""

# Test with a simple query
echo "Testing API key with query 3700123 (Treasury)..."
echo ""

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -H "X-Dune-API-Key: $DUNE_KEY" \
  "https://api.dune.com/api/v1/query/3700123/results")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "HTTP Status: $HTTP_CODE"
echo ""

case $HTTP_CODE in
  200)
    echo "✅ SUCCESS! API key is valid and working"
    echo ""
    echo "Sample data:"
    echo "$BODY" | head -n 20
    ;;
  401)
    echo "❌ UNAUTHORIZED - Invalid API key"
    echo ""
    echo "Solutions:"
    echo "1. Go to: https://dune.com/settings/api"
    echo "2. Create a new API key"
    echo "3. Replace the key in .env file"
    echo "4. Restart the dev server"
    ;;
  429)
    echo "❌ RATE LIMIT EXCEEDED"
    echo ""
    echo "You've hit the free tier limit:"
    echo "• Free tier: 20 query executions per day"
    echo "• 1000 datapoints per month"
    echo ""
    echo "Solutions:"
    echo "1. Wait until tomorrow for reset (limits are daily)"
    echo "2. Upgrade to paid plan: https://dune.com/pricing"
    echo "3. Use cached results (app has caching built-in)"
    echo ""
    echo "The app will show old cached data until limits reset."
    ;;
  404)
    echo "❌ Query not found"
    echo "The query ID might be wrong or deleted"
    ;;
  *)
    echo "❌ Unexpected response"
    echo "$BODY"
    ;;
esac

# Check query execution status
if [ "$HTTP_CODE" = "429" ]; then
    echo ""
    echo "Checking your Dune API usage..."
    echo "Visit: https://dune.com/settings/api"
    echo "Look for 'API Usage' to see your current limits"
fi

