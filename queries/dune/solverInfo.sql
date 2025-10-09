-- Query: CoW Protocol Solver Conversion Prices & Metrics
-- Query ID: 5533118
-- Version: 1.0
-- Description: Solver performance metrics including conversion prices and efficiency
-- Author: CoW Protocol Team
-- Source: https://github.com/cowprotocol/dune-queries
-- Last Updated: 2024-04-05

SELECT
    solver_address,
    solver_name,
    avg_conversion_price_usd,
    total_volume_traded_usd,
    unique_traders,
    avg_slippage_bps,
    avg_execution_time_seconds,
    performance_score
FROM cow_protocol.solver_performance_metrics
WHERE date >= NOW() - INTERVAL '7 days'
ORDER BY performance_score DESC
LIMIT 50;
