# ⚡ Quick Start - Get Data Loading in 2 Minutes

## Current Issue
The app loads but shows no data because API keys are missing.

## ✅ Fix It Now

### Step 1: Get a Dune API Key (1 minute)
1. Go to https://dune.com/
2. Click "Sign Up" (top right)
3. After signing in, go to: https://dune.com/settings/api
4. Click "Create New API Key"
5. **Copy the key** (looks like: `abcd1234efgh5678...`)

### Step 2: Add the Key to Your Project (30 seconds)
```bash
# Open the .env file in any text editor
open .env    # Mac
notepad .env # Windows
nano .env    # Linux

# Add this line with YOUR actual key:
VITE_DUNE_API_KEY=paste_your_key_here

# Save and close
```

### Step 3: Restart the Server (30 seconds)
```bash
# In your terminal, press Ctrl+C to stop the server
# Then start it again:
npm run dev
```

### Step 4: Refresh Your Browser
- Go to http://localhost:3000
- Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)
- **Data should now load!** 🎉

## 🔍 Verify It's Working

Open browser console (F12) and look for:
```
[SnapshotService] Received 100 proposals at...
[DuneService] Received 25 rows at...
```

You should see:
- ✅ Numbers in the Overview tab
- ✅ Treasury value displayed
- ✅ Proposals listed in Proposals tab
- ✅ Charts with real data

## ❌ Still Not Working?

### Check #1: Is the .env file correct?
```bash
cat .env | grep VITE_DUNE_API_KEY
```
Should show: `VITE_DUNE_API_KEY=your_actual_key` (not empty!)

### Check #2: Did you restart the server?
You MUST restart after adding the .env file. Ctrl+C, then `npm run dev` again.

### Check #3: Is the Dune key valid?
- Go back to https://dune.com/settings/api
- Make sure the key is there and not expired
- You have 20 free queries per day

### Check #4: Browser console errors?
Press F12, go to Console tab, look for red errors. Common ones:
- `401 Unauthorized` = Invalid API key
- `429 Rate limit` = Too many requests (wait 1 hour)
- `Network error` = Internet connection issue

## 📊 What Data Works Without Keys

Even without Dune, these work:
- ✅ **Proposals tab** - All CoW DAO proposals from Snapshot
- ✅ **Delegation tab** - Delegation statistics
- ✅ **Live tab** - Active proposals

But you need Dune for:
- ❌ Treasury value
- ❌ Revenue data
- ❌ Solver rewards
- ❌ Complete Overview tab

## 🎯 Next Steps

Once basic data is loading:
1. **Add CoinGecko key** (optional) - For live token prices
2. **Add Etherscan key** (optional) - For holder count
3. Explore all 5 tabs of the dashboard
4. Check the Configuration modal (bottom right)

## 📚 More Help

- Detailed guide: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Full README: [README.md](./README.md)
- Troubleshooting: See SETUP_GUIDE.md "Troubleshooting" section

