#!/bin/bash

# Dune Analytics Query ID Tester
# Usage: ./test-dune.sh QUERY_ID

API_KEY="DCeKQ141vBViuj5pSFlLYGpgLNNVPbZQ"
QUERY_ID=$1

if [ -z "$QUERY_ID" ]; then
  echo "❌ Error: No query ID provided"
  echo ""
  echo "Usage: ./test-dune.sh QUERY_ID"
  echo ""
  echo "Example: ./test-dune.sh 3702911"
  exit 1
fi

echo "🔍 Testing Dune Query ID: $QUERY_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Make the API call
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  "https://api.dune.com/api/v1/query/$QUERY_ID/results" \
  -H "X-Dune-API-Key: $API_KEY")

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

# Extract JSON response (everything except last line)
JSON_RESPONSE=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Success! Query ID $QUERY_ID is valid"
  echo ""
  
  # Check if jq is installed
  if command -v jq &> /dev/null; then
    echo "📊 Query Info:"
    echo "$JSON_RESPONSE" | jq '{
      execution_ended_at,
      row_count: .result.rows | length,
      columns: .result.metadata.column_names
    }'
    
    echo ""
    echo "📝 First row of data:"
    echo "$JSON_RESPONSE" | jq '.result.rows[0]'
  else
    echo "📊 Raw Response:"
    echo "$JSON_RESPONSE" | head -c 500
    echo ""
    echo "💡 Install jq for prettier output: brew install jq"
  fi
else
  echo "❌ Error: Query ID $QUERY_ID failed (HTTP $HTTP_CODE)"
  echo ""
  echo "Response:"
  echo "$JSON_RESPONSE" | head -c 500
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
