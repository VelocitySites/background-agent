"""Outlier screener: rank players by expected extra production from a
minutes spike, with model-derived explanations for every pick.

The score targets the headline use case directly: a strong per-minute producer
whose predicted minutes are far above his season average.

    UPLIFT   = PRED_MIN - MIN_SEASON
    PRA_RATE = PRED_PPM + PRED_RPM + PRED_APM
    SCORE    = UPLIFT * PRA_RATE          (expected *extra* PRA from the spike)

Explanations come from LightGBM per-prediction contributions on the minutes
model, filtered to contextual drivers (vacated minutes, tanking spots,
schedule, opponent) rather than the player's own baseline minutes.
"""

from __future__ import annotations

import pandas as pd

from simulator import config
from simulator.data.store import Bundle
from simulator.features import build_features
from simulator.models.core import ModelBundle

# Features that explain a player's *level*, not tonight's deviation from it.
_BASELINE_FEATURES = {
    "MIN_AVG_5", "MIN_AVG_10", "MIN_SEASON", "GAMES_PLAYED",
    "PPM_5", "PPM_10", "PPM_SEASON", "RPM_5", "RPM_10", "RPM_SEASON",
    "APM_5", "APM_10", "APM_SEASON", "MONTH",
}

_PHRASES = {
    "VACATED_MIN_SAMEPOS": lambda r: f"{r.VACATED_MIN_SAMEPOS:.0f} rotation min vacated at his position",
    "VACATED_MIN": lambda r: f"{r.VACATED_MIN:.0f} team rotation min vacated",
    "MIN_TREND": lambda r: f"minutes trending {'up' if r.MIN_TREND > 0 else 'down'} ({r.MIN_TREND:+.1f} vs season)",
    "GAMES_SINCE_RETURN": lambda r: f"game {int(r.GAMES_SINCE_RETURN) + 1} since returning from absence",
    "TANKING_SPOT": lambda r: "late-season minutes-shift spot (team out of contention)",
    "IS_B2B": lambda r: "team on a back-to-back",
    "TEAM_REST_DAYS": lambda r: f"{int(r.TEAM_REST_DAYS)} days rest",
    "REST_ASYMMETRY": lambda r: f"rest edge vs opponent ({r.REST_ASYMMETRY:+.0f} days)",
    "OPP_IS_B2B": lambda r: "opponent on a back-to-back",
    "BLOWOUT_RISK": lambda r: "blowout risk in this matchup",
    "OPP_PACE": lambda r: f"opponent pace {r.OPP_PACE:.0f} poss/game",
    "OPP_DEF_RATING": lambda r: f"opponent defensive rating {r.OPP_DEF_RATING:.0f}",
    "OPP_POS_PTS_ALLOWED_PM": lambda r: "opponent leaks points to his position",
    "OPP_POS_REB_ALLOWED_PM": lambda r: "opponent leaks rebounds to his position",
    "OPP_POS_AST_ALLOWED_PM": lambda r: "opponent leaks assists to his position",
    "OPP_REB_SHARE": lambda r: "opponent rebounding strength",
    "OPP_FT_DRAWN_RATE": lambda r: "opponent draws fouls at a high rate",
    "PF_PER_MIN_10": lambda r: "foul-trouble risk",
    "ALTITUDE_GAME": lambda r: "altitude game (Denver/Utah road trip)",
    "TRAVEL_MILES": lambda r: f"{r.TRAVEL_MILES:.0f} travel miles since last game",
    "TZ_CROSSED": lambda r: f"{abs(r.TZ_CROSSED):.0f} time zones crossed",
    "ROAD_TRIP_GAME_NUM": lambda r: f"game {int(r.ROAD_TRIP_GAME_NUM)} of road trip",
    "FIRST_HOME_AFTER_TRIP": lambda r: "first home game after a road trip",
    "GAMES_LAST_6D": lambda r: f"{int(r.GAMES_LAST_6D)} games in last 6 days",
    "IS_HOME": lambda r: "home game" if r.IS_HOME else "road game",
    "PLAYER_REST_DAYS": lambda r: f"{int(r.PLAYER_REST_DAYS)} days since his last game",
    "TEAM_WIN_PCT": lambda r: "team record context",
    "TEAM_MARGIN_15": lambda r: "team form context",
}

REPORT_COLS = [
    "PLAYER_NAME", "TEAM_ABBR", "OPP_ABBR", "IS_HOME", "GAME_DATE",
    "MIN_SEASON", "PRED_MIN", "UPLIFT", "PRED_PPM", "PRED_RPM", "PRED_APM",
    "EXP_PTS", "EXP_REB", "EXP_AST", "SCORE", "WHY",
]


def predictions_for_rows(models: ModelBundle, rows: pd.DataFrame) -> pd.DataFrame:
    """Attach predictions, uplift, expected totals, score, and explanations."""
    preds = models.predict(rows)
    out = rows.copy().join(preds)
    out["UPLIFT"] = out["PRED_MIN"] - out["MIN_SEASON"]
    out["EXP_PTS"] = out["PRED_MIN"] * out["PRED_PPM"]
    out["EXP_REB"] = out["PRED_MIN"] * out["PRED_RPM"]
    out["EXP_AST"] = out["PRED_MIN"] * out["PRED_APM"]
    pra_rate = out["PRED_PPM"] + out["PRED_RPM"] + out["PRED_APM"]
    out["SCORE"] = out["UPLIFT"].clip(lower=0) * pra_rate
    out["WHY"] = _explanations(models, out)
    return out


def screen_slate(
    bundle: Bundle,
    models: ModelBundle,
    date: pd.Timestamp,
    top_n: int = config.DEFAULT_TOP_N,
    overrides: set[int] | frozenset[int] = frozenset(),
    min_uplift: float = 2.0,
) -> pd.DataFrame:
    """Rank outlier candidates for all games on ``date``.

    Works for future dates (using the stored upcoming schedule) and for past
    dates (using the games actually played, with features that only see data
    from before that date — safe for review/backtests).
    """
    date = pd.Timestamp(date).normalize()
    future = bundle.upcoming_games[bundle.upcoming_games["GAME_DATE"] == date]
    if len(future):
        fs = build_features(bundle, slate=future, overrides=overrides)
        rows = fs.frame[fs.frame["IS_FUTURE"]]
    else:
        fs = build_features(bundle)
        rows = fs.frame[fs.frame["GAME_DATE"] == date]
        if not len(rows):
            raise ValueError(
                f"No games found on {date.date()} in the upcoming schedule or history."
            )

    scored = predictions_for_rows(models, rows)
    scored = scored[scored["UPLIFT"] >= min_uplift]
    return (
        scored.sort_values("SCORE", ascending=False)
        .head(top_n)[REPORT_COLS]
        .reset_index(drop=True)
    )


def _explanations(models: ModelBundle, rows: pd.DataFrame, k: int = 3) -> list[str]:
    contrib = models.minutes_contributions(rows)
    texts = []
    for (_, crow), (_, frow) in zip(contrib.iterrows(), rows.iterrows()):
        ranked = (
            crow.drop(labels=[c for c in _BASELINE_FEATURES if c in crow.index])
            .sort_values(key=abs, ascending=False)
        )
        parts = []
        for feat, val in ranked.items():
            if len(parts) >= k or abs(val) < 0.15:
                break
            phrase_fn = _PHRASES.get(feat)
            if phrase_fn is None:
                continue
            parts.append(f"{phrase_fn(frow)} ({val:+.1f} min)")
        texts.append("; ".join(parts) if parts else "no strong contextual driver")
    return texts
