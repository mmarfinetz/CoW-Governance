-- Query: CoW DAO Monthly Revenue & Treasury
-- Query ID: 3700123
-- Version: 1.0
-- Description: Monthly DAO revenue aggregation including treasury composition
-- Author: CoW Protocol Team
-- Source: https://github.com/cowprotocol/dune-queries
-- Last Updated: 2024-01-15

SELECT
    month,
    total_revenue_usd,
    fee_revenue_usd,
    solver_revenue_usd,
    treasury_balance_usd,
    token_holdings,
    stable_holdings
FROM cow_protocol.monthly_dao_revenue
WHERE month >= DATE_TRUNC('month', NOW() - INTERVAL '12 months')
ORDER BY month DESC;
