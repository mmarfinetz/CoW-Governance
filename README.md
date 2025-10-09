# CoW DAO Governance Dashboard

A comprehensive, real-time governance dashboard for CoW DAO built with React, Vite, and Tailwind CSS. This dashboard fetches **100% real data** from public APIs with **no mock data**.

## Features

- **Real-Time Governance Metrics**: Live data from Snapshot GraphQL API
- **Treasury Analytics**: Real treasury data from Safe Transaction Service and Dune Analytics
- **Proposal Tracking**: Complete proposal history with voting analytics
- **Token Metrics**: Live price, market cap, and holder data from CoinGecko and Etherscan
- **Solver Competition**: Real solver metrics from Dune dashboards
- **Interactive Visualizations**: Charts and graphs using Recharts
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Data Sources

All data is fetched from real, public APIs:

1. **Snapshot GraphQL API** (`https://hub.snapshot.org/graphql`)
   - Proposals for cow.eth space
   - Voting data and participation metrics
   - Governance parameters

2. **Dune Analytics API** (requires API key)
   - Treasury composition
   - Solver rewards and competition metrics
   - Revenue data

3. **CoinGecko API** (free tier)
   - COW token price
   - Market cap and volume
   - Price change percentages

4. **Etherscan API** (requires API key)
   - Token holder count
   - On-chain data verification

5. **Safe Transaction Service API**
   - Multisig wallet balances
   - Treasury Safe data

6. **CoW Protocol API** (`https://api.cow.fi/mainnet`)
   - Protocol health metrics
   - Solver competition data

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. **IMPORTANT**: Configure API Keys

**To see data in the dashboard, you MUST add at least a Dune API key:**

```bash
# Create your .env file (already exists if you just cloned)
cp .env.example .env

# Edit the .env file and add your Dune API key:
# nano .env  (or use any text editor)
```

**Required API Keys:**

| Service | Required? | Get Key From | Free Tier |
|---------|-----------|--------------|-----------|
| **Dune Analytics** | ✅ **REQUIRED** | https://dune.com/settings/api | 20 executions/day |
| CoinGecko | Optional | https://www.coingecko.com/en/api/pricing | Works without key |
| Etherscan | Optional | https://etherscan.io/myapikey | 5 calls/second |

**Your `.env` file should look like:**

```env
# REQUIRED - Without this, Treasury/Revenue/Solver data won't load
VITE_DUNE_API_KEY=your_actual_dune_key_here

# OPTIONAL
VITE_COINGECKO_API_KEY=
VITE_ETHERSCAN_API_KEY=
```

> 📖 **See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions on getting API keys**

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

### 4. Verify Data is Loading

Open your browser console (F12) and you should see:
- ✅ `[SnapshotService] Received X proposals` 
- ✅ `[DuneService] Received X rows`
- ✅ Data appearing in the dashboard tabs

**If no data loads:** Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for troubleshooting

### 5. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── App.jsx                    # Main application component
├── main.jsx                   # Application entry point
├── config/
│   └── apiConfig.js          # API endpoints and configuration
├── services/
│   ├── snapshotService.js    # Snapshot GraphQL API
│   ├── duneService.js        # Dune Analytics API
│   ├── coinGeckoService.js   # CoinGecko API
│   ├── etherscanService.js   # Etherscan API
│   ├── safeService.js        # Safe Transaction Service API
│   ├── cowProtocolService.js # CoW Protocol API
│   └── cacheService.js       # Data caching layer
├── hooks/
│   ├── useGovernanceData.js  # Governance metrics hook
│   ├── useProposalData.js    # Proposal data hook
│   ├── useTreasuryData.js    # Treasury data hook
│   ├── useTokenData.js       # Token metrics hook
│   ├── useSolverData.js      # Solver metrics hook
│   └── useSafeData.js        # Safe multisig data hook
├── components/
│   ├── shared/               # Reusable UI components
│   │   ├── MetricCard.jsx
│   │   ├── ChartContainer.jsx
│   │   ├── DataTable.jsx
│   │   ├── Badge.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorMessage.jsx
│   │   └── InfoTooltip.jsx
│   └── sections/             # Dashboard sections
│       ├── GovernanceOverview.jsx
│       ├── ProposalAnalytics.jsx
│       └── TreasuryDashboard.jsx
└── styles/
    └── index.css             # Tailwind CSS and global styles
```

## Dashboard Sections

### 1. Governance Overview
- **Governance Health Score**: Calculated based on participation, activity, and treasury health
- **Key Metrics Cards**: Quorum, active proposals, participation, treasury, holders, voting period
- **Quick Stats**: Success rate, max votes, voting mechanism

### 2. Proposal Analytics
- **Proposal Timeline**: Bar chart showing proposals over time
- **Category Breakdown**: Pie chart of proposal types
- **Voting Participation**: Line chart comparing votes to quorum
- **Recent Proposals Table**: Sortable table with all proposal details

### 3. Treasury Dashboard
- **Treasury Composition**: Pie chart of asset distribution
- **Budget Allocations**: Bar chart of major DAO commitments
- **Revenue Streams**: Overview of fee models
- **Token Distribution**: TGE allocation breakdown

## Data Caching

The dashboard implements intelligent caching to optimize API usage:

- **Proposals**: 5 minutes
- **Treasury**: 1 hour
- **Token Price**: 2 minutes (with live updates)
- **Solver Metrics**: 15 minutes
- **Safe Balances**: 10 minutes

## API Rate Limits

- **Snapshot**: 60 requests/minute (free)
- **CoinGecko**: 30 requests/minute (free tier)
- **Etherscan**: 5 requests/second (free tier)
- **Dune**: Varies by plan
- **Safe API**: No documented limits

## Technology Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Chart and visualization library
- **Axios**: HTTP client
- **Lucide React**: Icon library

## Key Features

### Real Data Integration
- ✅ All metrics fetched from live APIs
- ✅ No mock or static data
- ✅ Real-time updates with configurable intervals
- ✅ Error handling and fallbacks

### Performance
- ✅ Intelligent caching layer
- ✅ Parallel API requests
- ✅ Lazy loading of data
- ✅ Optimized re-renders

### User Experience
- ✅ Loading states
- ✅ Error messages with retry
- ✅ Responsive design
- ✅ Interactive charts and tables
- ✅ Last updated timestamps

## Validation

All data can be cross-referenced with official sources:

- **Proposals**: https://snapshot.org/#/cow.eth
- **Treasury**: https://dune.com/cowprotocol
- **Token Data**: https://www.coingecko.com/en/coins/cow-protocol
- **On-Chain Data**: https://etherscan.io/token/0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB

## Contributing

This dashboard is open for improvements. Key areas for enhancement:

1. Additional dashboard sections (Org Structure, Solver Competition, Risk Assessment, DAO Comparison)
2. More detailed Dune query integration
3. Historical data trending
4. Export functionality
5. Dark mode

## License

MIT

## Support

For issues or questions, please refer to:
- CoW DAO Forum: https://forum.cow.fi
- CoW Protocol Docs: https://docs.cow.fi
