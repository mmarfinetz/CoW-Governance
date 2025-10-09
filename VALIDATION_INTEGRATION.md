# Data Validation Framework - Integration Guide

## Overview

The data validation framework has been successfully implemented to ensure **NO MOCK DATA** and provide complete **data source transparency** for the CoW DAO Governance Dashboard.

## What Was Created

### 1. Core Validation Utilities

**Location:** `/src/utils/dataValidator.js`

**Functions:**
- `validateRealData(data, componentName)` - Detects suspicious patterns (round numbers, placeholders, default dates)
- `validateRequiredFields(data, requiredFields)` - Ensures required fields exist
- `validateBounds(value, { min, max, label })` - Validates numeric ranges
- `validateTimestampFreshness(timestamp, maxAgeMs)` - Checks data freshness
- `validateMultipleSources(dataItems)` - Batch validation across multiple sources

### 2. Development Validator

**Location:** `/src/utils/devValidator.js`

**Features:**
- Auto-scans DOM for `data-source` attributes
- Generates coverage reports (attributed vs missing)
- Monitors for suspicious data patterns in displayed content
- MutationObserver watches for DOM changes
- Exposes `window.__runDataValidation()` for manual testing

### 3. Data Source Attribution Components

**Location:** `/src/components/shared/DataSourceAttribution.jsx`

**Components:**
- `<DataSourceAttribution>` - Full footer with source + timestamp
- `<DataSourceAttribution inline>` - Compact inline version
- `<DataSourceBadge>` - Minimal badge

### 4. Enhanced UI Components

**Updated Components:**
- **MetricCard.jsx** - Now accepts `dataSource`, `lastUpdated`, `endpoint`, `showAttribution`
- **ChartContainer.jsx** - Now accepts `dataSource`, `lastUpdated`, `endpoint`, `showAttribution`

Both components automatically add `data-source` attribute to their root elements.

### 5. Service File Logging

**All service files updated with comprehensive logging:**

✅ **snapshotService.js**
- Logs: GraphQL endpoint, space, query parameters, result counts, timestamps

✅ **duneService.js**
- Logs: Query execution URL, query IDs, row counts, timestamps

✅ **coinGeckoService.js**
- Logs: Token data endpoints, token IDs, timestamps

✅ **etherscanService.js**
- Logs: API endpoints, contract addresses, holder counts, timestamps

✅ **safeService.js**
- Logs: Safe wallet endpoints, addresses, timestamps

✅ **cowProtocolService.js**
- Logs: Protocol API endpoints, health checks, timestamps

## How to Use

### Step 1: Initialize Dev Validator

Add to your main `App.jsx`:

```javascript
import { useEffect } from 'react';
import { initDevValidator } from './utils/devValidator';

function App() {
  useEffect(() => {
    // Initialize dev validator in development mode
    if (import.meta.env.DEV) {
      initDevValidator();
    }
  }, []);

  // ... rest of your app
}
```

### Step 2: Add Data Sources to MetricCards

**Before:**
```jsx
<MetricCard
  title="Total Proposals"
  value={data.totalProposals}
  color="blue"
/>
```

**After:**
```jsx
<MetricCard
  title="Total Proposals"
  value={data.totalProposals}
  color="blue"
  dataSource="snapshot:proposals"
  lastUpdated={data.lastUpdated}
  endpoint="https://hub.snapshot.org/graphql"
  showAttribution={true}  // Optional: shows source footer
/>
```

### Step 3: Add Data Sources to Charts

**Before:**
```jsx
<ChartContainer title="Proposal Timeline">
  <BarChart data={chartData} />
</ChartContainer>
```

**After:**
```jsx
<ChartContainer
  title="Proposal Timeline"
  dataSource="snapshot:proposals"
  lastUpdated={proposalData.timestamp}
  showAttribution={true}
>
  <BarChart data={chartData} />
</ChartContainer>
```

### Step 4: Validate Data in Hooks

Add validation to custom hooks:

```javascript
import { validateRealData, devOnlyValidation } from '../utils/dataValidator';

export function useProposalData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const proposals = await fetchProposals();

      // Validate in development only
      devOnlyValidation(validateRealData, proposals, 'useProposalData');

      setData({
        proposals,
        lastUpdated: new Date()  // Always include timestamp!
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  return { data, loading };
}
```

## Data Source Naming Convention

Format: `<service>:<data-type>`

**Standard Sources:**
- `snapshot:proposals` - Proposals from Snapshot
- `snapshot:votes` - Votes from Snapshot
- `snapshot:space` - Space info from Snapshot
- `dune:treasury` - Treasury composition from Dune
- `dune:revenue` - Revenue streams from Dune
- `dune:solverRewards` - Solver rewards from Dune
- `coingecko:price` - Token price from CoinGecko
- `coingecko:market` - Market data from CoinGecko
- `etherscan:holders` - Holder count from Etherscan
- `safe:balances` - Safe wallet balances
- `cowprotocol:health` - API health metrics
- `cowprotocol:surplus` - Total surplus metrics

## API Logging Format

All service calls now log in this format:

```
[ServiceName] Fetching from: <URL> (parameters) <ISO timestamp>
[ServiceName] Received <count> items at <ISO timestamp>
```

**Example Console Output:**
```
[SnapshotService] Fetching from: https://hub.snapshot.org/graphql (space: cow.eth, limit: 100) 2025-10-08T10:30:45.123Z
[SnapshotService] Received 87 proposals at 2025-10-08T10:30:46.456Z

[DuneService] Fetching results from: https://api.dune.com/api/v1/query/3667383/results (queryId: 3667383) 2025-10-08T10:30:47.000Z
[DuneService] Received 12 rows at 2025-10-08T10:30:48.234Z

[CoinGeckoService] Fetching simple price from: https://api.coingecko.com/api/v3/simple/price (token: cow-protocol) 2025-10-08T10:30:49.000Z
```

## Development Console Tools

When running in dev mode, these tools are available:

```javascript
// Run full validation and coverage report
window.__runDataValidation()

// Validate specific data object
window.__validateData(myData, 'ComponentName')
```

**Sample Output:**
```
[Dev Validator] Data Source Attribution Report
✓ Coverage: 87.5%
  Attributed: 70
  Missing: 10
  Total: 80

⚠️ 10 component(s) missing data-source attribution
  • .metric-card
    Content: "Active Proposals: 5..."
  • .chart-container
    Content: "Treasury: $2.5M..."

✓ 70 attributed elements
  snapshot: 28
  dune: 22
  coingecko: 8
  etherscan: 6
  safe: 4
  cowprotocol: 2
```

## Validation Warnings

The validator checks for these suspicious patterns:

### Round Numbers
- 10000, 50000, 100000, 1000000, etc.
- Often indicates hardcoded mock data

### Placeholder Text
- "lorem ipsum", "test", "mock", "example", "placeholder", "dummy", "fake"
- Indicates sample/placeholder content

### Default Dates
- Unix epoch (1970-01-01)
- Common defaults (2000-01-01, 2020-01-01)
- Dates before 2015 (before CoW Protocol existed)

## Critical Requirements

✅ **Every data display MUST have `data-source` attribute**
- MetricCard: Add via `dataSource` prop
- ChartContainer: Add via `dataSource` prop
- Custom components: Add `data-source="service:type"` to root element

✅ **All API calls MUST log full URL + timestamp**
- Format: `console.log('[ServiceName] Fetching from:', url, params, timestamp)`
- Already implemented in all service files

✅ **Validation never blocks render**
- All warnings are console-only
- Never throws errors or prevents display

✅ **Attribution is optional but encouraged**
- Use `showAttribution={true}` on user-facing components
- Omit for internal/developer-only views

✅ **Zero performance impact in production**
- All validation runs only when `import.meta.env.DEV === true`
- Production builds have no validation overhead

## Integration Checklist

Use this checklist when integrating the framework:

### Phase 1: Setup
- [ ] Add `initDevValidator()` to App.jsx
- [ ] Verify all service files have logging (already done)
- [ ] Import validation utilities where needed

### Phase 2: Component Updates
- [ ] Add `dataSource` prop to all MetricCard instances
- [ ] Add `dataSource` prop to all ChartContainer instances
- [ ] Add `data-source` attribute to custom data components
- [ ] Add `lastUpdated` timestamp to all data objects

### Phase 3: Validation
- [ ] Run `window.__runDataValidation()` in dev console
- [ ] Verify coverage is above 80%
- [ ] Fix any "missing attribution" warnings
- [ ] Check for suspicious data patterns

### Phase 4: Optional Enhancements
- [ ] Add `showAttribution={true}` to key user-facing metrics
- [ ] Add validation calls in custom hooks
- [ ] Add endpoint URLs for tooltip transparency
- [ ] Create data freshness indicators

## Example: Complete Integration

Here's a complete example of a component using all features:

```jsx
// In your section component
import { MetricCard } from '../shared/MetricCard';
import { ChartContainer } from '../shared/ChartContainer';
import { useProposalData } from '../../hooks/useProposalData';

export function ProposalAnalytics() {
  const { data, loading, error } = useProposalData();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {/* Metric with attribution */}
      <MetricCard
        title="Total Proposals"
        value={data.totalProposals}
        subtitle="All-time governance proposals"
        color="blue"
        dataSource="snapshot:proposals"
        lastUpdated={data.lastUpdated}
        endpoint="https://hub.snapshot.org/graphql"
        showAttribution={true}
      />

      {/* Chart with attribution */}
      <ChartContainer
        title="Proposal Timeline"
        subtitle="Proposals created over time"
        dataSource="snapshot:proposals"
        lastUpdated={data.lastUpdated}
        showAttribution={true}
      >
        <BarChart data={data.timeline} />
      </ChartContainer>
    </div>
  );
}
```

## Files Created/Modified

### Created Files
1. `/src/utils/dataValidator.js` - Core validation logic
2. `/src/utils/devValidator.js` - Development mode validator
3. `/src/utils/README.md` - Detailed documentation
4. `/src/components/shared/DataSourceAttribution.jsx` - Attribution components
5. `/VALIDATION_INTEGRATION.md` - This guide

### Modified Files
1. `/src/services/snapshotService.js` - Added API logging
2. `/src/services/duneService.js` - Added API logging
3. `/src/services/coinGeckoService.js` - Added API logging
4. `/src/services/etherscanService.js` - Added API logging
5. `/src/services/safeService.js` - Added API logging
6. `/src/services/cowProtocolService.js` - Added API logging
7. `/src/components/shared/MetricCard.jsx` - Added data-source support
8. `/src/components/shared/ChartContainer.jsx` - Added data-source support

## Next Steps

1. **Initialize the framework** - Add `initDevValidator()` to your App.jsx
2. **Run validation** - Open dev console and run `window.__runDataValidation()`
3. **Add sources** - Update MetricCard and ChartContainer instances with dataSource props
4. **Verify coverage** - Aim for 80%+ attribution coverage
5. **Enable attribution** - Add `showAttribution={true}` to user-facing components

## Support

For questions or issues:
- Check `/src/utils/README.md` for detailed API docs
- Run `window.__runDataValidation()` to see coverage report
- Check console for validation warnings
- Verify service files are logging API calls correctly

## Success Metrics

The framework is working correctly when you see:

✅ Console logs for every API call with full URL + timestamp
✅ Coverage report showing 80%+ attribution
✅ No "suspicious data" warnings in validation
✅ All MetricCards and ChartContainers have data-source attributes
✅ Zero validation overhead in production builds

---

**Framework Status: ✅ Complete and Ready for Integration**
