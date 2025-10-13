# CoW DAO Governance Dashboard - Dune Queries

This directory contains SQL queries used by the CoW DAO Governance Dashboard to fetch data from Dune Analytics.

## Query Structure

Each SQL file represents a Dune Analytics query with the following metadata:

- **Query Name**: Descriptive name of the query
- **Query ID**: Dune Analytics query identifier
- **Version**: Query version number (semantic versioning)
- **Description**: What data the query fetches
- **Author**: Query author
- **Source**: Link to CoW Protocol's official dune-queries repository
- **Last Updated**: Date of last query modification

## Current Queries

### 1. treasury.sql
- **ID**: 3700123
- **Version**: 1.0
- **Purpose**: Monthly DAO revenue and treasury composition
- **Usage**: Powers the Treasury Dashboard section

### 2. revenue.sql
- **ID**: 3700123
- **Version**: 1.0
- **Purpose**: Detailed breakdown of DAO revenue sources
- **Usage**: Revenue analytics and trend charts

### 3. solverRewards.sql
- **ID**: 5270914
- **Version**: 1.0
- **Purpose**: Solver competition metrics and rewards
- **Usage**: Solver performance tracking and analytics

### 4. solverInfo.sql
- **ID**: 5533118
- **Version**: 1.0
- **Purpose**: Solver conversion prices and efficiency metrics
- **Usage**: Solver detailed performance analysis

## Configuration

Query IDs and versions are centrally managed in:
- `/src/config/govConfig.json` - Master configuration file
- `/src/config/apiConfig.js` - Runtime API configuration

## Version Tracking

The Query Version Service (`/src/services/queryVersionService.js`) provides:

1. **GitHub Integration**: Fetches queries from CoW Protocol's official repository
2. **Version Comparison**: Compares local versions with GitHub versions
3. **Validation**: Ensures query IDs match configuration

## Updating Queries

When updating a query:

1. **Update SQL File**: Modify the `.sql` file in this directory
2. **Update Version**: Increment version number in SQL comment header
3. **Update govConfig.json**: Update version in `/src/config/govConfig.json`
4. **Test**: Verify query works in Dune Analytics
5. **Document**: Update this README if adding new queries

## Official Source

All queries are based on CoW Protocol's official Dune queries repository:
https://github.com/cowprotocol/dune-queries

## Query Execution

Queries are executed via:
- **Dune Analytics API**: `/src/services/duneService.js`
- **Caching**: Results cached per `govConfig.json` cache durations
- **Error Handling**: Graceful fallbacks in service layer

## Monitoring

View query status via:
- **Configuration Modal**: Click "Configuration" button in app footer
- **Console Logs**: Startup validation logs query versions
- **Cache Tab**: Monitor query cache status and age

## Delegation Data

For delegation analytics, the dashboard uses:
- **Snapshot GraphQL API**: Off-chain proposals, votes, and delegation data
- **Snapshot Delegate Registry**: On-chain delegation records stored at `0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446`
- **Token Balances**: COW and vCOW balances from EVM chains

### Key Delegation Contracts

| Contract | Address | Chain | Purpose |
|----------|---------|-------|---------|
| COW Token | `0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB` | Ethereum | Main COW token |
| vCOW Token | `0xD057B63f5E69CF1B929b356b579Cba08D7688048` | Ethereum | Vesting COW |
| Delegate Registry | `0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446` | Multi-chain | On-chain delegation records |

### Delegation Metrics Available

- Current delegated voting power per delegate
- Delegation flows (gained/lost)
- Number of delegators per delegate
- Participation rate per delegate
- Historical delegation changes

For detailed delegation analytics, refer to:
- `/src/services/delegationService.js` - Delegation data fetching
- `/src/hooks/useDelegationData.js` - Delegation data hook
- `/src/components/delegation/` - Delegation UI components
