# Quick Start Guide

## Prerequisites

You already have the API keys configured in the `.env` file:
- ✅ Dune Analytics API key
- ✅ CoinGecko API key
- ✅ Etherscan API key

## Start the Dashboard

1. **Install dependencies** (if not already done):
```bash
npm install
```

2. **Start the development server**:
```bash
npm run dev
```

3. **Open your browser** to:
```
http://localhost:3000
```

## What to Expect

The dashboard will load with **100% real data**:

### Governance Overview Tab
- Real-time governance health score
- Current quorum: 35M COW votes
- Live token holder count from Etherscan
- Active proposals count from Snapshot
- Real treasury value from Safe API
- Average participation calculated from actual votes

### Proposals Tab
- All CoW DAO proposals from cow.eth Snapshot space
- Real voting data with participation charts
- Proposal timeline showing historical activity
- Category breakdown of proposals
- Sortable table with all CIPs

### Treasury Tab
- Live COW token price from CoinGecko
- Treasury composition from Safe multisig wallets
- Budget allocations from governance proposals
- Revenue stream breakdown
- Token distribution metrics

## Data Sources Verification

All data can be verified against official sources:

1. **Snapshot Proposals**: https://snapshot.org/#/cow.eth
2. **Treasury Data**: https://dune.com/cowprotocol
3. **Token Metrics**: https://www.coingecko.com/en/coins/cow-protocol
4. **Holder Count**: https://etherscan.io/token/0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB

## Troubleshooting

### If you see "Error Loading Data"

1. **Check API keys**: Make sure your `.env` file has valid API keys
2. **Check network**: Ensure you have internet connectivity
3. **Try the retry button**: Click "Try Again" on any error messages
4. **Check browser console**: Look for specific API error messages

### Common Issues

**Dune API Error**:
- Dune API requires a paid plan ($39/mo minimum)
- The dashboard will still work with fallback data if Dune fails

**Rate Limit Errors**:
- The dashboard caches data to minimize API calls
- Wait a few minutes if you hit rate limits
- CoinGecko free tier: 30 calls/minute
- Etherscan free tier: 5 calls/second

**Snapshot Loading Slow**:
- Fetching 100 proposals takes 5-10 seconds initially
- Data is cached for 5 minutes after first load

## Performance

- **Initial Load**: 10-15 seconds (fetching all data in parallel)
- **Cached Load**: <1 second
- **Auto-Refresh**: Token price updates every 2 minutes

## Development

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Recharts (charts)
- Axios (API calls)
- Real-time data from 6 different APIs

---

**Enjoy exploring CoW DAO governance with real, live data! 🐮**
