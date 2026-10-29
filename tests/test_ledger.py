import pandas as pd

from simulator import ledger
from tests.conftest import make_mini_bundle


def _picks(date, pid=1, name="BOS P1"):
    return pd.DataFrame(
        [
            {
                "GAME_DATE": pd.Timestamp(date),
                "PLAYER_ID": pid,
                "PLAYER_NAME": name,
                "TEAM_ABBR": "BOS",
                "OPP_ABBR": "DEN",
                "MIN_SEASON": 20.0,
                "PRED_MIN": 30.0,
                "UPLIFT": 10.0,
                "PRED_PPM": 0.6,
                "PRED_RPM": 0.2,
                "PRED_APM": 0.1,
                "SCORE": 9.0,
                "WHY": "test",
            }
        ]
    )


def test_record_and_dedupe(tmp_data):
    assert ledger.record_picks(_picks("2025-01-05")) == 1
    assert ledger.record_picks(_picks("2025-01-05")) == 0  # duplicate skipped
    assert ledger.record_picks(_picks("2025-01-07")) == 1
    assert len(ledger.load_ledger()) == 2


def test_settle_fills_actuals_and_counts_dnp(tmp_data):
    bundle = make_mini_bundle()
    # Game G0002 happened on 2025-01-05; player 1 played 30 minutes.
    ledger.record_picks(_picks("2025-01-05"))
    # Player 99 never appears but BOS played that day -> settled as DNP (0 min).
    ledger.record_picks(_picks("2025-01-05", pid=99, name="Ghost"))
    settled = ledger.settle(bundle)
    assert settled == 2
    df = ledger.load_ledger()
    p1 = df[df["PLAYER_ID"] == 1].iloc[0]
    assert p1["ACTUAL_MIN"] == 30.0 and p1["ACTUAL_PTS"] == 15
    ghost = df[df["PLAYER_ID"] == 99].iloc[0]
    assert ghost["ACTUAL_MIN"] == 0.0 and bool(ghost["SETTLED"])


def test_summary_small_sample_verdict(tmp_data):
    bundle = make_mini_bundle()
    ledger.record_picks(_picks("2025-01-05"))
    ledger.settle(bundle)
    summary = ledger.summarize()
    assert summary["picks_settled"] == 1
    assert summary["hit_rate"] == 1.0  # played 30 vs 20 season avg -> +10 >= 5
    assert "too small" in summary["verdict"]


def test_wilson_interval_bounds():
    lo, hi = ledger.wilson_interval(0, 0)
    assert (lo, hi) == (0.0, 1.0)
    lo, hi = ledger.wilson_interval(50, 100)
    assert 0.40 < lo < 0.5 < hi < 0.60
    lo_small, hi_small = ledger.wilson_interval(5, 10)
    assert hi_small - lo_small > hi - lo  # smaller samples -> wider intervals
