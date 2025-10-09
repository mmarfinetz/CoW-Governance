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
// ❌ Problem: fetchData is recreated on every render
const fetchData = async () => {
  // ... fetch logic ...
};

useEffect(() => {
  fetchData();
}, [/* missing fetchData dependency */]);
```

The `fetchData` function was not memoized, so it was recreated on every render. This caused:
1. The `refetch` function returned from the hook to change on every render
2. Any component using `refetch` would re-render infinitely
3. Violating React's exhaustive-deps rule (which we had to disable)

## Solution

### Wrapped fetchData in useCallback

The proper fix was to wrap the `fetchData` function in `useCallback` with the correct dependencies:

```javascript
// ✅ Fixed: Stable fetchData function
const { filterByTimeRange, dateRange } = useTimeRange();

const fetchData = useCallback(async () => {
  // ... fetch logic using filterByTimeRange ...
}, [filterByTimeRange]); // Only recreate when filterByTimeRange changes

useEffect(() => {
  if (shouldFetch) {
    fetchData();
  }
}, [shouldFetch, fetchData]); // Depend on the stable fetchData
```

### Why This Works

1. **`fetchData`** is now memoized and only recreates when `filterByTimeRange` changes
2. **`filterByTimeRange`** is stable (wrapped in `useCallback` in TimeRangeContext)
3. The `useEffect` depends on the **stable `fetchData` function** instead of trying to skip dependencies
4. The `refetch` function returned from the hook is now stable
5. Follows React best practices - memoize functions that are used as dependencies

## Files Changed

1. **src/hooks/useProposalData.js**
   - Added `useCallback` import
   - Wrapped `fetchData` in `useCallback` with `[filterByTimeRange]` dependency
   - Changed `useEffect` to depend on `[shouldFetch, fetchData]`
   - `refetch` function is now stable

2. **src/hooks/useGovernanceData.js**
   - Added `useCallback` import
   - Wrapped `fetchData` in `useCallback` with `[filterByTimeRange]` dependency
   - Changed `useEffect` to depend on `[fetchData]`
   - `refetch` function is now stable

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

1. ✅ **Wrap functions in `useCallback`** if they're used as dependencies in `useEffect`
2. ✅ **Include all dependencies** in `useEffect` - don't use eslint-disable
3. ✅ Use `useCallback` for functions that are passed as props, context, or returned from hooks
4. ✅ Use `useMemo` for objects/arrays in context values
5. ✅ If a function is used in multiple places, memoize it at the source (context/hook)
6. ✅ Monitor browser console for "Maximum update depth" warnings

## Deployment

Ready to deploy. All changes tested and verified.

```bash
git push
# Vercel will auto-deploy to https://gov-dashboard-amber.vercel.app
```

## Summary

The Proposals tab error was caused by unstable function references in `useEffect` dependencies. The `fetchData` function was being recreated on every render, causing infinite loops when used as a dependency or returned as `refetch`. By wrapping `fetchData` in `useCallback` with proper dependencies, we've created stable function references that only change when the underlying data (`filterByTimeRange`) actually changes. This eliminates all infinite loop issues and the dashboard now runs smoothly across all tabs.

