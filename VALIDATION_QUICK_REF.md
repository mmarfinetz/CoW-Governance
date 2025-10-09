# Data Validation Framework - Quick Reference

## 🚀 3-Step Setup

### Step 1: Initialize (App.jsx)
```javascript
import { initDevValidator } from './utils/devValidator';

useEffect(() => {
  initDevValidator();
}, []);
```

### Step 2: Add Data Sources
```jsx
// MetricCard
<MetricCard
  title="Total Proposals"
  value={count}
  dataSource="snapshot:proposals"
  lastUpdated={timestamp}
  showAttribution={true}  // Optional
/>

// ChartContainer
<ChartContainer
  title="Treasury"
  dataSource="dune:treasury"
  lastUpdated={timestamp}
  showAttribution={true}  // Optional
>
  <Chart />
</ChartContainer>
```

### Step 3: Verify
```javascript
// Browser console
window.__runDataValidation()
```

---

## 📝 Data Source Convention

Format: `service:datatype`

```javascript
// Examples
"snapshot:proposals"
"snapshot:votes"
"dune:treasury"
"dune:revenue"
"coingecko:price"
"etherscan:holders"
"safe:balances"
"cowprotocol:health"
```

---

## 🔍 Console Commands

```javascript
// Run full validation report
window.__runDataValidation()

// Validate specific data
window.__validateData(data, 'ComponentName')
```

---

## 📦 Import Statements

```javascript
// Validation utilities
import {
  validateRealData,
  validateRequiredFields,
  validateBounds,
  validateTimestampFreshness,
  devOnlyValidation
} from '../utils/dataValidator';

// Dev validator
import {
  initDevValidator,
  runDevValidation,
  scanDataSourceAttributes
} from '../utils/devValidator';

// Attribution components
import {
  DataSourceAttribution,
  DataSourceBadge
} from '../components/shared/DataSourceAttribution';
```

---

## 🎯 Common Patterns

### Validate in Hook
```javascript
export function useProposalData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const proposals = await fetchProposals();

      // Validate
      devOnlyValidation(validateRealData, proposals, 'useProposalData');

      setData({ proposals, lastUpdated: new Date() });
    }
    fetchData();
  }, []);

  return data;
}
```

### Custom Component with Data Source
```jsx
export function MyDataComponent({ data }) {
  return (
    <div data-source="snapshot:proposals">
      <h3>{data.title}</h3>
      <p>{data.value}</p>
    </div>
  );
}
```

### Inline Attribution
```jsx
<div className="metric">
  <span>{value}</span>
  <DataSourceAttribution
    source="snapshot:proposals"
    timestamp={timestamp}
    inline={true}
  />
</div>
```

---

## ✅ Checklist

- [ ] `initDevValidator()` added to App.jsx
- [ ] All MetricCards have `dataSource` prop
- [ ] All ChartContainers have `dataSource` prop
- [ ] Run `window.__runDataValidation()`
- [ ] Coverage above 80%
- [ ] No suspicious data warnings
- [ ] API logs visible in console

---

## 🎨 Attribution Components

### Full Footer
```jsx
<DataSourceAttribution
  source="snapshot:proposals"
  timestamp={new Date()}
  endpoint="https://hub.snapshot.org/graphql"
/>
```

### Inline (Compact)
```jsx
<DataSourceAttribution
  source="snapshot:proposals"
  timestamp={new Date()}
  inline={true}
/>
```

### Badge Only
```jsx
<DataSourceBadge source="snapshot" />
```

---

## 🔧 Validation Functions

### validateRealData
```javascript
const { valid, warnings } = validateRealData(data, 'ComponentName');
```

### validateRequiredFields
```javascript
const { valid, missing } = validateRequiredFields(data, ['id', 'title']);
```

### validateBounds
```javascript
const { valid, warning } = validateBounds(value, {
  min: 0,
  max: 1000,
  label: 'Price'
});
```

### validateTimestampFreshness
```javascript
const { valid, age, warning } = validateTimestampFreshness(
  timestamp,
  3600000  // 1 hour
);
```

---

## 📊 Expected Console Output

```
[Dev Validator] Initialized - monitoring DOM for data source attributions

[SnapshotService] Fetching from: https://hub.snapshot.org/graphql (space: cow.eth, limit: 100) 2025-10-08T10:30:45.123Z
[SnapshotService] Received 87 proposals at 2025-10-08T10:30:46.456Z

[DuneService] Fetching results from: https://api.dune.com/api/v1/query/3667383/results (queryId: 3667383) 2025-10-08T10:30:47.000Z
[DuneService] Received 12 rows at 2025-10-08T10:30:48.234Z

[Dev Validator] Data Source Attribution Report
✓ Coverage: 95.2%
  Attributed: 120
  Missing: 6
  Total: 126

✓ 120 attributed elements
  snapshot: 45
  dune: 38
  coingecko: 15
  etherscan: 12
  safe: 8
  cowprotocol: 2
```

---

## ⚠️ Warning Patterns

### Suspicious Data
- Round numbers: 10000, 50000, 100000
- Placeholder text: lorem, test, mock, example
- Default dates: 1970-01-01, 2020-01-01

### Missing Attribution
- Components without `data-source` attribute
- Custom data displays without source

---

## 📚 Full Documentation

- **API Docs:** `/src/utils/README.md`
- **Integration Guide:** `/VALIDATION_INTEGRATION.md`
- **Summary:** `/DATA_VALIDATION_SUMMARY.md`

---

## 🎯 Success Criteria

✅ Console shows API logs with URLs + timestamps
✅ Coverage report > 80%
✅ No suspicious data warnings
✅ All metrics have `data-source` attributes
✅ Zero production overhead

---

**Quick Ref v1.0 - Data Validation Framework**
