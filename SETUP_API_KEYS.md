# API Keys Setup Guide

## ⚠️ IMPORTANT: The dashboard needs API keys to load data!

Without API keys configured, **no data will load**. Follow the steps below to set up your environment.

## Step-by-Step Setup

### Step 1: Create your `.env` file

```bash
# In the project root directory, copy the example file:
cp .env.example .env
```

### Step 2: Get Your API Keys

#### 🔴 REQUIRED: Dune Analytics API Key

**Without this key, the dashboard cannot load Treasury, Revenue, or Solver data.**

1. Go to https://dune.com
2. Sign up for a free account (if you don't have one)
3. Navigate to https://dune.com/settings/api
4. Create a new API key
5. Copy the key

**Free Tier:** 20 query executions per day (sufficient for development)

#### 🟡 OPTIONAL: CoinGecko API Key

**The dashboard works without this, but you'll get better rate limits with a key.**

1. Go to https://www.coingecko.com/en/api/pricing
2. Sign up for the free Demo plan (or paid plan)
3. Get your API key from the dashboard
4. Copy the key

**Free Tier:** Works without key, but limited to ~10-50 calls/minute

#### 🟡 OPTIONAL: Etherscan API Key

**Used for token holder count. Not critical for core functionality.**

1. Go to https://etherscan.io/myapikey
2. Sign up and create an API key
3. Copy the key

**Free Tier:** 5 calls/second (100,000 calls/day)

### Step 3: Add Keys to `.env` File

Open the `.env` file in your text editor and add your keys:

```env
# REQUIRED
VITE_DUNE_API_KEY=your_actual_dune_api_key_here

# OPTIONAL
VITE_COINGECKO_API_KEY=your_coingecko_key_here
VITE_ETHERSCAN_API_KEY=your_etherscan_key_here
```

**Example with real key format:**
```env
VITE_DUNE_API_KEY=abcd1234efgh5678ijkl9012mnop3456
VITE_COINGECKO_API_KEY=CG-XyZ123456789
VITE_ETHERSCAN_API_KEY=ABC123DEF456GHI789JKL012MNO345
```

### Step 4: Restart the Development Server

```bash
# Stop the current server (Ctrl+C if running)
# Then restart:
npm run dev
```

⚠️ **IMPORTANT:** Vite requires a server restart for environment variable changes to take effect!

### Step 5: Verify Data is Loading

1. Open http://localhost:5173 (or the port shown in terminal)
2. Open browser console (F12 or Cmd+Option+J on Mac)
3. Look for these messages:
   - ✅ `[SnapshotService] Received X proposals`
   - ✅ `[DuneService] Received X rows`
   - ✅ `[CoWProtocolService] Fetching health from...`
   - ✅ Data appearing in dashboard sections

### Step 6: Troubleshooting

#### No data loading?

**Check the browser console for errors:**

1. **401/403 errors**: API key is invalid or not set correctly
   - Solution: Double-check your API key in `.env`
   - Make sure there are NO quotes around the key
   - Restart the dev server

2. **CORS errors**: Uncommon but possible
   - Solution: This usually means the API endpoint changed

3. **Rate limit errors (429)**: Too many requests
   - Solution: Wait a few minutes and refresh
   - Dune free tier is limited to 20 executions/day

4. **Network errors**: Cannot reach API
   - Solution: Check your internet connection
   - Try accessing https://hub.snapshot.org/graphql directly

#### Still having issues?

1. **Check your `.env` file format:**
   ```env
   # ✅ CORRECT
   VITE_DUNE_API_KEY=abc123def456

   # ❌ WRONG - No quotes
   VITE_DUNE_API_KEY="abc123def456"

   # ❌ WRONG - No spaces
   VITE_DUNE_API_KEY = abc123def456
   ```

2. **Verify environment variables are loaded:**
   - Open browser console
   - Type: `import.meta.env`
   - You should see your `VITE_*` variables

3. **Clear cache and restart:**
   ```bash
   # Stop server
   # Delete node_modules/.vite
   rm -rf node_modules/.vite
   # Restart
   npm run dev
   ```

## What Each Service Provides

| Service | Data Provided | Required? |
|---------|---------------|-----------|
| **Snapshot** | Governance proposals, votes | ✅ **Built-in** (no key needed) |
| **Dune Analytics** | Treasury composition, revenue, solver rewards | ✅ **Required** |
| **CoinGecko** | Token price, market cap, volume | 🟡 Optional (works without key) |
| **Etherscan** | Token holder count | 🟡 Optional |
| **Safe API** | Multisig treasury balances | ✅ **Built-in** (no key needed) |
| **CoW Protocol API** | Protocol health, metrics | ✅ **Built-in** (no key needed) |

## Rate Limits & Usage

### Free Tier Limitations

**Dune Analytics (Free):**
- 20 query executions per day
- Each dashboard load uses ~4 query executions
- **Recommendation**: Use caching, limit refreshes

**CoinGecko (Free/No Key):**
- 10-50 calls/minute
- Dashboard caches for 2 minutes
- Should be sufficient for normal use

**Etherscan (Free):**
- 5 calls/second
- 100,000 calls/day
- More than enough for this dashboard

### Tips to Conserve API Credits

1. **Use caching**: Data is cached automatically
   - Proposals: 5 minutes
   - Treasury: 1 hour
   - Token price: 2 minutes

2. **Avoid excessive refreshing**: The dashboard auto-updates

3. **Consider upgrading**: If you hit limits frequently
   - Dune Plus: $39/month (1,000 executions/day)
   - Dune Premium: $390/month (unlimited)

## Security Notes

### ⚠️ Never Commit API Keys to Git

The `.env` file is in `.gitignore` by default, but be careful:

```bash
# ✅ SAFE - Share the template
git add .env.example

# ❌ DANGER - Never do this!
git add .env
git add .env.local
```

### Protecting Your Keys

1. **Never share your `.env` file**
2. **Rotate keys if exposed**: Generate new ones immediately
3. **Use read-only keys**: Where possible (Dune offers this)
4. **Monitor usage**: Check API dashboards for unusual activity

## Quick Reference

```bash
# Setup from scratch
cp .env.example .env
nano .env  # or code .env, vim .env, etc.
# Add your API keys
npm run dev

# Restart after changing .env
# Press Ctrl+C to stop server
npm run dev

# Check if keys are loaded (in browser console)
import.meta.env

# Test individual service (in browser console)
# See browser Network tab for API calls
```

## Need Help?

- **Dune API Docs**: https://dune.com/docs/api/
- **CoinGecko API Docs**: https://www.coingecko.com/en/api/documentation
- **Etherscan API Docs**: https://docs.etherscan.io/
- **CoW Protocol Docs**: https://docs.cow.fi/
- **Project Issues**: Check browser console for specific error messages

