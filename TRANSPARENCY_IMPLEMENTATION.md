# Methodology Documentation & Data Reconciliation Implementation

## Overview

This document provides a comprehensive summary of the transparency features implemented in the CoW DAO Governance Dashboard. All components maintain 100% transparency by showing REAL API comparisons and NEVER suppressing data discrepancies.

## Implementation Summary

### 1. Metric Definitions Config (`src/config/metricDefinitions.js`)

**Purpose**: Centralized source of truth for all metric formulas, calculations, and data sources.

**Features**:
- 30+ comprehensive metric definitions covering governance, token, treasury, and solver metrics
- Each definition includes:
  - `name`: Human-readable metric name
  - `formula`: Mathematical formula or query logic
  - `calculation`: Plain English explanation
  - `source`: Primary data source (API name)
  - `endpoint`: Full API endpoint URL
  - `updateFrequency`: Cache duration
  - `unit`: Measurement unit
  - `category`: Metric category (governance, token, treasury, solver)
  - `alternativeSource` (optional): Secondary data source for cross-validation

**Helper Functions**:
- `getMetricDefinition(key)`: Retrieve single metric definition
- `getMetricsByCategory(category)`: Filter metrics by category
- `getCategories()`: Get all available categories
- `searchMetrics(query)`: Search metrics by name/description

**Example Definition**:
```javascript
treasuryValue: {
  name: 'Treasury Total Value',
  formula: 'SUM(token_balance × token_price_usd) from Dune',
  calculation: 'Total USD value of all assets in CoW DAO treasury',
  source: 'Dune Analytics Query #3700123',
  endpoint: 'https://api.dune.com/api/v1/query/3700123/results',
  updateFrequency: '1 hour',
  unit: 'USD',
  category: 'treasury',
  alternativeSource: 'Safe Transaction Service API'
}
```

---

### 2. Reconciliation Service (`src/services/reconciliationService.js`)

**Purpose**: Compare metrics from multiple data sources and detect discrepancies using REAL API responses.

**Core Functions**:

#### `compareProposalCount()`
- Fetches proposal count from Snapshot GraphQL API
- Logs source URL and values
- Returns comparison object with timestamp

#### `compareTreasuryValue()` ⭐ Critical Comparison
- Fetches treasury data from **Dune Analytics** AND **Safe Transaction Service API** in parallel
- Calculates variance percentage: `|value1 - value2| / avg × 100`
- Logs both source URLs with actual values
- Status levels:
  - `ok`: Variance < 5%
  - `warning`: Variance 5-10%
  - `error`: API failure
  - `partial`: Only one source available

**Console Output Example**:
```
🔍 [Reconciliation] Comparing treasury value from Dune vs Safe API...
✅ Dune Analytics: $12,345,678 USD
   Source: https://api.dune.com/api/v1/query/3700123/results
✅ Safe API: $12,400,000 USD
   Source: https://safe-transaction-mainnet.safe.global/api/v1/safes/.../balances
⚠️  [Reconciliation] Treasury variance: 0.44%
```

#### `compareVotingPower()`
- Validates internal consistency of Snapshot data
- Checks: quorum vs participation, avg vs max votes
- Identifies anomalies (e.g., avg participation > quorum × 2)

#### `runReconciliation()`
- Executes all comparisons in parallel
- Generates comprehensive report with:
  - Timestamp
  - Duration (ms)
  - Individual comparison results
  - Summary statistics (ok/warnings/errors)
- **NEVER suppresses discrepancies** - all are logged and reported

#### Background Scheduling
- `startReconciliationSchedule()`: Runs reconciliation every hour
- `stopReconciliationSchedule()`: Stops background checks
- Automatic on app initialization

**Report Structure**:
```javascript
{
  timestamp: "2025-10-08T12:34:56.789Z",
  duration: 2500,
  comparisons: {
    treasuryValue: {
      metric: "treasuryValue",
      status: "warning",
      variance: 7.5,
      message: "Significant variance detected...",
      sources: {
        dune: { value: 12345678, url: "...", timestamp: "..." },
        safe: { value: 13000000, url: "...", timestamp: "..." }
      }
    }
  },
  summary: {
    total: 3,
    ok: 1,
    warnings: 1,
    errors: 1
  }
}
```

---

### 3. Reconciliation Report Utility (`src/utils/reconciliationReport.js`)

**Purpose**: Manage reconciliation report storage, export, and historical analysis.

**Core Functions**:

#### `generateReconciliationReport(reconciliationData)`
- Formats reconciliation data for export
- Adds metadata (version, user agent, URL)
- Returns JSON-serializable report

#### `saveReconciliationReport(report)`
- Saves to `localStorage` under key `cow_dao_reconciliation_reports`
- Maintains last 50 reports (configurable via `MAX_STORED_REPORTS`)
- Auto-trims old reports

#### `getReconciliationHistory()`
- Retrieves all stored reports from localStorage
- Returns array sorted by timestamp (newest first)

#### `downloadReconciliationReport(report, filename?)`
- Generates downloadable JSON file
- Filename format: `cow-dao-reconciliation-YYYY-MM-DD-HHmmss.json`
- Triggers browser download

#### `getHistorySummary()`
- Calculates aggregate statistics:
  - Total reports
  - Average variance across all metrics
  - Warning count
  - Error count
  - Last run timestamp

#### `getVarianceTrend(metricKey, limit)`
- Returns variance history for specific metric
- Useful for charting trends over time

#### `findHighVarianceReports(threshold)`
- Filters reports with variance > threshold
- Helps identify persistent discrepancies

---

### 4. Updated InfoTooltip Component (`src/components/shared/InfoTooltip.jsx`)

**New Features**:
- **`metric` prop**: Pass metric key to auto-populate definition
- Displays formula, source, and update frequency in tooltip
- Max-width styling for readability
- Fallback to custom `content` prop if no metric provided

**Usage**:
```jsx
<InfoTooltip metric="treasuryValue" />
// Shows: Name, calculation, formula, source, update frequency

<InfoTooltip content="Custom tooltip text" />
// Shows: Custom content (original behavior)
```

---

### 5. MethodologyModal Component (`src/components/modals/MethodologyModal.jsx`)

**Purpose**: Full-screen modal displaying all metric definitions with search and filtering.

**Features**:
- **Search**: Real-time search by metric name or description
- **Category Filter**: Filter by governance, token, treasury, solver
- **Expandable Cards**: Click "More" to see full details (endpoint, update frequency, unit)
- **Color-coded Categories**: Visual distinction (blue, green, purple, orange)
- **Responsive Design**: Mobile-friendly layout

**User Experience**:
1. Click "Methodology" button in dashboard header
2. Search for specific metrics
3. Filter by category
4. Expand cards to see technical details
5. Click "Close" or ESC to dismiss

**Card Structure**:
```
┌─────────────────────────────────────────┐
│ Metric Name                    [Category]│
│ Calculation explanation                  │
│                                          │
│ Formula: [code block]                    │
│ Source: API name                         │
│                              [More ▼]    │
│ ─────────────────────────────────────    │
│ Endpoint: [full URL]                     │
│ Updates: Every X minutes                 │
│ Unit: COW tokens / USD / count           │
│ Alternative: [if applicable]             │
└─────────────────────────────────────────┘
```

---

### 6. DataDiscrepancyWarning Component (`src/components/shared/DataDiscrepancyWarning.jsx`)

**Purpose**: Display warning banners when data variance exceeds threshold.

**Features**:
- **Severity Levels**:
  - Error (red): API failure
  - High (orange): Variance > 10%
  - Medium (yellow): Variance 5-10%
  - Low (blue): Variance < 5% but worth noting
- **Source Comparison**: Shows values from all sources side-by-side
- **Source Links**: Click "Source" to view API endpoint
- **Variance Display**: Shows exact percentage difference
- **Dismissible**: Click X to hide (does not suppress logging)
- **Learn More Button**: Opens MethodologyModal for context
- **Transparency Note**: Footer explaining discrepancies

**Warning Example**:
```
⚠️ Data Discrepancy Detected
Data discrepancy detected: Snapshot shows 1000, Dune shows 950

Dune: 12,345,678    [Source →]
Safe: 13,000,000    [Source →]

Variance: 5.02%

[Learn More]                        [×]

────────────────────────────────────────
This dashboard maintains full transparency
by showing all data discrepancies. Variances
may occur due to timing differences, data
aggregation methods, or API rate limits.
```

**Multiple Warnings**:
- `DataDiscrepancyWarnings` component shows all warnings in a stacked layout
- Each warning is independently dismissible

---

### 7. Updated GovernanceOverview Component

**New Features Added**:

#### Header Section
- **"Methodology" Button**: Opens MethodologyModal
- **"Report" Button**: Downloads latest reconciliation report (JSON)
- **Last Reconciled Timestamp**: Shows when data was last checked

#### Reconciliation Integration
- Runs `runReconciliation()` on component mount
- Displays `DataDiscrepancyWarnings` if variance detected
- Saves reports to localStorage automatically
- Re-runs hourly in background (via service)

#### User Flow
1. Dashboard loads
2. Reconciliation runs in background
3. If variance > 5%, warning banner appears
4. User clicks "Learn More" → MethodologyModal opens
5. User clicks "Report" → JSON file downloads
6. Warnings are logged to console with full URLs

---

## Reconciliation Logic Verification

### Comparison: Treasury Value (Dune vs Safe API)

**Dune Analytics**:
- Endpoint: `https://api.dune.com/api/v1/query/3700123/results`
- Query: Aggregates on-chain token balances from CoW DAO treasury addresses
- Returns: `totalValue` (sum of all assets in USD)

**Safe Transaction Service**:
- Endpoint: `https://safe-transaction-mainnet.safe.global/api/v1/safes/{address}/balances`
- Query: Direct multisig wallet balances from Safe API
- Returns: Array of token balances with USD values

**Variance Calculation**:
```javascript
const avg = (duneValue + safeValue) / 2;
const variance = Math.abs(duneValue - safeValue) / avg * 100;
```

**Why Variance Occurs**:
- **Timing**: Dune data may be cached (last query run), Safe API is real-time
- **Coverage**: Dune aggregates multiple addresses, Safe API is single multisig
- **Price Feeds**: Different USD price sources (CoinGecko vs Safe's oracle)
- **Update Lag**: Dune queries run asynchronously, may be stale

**Example Logged Output**:
```
🔍 [Reconciliation] Comparing treasury value from Dune vs Safe API...
✅ Dune Analytics: $12,345,678 USD
   Source: https://api.dune.com/api/v1/query/3700123/results
✅ Safe API: $12,400,000 USD
   Source: https://safe-transaction-mainnet.safe.global/api/v1/safes/0xA03...930/balances
✅ [Reconciliation] Treasury values match within 0.44%
```

---

## Files Created/Modified

### New Files
1. `/src/config/metricDefinitions.js` - Metric definitions config (350 lines)
2. `/src/services/reconciliationService.js` - Reconciliation logic (280 lines)
3. `/src/utils/reconciliationReport.js` - Report utilities (220 lines)
4. `/src/components/modals/MethodologyModal.jsx` - Methodology modal (240 lines)
5. `/src/components/shared/DataDiscrepancyWarning.jsx` - Warning component (200 lines)

### Modified Files
1. `/src/components/shared/InfoTooltip.jsx` - Added metric prop support
2. `/src/components/sections/GovernanceOverview.jsx` - Added methodology + reconciliation

### Backup Files
- `/src/components/sections/GovernanceOverview_Backup.jsx` - Original component

---

## Usage Examples

### Using InfoTooltip with Metric Definitions
```jsx
import { InfoTooltip } from './components/shared/InfoTooltip';

<MetricCard
  title="Treasury Size"
  value="$12.5M"
  icon={DollarSign}
>
  <InfoTooltip metric="treasuryValue" />
</MetricCard>
```

### Running Manual Reconciliation
```javascript
import { runReconciliation } from './services/reconciliationService';
import { downloadReconciliationReport } from './utils/reconciliationReport';

const report = await runReconciliation();
console.log(report);
downloadReconciliationReport(report);
```

### Accessing Reconciliation History
```javascript
import { getReconciliationHistory, getHistorySummary } from './utils/reconciliationReport';

const history = getReconciliationHistory(); // Last 50 reports
const summary = getHistorySummary(); // Aggregate stats
console.log(`Average variance: ${summary.avgVariance}%`);
```

---

## Testing Checklist

- [x] Metric definitions config exports all 30+ metrics
- [x] Reconciliation service fetches from REAL APIs (Dune, Safe, Snapshot)
- [x] Treasury comparison logs both source URLs
- [x] Variance calculation matches formula: `|v1-v2|/avg*100`
- [x] Reports are saved to localStorage
- [x] Report download generates valid JSON
- [x] InfoTooltip displays metric definitions
- [x] MethodologyModal opens and is searchable/filterable
- [x] DataDiscrepancyWarning shows when variance > 5%
- [x] Warning includes source links and exact variance
- [x] GovernanceOverview displays methodology button
- [x] Reconciliation runs on mount
- [x] Background hourly checks scheduled

---

## Critical Requirements Met

✅ **Compare REAL API responses**: All comparisons use actual Snapshot, Dune, and Safe APIs
✅ **Log all comparisons with URLs and values**: Console logs show full endpoints and data
✅ **Never suppress discrepancies**: Warnings always shown, never hidden
✅ **Reconciliation report is JSON serializable**: All reports export as valid JSON
✅ **Hourly checks run in background**: `startReconciliationSchedule()` runs every 60 minutes
✅ **Transparent metric definitions**: All formulas, sources, and calculations documented
✅ **Downloadable reports**: Users can export reconciliation data as JSON
✅ **Historical tracking**: Last 50 reports stored in localStorage

---

## Future Enhancements

1. **Chart Variance Trends**: Visualize variance over time using `getVarianceTrend()`
2. **Email Alerts**: Notify admins when variance > 10%
3. **Additional Comparisons**: Add holder count (Etherscan vs Dune)
4. **API Health Dashboard**: Show uptime/latency for each data source
5. **Automated Testing**: Unit tests for variance calculations
6. **Export History**: Download all 50 reports as single archive

---

## Developer Notes

- All reconciliation logic is centralized in `reconciliationService.js`
- Metric definitions are version-controlled in `metricDefinitions.js`
- localStorage key: `cow_dao_reconciliation_reports`
- Max stored reports: 50 (configurable via `MAX_STORED_REPORTS`)
- Variance threshold: 5% (configurable in component props)
- Background check interval: 1 hour (60 * 60 * 1000 ms)

---

**Implementation Complete**: All transparency components created with full reconciliation logic verification.
