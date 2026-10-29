"""Monte Carlo simulation of player stat lines.

Point predictions hide risk. For each player-game we simulate thousands of
outcomes: minutes drawn from a normal fitted to the model's P20-P80 band
(clipped to [0, 48]), then counting stats drawn as Poisson around rate*minutes.
That yields honest percentile ranges and, most importantly, the probability
that the predicted minutes spike actually materializes.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

# A normal's 20th-80th percentile span is 2 * 0.8416 standard deviations.
_Z_SPAN_20_80 = 1.6832

SIM_COLS = [
    "PROB_UPLIFT5", "PTS_P10", "PTS_P50", "PTS_P90",
    "REB_P50", "AST_P50", "EXTRA_PRA_EV",
]


def simulate(preds: pd.DataFrame, n_sims: int = 2000, seed: int = 0) -> pd.DataFrame:
    """Simulate stat lines for each row of ``preds``.

    Requires columns: PRED_MIN, PRED_MIN_LO, PRED_MIN_HI, PRED_PPM, PRED_RPM,
    PRED_APM, MIN_SEASON. Returns one row per input row with SIM_COLS.
    """
    rng = np.random.default_rng(seed)
    n = len(preds)
    if n == 0:
        return pd.DataFrame(columns=SIM_COLS, index=preds.index)

    mu = preds["PRED_MIN"].to_numpy(float)[:, None]
    sigma = (
        (preds["PRED_MIN_HI"] - preds["PRED_MIN_LO"]).to_numpy(float) / _Z_SPAN_20_80
    ).clip(min=0.5)[:, None]
    minutes = rng.normal(mu, sigma, size=(n, n_sims)).clip(0, 48)

    def counts(rate_col: str) -> np.ndarray:
        lam = preds[rate_col].to_numpy(float).clip(min=0)[:, None] * minutes
        return rng.poisson(lam)

    pts = counts("PRED_PPM")
    reb = counts("PRED_RPM")
    ast = counts("PRED_APM")

    season_avg = preds["MIN_SEASON"].to_numpy(float)[:, None]
    extra_min = np.clip(minutes - season_avg, 0, None)
    pra_rate = (
        preds[["PRED_PPM", "PRED_RPM", "PRED_APM"]].sum(axis=1).to_numpy(float)[:, None]
    )

    return pd.DataFrame(
        {
            "PROB_UPLIFT5": (minutes >= season_avg + 5.0).mean(axis=1),
            "PTS_P10": np.percentile(pts, 10, axis=1),
            "PTS_P50": np.percentile(pts, 50, axis=1),
            "PTS_P90": np.percentile(pts, 90, axis=1),
            "REB_P50": np.percentile(reb, 50, axis=1),
            "AST_P50": np.percentile(ast, 50, axis=1),
            "EXTRA_PRA_EV": (extra_min * pra_rate).mean(axis=1),
        },
        index=preds.index,
    )
