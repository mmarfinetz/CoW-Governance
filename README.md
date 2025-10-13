# CoW DAO Governance Dashboard

A comprehensive, real-time governance dashboard for CoW DAO built with React, Vite, and Tailwind CSS. This dashboard fetches **100% real data** from public APIs with **no mock data**.

## 🎯 Features

- **Real-Time Governance Metrics**: Live data from Snapshot GraphQL API
- **Treasury Analytics**: Real treasury data from Safe Transaction Service and CoW Protocol Subgraph
- **Proposal Tracking**: Complete proposal history with voting analytics
- **Token Metrics**: Live price, market cap, and holder data from CoinGecko and Etherscan
- **Solver Competition**: Real solver metrics from CoW Protocol Subgraph
- **Delegation Dashboard**: Delegation tracking and analytics
- **Interactive Visualizations**: Charts and graphs using Recharts
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 📊 Data Sources

All data is fetched from real, public APIs (**no API keys required for core functionality**):

### Primary Data Sources (No API Key)

1. **CoW Protocol Subgraph** (The Graph) - *Source of Truth*
   - Protocol fees collected
   - Total trading volume
   - Daily statistics
   - Top tokens by volume
   - Solver statistics
   - Recent settlements
   - **Endpoints:**
     - Mainnet: `https://api.thegraph.com/subgraphs/name/cowprotocol/cow`
     - Gnosis: `https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc`
     - Arbitrum: `https://api.thegraph.com/subgraphs/name/cowprotocol/cow-arbitrum-one`

2. **Snapshot GraphQL API** (`https://hub.snapshot.org/graphql`)
   - Proposals for cow.eth space
   - Voting data and participation metrics
   - Governance parameters

3. **Safe Transaction Service API**
   - Multisig wallet balances
   - Treasury Safe data

### Optional Data Sources (API Key Enhances Features)

4. **CoinGecko API** (free tier, works without key)
   - COW token price
   - Market cap and volume
   - Price change percentages

5. **Etherscan API** (optional)
   - Token holder count
   - On-chain data verification

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. (Optional) Configure API Keys

**The dashboard works without API keys!** All core functionality uses public endpoints. API keys are optional and only enhance features:

```bash
# Create .env file if you want to add optional API keys
cp .env.example .env
```

**Optional API Keys:**

| Service | Required? | Get Key From | What It Adds |
|---------|-----------|--------------|--------------|
| CoinGecko | Optional | https://www.coingecko.com/en/api/pricing | Higher rate limits for price data |
| Etherscan | Optional | https://etherscan.io/myapikey | Token holder count |

**Example `.env` file:**

```env
# OPTIONAL - Dashboard works without these
VITE_COINGECKO_API_KEY=your_key_here
VITE_ETHERSCAN_API_KEY=your_key_here
```

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

## 🏗️ Architecture

### Project Structure

```
src/
├── App.jsx                     # Main application component with tab navigation
├── main.jsx                    # Application entry point
├── config/
│   ├── govConfig.json         # Central configuration (SOURCE OF TRUTH)
│   ├── apiConfig.js           # JS wrapper with env var overrides
│   └── metricDefinitions.js   # Metric calculation definitions
├── services/                   # Raw API integrations
│   ├── subgraphService.js     # CoW Protocol Subgraph (The Graph)
│   ├── snapshotService.js     # Snapshot GraphQL API
│   ├── safeService.js         # Safe Transaction Service API
│   ├── coinGeckoService.js    # CoinGecko API
│   ├── etherscanService.js    # Etherscan API
│   ├── delegationService.js   # Delegation data
│   ├── multiChainService.js   # Multi-chain voting aggregation
│   ├── cacheService.js        # Intelligent data caching layer
│   └── reconciliationService.js # Data validation and cross-referencing
├── hooks/                      # React hooks consuming services
│   ├── useGovernanceData.js   # Governance metrics hook
│   ├── useProposalData.js     # Proposal data hook
│   ├── useTreasuryData.js     # Treasury data hook (Subgraph + Safe)
│   ├── useTokenData.js        # Token metrics hook
│   ├── useSolverData.js       # Solver metrics hook
│   ├── useSafeData.js         # Safe multisig data hook
│   ├── useDelegationData.js   # Delegation analytics
│   └── useMultiChainData.js   # Cross-chain voting data
├── components/
│   ├── shared/                # Reusable UI components
│   │   ├── MetricCard.jsx
│   │   ├── ChartContainer.jsx
│   │   ├── DataTable.jsx
│   │   ├── Badge.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorMessage.jsx
│   │   └── InfoTooltip.jsx
│   ├── sections/              # Main dashboard tabs
│   │   ├── GovernanceOverview.jsx
│   │   ├── ProposalAnalytics.jsx
│   │   ├── TreasuryDashboard.jsx
│   │   ├── DelegationDashboard.jsx
│   │   └── LiveGovernance.jsx
│   ├── proposals/             # Proposal-specific components
│   ├── delegation/            # Delegation-specific components
│   └── modals/                # Modal dialogs
├── contexts/
│   └── TimeRangeContext.jsx  # Global time filtering
├── utils/                     # Utility functions
│   ├── rateLimiter.js        # Rate limiting
│   ├── retryUtils.js         # Retry logic
│   ├── configValidator.js    # Startup validation
│   ├── dataValidator.js      # Data structure validation
│   └── csvExport.js          # CSV export functionality
└── styles/
    └── index.css              # Tailwind CSS and global styles
```

### Data Flow Architecture

The application follows a **service → hook → component** pattern:

1. **Services Layer** (`src/services/`): Raw API integrations
   - Handle all external API calls
   - Return standardized data structures
   - Include error handling and logging

2. **Hooks Layer** (`src/hooks/`): React hooks that consume services
   - Manage loading/error states
   - Implement data caching
   - Provide data to components

3. **Components Layer** (`src/components/`): UI components
   - Display data from hooks
   - Handle user interactions
   - Remain presentation-focused

### Configuration System

The project uses a centralized configuration system:

- **`src/config/govConfig.json`** - Single source of truth for:
  - API endpoints and rate limits
  - Cache durations
  - Governance parameters (space, quorum, voting periods)
  - Supported chains and features

- **`src/config/apiConfig.js`** - JavaScript wrapper that:
  - Imports govConfig.json
  - Merges environment variables from `.env` file
  - Exports typed configuration objects

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

## 💾 Data Caching

The dashboard implements intelligent caching to optimize API usage and respect rate limits:

- **Proposals**: 5 minutes (frequent updates for governance activity)
- **Treasury**: 1 hour (balances change less frequently)
- **Token Price**: 2 minutes (live price updates)
- **Solver Metrics**: 15 minutes (protocol activity)
- **Safe Balances**: 10 minutes (wallet balances)
- **Delegations**: 5 minutes (delegation changes)
- **Subgraph Data**: 15 minutes (on-chain data)

Caching is implemented via `cacheService.js` using localStorage with timestamp validation.

## 🔧 Development

### React Best Practices

**CRITICAL - Hooks Rules:**
- All hooks MUST be called at the top of components, before any conditional returns
- Never conditionally call hooks or call them after early returns
- This prevents "Rendered more hooks than during the previous render" errors

**Example - CORRECT:**
```jsx
function MyComponent() {
  const [data, setData] = useState(null);       // ✅ Hook at top
  const memoValue = useMemo(() => {}, []);      // ✅ Hook at top

  if (!data) return <Loading />;               // ✅ Conditional AFTER hooks
}
```

**Example - WRONG:**
```jsx
function MyComponent() {
  const [data, setData] = useState(null);

  if (!data) return <Loading />;               // ❌ Early return

  const memoValue = useMemo(() => {}, []);      // ❌ Hook after conditional!
}
```

### Data Fetching Pattern

All data fetching hooks follow this standard pattern:

```jsx
export function useMyData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCachedData(() => fetchFromAPI());
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
}
```

### API Service Pattern

All services follow consistent logging and error handling:

```javascript
export async function fetchData() {
  try {
    console.log('[ServiceName] Fetching from:', url, timestamp);
    const response = await axios.get(url, { headers });
    console.log('[ServiceName] Received', data.length, 'items at', timestamp);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
```

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

## 🔍 Data Validation

All data can be cross-referenced with official sources:

- **Proposals**: https://snapshot.org/#/cow.eth
- **Protocol Metrics**: https://thegraph.com/explorer (search "cowprotocol")
- **Token Data**: https://www.coingecko.com/en/coins/cow-protocol
- **On-Chain Data**: https://etherscan.io/token/0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB
- **Treasury**: Safe API + Subgraph data

The project includes validation tools in `src/utils/`:
- `configValidator.js` - Validates API keys and configuration at startup
- `dataValidator.js` - Validates data structures and freshness
- `devValidator.js` - Development environment checks

## 🚨 Troubleshooting

### Common Issues

**"No data loading in Treasury tab"**
- Check browser console for specific errors
- Verify network connection (subgraph requires internet)
- Try refreshing the page
- Check https://thegraph.com/explorer for The Graph network status

**"Proposals tab not showing data"**
- Verify Snapshot API is accessible
- Check console for GraphQL errors
- Ensure cow.eth space has proposals at https://snapshot.org/#/cow.eth

**"React Hooks error"**
- Ensure all hooks are at the top of components
- Check for conditional returns before hooks
- See "Development > React Best Practices" section above

**"Data seems stale"**
- Check the "Last updated" timestamp on metric cards
- Cache may be active (see Data Caching section)
- Click refresh button or reload page

### Testing Your Setup

After installation, verify data is loading:

1. **Start dev server**: `npm run dev`
2. **Open browser console**: Press F12
3. **Look for these logs**:
   ```
   [SubgraphService] Querying mainnet subgraph...
   [SubgraphService] Total volume (USD): [number]
   [SnapshotService] Received X proposals
   [SafeService] Fetched treasury balances
   ```
4. **Check all dashboard tabs load without errors**

## 📚 Resources

### CoW Protocol
- **Official Docs**: https://docs.cow.fi
- **Forum**: https://forum.cow.fi
- **Snapshot Space**: https://snapshot.org/#/cow.eth
- **Subgraph Repo**: https://github.com/cowprotocol/subgraph
- **Dune Dashboards**: https://dune.com/cowprotocol

### API Documentation
- **The Graph**: https://thegraph.com/docs/
- **Snapshot**: https://docs.snapshot.org/graphql-api
- **Safe API**: https://docs.safe.global/safe-core-api/
- **CoinGecko**: https://www.coingecko.com/api/documentation
- **Etherscan**: https://docs.etherscan.io/

### Development
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Recharts**: https://recharts.org/

## 🤝 Contributing

This dashboard is open for improvements. Key areas for enhancement:

1. Additional dashboard sections (Risk Assessment, DAO Comparison)
2. Historical data trending and analytics
3. Export functionality (CSV, PDF reports)
4. Dark mode theme
5. Multi-language support
6. Mobile app version

## 📄 License

MIT

## 💬 Support

For issues or questions:
- **Bug Reports**: Open an issue on GitHub
- **CoW DAO Forum**: https://forum.cow.fi
- **CoW Protocol Docs**: https://docs.cow.fi
- **Discord**: https://discord.gg/cowprotocol
