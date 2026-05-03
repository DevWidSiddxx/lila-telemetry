# LILA Black - Game Design Insights

Based on an analysis of the telemetry data (89,000+ events across 796 matches), here are 3 actionable insights for the Level Design & Systems teams.

## 1. The Storm Pacing is Overly Punishing
**Observation**: There were 39 `KilledByStorm` events compared to only 3 human-on-human `Kill` events. 
**Supporting Evidence**: Over 90% of non-bot player deaths are attributed to the environment rather than PvP combat.
**Actionable Recommendation**: The level design team should evaluate the traversal friction on Ambrose Valley and Grand Rift. The storm speed needs to be reduced, or more extraction zones/vehicles need to be placed along the map edges. 
**Metrics to Improve**: Player retention and PvP engagement rate (players are likely dying while running from the storm before seeing another team).

## 2. PvE Dominates the Match Economy
**Observation**: Players are spending the vast majority of their time fighting bots and looting, almost entirely avoiding other players. 
**Supporting Evidence**: We recorded 2,415 `BotKill` events and 12,885 `Loot` events, but only 3 human `Kill` events.
**Actionable Recommendation**: Level designers should rethink POI (Point of Interest) distribution. Currently, loot is so spread out that players can comfortably farm bots and extract without ever contesting a hot drop. High-tier loot should be consolidated into 2-3 central, highly defensible structures to force player convergence.
**Metrics to Improve**: Kill/Death ratio (Human vs Human), match tension, and spectator value.

## 3. Bot Lethality & Placement Imbalance
**Observation**: Bots are acting as minor speedbumps rather than credible threats or area-denial tools.
**Supporting Evidence**: Players killed bots 2,415 times, but bots only killed players 700 times (roughly a 3.5:1 ratio).
**Actionable Recommendation**: Rather than sprinkling low-threat bots everywhere, cluster harder "Boss" or "Elite" bot squads around extraction points. This provides a late-game PvE challenge that delays extraction and gives trailing human players a chance to ambush extracting teams.
**Metrics to Improve**: Late-game engagement time, extraction failure rate.
