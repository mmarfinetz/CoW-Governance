# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a real-time governance dashboard for CoW DAO built with React, Vite, and Tailwind CSS. The dashboard fetches **100% real data** from public APIs with **no mock data** allowed. The project uses multiple data sources including Snapshot, Dune Analytics, CoinGecko, Etherscan, Safe Transaction Service, and CoW Protocol APIs.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Setup Requirements

**CRITICAL**: The dashboard requires API keys to function. Before running:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Dune API key (REQUIRED for Treasury/Revenue/Solver data):
   ```
   VITE_DUNE_API_KEY=your_dune_key_here
   ```

3. Optional API keys for enhanced features:
   - `VITE_COINGECKO_API_KEY` - Token price data (works without key but has rate limits)
   - `VITE_ETHERSCAN_API_KEY` - Token holder count

Get API keys from:
- Dune: https://dune.com/settings/api (free tier: 20 executions/day)
- CoinGecko: https://www.coingecko.com/en/api/pricing
- Etherscan: https://etherscan.io/myapikey

## Architecture Overview

### Data Flow Architecture

The application follows a **service → hook → component** pattern:

1. **Services Layer** (`src/services/`): Raw API integrations
   - `snapshotService.js` - Snapshot GraphQL API for proposals and governance
   - `duneService.js` - Dune Analytics API for treasury, revenue, and solver metrics
   - `coinGeckoService.js` - Token price and market data
   - `etherscanService.js` - On-chain data (holder counts)
   - `safeService.js` - Safe multisig wallet balances
   - `cowProtocolService.js` - CoW Protocol API
   - `cacheService.js` - Intelligent data caching layer
   - `delegationService.js` - Delegation data
   - `multiChainService.js` - Multi-chain voting aggregation
   - `reconciliationService.js` - Data validation and cross-referencing

2. **Hooks Layer** (`src/hooks/`): React hooks that consume services
   - `useGovernanceData.js` - Governance metrics (proposals, participation, etc.)
   - `useProposalData.js` - Proposal analytics
   - `useTreasuryData.js` - Treasury and revenue data
   - `useTokenData.js` - Token metrics
   - `useSolverData.js` - Solver competition metrics
   - `useSafeData.js` - Safe multisig data
   - `useDelegationData.js` - Delegation analytics
   - `useMultiChainData.js` - Cross-chain voting data

3. **Components Layer** (`src/components/`):
   - `sections/` - Main dashboard sections (GovernanceOverview, ProposalAnalytics, TreasuryDashboard, DelegationDashboard, LiveGovernance)
   - `shared/` - Reusable UI components (MetricCard, ChartContainer, DataTable, Badge, LoadingSpinner, ErrorMessage)
   - `proposals/` - Proposal-specific components
   - `delegation/` - Delegation-specific components
   - `modals/` - Modal dialogs (ConfigurationModal)

### Configuration System

The project uses a centralized configuration system:

- **`src/config/govConfig.json`** - Single source of truth for:
  - API endpoints and rate limits
  - Dune query IDs (validated from cowprotocol/dune-queries repo)
  - Cache durations
  - Governance parameters (space, quorum, voting periods)
  - Supported chains and features

- **`src/config/apiConfig.js`** - JavaScript wrapper that:
  - Imports govConfig.json
  - Merges environment variables (`.env` file)
  - Exports typed configuration objects
  - Logs API key availability for debugging

**IMPORTANT**: Always update `govConfig.json` when changing API configurations. Environment variables in `.env` override govConfig values.

### Caching Strategy

Data caching is critical to avoid rate limits. Cache durations are defined in `govConfig.json`:

- **Proposals**: 5 minutes (`cacheService.js`)
- **Treasury**: 1 hour (Dune data)
- **Token Price**: 2 minutes (CoinGecko)
- **Solver Metrics**: 15 minutes (Dune data)
- **Safe Balances**: 10 minutes
- **Delegations**: 5 minutes
- **Delegates**: 1 hour
- **Chain Data**: 15 minutes

**How it works**: `getCachedProposals()`, `getCachedTreasury()`, etc. in `cacheService.js` check localStorage timestamps and return cached data if still valid.

### State Management

- **Global State**: `TimeRangeContext` (`src/contexts/TimeRangeContext.jsx`) provides time filtering across all dashboard sections
- **Local State**: Each hook manages its own loading/error/data state
- **No Redux/MobX**: Simple useState/useContext pattern throughout

### API Rate Limiting

The project implements rate limiting to prevent API errors:

- **`src/utils/rateLimiter.js`** - Token bucket rate limiter for Dune API
- **`src/utils/retryUtils.js`** - Exponential backoff retry logic for failed requests
- **Sequential fetching**: Dune queries execute sequentially with delays to avoid rate limits

**CRITICAL**: Dune API has strict rate limits. Always use `duneRateLimiter.execute()` when making Dune requests.

## Key Development Patterns

### React Best Practices

**CRITICAL - Hooks Rules**:
- All hooks MUST be called at the top of components, before any conditional returns
- Never conditionally call hooks or call them after early returns
- This is the #1 cause of "Rendered more hooks than during the previous render" errors

**Example - CORRECT**:
```jsx
function MyComponent() {
  const [data, setData] = useState(null); // ✅ Hook at top
  const memoValue = useMemo(() => {}, []); // ✅ Hook at top

  if (!data) return <Loading />; // ✅ Conditional AFTER hooks
}
```

**Example - WRONG**:
```jsx
function MyComponent() {
  const [data, setData] = useState(null);

  if (!data) return <Loading />; // ❌ Early return

  const memoValue = useMemo(() => {}, []); // ❌ Hook after conditional!
}
```

### Data Fetching Pattern

All data fetching hooks follow this pattern:

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

      // Fetch from cached service
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

All services in `src/services/` follow this pattern:

```javascript
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

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

**Key points**:
- Always log API calls with timestamps for debugging
- Always use `API_CONFIG` for endpoints/keys
- Always throw errors (let hooks handle them)
- Use consistent error messages

### Error Handling

The project has specific error handling requirements:

1. **Missing API Keys**: Show helpful messages with links to get keys
2. **Rate Limits**: Gracefully degrade, show cached data if available
3. **Network Errors**: Display retry button
4. **Invalid Queries**: Log to console, show user-friendly message

Example from `duneService.js`:
```javascript
if (!API_KEY) {
  console.warn('Dune API key not set, using fallback data structure');
  return { totalValue: 0, composition: [], timestamp: new Date() };
}
```

### Snapshot GraphQL Queries

When working with Snapshot API:

1. **Always test queries** at https://hub.snapshot.org/graphql
2. **Check field availability** - Not all fields work for all proposal types
3. **Use correct space**: `cow.eth`
4. **Handle pagination**: Default limit is 100, max is 1000

Example query structure:
```graphql
query Proposals {
  proposals(
    first: 100,
    where: { space_in: ["cow.eth"] },
    orderBy: "created",
    orderDirection: desc
  ) {
    id
    title
    state
    # ... other fields
  }
}
```

### Dune Query Management

**IMPORTANT**: Dune query IDs are stored in `govConfig.json`:

```json
{
  "queries": {
    "dune": {
      "treasury": { "id": "3700123", "name": "Monthly DAO Revenue & Treasury" },
      "revenue": { "id": "3700123", "name": "Monthly Revenue Streams" },
      "solverRewards": { "id": "5270914", "name": "Solver Auction Data" },
      "solverInfo": { "id": "5533118", "name": "Solver Conversion Prices" }
    }
  }
}
```

These IDs are from the official CoW Protocol Dune queries repo: https://github.com/cowprotocol/dune-queries

**When updating Dune queries**:
1. Verify query ID exists in cowprotocol/dune-queries repo
2. Update `govConfig.json` with new ID and version
3. Test query returns expected data structure
4. Update cache duration if needed

## Testing and Debugging

### Local Development Testing

After making changes:
1. Clear browser cache and localStorage
2. Restart dev server (`npm run dev`)
3. Open browser console (F12)
4. Check for console logs:
   - `[SnapshotService] Received X proposals`
   - `[DuneService] Received X rows`
   - `[API Config] VITE_DUNE_API_KEY exists: true`
5. Verify all 5 tabs load: Overview, Proposals, Treasury, Delegation, Live

### Common Issues

**"Rendered more hooks than during the previous render"**:
- Check for conditional hook calls or hooks after early returns
- Move all hooks to top of component

**"No treasury data available"**:
- Check `.env` file exists with `VITE_DUNE_API_KEY`
- Verify API key is valid at https://dune.com/settings/api
- Check browser console for specific error messages

**"Request failed with status code 400"** (Snapshot):
- Test GraphQL query at https://hub.snapshot.org/graphql
- Verify field names match Snapshot schema
- Check `space_in` filter uses correct space ID

**Dune API rate limits**:
- Check if `duneRateLimiter` is being used
- Verify sequential execution in `fetchAllDuneData()`
- Increase delays between requests if needed

### Configuration Validation

The project includes a startup validation system:

- **`src/utils/configValidator.js`** - Validates API keys and configuration
- **`src/utils/devValidator.js`** - Development environment checks
- **`src/utils/dataValidator.js`** - Data structure validation

These run automatically on app startup and log warnings to console.

## Project Constraints

**CRITICAL RULES**:

1. **No Mock Data**: All data must come from real APIs
2. **Subgraph as Source of Truth**: Snapshot GraphQL is the primary data source
3. **No DeFi Llama**: Removed per project requirements
4. **Real-Time Only**: No static data files (except govConfig.json)
5. **Handle API Failures Gracefully**: Dashboard should work even if some APIs fail

## Useful Scripts

The project includes helper scripts in the root directory:

- `CHECK_STATUS.sh` - Check all API endpoints
- `START_DASHBOARD.sh` - Start dev server with validation
- `test-dune-api.sh` - Test Dune API connection
- `test-snapshot-api.sh` - Test Snapshot API connection
- `restart.sh` - Clean restart (clears cache, restarts server)

## External Resources

### API Documentation
- Snapshot GraphQL: https://docs.snapshot.org/graphql-api
- Dune Analytics: https://docs.dune.com/api-reference/
- Safe API: https://docs.safe.global/safe-core-api/
- CoinGecko: https://www.coingecko.com/api/documentation
- Etherscan: https://docs.etherscan.io/
- CoW Protocol: https://docs.cow.fi

### CoW DAO Resources
- Snapshot Space: https://snapshot.org/#/cow.eth
- Forum: https://forum.cow.fi
- Dune Queries: https://github.com/cowprotocol/dune-queries
- Token Contract: 0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB

## Multi-Chain Support

The dashboard supports multi-chain voting aggregation (currently in development):

- **Supported Chains**: Ethereum Mainnet, Gnosis Chain, Arbitrum, Base, Polygon
- **RPC Endpoints**: Configured in `apiConfig.js` under `chains`
- **Service**: `multiChainService.js` aggregates voting power across chains
- **Hook**: `useMultiChainData.js` provides cross-chain metrics

## Time Range Filtering

The dashboard supports global time filtering via `TimeRangeContext`:

- **Presets**: Last 30 days, Last 90 days, Year-to-date, All time, Custom
- **Default**: Last 90 days
- **Usage**: All hooks consume `useTimeRange()` and filter data accordingly
- **Implementation**: Unix timestamp filtering on `created` field

## File Organization

```
src/
├── App.jsx                  # Main app component with tab navigation
├── main.jsx                 # Vite entry point
├── config/
│   ├── govConfig.json       # Central configuration (SOURCE OF TRUTH)
│   └── apiConfig.js         # JS wrapper with env var overrides
├── services/                # Raw API integrations
│   ├── snapshotService.js   # Snapshot GraphQL
│   ├── duneService.js       # Dune Analytics
│   ├── cacheService.js      # Caching layer
│   └── ...                  # Other API services
├── hooks/                   # React hooks consuming services
│   ├── useGovernanceData.js
│   ├── useProposalData.js
│   └── ...
├── components/
│   ├── sections/            # Main dashboard tabs
│   │   ├── GovernanceOverview.jsx
│   │   ├── ProposalAnalytics.jsx
│   │   ├── TreasuryDashboard.jsx
│   │   ├── DelegationDashboard.jsx
│   │   └── LiveGovernance.jsx
│   ├── shared/              # Reusable UI components
│   │   ├── MetricCard.jsx
│   │   ├── ChartContainer.jsx
│   │   └── ...
│   └── ...
├── contexts/
│   └── TimeRangeContext.jsx # Global time filtering
├── utils/
│   ├── rateLimiter.js       # Rate limiting
│   ├── retryUtils.js        # Retry logic
│   ├── configValidator.js   # Startup validation
│   └── ...
└── styles/
    └── index.css            # Tailwind + global styles
```

## Making Changes

### Adding a New API Endpoint

1. Add endpoint to `govConfig.json`
2. Create service in `src/services/myService.js`
3. Add caching logic if needed
4. Create hook in `src/hooks/useMyData.js`
5. Update component to use hook
6. Test with real API
7. Update `.env.example` if new API key required

### Adding a New Dashboard Section

1. Create component in `src/components/sections/MySection.jsx`
2. Add tab to `App.jsx` tabs array
3. Add route case in `renderContent()` function
4. Import required hooks
5. Test data fetching and error states

### Updating Dune Queries

1. Verify new query ID at https://github.com/cowprotocol/dune-queries
2. Update `govConfig.json` with new query ID
3. Update service method in `duneService.js` if data structure changed
4. Test query returns expected fields
5. Clear cache (localStorage) to test fresh data
