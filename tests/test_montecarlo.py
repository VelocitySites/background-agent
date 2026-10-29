import numpy as np
import pandas as pd

from simulator.montecarlo import simulate


def _preds(pred_min=30.0, lo=26.0, hi=34.0, ppm=0.6, season=25.0):
    return pd.DataFrame(
        [
            {
                "PRED_MIN": pred_min,
                "PRED_MIN_LO": lo,
                "PRED_MIN_HI": hi,
                "PRED_PPM": ppm,
                "PRED_RPM": 0.2,
                "PRED_APM": 0.1,
                "MIN_SEASON": season,
            }
        ]
    )


def test_simulation_centers_on_prediction():
    out = simulate(_preds(), n_sims=5000, seed=1)
    row = out.iloc[0]
    assert abs(row["PTS_P50"] - 30.0 * 0.6) < 2.0
    assert row["PTS_P10"] < row["PTS_P50"] < row["PTS_P90"]
    assert 0.0 <= row["PROB_UPLIFT5"] <= 1.0


def test_probability_responds_to_uplift():
    big_uplift = simulate(_preds(pred_min=35, lo=31, hi=39, season=25), n_sims=4000, seed=2)
    no_uplift = simulate(_preds(pred_min=25, lo=21, hi=29, season=25), n_sims=4000, seed=2)
    assert big_uplift.iloc[0]["PROB_UPLIFT5"] > 0.8
    assert no_uplift.iloc[0]["PROB_UPLIFT5"] < 0.2
    assert big_uplift.iloc[0]["EXTRA_PRA_EV"] > no_uplift.iloc[0]["EXTRA_PRA_EV"]


def test_tight_band_narrows_outcomes():
    tight = simulate(_preds(lo=29.5, hi=30.5), n_sims=4000, seed=3).iloc[0]
    wide = simulate(_preds(lo=20, hi=40), n_sims=4000, seed=3).iloc[0]
    assert (tight["PTS_P90"] - tight["PTS_P10"]) < (wide["PTS_P90"] - wide["PTS_P10"])


def test_empty_input():
    out = simulate(_preds().iloc[0:0])
    assert len(out) == 0
