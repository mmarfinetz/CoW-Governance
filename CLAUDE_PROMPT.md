# Claude Code: Fix CoW DAO Governance Dashboard

## Context
This is a React dashboard for CoW DAO governance that fetches **100% real data** from public APIs (Snapshot, Dune Analytics, CoinGecko, Etherscan, Safe API). The project prioritizes the **subgraph as the source of truth** and **no mock data** should be used.

## Current Errors

### 1. Proposals Tab - React Hooks Violation
**Error**: "Rendered more hooks than during the previous render"
**Location**: `src/components/sections/ProposalAnalytics.jsx:31:37`
**Root Cause**: Conditional early return (lines 27-34) BEFORE `useMemo` hook (line 37) violates Rules of Hooks

**Fix Required**: 
- Move ALL hooks (useMemo on line 37) to the TOP of the component, before any conditional returns
- Hooks must ALWAYS be called in the same order on every render
- Never conditionally call hooks or call them after early returns

### 2. Treasury Tab - Missing API Keys
**Error**: "No treasury data available from APIs"
**Root Cause**: No `.env` file exists with `VITE_DUNE_API_KEY`

**Fix Required**:
- User needs to create `.env` file from `.env.example` and add their Dune API key
- Improve error messages to clearly indicate missing API keys
- Show helpful instructions in the UI when API keys are missing

### 3. Delegation Tab - API 400 Error
**Error**: "Request failed with status code 400"
**Location**: `src/hooks/useDelegationData.js` - Snapshot GraphQL query
**Possible Causes**:
- GraphQL query syntax may be incorrect for current Snapshot API
- The `delegations` query might not exist or has different field names
- Need to test query against Snapshot API documentation

**Fix Required**:
- Verify the correct GraphQL schema for Snapshot delegations API
- Test query independently before using in code
- Add better error handling with specific messages for 400 errors

### 4. Live Governance Tab - No Data
**Status**: May be legitimate if no active proposals exist
**Action**: Verify by checking https://snapshot.org/#/cow.eth manually

## Tasks to Complete

### Priority 1: Fix React Hooks Violation (CRITICAL)
1. Open `src/components/sections/ProposalAnalytics.jsx`
2. Move the `useMemo` hook (line 37) and the `columns` definition (lines 96-134) to the TOP of the component, immediately after the hooks on lines 18-19
3. Ensure ALL hooks are called unconditionally before any early returns
4. Test the Proposals tab loads without errors

### Priority 2: Setup Environment Variables
1. Verify `.env.example` exists (just created)
2. Guide user to create `.env` file: `cp .env.example .env`
3. User must add their Dune API key from https://dune.com/settings/api
4. Restart dev server after adding API keys

### Priority 3: Fix Delegation GraphQL Query
1. Review `src/hooks/useDelegationData.js` lines 12-26
2. Check Snapshot API documentation for correct delegation query schema
3. Test query using GraphQL playground or curl
4. Update query to match current API schema
5. Consider alternative: Use Snapshot's REST API if GraphQL delegations is deprecated

### Priority 4: Improve Error Handling
1. Add specific error messages for missing API keys (show which keys are missing)
2. Add helpful links to get API keys in error messages
3. Improve Treasury error message to distinguish between:
   - Missing API keys
   - API rate limits
   - Invalid API keys
   - Network errors

## Code Quality Standards

### React Best Practices
- ✅ All hooks at the top of components, before any conditionals
- ✅ No conditional hook calls
- ✅ Proper dependency arrays in useEffect/useMemo/useCallback
- ✅ Meaningful component and variable names
- ✅ Error boundaries for graceful failures

### API Integration Best Practices
- ✅ No mock data - only real API calls
- ✅ Clear error messages with actionable steps
- ✅ Proper loading states
- ✅ Cache data appropriately to avoid rate limits
- ✅ Handle partial failures gracefully

### Testing Approach
After each fix:
1. Clear browser cache and local storage
2. Restart dev server
3. Open browser console to check for errors
4. Verify data loads correctly
5. Check all dashboard tabs (Overview, Proposals, Treasury, Delegation, Live)

## Expected Outcome

After all fixes:
- ✅ Proposals tab loads without React errors, displays real proposal data with charts
- ✅ Treasury tab shows real treasury data from Dune + Safe (with valid API keys)
- ✅ Delegation tab displays real delegation data from Snapshot
- ✅ Live tab shows active proposals (if any exist)
- ✅ Clear, helpful error messages if API keys are missing
- ✅ No console errors
- ✅ All data from real APIs, no mock data

## Additional Context

### Key Files to Review
- `src/components/sections/ProposalAnalytics.jsx` - Hooks violation HERE
- `src/hooks/useDelegationData.js` - GraphQL 400 error HERE  
- `src/hooks/useTreasuryData.js` - Treasury data fetching
- `src/config/apiConfig.js` - API configuration and keys
- `src/services/snapshotService.js` - Snapshot API calls

### Project Constraints
- **Must use real APIs only** - No mock data allowed
- **Subgraph is source of truth** - Per project requirements
- **No DeFi Llama** - Removed per project requirements

### API Documentation
- Snapshot GraphQL: https://docs.snapshot.org/graphql-api
- Dune Analytics: https://docs.dune.com/api-reference/
- Safe API: https://docs.safe.global/safe-core-api/
- CoinGecko: https://www.coingecko.com/api/documentation
- Etherscan: https://docs.etherscan.io/

## Prompt for Claude

Copy and paste this into Claude Code:

---

**Goal**: Fix all errors in the CoW DAO Governance Dashboard so it runs 100% locally with no errors and no mock data.

**Current Issues**:
1. Proposals tab: React error "Rendered more hooks than during the previous render" in ProposalAnalytics.jsx line 37
2. Treasury tab: "No treasury data available" - missing VITE_DUNE_API_KEY in .env file  
3. Delegation tab: "Request failed with status code 400" - GraphQL query error in useDelegationData.js
4. Live tab: No active proposals showing

**Requirements**:
- Fix React hooks violation by moving ALL hooks to the top of ProposalAnalytics component before any conditional returns
- Create .env file instructions and improve error messages when API keys are missing
- Debug and fix Snapshot GraphQL delegation query (check API docs for correct schema)
- All data must come from real APIs - no mock data
- Clear console errors and ensure all 5 tabs work correctly

**Project context**: 
- React + Vite + Tailwind dashboard
- Uses Snapshot, Dune, CoinGecko, Etherscan, Safe APIs
- Subgraph is source of truth per memory
- See README.md and CLAUDE_PROMPT.md for full details

**Start with Priority 1** (React hooks violation in ProposalAnalytics.jsx) as it's blocking the Proposals tab completely.

---

## Success Criteria

✅ All 5 dashboard tabs load without errors
✅ Real data displays in all sections (with valid API keys)
✅ No React errors in console
✅ No "Rendered more hooks" errors
✅ Helpful error messages guide users to add API keys
✅ GraphQL queries work correctly with Snapshot API

