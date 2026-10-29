"""Paper-trading ledger: every pick is recorded, settled against the real box
score, and summarized with a confidence interval.

This is the edge-verification gate. Until the settled sample is large enough
and the hit-rate confidence interval clears a meaningful bar, the only honest
conclusion is "not proven" — the summary says so explicitly.
"""

from __future__ import annotations

import math
from pathlib import Path

import pandas as pd

from simulator import config
from simulator.data.store import Bundle

LEDGER_COLS = [
    "GAME_DATE", "PLAYER_ID", "PLAYER_NAME", "TEAM_ABBR", "OPP_ABBR",
    "MIN_SEASON", "PRED_MIN", "UPLIFT", "PRED_PPM", "PRED_RPM", "PRED_APM",
    "SCORE", "WHY",
    "ACTUAL_MIN", "ACTUAL_PTS", "ACTUAL_REB", "ACTUAL_AST", "SETTLED",
]

# A pick "hits" when the player actually exceeded his season average by this many minutes.
HIT_MARGIN_MIN = 5.0
MIN_SETTLED_FOR_CONCLUSION = 50


def load_ledger(path: Path | None = None) -> pd.DataFrame:
    path = path or config.LEDGER_PATH
    if not Path(path).exists():
        return pd.DataFrame(columns=LEDGER_COLS)
    df = pd.read_csv(path, parse_dates=["GAME_DATE"])
    return df


def record_picks(picks: pd.DataFrame, path: Path | None = None) -> int:
    """Append new picks (skipping player-date duplicates). Returns rows added."""
    path = path or config.LEDGER_PATH
    ledger = load_ledger(path)
    rows = picks.copy()
    rows["PLAYER_ID"] = rows.get("PLAYER_ID", pd.NA)
    for col, default in (
        ("ACTUAL_MIN", pd.NA), ("ACTUAL_PTS", pd.NA),
        ("ACTUAL_REB", pd.NA), ("ACTUAL_AST", pd.NA), ("SETTLED", False),
    ):
        rows[col] = default
    rows = rows.reindex(columns=LEDGER_COLS)
    if len(ledger):
        existing = set(zip(ledger["PLAYER_ID"], ledger["GAME_DATE"]))
        mask = [
            (pid, d) not in existing
            for pid, d in zip(rows["PLAYER_ID"], rows["GAME_DATE"])
        ]
        rows = rows[mask]
    combined = pd.concat([ledger, rows], ignore_index=True)
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    combined.to_csv(path, index=False)
    return len(rows)


def settle(bundle: Bundle, path: Path | None = None) -> int:
    """Fill in actual results for unsettled picks whose games have been played.

    A pick on a date where the player's team played but he logged no row is
    settled as 0 minutes (late scratch — exactly the risk the ledger must count).
    """
    path = path or config.LEDGER_PATH
    ledger = load_ledger(path)
    if not len(ledger):
        return 0
    pg = bundle.player_games
    team_dates = set(zip(bundle.team_games["TEAM_ABBR"], bundle.team_games["GAME_DATE"]))
    actual = pg.set_index(["PLAYER_ID", "GAME_DATE"])[["MIN", "PTS", "REB", "AST"]]

    settled_count = 0
    for idx, row in ledger[~ledger["SETTLED"].astype(bool)].iterrows():
        key = (row["PLAYER_ID"], row["GAME_DATE"])
        if key in actual.index:
            a = actual.loc[key]
            if isinstance(a, pd.DataFrame):  # traded-player edge case: take the game played
                a = a.iloc[0]
            ledger.loc[idx, ["ACTUAL_MIN", "ACTUAL_PTS", "ACTUAL_REB", "ACTUAL_AST"]] = (
                a["MIN"], a["PTS"], a["REB"], a["AST"]
            )
            ledger.loc[idx, "SETTLED"] = True
            settled_count += 1
        elif (row["TEAM_ABBR"], row["GAME_DATE"]) in team_dates:
            ledger.loc[idx, ["ACTUAL_MIN", "ACTUAL_PTS", "ACTUAL_REB", "ACTUAL_AST"]] = (
                0.0, 0, 0, 0
            )
            ledger.loc[idx, "SETTLED"] = True
            settled_count += 1
    ledger.to_csv(path, index=False)
    return settled_count


def wilson_interval(hits: int, n: int, z: float = 1.96) -> tuple[float, float]:
    """Wilson score interval for a binomial proportion."""
    if n == 0:
        return (0.0, 1.0)
    p = hits / n
    denom = 1 + z**2 / n
    center = (p + z**2 / (2 * n)) / denom
    half = z * math.sqrt(p * (1 - p) / n + z**2 / (4 * n**2)) / denom
    return (max(0.0, center - half), min(1.0, center + half))


def summarize(path: Path | None = None) -> dict:
    """Settled-pick performance with an explicit small-sample verdict."""
    ledger = load_ledger(path)
    settled = ledger[ledger["SETTLED"].astype(bool)].copy()
    n = len(settled)
    out: dict = {"picks_total": len(ledger), "picks_settled": n}
    if n == 0:
        out["verdict"] = "No settled picks yet - nothing can be concluded."
        return out
    settled["ACTUAL_UPLIFT"] = settled["ACTUAL_MIN"].astype(float) - settled["MIN_SEASON"]
    hits = int((settled["ACTUAL_UPLIFT"] >= HIT_MARGIN_MIN).sum())
    lo, hi = wilson_interval(hits, n)
    out.update(
        hit_rate=round(hits / n, 3),
        hit_rate_ci95=(round(lo, 3), round(hi, 3)),
        hits=hits,
        mean_predicted_uplift=round(float(settled["UPLIFT"].mean()), 2),
        mean_actual_uplift=round(float(settled["ACTUAL_UPLIFT"].mean()), 2),
        minutes_mae=round(
            float((settled["ACTUAL_MIN"].astype(float) - settled["PRED_MIN"]).abs().mean()), 2
        ),
        dnp_rate=round(float((settled["ACTUAL_MIN"].astype(float) == 0).mean()), 3),
    )
    if n < MIN_SETTLED_FOR_CONCLUSION:
        out["verdict"] = (
            f"Sample too small ({n} settled picks < {MIN_SETTLED_FOR_CONCLUSION}). "
            "No conclusion about an edge is possible yet. Keep paper-trading."
        )
    else:
        out["verdict"] = (
            f"Hit rate {hits}/{n} = {hits / n:.1%} "
            f"(95% CI {lo:.1%}-{hi:.1%}). A real edge requires the LOWER bound "
            "to stay meaningfully above what a naive baseline achieves - "
            "compare against `simulator backtest` baseline numbers."
        )
    return out
