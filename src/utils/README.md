# Data Validation Framework

This framework ensures NO MOCK DATA and provides complete data source transparency for the CoW DAO Governance Dashboard.

## Quick Start

### 1. Enable Development Validator

Add to your main `App.jsx` or entry point:

```javascript
import { initDevValidator } from './utils/devValidator';

// In your component or app initialization
useEffect(() => {
  if (import.meta.env.DEV) {
    initDevValidator();
  }
}, []);
```

### 2. Add Data Source Attributes to Components

#### MetricCard Example

```jsx
<MetricCard
  title="Total Proposals"
  value={proposalCount}
  color="blue"
  dataSource="snapshot:proposals"
  lastUpdated={lastUpdated}
  endpoint="https://hub.snapshot.org/graphql"
  showAttribution={true}  // Optional: displays source footer
/>
```

#### ChartContainer Example

```jsx
<ChartContainer
  title="Treasury Composition"
  dataSource="dune:treasury"
  lastUpdated={treasuryData.timestamp}
  endpoint="https://api.dune.com/api/v1/query/12345/results"
  showAttribution={true}
>
  <PieChart data={treasuryData.composition} />
</ChartContainer>
```

### 3. Validate Data in Hooks

```javascript
import { validateRealData } from '../utils/dataValidator';

export function useProposalData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const proposals = await fetchProposals();

      // Validate in development
      if (import.meta.env.DEV) {
        validateRealData(proposals, 'useProposalData');
      }

      setData(proposals);
    }
    fetchData();
  }, []);

  return data;
}
```

## API Logging

All service files now automatically log API calls in this format:

```
[ServiceName] Fetching from: <URL> (params) <timestamp>
[ServiceName] Received <count> records at <timestamp>
```

Example output:
```
[SnapshotService] Fetching from: https://hub.snapshot.org/graphql (space: cow.eth, limit: 100) 2025-10-08T10:30:45.123Z
[SnapshotService] Received 87 proposals at 2025-10-08T10:30:46.456Z
```

## Data Source Naming Convention

Use this format: `<service>:<data-type>`

**Examples:**
- `snapshot:proposals` - Proposals from Snapshot
- `snapshot:votes` - Votes from Snapshot
- `dune:treasury` - Treasury data from Dune
- `dune:revenue` - Revenue data from Dune
- `coingecko:price` - Token price from CoinGecko
- `etherscan:holders` - Holder count from Etherscan
- `safe:balances` - Safe wallet balances
- `cowprotocol:metrics` - Protocol metrics from CoW API

## Validation Functions

### validateRealData(data, componentName)

Scans data for suspicious patterns:
- Round numbers (10000, 50000, etc.)
- Placeholder text (lorem, test, mock, example)
- Default dates (1970, 2020-01-01)

```javascript
const { valid, warnings } = validateRealData(myData, 'MyComponent');
// Returns: { valid: true/false, warnings: ['warning1', 'warning2'] }
```

### validateRequiredFields(data, requiredFields)

Ensures all required fields are present:

```javascript
const { valid, missing } = validateRequiredFields(proposal, [
  'id',
  'title',
  'state',
  'created'
]);
// Returns: { valid: true/false, missing: ['field1', 'field2'] }
```

### validateBounds(value, bounds)

Validates numeric values are within reasonable ranges:

```javascript
const { valid, warning } = validateBounds(price, {
  min: 0,
  max: 1000,
  label: 'COW Price'
});
```

### validateTimestampFreshness(timestamp, maxAgeMs)

Checks if data is fresh:

```javascript
const { valid, age, warning } = validateTimestampFreshness(
  data.timestamp,
  3600000  // 1 hour
);
```

## Development Tools

When running in development mode, these tools are available in the browser console:

```javascript
// Run full validation report
window.__runDataValidation()

// Validate specific data
window.__validateData(myData, 'ComponentName')
```

## Data Source Attribution Component

### DataSourceAttribution

Full-width footer for cards and charts:

```jsx
<DataSourceAttribution
  source="snapshot:proposals"
  timestamp={new Date()}
  endpoint="https://hub.snapshot.org/graphql"
/>
```

### DataSourceAttribution (inline)

Compact inline version:

```jsx
<DataSourceAttribution
  source="snapshot:proposals"
  timestamp={new Date()}
  inline={true}
/>
```

### DataSourceBadge

Minimal badge for tight spaces:

```jsx
import { DataSourceBadge } from './DataSourceAttribution';

<DataSourceBadge source="snapshot" />
```

## Validation Report

The dev validator automatically generates a coverage report:

```
[Dev Validator] Data Source Attribution Report
✓ Coverage: 95.2%
  Attributed: 120
  Missing: 6
  Total: 126

⚠️ 6 component(s) missing data-source attribution
  • .metric-card
    Content: "Total Proposals: 87..."
  • .chart-container
    Content: "Treasury Value: $2.5M..."
  ...

✓ 120 attributed elements
  snapshot: 45
  dune: 38
  coingecko: 15
  etherscan: 12
  safe: 8
  cowprotocol: 2
```

## Best Practices

### ✅ DO

- Always add `data-source` attribute to components displaying data
- Log API calls with full URL and timestamp
- Validate data in development mode
- Use cached data wrappers to avoid redundant validations
- Show attribution footer on user-facing dashboards

### ❌ DON'T

- Don't block rendering based on validation (warnings only)
- Don't run validation in production (use `import.meta.env.DEV` checks)
- Don't use generic sources like "api" or "data" (be specific)
- Don't skip logging for internal/private endpoints (transparency is key)

## Service File Template

When adding new API endpoints, follow this pattern:

```javascript
export async function fetchNewData() {
  try {
    const url = `${BASE_URL}/endpoint`;
    console.log('[MyService] Fetching from:', url, '(params)', new Date().toISOString());

    const response = await axios.get(url);
    const data = response.data;

    console.log('[MyService] Received', data.length, 'items at', new Date().toISOString());

    return {
      ...data,
      timestamp: new Date()  // Always include timestamp
    };
  } catch (error) {
    console.error('Error fetching new data:', error);
    throw error;
  }
}
```

## Troubleshooting

### "Missing data-source attribution" warnings

Add `data-source` attribute to the component:
```jsx
<div data-source="snapshot:proposals">...</div>
```

### "Suspicious round number" warnings

Ensure you're fetching real data, not using hardcoded values:
```javascript
// ❌ Bad
const totalValue = 1000000;

// ✅ Good
const totalValue = await fetchTreasuryValue();
```

### Validation not running

Check that dev validator is initialized:
```javascript
// In App.jsx
import { initDevValidator } from './utils/devValidator';

useEffect(() => {
  initDevValidator();
}, []);
```

## Performance

- All validation runs **only in development mode**
- Zero performance impact in production builds
- DOM scanning is debounced (1 second delay)
- Validation results are cached to avoid re-scanning

## Integration Checklist

- [ ] Import and initialize `initDevValidator()` in App.jsx
- [ ] Add `dataSource` prop to all MetricCard components
- [ ] Add `dataSource` prop to all ChartContainer components
- [ ] Add `data-source` attribute to custom data display components
- [ ] Verify all service files log API calls
- [ ] Run `window.__runDataValidation()` in console
- [ ] Aim for 80%+ attribution coverage
- [ ] Add `showAttribution={true}` to user-facing components

## Future Enhancements

- [ ] Add runtime data schema validation (Zod/Yup)
- [ ] Track API call success/failure rates
- [ ] Add performance metrics (API response times)
- [ ] Create dashboard showing data freshness across all sources
- [ ] Add E2E tests to verify no mock data in production
