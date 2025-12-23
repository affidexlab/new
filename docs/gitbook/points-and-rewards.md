# Points & Rewards

DecaFlow tracks every on-chain action via the Points Service (PostgreSQL + cron jobs). Points power cash rewards, airdrop eligibility, and leaderboard rankings.

## Base Rates
| Action | Min USD | Base Rate |
|--------|---------|-----------|
| Swap | $10 | 2 pts per $1 |
| Bridge | $5 | 4 pts per $1 |
| Liquidity Add | $50 | 7 pts per $1 |
| Liquidity Remove | $0 | 1.5 pts per $1 |
| Privacy Swap | $10 | 2.5 pts per $1 |
| VDM Staking | $10 | 2.5 pts per $1 |

Multipliers stack via `/admin` events (e.g., 2x bridge week).

## Leaderboard Rewards
- **Weekly**: Top 10 split 80% of weekly fees (Tiered 40/25/15/20%).
- **Monthly**: Top 20 share 20% of monthly fees + bonus point airdrops.

## Airdrop Eligibility (2026 token)
- 1,000+ total points
- 5+ successful transactions
- Account not flagged by compliance scripts

Full implementation details: [`docs/POINTS_REWARDS_SYSTEM.md`](../POINTS_REWARDS_SYSTEM.md).
