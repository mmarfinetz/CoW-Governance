# 🔄 RESTART YOUR DEV SERVER

## The Problem

Your Dune API key **IS VALID** ✅ but your dev server is using the **OLD** .env file from before you added the keys!

When you start `npm run dev`, it loads environment variables at startup. Changes to `.env` are NOT picked up until you restart.

## The Solution (30 seconds)

### Step 1: Find the Terminal Running the Dev Server
Look for the terminal window that shows:
```
VITE v5.0.8  ready in 500 ms
➜  Local:   http://localhost:XXXX/
```

### Step 2: Stop the Server
In that terminal window, press:
```
Ctrl+C
```

You should see the server stop and return to the command prompt.

### Step 3: Restart the Server
```bash
npm run dev
```

### Step 4: Note the Port Number
The output will show:
```
➜  Local:   http://localhost:3001/    <-- THIS IS YOUR URL
```

### Step 5: Open in Browser
Go to the URL from Step 4 (probably `http://localhost:3001`)

### Step 6: Hard Refresh
Press **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)

## ✅ Verify It's Working

After restarting, open browser console (F12 → Console) and you should see:

```
✅ [SnapshotService] Received 100 proposals
✅ [DuneService] Received 20 rows
✅ [CoinGeckoService] Fetched token price
```

**No more 429 errors!**

The dashboard should now show:
- ✅ Governance metrics
- ✅ Treasury value
- ✅ Economic data
- ✅ Delegation stats
- ✅ All proposals

## 🎯 Why This Happened

Timeline:
1. Server started at 11:30 PM → Loaded empty .env
2. You added API keys at 11:46 PM → But server still uses old values
3. App tries to call APIs without keys → Gets 429 errors
4. **Solution**: Restart server → Loads new .env with keys!

## 🚨 If You Still Get Errors After Restart

### Error: "429 Rate Limit"
- You've used all 20 free Dune queries for today
- Wait until tomorrow (resets daily)
- Or upgrade: https://dune.com/pricing

### Error: "401 Unauthorized"  
- API key is wrong/expired
- Go to: https://dune.com/settings/api
- Create a new key
- Update .env
- Restart server again

### Error: "No data available"
- Wait 10-15 seconds for Dune queries to execute
- Check browser console for actual error messages
- Make sure you hard refreshed (Cmd+Shift+R)

## 🎉 Success Indicators

When working correctly, you'll see:

**Overview Tab:**
- Governance Health Score: ~75-85
- Total Proposals: 100+
- Treasury Value: $XXX million
- Token Price: Real current price

**Treasury Tab:**
- Pie chart with asset breakdown
- Revenue charts
- Real monthly data

**All Tabs:**
- No "Error Loading Data" messages
- No red error boxes
- Real-time timestamps in footer

---

**TL;DR**: Just restart the dev server with `Ctrl+C` then `npm run dev`. Your API keys are valid! 🚀

