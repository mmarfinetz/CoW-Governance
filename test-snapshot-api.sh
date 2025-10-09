#!/bin/bash
# Quick test to verify Snapshot API is accessible and returning data

echo "Testing Snapshot API (no key needed)..."
echo ""

curl -s -X POST https://hub.snapshot.org/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { proposals(first: 1, where: { space_in: [\"cow.eth\"] }, orderBy: \"created\", orderDirection: desc) { id title state created } }"
  }' | jq '.data.proposals[0] | {title, state, created}'

echo ""
echo "If you see proposal data above, Snapshot API is working! ✅"
echo "If you see an error, there might be a network issue ❌"

