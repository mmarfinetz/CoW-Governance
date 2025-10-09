-- Query: CoW Protocol Solver Auction Data & Rewards
-- Query ID: 5270914
-- Version: 1.0
-- Description: Solver competition metrics, rewards, and auction performance
-- Author: CoW Protocol Team
-- Source: https://github.com/cowprotocol/dune-queries
-- Last Updated: 2024-03-10

SELECT
    solver_address,
    solver_name,
    total_rewards_eth,
    total_rewards_usd,
    auction_wins,
    success_rate,
    avg_reward_per_auction,
    last_active_date
FROM cow_protocol.solver_auction_stats
WHERE last_active_date >= NOW() - INTERVAL '30 days'
ORDER BY total_rewards_usd DESC
LIMIT 50;
