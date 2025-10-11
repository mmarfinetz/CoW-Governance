# The Graph API Key Setup

## Why You Need This

The CoW Protocol subgraph is deployed on **The Graph's Decentralized Network**, which requires an API key for queries. This gives you access to:

- 📊 **Total Protocol Volume** (all-time)
- 💰 **Total Fees Collected** (all-time)
- 📈 **Daily Statistics** (last 30 days)
- 🪙 **Top Tokens by Volume** (USDC, WETH, DAI, etc.)
- ⚖️ **Solver Statistics** (active solvers and their performance)
- 🔄 **Recent Settlements** (latest protocol activity)

---

## Quick Setup (5 minutes)

### Step 1: Get Your Free API Key

1. Go to **https://thegraph.com/studio/apikeys/**
2. **Sign in** (you can use GitHub, Google, or email)
3. Click **"Create API Key"**
4. Give it a name like `"CoW Dashboard"`
5. **Copy the API key** (it starts with a long string of characters)

**Free Tier:**
- ✅ 100,000 queries per month
- ✅ No credit card required
- ✅ Perfect for dashboards

---

### Step 2: Add to Your .env File

Create or edit `.env` in your project root:

```bash
cd /Users/mitch/Desktop/govdashboard

# If .env doesn't exist, create it from template
cp ENV_TEMPLATE.txt .env

# Edit .env file (use any text editor)
nano .env
# OR
code .env  # if using VS Code
# OR
open -a TextEdit .env
```

Add your Graph API key:

```env
# The Graph API Key (REQUIRED for protocol metrics)
VITE_GRAPH_API_KEY=your_actual_api_key_here

# Other optional keys
VITE_COINGECKO_API_KEY=
VITE_ETHERSCAN_API_KEY=
```

**Important**: Replace `your_actual_api_key_here` with the actual key you copied from The Graph!

---

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

### Step 4: Verify It's Working

1. **Open Treasury tab** in your dashboard
2. **Open Console** (`Cmd + Option + J` on Mac)
3. **Look for these logs**:

```
[API Config] VITE_GRAPH_API_KEY exists: true
[TreasuryData] Fetching from Subgraph (The Graph) and Safe APIs...
[SubgraphService] Querying mainnet subgraph via The Graph decentralized network
[SubgraphService] Query successful
[SubgraphService] Total volume (USD): 123456789
[SubgraphService] Total fees (USD): 1234567
[SubgraphService] Fetched 30 days of statistics
[SubgraphService] Fetched 20 tokens
[TreasuryData] Successfully compiled treasury data
```

4. **Check Treasury tab** for:
   - ✅ Protocol Fees Collected shows dollar amount
   - ✅ Total Volume shows billions in USD
   - ✅ Daily Revenue chart shows 30 days
   - ✅ Top Tokens chart shows USDC, WETH, etc.

---

## What You Get With The API Key

### Before (No API Key)
- ❌ No protocol volume data
- ❌ No fee collection data
- ❌ No daily revenue charts
- ❌ No token statistics
- ❌ No solver data
- ✅ Only treasury holdings from Safe

### After (With API Key)
- ✅ **Total Protocol Volume**: $XXB lifetime
- ✅ **Total Fees**: $XXM collected
- ✅ **Daily Revenue Chart**: 30 days of fee data
- ✅ **Top Tokens Chart**: Most traded tokens
- ✅ **Solver Statistics**: Top performers
- ✅ **Recent Settlements**: Latest activity
- ✅ **Treasury Holdings**: From Safe API

---

## Troubleshooting

### "No Graph API key found" Error

**Problem**: Console shows warning about missing API key

**Solution**:
1. Check `.env` file exists in project root
2. Verify `VITE_GRAPH_API_KEY=your_key` is spelled correctly
3. Make sure there are no spaces around the `=`
4. Restart dev server

---

### "auth error: missing authorization header"

**Problem**: API key not being sent properly

**Solution**:
1. Make sure `.env` file is in the **project root** (same folder as `package.json`)
2. Restart dev server completely (stop with Ctrl+C, then `npm run dev`)
3. Check browser console to see if key is detected:
   ```
   [API Config] VITE_GRAPH_API_KEY exists: true
   ```

---

### "Invalid API key" or 403 Error

**Problem**: API key is wrong or expired

**Solution**:
1. Go back to https://thegraph.com/studio/apikeys/
2. Check if your key is still active
3. Copy it again and update `.env`
4. Restart dev server

---

### Still No Data After Adding Key

**Problem**: Everything looks right but no data appears

**Solution**:
1. **Check console** for specific error messages
2. **Try the test query**:
   ```bash
   curl -X POST "https://gateway-arbitrum.network.thegraph.com/api/YOUR_KEY_HERE/subgraphs/id/8mdwJG7YCSwqfxUbhCypZvoubeZcFVpCHb4zmHhvuKTD" \
     -H "Content-Type: application/json" \
     -d '{"query": "{ totals(first: 1) { volumeUsd } }"}'
   ```
   Replace `YOUR_KEY_HERE` with your actual key. Should return JSON with volumeUsd.

3. **Clear browser cache** and reload
4. **Check Safe API** is working (shows treasury value even without Graph key)

---

## API Key Best Practices

### ✅ DO:
- Keep your API key in `.env` file
- Add `.env` to `.gitignore` (already done)
- Use one key per project
- Monitor your usage at https://thegraph.com/studio/

### ❌ DON'T:
- Share your API key publicly
- Commit `.env` to git (it's already in `.gitignore`)
- Use the same key in production as development
- Exceed rate limits

---

## Free Tier Limits

**100,000 queries/month** is plenty for a dashboard:

- **1 page load** = ~5 queries (totals, daily stats, tokens, solvers, settlements)
- **100,000 queries** ÷ 5 = **20,000 page loads/month**
- **20,000 loads** ÷ 30 days = **~667 loads/day**

You're very unlikely to hit the limit! 🎉

---

## Quick Reference

| What | URL |
|------|-----|
| **Get API Key** | https://thegraph.com/studio/apikeys/ |
| **Dashboard** | https://thegraph.com/studio/ |
| **Docs** | https://thegraph.com/docs/ |
| **CoW Subgraph** | https://github.com/cowprotocol/subgraph |
| **Explorer** | https://thegraph.com/explorer/ |

---

## Example .env File

```env
# Copy this to .env (remove .example from filename)

# ============================================
# REQUIRED FOR FULL DASHBOARD
# ============================================

# The Graph API Key - Get at https://thegraph.com/studio/apikeys/
VITE_GRAPH_API_KEY=abcd1234567890efghijklmnop  # ← YOUR KEY HERE

# ============================================
# OPTIONAL
# ============================================

# CoinGecko (for token prices - works without key)
VITE_COINGECKO_API_KEY=

# Etherscan (for holder count - optional)
VITE_ETHERSCAN_API_KEY=
```

---

## Success! ✅

Once you see this in your dashboard:

- **Protocol Fees Collected**: $X.XM (not $0)
- **Total Volume**: $X.XB (not $0)
- **Daily Revenue chart**: Line chart with data
- **Top Tokens chart**: Bar chart with USDC, WETH, etc.

**You're done!** 🎉 Enjoy your complex, data-rich CoW DAO governance dashboard!

---

## Need Help?

If you're stuck, check the console (`Cmd + Option + J`) for error messages and refer to the troubleshooting section above.

The most common issue is simply forgetting to restart the dev server after adding the API key! 🔄

