# 🚀 Setup Guide - Getting Data to Load

## Current Status ✅
- ✅ Dev server is running on http://localhost:3000
- ✅ App loads successfully
- ❌ No data is showing because API keys are missing

## What's Working Without Keys
The following data sources work **immediately without any API keys**:
- ✅ **Snapshot Governance Data** (proposals, votes, space info)
- ✅ **Safe Treasury Addresses** (on-chain balances)
- ✅ **CoW Protocol API** (solver information)

## What Needs API Keys ⚠️

### 🔑 REQUIRED: Dune Analytics API Key
**Why you need it:** Treasury analytics, revenue data, and solver rewards all come from Dune queries

**How to get it:**
1. Go to https://dune.com/
2. Sign up for a free account
3. Go to Settings → API Keys: https://dune.com/settings/api
4. Create a new API key
5. Copy the key and add it to `.env`:
   ```bash
   VITE_DUNE_API_KEY=your_actual_key_here
   ```

**Free tier limits:**
- 20 query executions per day
- 1000 datapoints per month
- Should be enough for development/personal use

### 🔑 OPTIONAL: CoinGecko API Key
**Why you need it:** Real-time COW token price data

**Note:** CoinGecko's public API works without a key, but has strict rate limits (10-50 calls/min)

**How to get it:**
1. Go to https://www.coingecko.com/en/api/pricing
2. Sign up for the free tier
3. Get your API key
4. Add to `.env`:
   ```bash
   VITE_COINGECKO_API_KEY=your_actual_key_here
   ```

### 🔑 OPTIONAL: Etherscan API Key
**Why you need it:** Additional token holder data and transaction verification

**How to get it:**
1. Go to https://etherscan.io/
2. Create an account
3. Go to https://etherscan.io/myapikey
4. Create a new API key
5. Add to `.env`:
   ```bash
   VITE_ETHERSCAN_API_KEY=your_actual_key_here
   ```

## 🎯 Quick Start Steps

### Step 1: Add Your Dune API Key (Required)
```bash
# Edit the .env file
nano .env

# Add your Dune API key:
VITE_DUNE_API_KEY=your_dune_api_key_here
```

### Step 2: Restart the Dev Server
```bash
# Stop the current dev server (Ctrl+C)
# Then restart it:
npm run dev
```

### Step 3: Refresh Your Browser
- Open http://localhost:3000
- Do a hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Data should now start loading!

## 🔍 Troubleshooting

### Data Still Not Loading?

1. **Check browser console (F12 → Console tab)**
   - Look for API errors
   - Check if API key is being sent

2. **Verify your .env file:**
   ```bash
   cat .env | grep VITE_DUNE_API_KEY
   ```
   - Should show your key (not empty)
   - Key should NOT have quotes around it

3. **Check Dune API Key is valid:**
   - Go to https://dune.com/settings/api
   - Make sure the key is active
   - Check you haven't exceeded rate limits

4. **Clear browser cache:**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Or clear site data in DevTools

### Expected Load Times

- **Snapshot data**: 1-3 seconds
- **Dune queries**: 5-15 seconds (first load), 1-2 seconds (cached)
- **CoinGecko**: 1-2 seconds
- **Safe balances**: 2-5 seconds

### Common Error Messages

**"Dune API key not set, using fallback data structure"**
- Add `VITE_DUNE_API_KEY` to `.env` file
- Restart dev server

**"Error fetching proposals from Snapshot"**
- Usually a network issue
- Check your internet connection
- Snapshot API might be temporarily down

**"Rate limit exceeded"**
- You've hit API rate limits
- Wait a few minutes
- Consider upgrading to paid tier for that API

## 📊 What Data Each Section Shows

### Overview Tab
- **Snapshot**: Total proposals, voting participation, voter stats
- **Dune**: Treasury value, revenue metrics
- **CoinGecko**: COW token price
- **Safe**: Treasury balances

### Proposals Tab
- **Snapshot**: All proposal details, votes, outcomes
- No API keys needed for this tab!

### Treasury Tab
- **Dune**: Treasury composition, monthly revenue
- **Safe**: Current balances by token
- **CoinGecko**: USD values

### Delegation Tab
- **Snapshot**: Delegation relationships, delegate stats
- No API keys needed for this tab!

### Live Tab
- **Snapshot**: Active proposals, recent activity
- Real-time updates every 5 minutes

## 🎉 Success Checklist

Once everything is working, you should see:
- ✅ Overview tab shows treasury value and token price
- ✅ Proposals tab lists all CoW DAO proposals
- ✅ Treasury tab shows asset composition and revenue
- ✅ Delegation tab shows delegation statistics
- ✅ Live tab shows active proposals and recent activity
- ✅ No error messages in browser console
- ✅ Data timestamps update in the footer

## 💡 Pro Tips

1. **Development Mode**: The app caches API responses to reduce API calls
   - Snapshot: 5 minutes
   - Dune queries: 15-60 minutes
   - Token prices: 2 minutes

2. **Production Use**: If deploying publicly, consider:
   - Using environment variables on your hosting platform
   - Upgrading to paid API tiers
   - Implementing server-side caching

3. **Monitoring**: Watch the browser console for:
   - API call timestamps
   - Cache hits/misses
   - Rate limit warnings

## 🆘 Still Having Issues?

Check these files for debugging:
- Browser console: Press F12 → Console tab
- Network tab: See actual API requests/responses
- `src/config/apiConfig.js`: Verify endpoints
- `src/services/*.js`: Check service implementations

The app has extensive logging - check console for detailed information about what's loading and what's failing.

