# ⚡ FIX THE 429 ERROR - DO THIS NOW

## What's Wrong
Your Dune API key **IS WORKING** ✅ but your dev server started **BEFORE** you added the keys to `.env`. 

The server is using empty API keys → Dune API rejects them → You get 429 errors.

## The Fix (One Command)

**Option 1: Use the restart script**
```bash
./restart.sh
```

This will:
1. Stop the old server
2. Start a new one with your API keys
3. Show you the correct URL

**Option 2: Manual restart**
1. Find the terminal running `npm run dev`
2. Press `Ctrl+C` to stop it
3. Run `npm run dev` again
4. Open the URL it shows (probably http://localhost:3001)

## After Restarting

1. **Go to the URL shown in terminal** (e.g., http://localhost:3001)
2. **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. **Wait 10-15 seconds** for Dune queries to load
4. **Data should appear!**

## Verify It Worked

Open browser console (F12 → Console), you should see:
```
✅ [SnapshotService] Received 100 proposals
✅ [DuneService] Received 20 rows
✅ [DuneService] Fetching results from...
```

**NO MORE "429" or "Request failed" errors!**

## What You'll See Working

✅ **Overview Tab**: Governance health, treasury value, all metrics  
✅ **Proposals Tab**: Already working  
✅ **Treasury Tab**: Asset composition, revenue charts  
✅ **Delegation Tab**: Delegation statistics  
✅ **Live Tab**: Active proposals, recent activity  

---

**TL;DR**: Run `./restart.sh` or manually restart the dev server. That's it! 🚀

