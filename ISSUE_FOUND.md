# 🎯 ISSUE FOUND!

## The Problem

You're going to **http://localhost:3000** but your govdashboard is actually running on **http://localhost:3001**!

## The Solution

### Go to the correct URL:
```
http://localhost:3001
```

## Why This Happened

When Vite starts, if port 3000 is already taken (by another app), it automatically uses the next available port (3001). 

Your `vite.config.js` specifies port 3000, but something else was using that port when the server started, so Vite chose 3001 instead.

## What to Do Now

### Option 1: Use Port 3001 (Quickest)
Just go to: **http://localhost:3001**

### Option 2: Restart on Port 3000 (If you prefer 3000)

```bash
# 1. Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# 2. Stop your current dev server (Ctrl+C)

# 3. Restart it
npm run dev

# 4. It should now be on port 3000
# Check the terminal output - it will say:
#   "Local: http://localhost:3000/"
```

## Verify It's Working

Once you go to the correct port (3001 or 3000):

1. **The app should load** (you'll see the CoW DAO header)
2. **Open console** (F12 → Console tab)
3. **Check for API calls:**
   - ✅ Look for: `[SnapshotService] Received X proposals`
   - ✅ Look for: `[DuneService] Received X rows`
   - ❌ If you see: `"Dune API key not set"` → Keys need to be filled in

## Check Your .env File

Your `.env` file exists and has some content, but the keys might be empty. Check:

```bash
cat .env
```

If you see lines like:
```
VITE_DUNE_API_KEY=
VITE_COINGECKO_API_KEY=
VITE_ETHERSCAN_API_KEY=
```

With nothing after the `=`, you need to add actual API keys. See `QUICK_START.md` for how to get them.

## Quick Diagnostic

Run this to see what's happening:

```bash
# Check what ports your servers are on
lsof -i :3000 && echo "---" && lsof -i :3001

# Check if .env has keys
grep "^VITE_DUNE_API_KEY=." .env && echo "✅ Dune key exists" || echo "❌ Dune key empty"

# Test if server responds
curl -s http://localhost:3001 | head -5
```

## Expected Terminal Output

When `npm run dev` runs, you should see something like:

```
VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**The URL shown in the terminal is the correct one to use!**

---

## Summary

1. ✅ Dev server IS running
2. ✅ .env file exists
3. ❌ You're accessing the WRONG PORT
4. ❌ API keys might be empty

**Next Step:** Go to http://localhost:3001 and check if data loads!

