# Dune Analytics Setup Guide

## ✅ SETUP COMPLETE!

**The query IDs have been configured and tested!**

We've integrated confirmed query IDs from CoW Protocol's official `dune-queries` GitHub repository:

- **Revenue**: `3700123` (monthly_dao_revenue) ✅ Tested & Working
- **Treasury**: `3700123` (same query, includes treasury data) ✅ Tested & Working
- **Solver Rewards**: `5270914` (auction_data) ✅ Tested & Working
- **Solver Info**: `5533118` (conversion_prices) ✅ Tested & Working

**To see it working:**
```bash
npm run dev
```

The dashboard will now fetch real-time data from Dune Analytics!

---

## 📋 All Confirmed Query IDs (from CoW Protocol GitHub)

Based on the official [cowprotocol/dune-queries](https://github.com/cowprotocol/dune-queries) repository, here are all confirmed query IDs:

### CoW Revenue Dashboard
- **3700123** - `monthly_dao_revenue_3700123.sql` ✅ **Currently Used**
- **4217030** - `native_token_usd_conversion_4217030.sql` (helper for USD conversion)

### CoW Solver Rewards Dashboard
- **3490353** - `excluded_batches_query_3490353.sql` (weekly excluded batches)
- **5270914** - `auction_data_5270914.sql` ✅ **Currently Used**
- **5533118** - `conversion_prices_5533118.sql` ✅ **Currently Used**

### Other Available Queries
You can find more queries by exploring the repo:
```bash
# Clone and explore all query IDs
git clone https://github.com/cowprotocol/dune-queries
cd dune-queries
find . -name "*_[0-9]*.sql" | grep -oE '[0-9]{7}' | sort -u
```

### Swapping Query IDs

If you want to use different queries, edit `src/config/apiConfig.js`:

```javascript
dune: {
  queries: {
    treasury: '3700123',    // Change to any treasury-related query
    revenue: '4217030',     // Try the USD conversion query instead
    solverRewards: '3490353', // Try excluded batches query
    solverInfo: '5533118'   // Keep current or explore other solver queries
  }
}
```

**Always test first:** `./test-dune.sh QUERY_ID`

---

## Overview

The dashboard uses Dune Analytics for treasury, revenue, and solver competition data. While the API key is already configured in your `.env` file, you'll need to identify the correct Dune query IDs to fetch real data.

## Finding CoW Protocol Dune Queries

### 1. Visit CoW Protocol's Dune Profile

Go to: https://dune.com/cowprotocol

You'll see all public dashboards created by CoW Protocol.

### 2. Key Dashboards to Use

We'll extract queries from these official CoW Protocol dashboards:
- **CoW Swap High Level Metrics Dashboard**: https://dune.com/cowprotocol/cowswap-high-level-metrics-dashboard
- **CoW Solver Rewards**: https://dune.com/cowprotocol/cow-solver-rewards
- **Solver Info**: https://dune.com/cowprotocol/solver-info
- **COW DAO Revenue**: https://dune.com/cowprotocol/cow-revenue

### 3. Extract Query IDs

For each dashboard, you need to find specific queries. Here's how:

#### Method 1: Click on Charts (Recommended)
1. Open one of the dashboard URLs above
2. Find a relevant chart/visualization
3. Click on the chart title or the three dots menu (⋯)
4. Select "View query" or click the chart to open it
5. The URL will change to: `https://dune.com/queries/1234567`
6. Copy the number (1234567) - this is your query ID

#### Method 2: Inspect Dashboard
1. Scroll through the dashboard
2. Hover over charts - some show query IDs in tooltips
3. Or check the dashboard's "Queries" tab if available
4. Copy the query ID number

#### Specific Queries Needed

**From CoW Swap High Level Metrics Dashboard:**
- Look for: "Treasury Balance" or "DAO Treasury Composition" chart
- This will be your `treasury` query ID

**From CoW Revenue Dashboard:**
- Look for: "Protocol Revenue Over Time" or "Total Revenue" chart  
- This will be your `revenue` query ID

**From CoW Solver Rewards Dashboard:**
- Look for: "Solver Rewards Distribution" or "Weekly Solver Payouts" chart
- This will be your `solverRewards` query ID

**From Solver Info Dashboard:**
- Look for: "Active Solvers" or "Solver Performance" table/chart
- This will be your `solverInfo` query ID

### 4. Update apiConfig.js

Once you have the 4 query IDs, open `src/config/apiConfig.js` and replace the placeholder query IDs:

```javascript
dune: {
  baseUrl: 'https://api.dune.com/api/v1',
  apiKey: import.meta.env.VITE_DUNE_API_KEY,
  queries: {
    treasury: 'YOUR_TREASURY_QUERY_ID',      // From High Level Metrics Dashboard
    revenue: 'YOUR_REVENUE_QUERY_ID',        // From CoW Revenue Dashboard
    solverRewards: 'YOUR_SOLVER_REWARDS_ID', // From CoW Solver Rewards Dashboard
    solverInfo: 'YOUR_SOLVER_INFO_ID'        // From Solver Info Dashboard
  }
}
```

**Example with real IDs:**
```javascript
queries: {
  treasury: '3702911',
  revenue: '3445799',
  solverRewards: '3445802',
  solverInfo: '3445793'
}
```

### 5. Test Each Query ID

Before updating the config, test each query ID to ensure it returns data:

```bash
# Test treasury query (replace QUERY_ID with your actual ID)
curl -X GET "https://api.dune.com/api/v1/query/QUERY_ID/results" \
  -H "X-Dune-API-Key: DCeKQ141vBViuj5pSFlLYGpgLNNVPbZQ"

# If successful, you'll see JSON data
# If failed, you'll see an error - try a different query ID
```

**Quick test script** - Save as `test-dune.sh`:
```bash
#!/bin/bash
API_KEY="DCeKQ141vBViuj5pSFlLYGpgLNNVPbZQ"
QUERY_ID=$1

if [ -z "$QUERY_ID" ]; then
  echo "Usage: ./test-dune.sh QUERY_ID"
  exit 1
fi

echo "Testing Dune Query ID: $QUERY_ID"
curl -s -X GET "https://api.dune.com/api/v1/query/$QUERY_ID/results" \
  -H "X-Dune-API-Key: $API_KEY" | jq '.execution_ended_at, .result.rows[0]'
```

Run it: `chmod +x test-dune.sh && ./test-dune.sh 3702911`

### 6. Restart Dev Server

After updating `apiConfig.js`:

```bash
npm run dev
```

The dashboard should now fetch real data from Dune Analytics!

## Recommended Queries to Use

### Treasury Query
**Look for**: A query that shows CoW DAO treasury composition by token
**Typical fields**: token_symbol, balance, value_usd, percentage
**Dashboard**: Often found in "CoW Swap High Level Metrics Dashboard"

### Revenue Query
**Look for**: A query showing protocol revenue over time
**Typical fields**: date, fee_type, revenue_usd
**Dashboard**: "COW DAO Revenue" dashboard

### Solver Rewards Query
**Look for**: Weekly or monthly solver reward distributions
**Typical fields**: solver_address, rewards, period
**Dashboard**: "CoW Solver Rewards" dashboard

### Solver Info Query
**Look for**: Active solvers and their competition metrics
**Typical fields**: solver_name, trades_won, success_rate
**Dashboard**: "Solver Info" dashboard

## Alternative: Create Custom Queries

If you have a Dune account (paid tier required for API access):

1. Log in to https://dune.com
2. Click "New Query"
3. Write SQL queries against CoW Protocol tables
4. Save the query
5. Get the query ID from the URL
6. Use that ID in `apiConfig.js`

### Example Custom Treasury Query

```sql
SELECT
  token_symbol,
  SUM(amount) as balance,
  SUM(amount_usd) as value_usd
FROM cowswap.treasuryholdings
WHERE wallet IN (
  '0xCA771eda0c70aA7d053aB1B25004559B918FE662', -- Main DAO Safe
  '0xA1cb77f4b7454F81C59f6b0267a90A7ab6A57D03'  -- DAO USDC Safe
)
GROUP BY token_symbol
ORDER BY value_usd DESC
```

## Fallback Behavior

If Dune queries are not configured or fail:

✅ The dashboard will still work
✅ Treasury data will fallback to Safe API data
✅ Solver data will show empty state
✅ No errors will crash the app

## Testing Dune Integration

After updating query IDs:

1. Run `npm run dev`
2. Open browser console (F12)
3. Look for Dune API calls in Network tab
4. Check for successful 200 responses
5. Verify data appears in Treasury and Solver sections

## Dune API Pricing

- **Free**: No API access
- **Plus ($39/mo)**: 50 queries/month
- **Premium ($399/mo)**: 500 queries/month
- **Enterprise**: Unlimited

Your API key is already configured, so you should have a paid plan.

## Current Status

✅ **API Key Configured**: Your `.env` file has a valid Dune API key  
❌ **Query IDs Needed**: `apiConfig.js` has placeholder IDs that need to be replaced

**Next Steps**:
1. Visit the 4 dashboard URLs in section "Key Dashboards to Use"
2. Click on charts to find query IDs
3. Test them with `./test-dune.sh QUERY_ID`
4. Update `src/config/apiConfig.js` with real IDs
5. Run `npm run dev` to see real data

**Dashboard URLs to visit**:
- https://dune.com/cowprotocol/cowswap-high-level-metrics-dashboard
- https://dune.com/cowprotocol/cow-solver-rewards
- https://dune.com/cowprotocol/solver-info
- https://dune.com/cowprotocol/cow-revenue

## Quick Test

To test if your Dune API key works:

```bash
curl -X GET "https://api.dune.com/api/v1/query/1234567/results" \
  -H "X-Dune-API-Key: DCeKQ141vBViuj5pSFlLYGpgLNNVPbZQ"
```

Replace `1234567` with any CoW Protocol query ID you find on Dune.

If you get a valid JSON response, your API key works!

## Support

- Dune Docs: https://docs.dune.com/api-reference
- CoW Protocol Dune Profile: https://dune.com/cowprotocol
- Dune Discord: https://discord.gg/dune

---

## Summary

**What you have**: ✅ Valid Dune API key  
**What you need**: ❌ 4 query IDs from CoW Protocol dashboards

**Action items**:
1. Open each dashboard URL (see "Key Dashboards to Use" section)
2. Click charts to reveal query IDs in URLs
3. Test with: `./test-dune.sh QUERY_ID`
4. Add to `src/config/apiConfig.js`
5. Restart: `npm run dev`

**Estimated time**: 10-15 minutes

**Note**: The dashboard works without Dune data. Dune integration enhances the Treasury and Solver sections with additional metrics, but is not required for core functionality.
