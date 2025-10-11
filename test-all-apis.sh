#!/bin/bash

# Comprehensive API Testing Script for CoW DAO Dashboard
# Tests all API endpoints to verify they're accessible

echo "=========================================="
echo "CoW DAO Dashboard - API Status Check"
echo "=========================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    source .env
    echo "✅ .env file loaded"
else
    echo "❌ .env file not found!"
    echo "   Create it from ENV_TEMPLATE.txt"
    exit 1
fi

echo ""
echo "=== API Keys Configured ==="
echo "VITE_GRAPH_API_KEY: ${VITE_GRAPH_API_KEY:+✅ SET (${#VITE_GRAPH_API_KEY} chars)}${VITE_GRAPH_API_KEY:-❌ NOT SET}"
echo "VITE_DUNE_API_KEY: ${VITE_DUNE_API_KEY:+✅ SET (${#VITE_DUNE_API_KEY} chars)}${VITE_DUNE_API_KEY:-❌ NOT SET}"
echo "VITE_COINGECKO_API_KEY: ${VITE_COINGECKO_API_KEY:+✅ SET}${VITE_COINGECKO_API_KEY:-⚠️  NOT SET (optional)}"
echo "VITE_ETHERSCAN_API_KEY: ${VITE_ETHERSCAN_API_KEY:+✅ SET}${VITE_ETHERSCAN_API_KEY:-⚠️  NOT SET (optional)}"

echo ""
echo "=== Testing Snapshot API (Governance) ==="
SNAPSHOT_TEST=$(curl -s -X POST "https://hub.snapshot.org/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ proposals(first: 1, where: {space_in: [\"cow.eth\"]}) { id title } }"}' \
  | jq -r '.data.proposals[0].id' 2>/dev/null)

if [ "$SNAPSHOT_TEST" != "null" ] && [ -n "$SNAPSHOT_TEST" ]; then
    echo "✅ Snapshot API working - fetched proposal ID: $SNAPSHOT_TEST"
else
    echo "❌ Snapshot API failed or returned no data"
fi

echo ""
echo "=== Testing The Graph Subgraph (Protocol Data) ==="
if [ -z "$VITE_GRAPH_API_KEY" ]; then
    echo "⚠️  Skipped - VITE_GRAPH_API_KEY not set"
    echo "   Get key at: https://thegraph.com/studio/apikeys/"
else
    GRAPH_URL="https://gateway-arbitrum.network.thegraph.com/api/${VITE_GRAPH_API_KEY}/subgraphs/id/8mdwJG7YCSwqfxUbhCypZvoubeZcFVpCHb4zmHhvuKTD"
    GRAPH_TEST=$(curl -s -X POST "$GRAPH_URL" \
      -H "Content-Type: application/json" \
      -d '{"query": "{ totals(first: 1) { volumeUsd } }"}' \
      | jq -r '.data.totals[0].volumeUsd' 2>/dev/null)
    
    if [ "$GRAPH_TEST" != "null" ] && [ -n "$GRAPH_TEST" ]; then
        echo "✅ The Graph API working - volume: \$$GRAPH_TEST"
    else
        ERROR_MSG=$(curl -s -X POST "$GRAPH_URL" \
          -H "Content-Type: application/json" \
          -d '{"query": "{ totals(first: 1) { volumeUsd } }"}' 2>&1)
        echo "❌ The Graph API failed"
        echo "   Response: $ERROR_MSG"
    fi
fi

echo ""
echo "=== Testing Dune Analytics (Revenue) ==="
if [ -z "$VITE_DUNE_API_KEY" ]; then
    echo "⚠️  Skipped - VITE_DUNE_API_KEY not set"
    echo "   Get key at: https://dune.com/settings/api"
else
    DUNE_TEST=$(curl -s -X GET "https://api.dune.com/api/v1/query/5938001/results" \
      -H "X-Dune-API-Key: $VITE_DUNE_API_KEY" \
      | jq -r '.result.rows | length' 2>/dev/null)
    
    if [ "$DUNE_TEST" != "null" ] && [ "$DUNE_TEST" -gt 0 ]; then
        echo "✅ Dune API working - fetched $DUNE_TEST rows from query 5938001"
    else
        ERROR_MSG=$(curl -s -X GET "https://api.dune.com/api/v1/query/5938001/results" \
          -H "X-Dune-API-Key: $VITE_DUNE_API_KEY" 2>&1)
        echo "❌ Dune API failed"
        echo "   Response: $ERROR_MSG"
    fi
fi

echo ""
echo "=== Testing Safe API (Treasury Holdings) ==="
SAFE_TEST=$(curl -s "https://safe-transaction-mainnet.safe.global/api/v1/safes/0x616dE58c011F8736fa20c7Ae5352F7f6FB9F0669/" \
  | jq -r '.address' 2>/dev/null)

if [ "$SAFE_TEST" = "0x616dE58c011F8736fa20c7Ae5352F7f6FB9F0669" ]; then
    echo "✅ Safe API working - fetched treasury Safe"
else
    echo "❌ Safe API failed or Safe address not found"
fi

echo ""
echo "=== Testing CoinGecko API (Token Price) ==="
COINGECKO_TEST=$(curl -s "https://api.coingecko.com/api/v3/simple/price?ids=cow-protocol&vs_currencies=usd" \
  | jq -r '.["cow-protocol"].usd' 2>/dev/null)

if [ "$COINGECKO_TEST" != "null" ] && [ -n "$COINGECKO_TEST" ]; then
    echo "✅ CoinGecko API working - COW price: \$$COINGECKO_TEST"
else
    echo "⚠️  CoinGecko API failed (free tier may be rate limited)"
fi

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "Required for full dashboard:"
echo "  - Snapshot API: Check above"
echo "  - The Graph API: ${VITE_GRAPH_API_KEY:+✅ Key set}${VITE_GRAPH_API_KEY:-❌ Key missing}"
echo "  - Safe API: Check above"
echo ""
echo "Optional for enhanced data:"
echo "  - Dune Analytics: ${VITE_DUNE_API_KEY:+✅ Key set}${VITE_DUNE_API_KEY:-⚠️  Key missing}"
echo "  - CoinGecko: Check above"
echo ""
echo "Next steps:"
echo "  1. Fix any ❌ errors above"
echo "  2. Add missing API keys to .env"
echo "  3. Restart dev server: npm run dev"
echo ""

