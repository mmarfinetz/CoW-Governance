# Dune Queries Setup Guide

## Issue: Treasury Data Not Loading

If you see "Dune API key is configured but no data was returned", it means the Dune queries being used are **private** or **not accessible** with your API key.

---

## Why This Happens

The dashboard is configured to use these Dune query IDs:
- **3700123** - Treasury/Revenue data
- **5270914** - Solver Rewards
- **5533118** - Solver Info

These queries may be:
1. **Private** - Only accessible to the query creator
2. **Deleted** - No longer exist on Dune
3. **Access restricted** - Require special permissions

---

## Solution Options

### Option 1: Test Query Access (Quick Check)

Run this command to test if the queries are accessible:

```bash
# From the project root
source .env
./test-dune-direct.sh $VITE_DUNE_API_KEY
```

This will show you which queries are accessible and which are not.

---

### Option 2: Use Public CoW Protocol Queries

Visit https://dune.com/cowprotocol to find public CoW Protocol dashboards and queries.

1. Browse available dashboards
2. Find queries similar to what you need (treasury, revenue, solver data)
3. Note the **query IDs** from the URL (e.g., `dune.com/queries/1234567`)
4. Update `src/config/govConfig.json` with the new IDs

---

### Option 3: Fork/Create Your Own Queries

#### Step 1: Find Existing Queries

1. Go to https://dune.com/cowprotocol
2. Find a dashboard with treasury/solver data
3. Click on any visualization
4. Click "View query" or the query ID

#### Step 2: Fork the Query

1. Once viewing a query, click "Fork" (top right)
2. This creates your own copy
3. Your fork will be **public by default**
4. Note the new query ID from the URL

#### Step 3: Create Simple Test Query

If you can't find the exact queries, create a simple one:

```sql
-- CoW DAO Treasury Holdings (Simple Version)
SELECT
    DATE_TRUNC('month', evt_block_time) as month,
    SUM(value / 1e18) as token_amount
FROM erc20_ethereum.evt_Transfer
WHERE 
    "to" = 0xCAFECAFECA00000000000000000000000000000 -- Replace with actual treasury address
    AND contract_address IN (
        0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB, -- COW token
        0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48  -- USDC
    )
GROUP BY 1
ORDER BY 1 DESC
LIMIT 100
```

Make it **public** and save. Note the query ID.

#### Step 4: Update Dashboard Configuration

Edit `src/config/govConfig.json`:

```json
{
  "queries": {
    "dune": {
      "treasury": {
        "id": "YOUR_QUERY_ID_HERE",
        "version": "1.0",
        "name": "Treasury Data",
        "cacheDuration": 3600000
      },
      "revenue": {
        "id": "YOUR_REVENUE_QUERY_ID",
        "version": "1.0",
        "name": "Revenue Data",
        "cacheDuration": 3600000
      }
    }
  }
}
```

#### Step 5: Restart and Test

```bash
# Stop the dev server (Ctrl+C)
npm run dev

# Check browser console for Dune API logs
```

---

### Option 4: Temporary Workaround - Disable Treasury Tab

If you just want to see the other tabs working, you can temporarily disable treasury data:

1. Comment out the treasury data fetching
2. Or skip this tab for now

The **Overview**, **Proposals**, and **Live** tabs don't need Dune and should work with just Snapshot API.

---

## Common Dune Query Addresses

Here are some public CoW Protocol related addresses you can use in queries:

### Treasury Safes
- CoW DAO Main Treasury: `0xCAFECAFECA00000000000000000000000000000` *(verify current address)*
- CoW Grants Safe: Check governance proposals for current addresses

### Token Addresses
- COW Token: `0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB`
- vCOW Token: `0xD057B63f5E69CF1B929b356b579Cba08D7688048`

### Solver Addresses
Check https://api.cow.fi/mainnet/api/v1/solver_competition for current solver addresses.

---

## Testing Your Setup

After updating query IDs:

1. **Restart dev server**: `npm run dev`
2. **Open browser console**: Press F12
3. **Go to Treasury tab**
4. **Look for logs**:
   - ✅ `[DuneService] Fetching results from...`
   - ✅ `[DuneService] Received X rows`
   - ❌ `Error getting results for query...` (means query not accessible)

---

## Alternative: Use Subgraph Data

As per your project requirements, the **subgraph should be the source of truth**. You might want to:

1. Use CoW Protocol's subgraph instead of Dune
2. Query: `https://api.thegraph.com/subgraphs/name/cowprotocol/cow`
3. This gives you real-time on-chain data without Dune API limits

Example subgraph query:
```graphql
{
  tokens(first: 10) {
    id
    address
    name
    symbol
    totalVolume
  }
}
```

This could replace some Dune queries entirely!

---

## Need Help?

1. **Check browser console** for detailed error messages
2. **Verify your Dune API key** at https://dune.com/settings/api
3. **Test query access** using the test script
4. **Fork public queries** from dune.com/cowprotocol
5. **Consider using subgraph** as alternative data source

---

## Quick Debug Checklist

- [ ] `.env` file exists with `VITE_DUNE_API_KEY=your_key`
- [ ] Dev server was restarted after adding key
- [ ] API key is valid (check Dune dashboard)
- [ ] Browser console shows what error exactly (404? 403? 401?)
- [ ] Tested query access with `test-dune-direct.sh`
- [ ] Queries are public or you've forked them
- [ ] Query IDs in `govConfig.json` match your accessible queries

---

## Expected Browser Console Output

### Success Case:
```
[DuneService] Fetching results from: https://api.dune.com/api/v1/query/3700123/results
[DuneService] Received 45 rows at 2024-10-11T...
[DuneService] Completed fetching all Dune data
```

### Failure Case:
```
[DuneService] Query 3700123 not found or not accessible with your API key
Error: Dune query 3700123 not found. This query may be private or deleted.
```

If you see failure messages, follow Option 2 or 3 above to use accessible queries.

