# 🚀 Deployment Guide

## Quick Answer

**YES - Use GitHub + Vercel!** 

This is a **100% frontend app** - you need NO backend or Railway.

## Why No Backend Needed?

This dashboard:
- ✅ Runs entirely in the browser
- ✅ Calls external APIs directly from the frontend
- ✅ No server-side code
- ✅ No database
- ✅ Just static HTML/CSS/JS built by Vite

## Deployment Steps

### 1. Push to GitHub

```bash
# If git push fails with auth, do this:
git push
# Or if you need to set upstream:
git push -u origin main
```

### 2. Deploy on Vercel (Recommended)

**Option A: From Vercel Dashboard**

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Vercel auto-detects Vite settings ✅
5. Add environment variables:
   - `VITE_DUNE_API_KEY`
   - `VITE_COINGECKO_API_KEY`
   - `VITE_ETHERSCAN_API_KEY`
6. Click "Deploy"

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, add env vars when asked
# Production deploy:
vercel --prod
```

### 3. Configure Environment Variables in Vercel

In Vercel project settings → Environment Variables:

```
VITE_DUNE_API_KEY=your_dune_key
VITE_COINGECKO_API_KEY=your_coingecko_key
VITE_ETHERSCAN_API_KEY=your_etherscan_key
```

**IMPORTANT**: Vercel only loads env vars prefixed with `VITE_` ✅

## Alternative Deployment Options

### Netlify
- Similar to Vercel
- Auto-detects Vite
- Add env vars in site settings
- Deploy from GitHub

### Cloudflare Pages
- Free tier
- Fast CDN
- Connect GitHub repo
- Add env vars in settings

### GitHub Pages
- Free but requires manual build
- No env vars support (would need to hardcode keys - NOT recommended)

## Build Command

If asked, use:
```bash
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## Post-Deployment

After deploying, your dashboard will be at:
```
https://your-project-name.vercel.app
```

**Test it:**
1. Open the URL
2. Check browser console for API calls
3. Verify data loads
4. All your API keys work from the browser

## Why Vercel is Best for This

✅ **Auto-deploys** from GitHub  
✅ **Environment variables** built-in  
✅ **Vite optimized**  
✅ **Fast global CDN**  
✅ **Free tier** (plenty for this)  
✅ **HTTPS** automatic  
✅ **Preview deploys** for PRs  

## No Backend Needed Because

All data comes from public APIs:
- Snapshot GraphQL (public)
- Dune Analytics (your API key)
- CoinGecko (your API key)
- Etherscan (your API key)
- Safe Transaction API (public)
- CoW Protocol API (public)

The browser makes these requests directly - no proxy/backend needed.

## Security Note

⚠️ **API keys are exposed in frontend code** - this is normal for frontend apps.

**Best practices:**
1. Use read-only API keys (Dune offers this)
2. Set up API key restrictions (IP/domain limits)
3. Monitor API usage for abuse
4. Rotate keys if compromised

For Vercel, you can add domain restrictions in your API dashboards:
- Dune: Restrict to `*.vercel.app`
- CoinGecko: Restrict to your domain
- Etherscan: Restrict to your domain

## Cost

**Vercel Free Tier includes:**
- 100 GB bandwidth/month
- Unlimited requests
- Auto-scaling
- HTTPS/SSL
- Preview deployments

**More than enough for a governance dashboard!**

## Summary

```bash
# 1. Push to GitHub
git push

# 2. Go to vercel.com
# 3. Import your GitHub repo
# 4. Add environment variables
# 5. Deploy

# That's it! No Railway, no backend, no database needed.
```

Your dashboard will be live at `https://your-project.vercel.app` 🚀

