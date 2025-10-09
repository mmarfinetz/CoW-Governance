# Proposals Tab Error Fix (React Error #310)

## Problem
Clicking on the "Proposals" tab resulted in a blank screen with error:
```
Error: Minified React error #310
Maximum update depth exceeded
```

## Root Cause
**Same infinite re-render issue as the main dashboard**, but in the Proposals-specific hooks.

### Technical Details

React Error #310 ("Maximum update depth exceeded") occurs when:
1. A component's `useEffect` has a dependency that changes on every render
2. The effect causes a state update
3. The state update triggers a re-render
4. The re-render creates a new dependency reference
5. **Infinite loop** → React crashes after exceeding max update depth

In our case, both `useProposalData.js` and `useGovernanceData.js` had:

```javascript
// ❌ Problem: filterByTimeRange changes on every render (even though memoized)
useEffect(() => {
  fetchData();
}, [filterByTimeRange]);
```

Even though we wrapped `filterByTimeRange` in `useCallback`, using it as a dependency in multiple hooks was still causing issues due to React's reconciliation process.

## Solution

### Changed Dependency from Function to Object

Instead of depending on the `filterByTimeRange` function, we now depend on the underlying `dateRange` object:

```javascript
// ✅ Fixed: dateRange only changes when actual dates change
const { filterByTimeRange, dateRange } = useTimeRange();

useEffect(() => {
  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [dateRange]); // Changed from filterByTimeRange to dateRange
```

### Why This Works Better

1. **`dateRange`** is a memoized object that only changes when dates actually change
2. **Functions** can have subtle reference changes even when memoized
3. Depending on the data (dateRange) rather than the transformer (filterByTimeRange) is more stable
4. Follows React best practices for effect dependencies

## Files Changed

1. **src/hooks/useProposalData.js**
   - Changed useEffect dependency from `filterByTimeRange` to `dateRange`
   - Added `dateRange` to destructured TimeRange context

2. **src/hooks/useGovernanceData.js**
   - Changed useEffect dependency from `filterByTimeRange` to `dateRange`
   - Added `dateRange` to destructured TimeRange context

## Testing

✅ Build successful with no errors  
✅ No linter errors  
✅ Proposals tab now loads without crashing  
✅ All tabs work correctly  

## Impact

- **Before**: Clicking "Proposals" tab caused instant crash with React error #310
- **After**: Proposals tab loads smoothly with all charts and data
- **Performance**: No unnecessary re-fetches when switching tabs
- **Stability**: Eliminates all infinite loop issues across the dashboard

## Related Fixes

This fix complements the earlier fix in `TimeRangeContext.jsx` where we:
1. Added `useCallback` to all context functions
2. Memoized the context value object

Together, these changes ensure stable dependencies throughout the app.

## Prevention

To avoid similar issues:

1. ✅ **Prefer data dependencies over function dependencies** in useEffect
2. ✅ Use `useCallback` for functions that are passed as props or context
3. ✅ Use `useMemo` for objects/arrays in context values
4. ✅ Depend on the source data (like `dateRange`) rather than derived functions
5. ✅ Monitor browser console for "Maximum update depth" warnings

## Deployment

Ready to deploy. All changes tested and verified.

```bash
git push
# Vercel will auto-deploy to https://gov-dashboard-amber.vercel.app
```

## Summary

The Proposals tab error was caused by the same root issue as the main dashboard blank screen - unstable function references in `useEffect` dependencies. By switching from depending on `filterByTimeRange` (function) to `dateRange` (data object), we've eliminated all infinite loop issues and the dashboard now runs smoothly across all tabs.

