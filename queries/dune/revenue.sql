-- Query: CoW DAO Monthly Revenue Streams
-- Query ID: 3700123
-- Version: 1.0
-- Description: Detailed breakdown of DAO revenue sources
-- Author: CoW Protocol Team
-- Source: https://github.com/cowprotocol/dune-queries
-- Last Updated: 2024-01-15

SELECT
    month,
    total_revenue_usd,
    protocol_fees_usd,
    solver_penalties_usd,
    other_revenue_usd,
    revenue_growth_pct
FROM cow_protocol.monthly_dao_revenue
WHERE month >= DATE_TRUNC('month', NOW() - INTERVAL '12 months')
ORDER BY month DESC;
