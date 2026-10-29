"""Walk-forward backtesting: train strictly on the past, predict forward,
retrain periodically, and score everything that would have been called.

Reported metrics:
- Minutes MAE for the model vs a naive baseline (recent 10-game average), so
  the model has to *earn* its complexity.
- Outlier-call quality: among rows where the model predicted an uplift of at
  least ``call_threshold`` minutes over season average, how often the player
  actually exceeded his average by ``hit_margin`` minutes (with a Wilson 95%
  interval), again versus the baseline rate among all rows.
- Daily top-pick performance: the realized average uplift of each day's top-N
  scored picks - the exact thing `simulator predict` outputs.
"""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from simulator import config
from simulator.data.store import Bundle
from simulator.features import build_features
from simulator.ledger import HIT_MARGIN_MIN, wilson_interval
from simulator.models.core import train_models
from simulator.screener import predictions_for_rows


@dataclass
class BacktestResult:
    metrics: dict
    calls: pd.DataFrame       # every uplift call with predicted and actual numbers
    daily_picks: pd.DataFrame  # top-N picks per day with actuals


def walk_forward(
    bundle: Bundle,
    start: pd.Timestamp,
    end: pd.Timestamp,
    retrain_every_days: int = 30,
    top_n: int = config.DEFAULT_TOP_N,
    call_threshold: float = config.UPLIFT_CALL_THRESHOLD,
    hit_margin: float = HIT_MARGIN_MIN,
    min_uplift: float = 2.0,
) -> BacktestResult:
    start, end = pd.Timestamp(start).normalize(), pd.Timestamp(end).normalize()
    fs = build_features(bundle)
    frame = fs.frame[~fs.frame["IS_FUTURE"]]

    test_dates = sorted(
        d for d in frame["GAME_DATE"].unique() if start <= pd.Timestamp(d) <= end
    )
    if not test_dates:
        raise ValueError(f"No games between {start.date()} and {end.date()}.")

    models = None
    trained_until: pd.Timestamp | None = None
    scored_days = []
    for d in test_dates:
        d = pd.Timestamp(d)
        if models is None or (d - trained_until).days >= retrain_every_days:
            models = train_models(fs, cutoff=d)
            trained_until = d
        day_rows = frame[frame["GAME_DATE"] == d]
        day_scored = predictions_for_rows(models, day_rows)
        scored_days.append(day_scored)

    scored = pd.concat(scored_days, ignore_index=True)
    scored["ACTUAL_UPLIFT"] = scored["MIN"] - scored["MIN_SEASON"]
    scored["BASELINE_PRED_MIN"] = scored["MIN_AVG_10"]

    model_mae = float((scored["MIN"] - scored["PRED_MIN"]).abs().mean())
    baseline_mae = float((scored["MIN"] - scored["BASELINE_PRED_MIN"]).abs().mean())

    calls = scored[scored["UPLIFT"] >= call_threshold].copy()
    call_hits = int((calls["ACTUAL_UPLIFT"] >= hit_margin).sum())
    call_n = len(calls)
    lo, hi = wilson_interval(call_hits, call_n)
    base_rate = float((scored["ACTUAL_UPLIFT"] >= hit_margin).mean())

    picks = (
        scored[scored["UPLIFT"] >= min_uplift]
        .sort_values(["GAME_DATE", "SCORE"], ascending=[True, False])
        .groupby("GAME_DATE", sort=True)
        .head(top_n)
        .copy()
    )
    pick_hits = int((picks["ACTUAL_UPLIFT"] >= hit_margin).sum())
    plo, phi = wilson_interval(pick_hits, len(picks))

    metrics = {
        "rows_scored": len(scored),
        "dates": len(test_dates),
        "minutes_mae_model": round(model_mae, 3),
        "minutes_mae_baseline_avg10": round(baseline_mae, 3),
        "ppm_mae": round(float((scored["PPM"] - scored["PRED_PPM"]).abs().mean()), 4),
        "rpm_mae": round(float((scored["RPM"] - scored["PRED_RPM"]).abs().mean()), 4),
        "apm_mae": round(float((scored["APM"] - scored["PRED_APM"]).abs().mean()), 4),
        "uplift_calls": call_n,
        "uplift_call_hit_rate": round(call_hits / call_n, 3) if call_n else None,
        "uplift_call_ci95": (round(lo, 3), round(hi, 3)) if call_n else None,
        "base_rate_any_player": round(base_rate, 3),
        "top_picks": len(picks),
        "top_pick_hit_rate": round(pick_hits / len(picks), 3) if len(picks) else None,
        "top_pick_ci95": (round(plo, 3), round(phi, 3)) if len(picks) else None,
        "top_pick_mean_actual_uplift": (
            round(float(picks["ACTUAL_UPLIFT"].mean()), 2) if len(picks) else None
        ),
    }
    keep = [
        "GAME_DATE", "PLAYER_ID", "PLAYER_NAME", "TEAM_ABBR", "OPP_ABBR",
        "MIN_SEASON", "PRED_MIN", "UPLIFT", "MIN", "ACTUAL_UPLIFT", "SCORE", "WHY",
    ]
    return BacktestResult(metrics=metrics, calls=calls[keep], daily_picks=picks[keep])
