# 🎯 How to Get Data Loading - Summary

## Current Status

✅ **Dev server is running** on http://localhost:3000  
✅ **App loads successfully**  
✅ **`.env` file exists**  
❌ **No data is showing because API keys are missing**

## The Problem

Your `.env` file exists but doesn't have API keys configured. The services are working but returning empty data because:

1. **Dune API** requires `VITE_DUNE_API_KEY` → Treasury, Revenue, Solver data
2. Services have fallback handling that returns empty structures when keys are missing
3. Browser console likely shows: `"Dune API key not set, using fallback data structure"`

## The Solution (2 minutes)

### Option 1: Quick Fix with Dune API Key (Recommended)

```bash
# 1. Get a FREE Dune API key:
#    Go to: https://dune.com/settings/api
#    (Sign up if needed - it's free)
#    Copy your API key

# 2. Add it to your .env file:
echo 'VITE_DUNE_API_KEY=your_actual_key_here' >> .env

# 3. Restart the dev server:
#    Press Ctrl+C in the terminal running the server
#    Then run:
npm run dev

# 4. Refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
#    Data should now load!
```

### Option 2: Manual Edit

1. Open `.env` in any text editor
2. Find the line: `VITE_DUNE_API_KEY=`
3. Add your key after the `=`: `VITE_DUNE_API_KEY=abc123xyz456`
4. Save the file
5. Restart dev server (`Ctrl+C` then `npm run dev`)
6. Hard refresh browser

## What You'll Get

With a Dune API key, you'll see:

✅ **Overview Tab:**
- Treasury value
- Revenue metrics
- Solver statistics
- Token data

✅ **Treasury Tab:**
- Asset composition charts
- Revenue breakdown
- Monthly trends

✅ **All Other Tabs:**
- Snapshot data (proposals, votes) - works without keys
- Delegation data - works without keys

## Free Tier Limits

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| **Dune** | 20 queries/day | Enough for development |
| **Snapshot** | 60 req/min | Already working (no key needed) |
| **CoinGecko** | 10-50 calls/min | Works without key |

## Verify It's Working

After adding the Dune key and restarting:

1. **Open browser console** (F12 → Console tab)
2. **Look for these messages:**
   ```
   ✅ [SnapshotService] Received 100 proposals
   ✅ [DuneService] Received 25 rows
   ✅ [DuneService] Fetching results from...
   ```

3. **Check the dashboard:**
   - Overview tab shows numbers (not all zeros)
   - Treasury tab shows charts with data
   - No red error messages

## Troubleshooting

### "Still seeing no data"
1. Did you restart the dev server? (Must do after .env changes)
2. Did you hard refresh the browser? (Cmd+Shift+R / Ctrl+Shift+R)
3. Check console for errors (F12)

### "401 Unauthorized" error
- Your Dune API key is invalid
- Go to https://dune.com/settings/api and verify the key

### "429 Rate Limit" error
- You've exceeded free tier limits
- Wait 1 hour or upgrade to paid plan

### "Dune API key not set" warning still showing
- The .env file wasn't read properly
- Make sure the file is named exactly `.env` (with the dot)
- No spaces around the `=` sign
- Restart the server

## Quick Tests

### Test 1: Check if .env is correct
```bash
cat .env | grep VITE_DUNE_API_KEY
```
Should show: `VITE_DUNE_API_KEY=your_key` (not empty)

### Test 2: Test Snapshot API (works without keys)
```bash
./test-snapshot-api.sh
```
Should show a proposal title and state

### Test 3: Check the dev server logs
Look in the terminal where `npm run dev` is running for error messages

## Next Steps

Once data is loading:

1. ✅ Add CoinGecko key for token prices (optional)
2. ✅ Add Etherscan key for holder count (optional)
3. ✅ Explore all 5 dashboard tabs
4. ✅ Click "Configuration" button (bottom right) to see API status
5. ✅ Check footer for data timestamps

## Getting API Keys

| Service | URL | Cost | Time to Get |
|---------|-----|------|-------------|
| **Dune** | https://dune.com/settings/api | FREE | 2 minutes |
| CoinGecko | https://www.coingecko.com/en/api/pricing | FREE | 2 minutes |
| Etherscan | https://etherscan.io/myapikey | FREE | 2 minutes |

All three have free tiers that work great for development!

## Files to Check

- ✅ `.env` - Your API keys (edit this)
- 📖 `QUICK_START.md` - 2-minute setup guide
- 📖 `SETUP_GUIDE.md` - Detailed troubleshooting
- 📖 `README.md` - Full documentation

---

**TL;DR:** Add `VITE_DUNE_API_KEY=your_key` to the `.env` file, restart the server, refresh the browser. That's it! 🚀

