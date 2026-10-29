# NBA Stats-Per-Minute Simulator

Predicts **minutes** and **per-minute production** (points, rebounds, assists per
minute) for every NBA player on an upcoming slate, then surfaces the 4–5 players
whose context — vacated teammate minutes, rest, schedule, travel, opponent —
points to an unusual minutes spike. The headline output is exactly:

> *"averages 25 minutes, but is projected for 35 tonight because a starter at his
> position is out and his team is in a late-season minutes-shift spot."*

## Read this first — honest framing

This is a **research tool, not an income source**:

- Sportsbooks price player props using everything modeled here *plus* data that
  is not publicly available (real-time injury intel, optical tracking, sharp
  syndicate money). The vig requires ~52.4% to break even on single bets, and
  **parlays multiply the house edge on every leg** — that is why books promote them.
- The tool therefore ships with a **paper-trading ledger and an
  edge-verification gate**: every pick is recorded, settled against the real box
  score, and summarized with a Wilson 95% confidence interval. Until a large
  settled sample shows the *lower* confidence bound clearing a meaningful bar,
  the only honest conclusion is "not proven."
- Never fund bets with money needed for essentials. Paper-trade first, for a
  long time.

## Install

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
```

## Quickstart (offline demo, no network needed)

```bash
simulator fetch --source synthetic   # simulated league with planted causal effects
simulator train
simulator predict --top 5            # headline report for the next slate
simulator backtest --start 2025-03-01 --end 2025-03-25
```

## Live NBA data

```bash
simulator fetch --source nba --seasons 3   # stats.nba.com via nba_api (rate-limited)
simulator train
simulator daily                            # fetch -> settle -> predict, run once a day
```

> stats.nba.com aggressively throttles or blocks datacenter/cloud IPs. If
> `fetch --source nba` times out, run it from a residential connection. The
> synthetic source exercises the identical pipeline.

Mark players known to be out tonight (injury news the data can't see yet):

```bash
simulator override add "Jayson Tatum"   # adds his minutes to the vacated pool
simulator override list
simulator override clear
```

## Example report (synthetic league)

```
                      Minutes-uplift outliers - 2025-03-26
┃ # ┃ Player      ┃ Tm  ┃ Opp ┃ H/A ┃ Avg Min ┃ Proj Min     ┃ Uplift ┃ P(+5m) ┃ P/min ┃ PTS P10-P90 ┃
│ 1 │ ORL Player9 │ ORL │ DAL │ H   │ 14.6    │ 22.4 (15-27) │ +7.8   │ 61%    │ 0.68  │ 15 (5-24)   │
│ 2 │ BOS Player2 │ BOS │ UTA │ H   │ 34.5    │ 42.9 (35-47) │ +8.4   │ 68%    │ 0.63  │ 27 (20-34)  │
...
  1. ORL Player9: 64 rotation min vacated at his position (+2.7 min); ...
  2. BOS Player2: 29 rotation min vacated at his position (+2.5 min); ...
```

Each pick shows the P20-P80 projected-minutes band, the simulated probability
the player actually exceeds his average by 5+ minutes (`P(+5m)`), and the
P10-P90 range of simulated point outcomes — not just a single number.

## How it works

```
nba_api / synthetic  ->  Parquet cache  ->  feature engineering  ->  LightGBM models
                                                                      |         |
                                                              MinutesModel  RatesModel
                                                                      \         /
                                                                   outlier screener
                                                                    |           |
                                                              daily report   paper ledger
                                                                                |
                                                                       walk-forward backtest
```

### Features (all computed strictly from data before tip-off)

| Group | Signals |
|---|---|
| Player form | rolling 5/10-game and season per-minute rates, **shrunk rates** (empirical-Bayes blend toward the league-position prior, so small samples aren't trusted blindly), last-game minutes, minutes volatility, exponentially weighted minutes, minutes rank on team, minutes trend, foul rate, games since return from absence measured in *team games missed* (injury ramp-up curve) |
| Minutes drivers | **vacated minutes** — season-average minutes of rotation players who missed the team's last game, overall and at the player's position; manual availability overrides |
| Schedule | rest days, back-to-back, games in last 6 days, road-trip game number, first home game after a trip |
| Travel | miles since last game, time zones crossed, altitude games (Denver/Utah visitors) |
| Team context | win %, recent margin, late-season tanking spot, blowout risk, rest asymmetry vs opponent |
| Opponent | defensive rating, pace, rebound share, FT drawn rate, and per-minute PTS/REB/AST allowed **to the player's position** |

### Models

- **MinutesModel** — LightGBM regression for tonight's minutes (chronological
  validation split, never random). This produces the "25 → 35" projection.
- **Quantile models** — P20/P80 LightGBM regressions bracket the minutes
  prediction with an uncertainty band (validation coverage is reported).
- **RatesModel** — LightGBM regressions for PPM/RPM/APM, sample-weighted by
  minutes so garbage-time noise doesn't dominate.
- All persist feature importances; `simulator train` prints the top drivers.

### Monte Carlo simulation

Every candidate's stat line is simulated thousands of times: minutes drawn
from the quantile band, counting stats drawn as Poisson around rate×minutes.
This produces `P(+5m)` (probability the minutes spike materializes), P10-P90
outcome ranges, and the screener score itself:

`SCORE = E[max(simulated minutes − season avg, 0) × (PPM + RPM + APM)]`

— the *probability-weighted* expected extra production, so a pick only ranks
highly when the spike is both large and likely. Every pick carries a "why"
derived from the minutes model's own per-prediction contributions (e.g. "34
rotation min vacated at his position (+4.2 min)").

### Measured accuracy (same dataset, before → after the feature upgrade)

Walk-forward backtest, 70 slate dates, identical data and windows:

| Metric | Before | After |
|---|---|---|
| Minutes MAE (model) | 2.278 | **2.206** |
| Minutes MAE (naive 10-game avg) | 2.497 | 2.497 |
| ≥8-min uplift calls hit rate | 72.7% (22 calls) | **92.6%** (27 calls) |
| Hit-rate 95% CI lower bound | 51.8% | **76.6%** |
| Top-pick mean realized uplift | +4.99 min | +5.11 min |

### Verification

- `simulator backtest --start --end` — walk-forward: trains only on the past,
  predicts forward, retrains monthly. Reports minutes MAE **vs a naive
  10-game-average baseline**, hit rate of ≥8-minute uplift calls vs the base
  rate of random spikes, and realized performance of each day's top picks —
  all with confidence intervals.
- `simulator predict` records picks; `simulator settle` fills in actual box
  scores (a late scratch counts as 0 minutes); `simulator ledger` reports the
  running hit rate and refuses to draw conclusions from small samples.

## Known limitations

- Real-time injury reports and Vegas lines are not in free NBA data. Absences
  are inferred from recent participation, so a surprise same-day scratch is
  missed unless you add an `override`.
- stats.nba.com access is unreliable from cloud hosts; the live-data path was
  built to spec but validated end-to-end against the synthetic league (which
  plants the same causal effects the features target).

## Development

```bash
pytest          # 26 tests: unit (features, ledger, Monte Carlo) + full pipeline integration
```
