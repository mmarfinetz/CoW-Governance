# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A real-time governance dashboard for CoW DAO built with React + Vite + Tailwind CSS. The dashboard displays 100% real data from public APIs (Snapshot, Dune Analytics, CoinGecko, Etherscan) with **no mock data**.

## Development Commands

### Essential Commands
```bash
npm install          # Install dependencies
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
```

## API Architecture & Data Flow

### Core Data Sources
The application fetches real-time data from 6 public APIs:

1. **Snapshot GraphQL API** (`https://hub.snapshot.org/graphql`)
   - Proposals for `cow.eth` space
   - Voting data, participation metrics, governance parameters
   - No API key required

2. **Dune Analytics API** (requires API key)
   - Treasury composition and revenue data
   - Solver rewards and competition metrics
   - Queries are pre-configured in `src/config/apiConfig.js`

3. **CoinGecko API** (free tier available)
   - COW token price, market cap, volume
   - Price change percentages

4. **Etherscan API** (requires API key)
   - Token holder count
   - On-chain data verification

5. **Safe Transaction Service API**
   - Multisig wallet balances
   - Treasury Safe data (no API key required)

6. **CoW Protocol API** (`https://api.cow.fi/mainnet`)
   - Protocol health metrics
   - Solver competition data

### Environment Variables
API keys are configured in `.env` (copy from `.env.example`):
- `VITE_DUNE_API_KEY` - Required for full treasury data
- `VITE_ETHERSCAN_API_KEY` - Required for holder count
- `VITE_COINGECKO_API_KEY` - Optional (free tier works)

### Caching Strategy
The app implements an intelligent in-memory cache (`src/services/cacheService.js`):
- **Proposals**: 5 minutes
- **Treasury**: 1 hour
- **Token Price**: 2 minutes
- **Solver Metrics**: 15 minutes
- **Safe Balances**: 10 minutes

Cache durations are defined in `src/config/apiConfig.js` under `CACHE_DURATIONS`.

## Architecture Patterns

### Service Layer Pattern
All API calls are abstracted into service modules in `src/services/`:
- `snapshotService.js` - GraphQL queries for Snapshot
- `duneService.js` - Dune Analytics queries
- `coinGeckoService.js` - Token price data
- `etherscanService.js` - On-chain data
- `safeService.js` - Safe multisig data
- `cowProtocolService.js` - Protocol metrics
- `cacheService.js` - Centralized caching logic

Each service exports:
- Fetch functions (e.g., `fetchProposals()`, `fetchTokenPrice()`)
- Data transformation utilities
- Error handling wrappers

### Custom Hooks Pattern
Data fetching logic is encapsulated in custom hooks in `src/hooks/`:
- `useGovernanceData.js` - Governance metrics from Snapshot
- `useProposalData.js` - Proposal history and analytics
- `useTreasuryData.js` - Treasury composition and revenue
- `useTokenData.js` - Token price and market data
- `useSolverData.js` - Solver competition metrics
- `useSafeData.js` - Safe multisig balances

Each hook returns: `{ data, loading, error, lastUpdated, refetch }`

### Component Architecture
```
src/
├── App.jsx                    # Main app with tab navigation
├── components/
│   ├── shared/               # Reusable UI components
│   │   ├── MetricCard.jsx    # Key metric display cards
│   │   ├── ChartContainer.jsx # Recharts wrapper
│   │   ├── DataTable.jsx     # Sortable data tables
│   │   ├── Badge.jsx         # Status badges
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorMessage.jsx
│   │   └── InfoTooltip.jsx
│   └── sections/             # Dashboard sections
│       ├── GovernanceOverview.jsx  # Metrics & health score
│       ├── ProposalAnalytics.jsx   # Charts & proposal table
│       └── TreasuryDashboard.jsx   # Treasury breakdown
```

### Dashboard Sections
1. **Governance Overview** (`GovernanceOverview.jsx`)
   - Governance Health Score (calculated from participation, activity, treasury)
   - Key metrics: Quorum, active proposals, participation, treasury, holders
   - Uses `useGovernanceData()` and `useTokenData()` hooks

2. **Proposal Analytics** (`ProposalAnalytics.jsx`)
   - Proposal timeline bar chart (proposals over time)
   - Category breakdown pie chart
   - Voting participation line chart
   - Recent proposals sortable table
   - Uses `useProposalData()` hook

3. **Treasury Dashboard** (`TreasuryDashboard.jsx`)
   - Treasury composition pie chart
   - Budget allocations bar chart
   - Revenue streams overview
   - Uses `useTreasuryData()` and `useSafeData()` hooks

## Key Implementation Details

### GraphQL Queries (Snapshot)
Snapshot API uses GraphQL. Queries are constructed as template strings in `snapshotService.js`:
```javascript
const query = `
  query Proposals {
    proposals(
      first: 100,
      where: { space_in: ["cow.eth"] },
      orderBy: "created",
      orderDirection: desc
    ) { ... }
  }
`;
```

### Parallel Data Fetching
Hooks use `Promise.all()` to fetch multiple data sources in parallel:
```javascript
const [proposals, spaceInfo] = await Promise.all([
  getCachedProposals(() => fetchProposals(100)),
  fetchSpaceInfo()
]);
```

### Error Handling
All services and hooks implement try-catch error handling:
- Errors are logged to console
- Error state is exposed via hooks
- `ErrorMessage` component displays user-friendly errors with retry

### Metrics Calculations
Custom calculations are performed in service modules:
- `calculateGovernanceMetrics()` in `snapshotService.js`
- Calculates: total/active proposals, avg participation, max votes, success rate
- Success rate logic: proposals that met quorum and passed

## API Configuration

Centralized in `src/config/apiConfig.js`:
```javascript
export const API_CONFIG = {
  snapshot: { endpoint, space, rateLimit },
  dune: { baseUrl, apiKey, queries: { treasury, revenue, solverRewards } },
  coinGecko: { baseUrl, apiKey, tokenId },
  etherscan: { baseUrl, apiKey, cowTokenAddress },
  cowProtocol: { baseUrl },
  safe: { baseUrl, addresses: { solverPayouts } }
};
```

Dune query IDs are pre-configured and confirmed working from CoW Protocol's official dune-queries repo.

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool (fast HMR, optimized builds)
- **Tailwind CSS** - Utility-first styling (config in `tailwind.config.js`)
- **Recharts** - Chart library (Bar, Line, Pie charts)
- **Axios** - HTTP client for all API calls
- **Lucide React** - Icon library

## Important Constraints

- **No Mock Data**: All data must come from real APIs
- **Real-time Updates**: Data refreshes based on cache durations
- **API Rate Limits**: Respect rate limits defined in `API_CONFIG`
- **Error Resilience**: Always handle API failures gracefully
- **Cache Awareness**: Use cached wrappers (`getCachedProposals()`, etc.) to avoid redundant API calls

## Adding New Features

### Adding a New API Source
1. Create service module in `src/services/` (e.g., `newService.js`)
2. Add API config to `src/config/apiConfig.js`
3. Add cache duration to `CACHE_DURATIONS`
4. Create cached wrapper in `cacheService.js`

### Adding a New Dashboard Section
1. Create component in `src/components/sections/`
2. Create custom hook in `src/hooks/` if needed
3. Add tab to `App.jsx` tabs array
4. Add case to `renderContent()` switch statement

### Adding a New Metric
1. Add calculation logic to appropriate service (e.g., `snapshotService.js`)
2. Update hook to include new metric in returned data
3. Create/update `MetricCard` in dashboard section component
