#!/bin/bash

# Test Dune API connectivity directly
# Usage: ./test-dune-direct.sh YOUR_API_KEY

if [ -z "$1" ]; then
  echo "Usage: ./test-dune-direct.sh YOUR_DUNE_API_KEY"
  echo ""
  echo "Or set it in .env and run: source .env && ./test-dune-direct.sh \$VITE_DUNE_API_KEY"
  exit 1
fi

API_KEY="$1"
echo "Testing Dune API with key: ${API_KEY:0:10}..."

echo ""
echo "=== Testing Query 3700123 (Treasury/Revenue) ==="
curl -s -X GET "https://api.dune.com/api/v1/query/3700123/results" \
  -H "X-Dune-API-Key: $API_KEY" \
  | jq -r '.state, .result.rows[0:2]' 2>/dev/null || echo "Error or query not accessible"

echo ""
echo "=== Testing Query 5270914 (Solver Rewards) ==="
curl -s -X GET "https://api.dune.com/api/v1/query/5270914/results" \
  -H "X-Dune-API-Key: $API_KEY" \
  | jq -r '.state, .result.rows[0:2]' 2>/dev/null || echo "Error or query not accessible"

echo ""
echo "=== Testing Query 5533118 (Solver Info) ==="
curl -s -X GET "https://api.dune.com/api/v1/query/5533118/results" \
  -H "X-Dune-API-Key: $API_KEY" \
  | jq -r '.state, .result.rows[0:2]' 2>/dev/null || echo "Error or query not accessible"

echo ""
echo "=== Test Complete ==="
echo "If you see 'Error or query not accessible', these queries may be private."
echo "You can fork them or create your own public queries."

