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
