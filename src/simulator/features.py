"""Leakage-free feature engineering.

Every feature for a game on date D is computed exclusively from games strictly
before D (rolling windows are shifted by one game). Historical rows and future
slate rows flow through the same code path: slate rows are appended with NaN
stats, so the shifted rollups automatically produce their pre-game features.

Feature groups:
- Player form: rolling and season per-minute rates, minutes trend, foul rate,
  games since return from absence (injury ramp-up curve).
- Schedule and travel: rest days, back-to-back, 4-games-in-6-nights density,
  road-trip game number, first home game after a trip, travel miles, time
  zones crossed, altitude games.
- Team context: win percentage, recent point margin (strength), tanking spot,
  blowout risk, rest asymmetry versus the opponent.
- Opponent: defensive rating, pace, rebound share, free throws drawn, and
  position-specific per-minute production allowed.
- Minutes drivers: vacated minutes (overall and same-position) inferred from
  who missed the team's most recent game, plus manual availability overrides.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from simulator import config
from simulator.data.store import Bundle
from simulator.data.teams import HIGH_ALTITUDE_FT, haversine_miles, team_meta

FEATURES = [
    # player form
    "MIN_AVG_5", "MIN_AVG_10", "MIN_SEASON", "MIN_TREND",
    "PPM_5", "PPM_10", "PPM_SEASON",
    "RPM_5", "RPM_10", "RPM_SEASON",
    "APM_5", "APM_10", "APM_SEASON",
    "PF_PER_MIN_10", "GAMES_PLAYED", "GAMES_SINCE_RETURN", "PLAYER_REST_DAYS",
    # schedule / travel
    "IS_HOME", "TEAM_REST_DAYS", "IS_B2B", "GAMES_LAST_6D",
    "ROAD_TRIP_GAME_NUM", "FIRST_HOME_AFTER_TRIP",
    "TRAVEL_MILES", "TZ_CROSSED", "ALTITUDE_GAME",
    # team context
    "TEAM_WIN_PCT", "TEAM_MARGIN_15", "TANKING_SPOT", "MONTH",
    "BLOWOUT_RISK", "REST_ASYMMETRY", "OPP_IS_B2B",
    # opponent
    "OPP_DEF_RATING", "OPP_PACE", "OPP_REB_SHARE", "OPP_FT_DRAWN_RATE",
    "OPP_POS_PTS_ALLOWED_PM", "OPP_POS_REB_ALLOWED_PM", "OPP_POS_AST_ALLOWED_PM",
    # minutes drivers
    "VACATED_MIN", "VACATED_MIN_SAMEPOS",
]

TARGETS = ["MIN", "PPM", "RPM", "APM"]
META_COLS = [
    "PLAYER_ID", "PLAYER_NAME", "TEAM_ABBR", "OPP_ABBR", "GAME_ID",
    "GAME_DATE", "IS_FUTURE", "POSITION",
]


@dataclass
class FeatureSet:
    frame: pd.DataFrame  # META_COLS + FEATURES + TARGETS (targets NaN for future rows)
    features: list[str]


def build_features(
    bundle: Bundle,
    slate: pd.DataFrame | None = None,
    overrides: set[int] | frozenset[int] = frozenset(),
) -> FeatureSet:
    """Build the modeling frame for all historical games, optionally appending
    pre-game rows for a future ``slate`` (GAME_DATE, HOME_ABBR, AWAY_ABBR).

    ``overrides`` is a set of PLAYER_IDs known to be out for the slate games;
    they are excluded as candidates and their minutes are added to the vacated
    pool of their team.
    """
    positions = bundle.rosters.set_index("PLAYER_ID")["POSITION"].to_dict()

    team_frame = _team_context(bundle, slate)
    player_frame = _player_rows(bundle, slate, overrides)

    pf = _player_form(player_frame)
    pf = pf.merge(
        team_frame.add_prefix("T_"),
        left_on=["TEAM_ABBR", "GAME_KEY"],
        right_on=["T_TEAM_ABBR", "T_GAME_KEY"],
        how="left",
    )
    opp_cols = [
        "TEAM_ABBR", "GAME_KEY", "REST_DAYS", "IS_B2B",
        "DEF_RATING", "PACE", "REB_SHARE", "FT_DRAWN_RATE",
    ]
    pf = pf.merge(
        team_frame[opp_cols].add_prefix("O_"),
        left_on=["OPP_ABBR", "GAME_KEY"],
        right_on=["O_TEAM_ABBR", "O_GAME_KEY"],
        how="left",
    )

    pf["POSITION"] = pf["PLAYER_ID"].map(positions).fillna("F")
    pos_def = _position_defense(bundle)
    pf = pd.merge_asof(
        pf.sort_values("GAME_DATE"),
        pos_def.sort_values("GAME_DATE"),
        on="GAME_DATE",
        left_by=["OPP_ABBR", "POSITION"],
        right_by=["DEF_TEAM", "POSITION"],
        direction="backward",
        allow_exact_matches=False,
    )

    vac = _vacated_minutes(player_frame, positions, overrides)
    pf = pf.merge(vac, on=["TEAM_ABBR", "GAME_KEY", "POSITION"], how="left")
    pf[["VACATED_MIN", "VACATED_MIN_SAMEPOS"]] = (
        pf[["VACATED_MIN", "VACATED_MIN_SAMEPOS"]].fillna(0.0)
    )

    out = pd.DataFrame(
        {
            "PLAYER_ID": pf["PLAYER_ID"],
            "PLAYER_NAME": pf["PLAYER_NAME"],
            "TEAM_ABBR": pf["TEAM_ABBR"],
            "OPP_ABBR": pf["OPP_ABBR"],
            "GAME_ID": pf["GAME_ID"],
            "GAME_DATE": pf["GAME_DATE"],
            "IS_FUTURE": pf["IS_FUTURE"],
            "POSITION": pf["POSITION"],
            # player form
            "MIN_AVG_5": pf["MIN_AVG_5"],
            "MIN_AVG_10": pf["MIN_AVG_10"],
            "MIN_SEASON": pf["MIN_SEASON"],
            "MIN_TREND": pf["MIN_AVG_5"] - pf["MIN_SEASON"],
            "PPM_5": pf["PPM_5"], "PPM_10": pf["PPM_10"], "PPM_SEASON": pf["PPM_SEASON"],
            "RPM_5": pf["RPM_5"], "RPM_10": pf["RPM_10"], "RPM_SEASON": pf["RPM_SEASON"],
            "APM_5": pf["APM_5"], "APM_10": pf["APM_10"], "APM_SEASON": pf["APM_SEASON"],
            "PF_PER_MIN_10": pf["PF_PER_MIN_10"],
            "GAMES_PLAYED": pf["GAMES_PLAYED"],
            "GAMES_SINCE_RETURN": pf["GAMES_SINCE_RETURN"],
            "PLAYER_REST_DAYS": pf["PLAYER_REST_DAYS"],
            # schedule / travel
            "IS_HOME": pf["IS_HOME"].astype(float),
            "TEAM_REST_DAYS": pf["T_REST_DAYS"],
            "IS_B2B": pf["T_IS_B2B"].astype(float),
            "GAMES_LAST_6D": pf["T_GAMES_LAST_6D"],
            "ROAD_TRIP_GAME_NUM": pf["T_ROAD_TRIP_GAME_NUM"],
            "FIRST_HOME_AFTER_TRIP": pf["T_FIRST_HOME_AFTER_TRIP"].astype(float),
            "TRAVEL_MILES": pf["T_TRAVEL_MILES"],
            "TZ_CROSSED": pf["T_TZ_CROSSED"],
            "ALTITUDE_GAME": pf["T_ALTITUDE_GAME"].astype(float),
            # team context
            "TEAM_WIN_PCT": pf["T_WIN_PCT"],
            "TEAM_MARGIN_15": pf["T_MARGIN_15"],
            "TANKING_SPOT": pf["T_TANKING_SPOT"].astype(float),
            "MONTH": pf["GAME_DATE"].dt.month,
            "BLOWOUT_RISK": np.nan,  # filled below from the pair's margin gap
            "REST_ASYMMETRY": pf["T_REST_DAYS"] - pf["O_REST_DAYS"],
            "OPP_IS_B2B": pf["O_IS_B2B"].astype(float),
            # opponent
            "OPP_DEF_RATING": pf["O_DEF_RATING"],
            "OPP_PACE": pf["O_PACE"],
            "OPP_REB_SHARE": pf["O_REB_SHARE"],
            "OPP_FT_DRAWN_RATE": pf["O_FT_DRAWN_RATE"],
            "OPP_POS_PTS_ALLOWED_PM": pf["OPP_POS_PTS_ALLOWED_PM"],
            "OPP_POS_REB_ALLOWED_PM": pf["OPP_POS_REB_ALLOWED_PM"],
            "OPP_POS_AST_ALLOWED_PM": pf["OPP_POS_AST_ALLOWED_PM"],
            # minutes drivers
            "VACATED_MIN": pf["VACATED_MIN"],
            "VACATED_MIN_SAMEPOS": pf["VACATED_MIN_SAMEPOS"],
            # targets
            "MIN": pf["MIN"],
            "PTS": pf["PTS"],
            "REB": pf["REB"],
            "AST": pf["AST"],
        }
    )
    # Blowout risk: gap between the two teams' recent margins.
    opp_lookup = team_frame.set_index(["TEAM_ABBR", "GAME_KEY"])["MARGIN_15"]
    opp_margin = pd.Series(
        opp_lookup.reindex(
            pd.MultiIndex.from_arrays([pf["OPP_ABBR"], pf["GAME_KEY"]])
        ).to_numpy(),
        index=out.index,
    )
    out["BLOWOUT_RISK"] = (
        pd.Series(pf["T_MARGIN_15"].to_numpy(), index=out.index) - opp_margin
    ).abs()

    with np.errstate(divide="ignore", invalid="ignore"):
        played = out["MIN"].fillna(0) >= 8
        out["PPM"] = np.where(played, out["PTS"] / out["MIN"], np.nan)
        out["RPM"] = np.where(played, out["REB"] / out["MIN"], np.nan)
        out["APM"] = np.where(played, out["AST"] / out["MIN"], np.nan)

    # Only rows with enough history are usable for modeling or prediction.
    out = out[out["GAMES_PLAYED"] >= config.MIN_GAMES_FOR_PREDICTION].reset_index(drop=True)
    return FeatureSet(frame=out, features=list(FEATURES))


# ---------------------------------------------------------------------------
# Row assembly
# ---------------------------------------------------------------------------

def _game_key(date: pd.Series, game_id: pd.Series) -> pd.Series:
    return date.dt.strftime("%Y%m%d") + "_" + game_id.astype(str)


def _player_rows(
    bundle: Bundle, slate: pd.DataFrame | None, overrides: set[int] | frozenset[int]
) -> pd.DataFrame:
    pg = bundle.player_games.copy()
    pg["IS_FUTURE"] = False
    rows = [pg]

    if slate is not None and len(slate):
        pg_sorted = pg.sort_values("GAME_DATE")
        latest_team = pg_sorted.groupby("PLAYER_ID")["TEAM_ABBR"].last()
        latest_name = pg_sorted.groupby("PLAYER_ID")["PLAYER_NAME"].last()
        last_date = pg_sorted.groupby("PLAYER_ID")["GAME_DATE"].last()

        fut_rows = []
        for i, g in slate.reset_index(drop=True).iterrows():
            gid = f"FUT{i:05d}"
            for team, opp, is_home in (
                (g["HOME_ABBR"], g["AWAY_ABBR"], True),
                (g["AWAY_ABBR"], g["HOME_ABBR"], False),
            ):
                cutoff = g["GAME_DATE"] - pd.Timedelta(days=config.RECENT_ACTIVITY_DAYS)
                candidates = latest_team[
                    (latest_team == team) & (last_date >= cutoff)
                ].index
                for pid in candidates:
                    if int(pid) in overrides:
                        continue
                    fut_rows.append(
                        {
                            "PLAYER_ID": pid,
                            "PLAYER_NAME": latest_name[pid],
                            "TEAM_ABBR": team,
                            "GAME_ID": gid,
                            "GAME_DATE": g["GAME_DATE"],
                            "IS_HOME": is_home,
                            "OPP_ABBR": opp,
                            "MIN": np.nan, "PTS": np.nan, "REB": np.nan,
                            "AST": np.nan, "PF": np.nan,
                            "SEASON": pg["SEASON"].iloc[-1],
                            "IS_FUTURE": True,
                        }
                    )
        if fut_rows:
            rows.append(pd.DataFrame(fut_rows))

    frame = pd.concat(rows, ignore_index=True).sort_values(
        ["PLAYER_ID", "GAME_DATE"]
    ).reset_index(drop=True)
    frame["GAME_KEY"] = _game_key(frame["GAME_DATE"], frame["GAME_ID"])
    return frame


# ---------------------------------------------------------------------------
# Player form
# ---------------------------------------------------------------------------

def _rate(num: pd.Series, den: pd.Series) -> pd.Series:
    with np.errstate(divide="ignore", invalid="ignore"):
        return num / den.replace(0, np.nan)


def _player_form(frame: pd.DataFrame) -> pd.DataFrame:
    df = frame.copy()
    g = df.groupby("PLAYER_ID", sort=False)

    # Shift by one game so the current game's stats never leak into features.
    for col in ("MIN", "PTS", "REB", "AST", "PF"):
        df[f"_prev_{col}"] = g[col].shift(1)

    gp = df.groupby("PLAYER_ID", sort=False)
    for w in (5, 10):
        roll = lambda c, w=w: gp[f"_prev_{c}"].transform(
            lambda s: s.rolling(w, min_periods=3).sum()
        )
        df[f"MIN_AVG_{w}"] = gp["_prev_MIN"].transform(
            lambda s, w=w: s.rolling(w, min_periods=3).mean()
        )
        df[f"PPM_{w}"] = _rate(roll("PTS"), roll("MIN"))
        df[f"RPM_{w}"] = _rate(roll("REB"), roll("MIN"))
        df[f"APM_{w}"] = _rate(roll("AST"), roll("MIN"))

    expanding_sum = lambda c: gp[f"_prev_{c}"].transform(lambda s: s.expanding().sum())
    df["MIN_SEASON"] = gp["_prev_MIN"].transform(lambda s: s.expanding().mean())
    df["PPM_SEASON"] = _rate(expanding_sum("PTS"), expanding_sum("MIN"))
    df["RPM_SEASON"] = _rate(expanding_sum("REB"), expanding_sum("MIN"))
    df["APM_SEASON"] = _rate(expanding_sum("AST"), expanding_sum("MIN"))
    df["PF_PER_MIN_10"] = _rate(
        gp["_prev_PF"].transform(lambda s: s.rolling(10, min_periods=3).sum()),
        gp["_prev_MIN"].transform(lambda s: s.rolling(10, min_periods=3).sum()),
    )
    df["GAMES_PLAYED"] = gp.cumcount()
    df["PLAYER_REST_DAYS"] = (
        df["GAME_DATE"] - gp["GAME_DATE"].shift(1)
    ).dt.days.clip(upper=30)

    # Games since return from a multi-game absence (>= 7 calendar days without
    # a game is treated as an absence; ramp-up effects fade after ~8 games).
    gap = df["PLAYER_REST_DAYS"].fillna(99)
    absence = gap >= 7
    seq = df.groupby("PLAYER_ID", sort=False).cumcount()
    last_absence_seq = seq.where(absence).groupby(df["PLAYER_ID"]).ffill()
    df["GAMES_SINCE_RETURN"] = (seq - last_absence_seq).fillna(99).clip(upper=99)

    return df.drop(columns=[c for c in df.columns if c.startswith("_prev_")])


# ---------------------------------------------------------------------------
# Team context (schedule, travel, strength, opponent defense/pace)
# ---------------------------------------------------------------------------

def _team_context(bundle: Bundle, slate: pd.DataFrame | None) -> pd.DataFrame:
    tg = bundle.team_games.copy()
    tg["IS_FUTURE"] = False

    # Points allowed and FT drawn against: join the opposing row of each game.
    opp_side = tg[["GAME_ID", "TEAM_ABBR", "PTS", "FTA"]].rename(
        columns={"TEAM_ABBR": "OPP_ABBR", "PTS": "PTS_ALLOWED", "FTA": "FTA_ALLOWED"}
    )
    tg = tg.merge(opp_side, on=["GAME_ID", "OPP_ABBR"], how="left")
    tg["POSS"] = tg["FGA"] + 0.44 * tg["FTA"] - tg["OREB"] + tg["TOV"]
    opp_reb = tg[["GAME_ID", "TEAM_ABBR", "REB"]].rename(
        columns={"TEAM_ABBR": "OPP_ABBR", "REB": "REB_ALLOWED"}
    )
    tg = tg.merge(opp_reb, on=["GAME_ID", "OPP_ABBR"], how="left")

    if slate is not None and len(slate):
        fut = []
        for i, g in slate.reset_index(drop=True).iterrows():
            gid = f"FUT{i:05d}"
            for team, opp, is_home in (
                (g["HOME_ABBR"], g["AWAY_ABBR"], True),
                (g["AWAY_ABBR"], g["HOME_ABBR"], False),
            ):
                fut.append(
                    {
                        "TEAM_ABBR": team, "GAME_ID": gid, "GAME_DATE": g["GAME_DATE"],
                        "IS_HOME": is_home, "OPP_ABBR": opp, "IS_FUTURE": True,
                    }
                )
        tg = pd.concat([tg, pd.DataFrame(fut)], ignore_index=True)

    tg = tg.sort_values(["TEAM_ABBR", "GAME_DATE"]).reset_index(drop=True)
    tg["GAME_KEY"] = _game_key(tg["GAME_DATE"], tg["GAME_ID"])
    g = tg.groupby("TEAM_ABBR", sort=False)

    tg["REST_DAYS"] = (tg["GAME_DATE"] - g["GAME_DATE"].shift(1)).dt.days.clip(upper=10)
    tg["IS_B2B"] = tg["REST_DAYS"] == 1

    # Schedule density: team games in the 6 days before this one.
    def _density(dates: pd.Series) -> pd.Series:
        out = []
        vals = dates.tolist()
        for i, d in enumerate(vals):
            out.append(sum(1 for p in vals[:i] if 0 < (d - p).days <= 6))
        return pd.Series(out, index=dates.index)

    tg["GAMES_LAST_6D"] = g["GAME_DATE"].transform(_density)

    # Road trip game number (consecutive away games, counting this one) and
    # the first-home-game-after-a-trip letdown spot.
    def _trip(is_home: pd.Series) -> pd.DataFrame:
        trip_num, first_home = [], []
        streak = 0
        for h in is_home:
            if h:
                first_home.append(streak >= 3)
                streak = 0
                trip_num.append(0)
            else:
                streak += 1
                trip_num.append(streak)
                first_home.append(False)
        return pd.DataFrame({"ROAD_TRIP_GAME_NUM": trip_num, "FIRST_HOME_AFTER_TRIP": first_home},
                            index=is_home.index)

    trip = pd.concat([_trip(grp["IS_HOME"]) for _, grp in tg.groupby("TEAM_ABBR", sort=False)])
    tg = tg.join(trip)

    # Travel: venue of each game is the home team's arena.
    meta = team_meta().set_index("TEAM_ABBR")
    venue = np.where(tg["IS_HOME"], tg["TEAM_ABBR"], tg["OPP_ABBR"])
    tg["_V_LAT"] = meta["LAT"].reindex(venue).to_numpy()
    tg["_V_LON"] = meta["LON"].reindex(venue).to_numpy()
    tg["_V_TZ"] = meta["TZ_OFFSET"].reindex(venue).to_numpy()
    tg["_V_ALT"] = meta["ALTITUDE_FT"].reindex(venue).to_numpy()
    g = tg.groupby("TEAM_ABBR", sort=False)
    prev_lat, prev_lon = g["_V_LAT"].shift(1), g["_V_LON"].shift(1)
    tg["TRAVEL_MILES"] = [
        haversine_miles(a, b, c, d) if not (pd.isna(a) or pd.isna(c)) else 0.0
        for a, b, c, d in zip(prev_lat, prev_lon, tg["_V_LAT"], tg["_V_LON"])
    ]
    tg["TZ_CROSSED"] = (tg["_V_TZ"] - g["_V_TZ"].shift(1)).abs().fillna(0)
    tg["ALTITUDE_GAME"] = (~tg["IS_HOME"]) & (tg["_V_ALT"] >= HIGH_ALTITUDE_FT)

    # Strength and tanking context (shifted: known before tip-off).
    tg["_prev_win"] = g["WL"].shift(1).eq("W").astype(float).where(g["WL"].shift(1).notna())
    tg["WIN_PCT"] = (
        tg.groupby("TEAM_ABBR", sort=False)["_prev_win"]
        .transform(lambda s: s.expanding(min_periods=3).mean())
    )
    tg["_prev_margin"] = (tg["PTS"] - tg["PTS_ALLOWED"]).groupby(tg["TEAM_ABBR"]).shift(1)
    tg["MARGIN_15"] = (
        tg.groupby("TEAM_ABBR", sort=False)["_prev_margin"]
        .transform(lambda s: s.rolling(15, min_periods=3).mean())
    )
    tg["TANKING_SPOT"] = (tg["GAME_DATE"].dt.month.isin((3, 4))) & (tg["WIN_PCT"] < 0.4)

    # Opponent-facing rolling profiles (how this team's opponents fare).
    def _roll15(col: str) -> pd.Series:
        return (
            tg.groupby("TEAM_ABBR", sort=False)[col]
            .transform(lambda s: s.shift(1).rolling(15, min_periods=3).mean())
        )

    tg["DEF_RATING"] = _roll15("PTS_ALLOWED") / _roll15("POSS") * 100.0
    tg["PACE"] = _roll15("POSS")
    tg["_reb_share"] = tg["REB"] / (tg["REB"] + tg["REB_ALLOWED"])
    tg["REB_SHARE"] = _roll15("_reb_share")
    tg["FT_DRAWN_RATE"] = _roll15("FTA_ALLOWED")  # FTs conceded per game

    keep = [
        "TEAM_ABBR", "GAME_KEY", "GAME_DATE", "REST_DAYS", "IS_B2B",
        "GAMES_LAST_6D", "ROAD_TRIP_GAME_NUM", "FIRST_HOME_AFTER_TRIP",
        "TRAVEL_MILES", "TZ_CROSSED", "ALTITUDE_GAME", "WIN_PCT", "MARGIN_15",
        "TANKING_SPOT", "DEF_RATING", "PACE", "REB_SHARE", "FT_DRAWN_RATE",
    ]
    return tg[keep].copy()


# ---------------------------------------------------------------------------
# Position-specific defense
# ---------------------------------------------------------------------------

def _position_defense(bundle: Bundle) -> pd.DataFrame:
    """Per-minute PTS/REB/AST that each defense allowed to each position,
    rolling over its last 10 defensive games (shifted; leakage-free)."""
    pg = bundle.player_games.copy()
    positions = bundle.rosters.set_index("PLAYER_ID")["POSITION"].to_dict()
    pg["POSITION"] = pg["PLAYER_ID"].map(positions).fillna("F")
    grp = (
        pg.groupby(["OPP_ABBR", "POSITION", "GAME_DATE"])[["PTS", "REB", "AST", "MIN"]]
        .sum()
        .reset_index()
        .rename(columns={"OPP_ABBR": "DEF_TEAM"})
        .sort_values(["DEF_TEAM", "POSITION", "GAME_DATE"])
    )
    g = grp.groupby(["DEF_TEAM", "POSITION"], sort=False)
    for col in ("PTS", "REB", "AST", "MIN"):
        grp[f"_r_{col}"] = g[col].transform(lambda s: s.rolling(10, min_periods=3).sum())
    grp["OPP_POS_PTS_ALLOWED_PM"] = _rate(grp["_r_PTS"], grp["_r_MIN"])
    grp["OPP_POS_REB_ALLOWED_PM"] = _rate(grp["_r_REB"], grp["_r_MIN"])
    grp["OPP_POS_AST_ALLOWED_PM"] = _rate(grp["_r_AST"], grp["_r_MIN"])
    return grp[
        ["DEF_TEAM", "POSITION", "GAME_DATE",
         "OPP_POS_PTS_ALLOWED_PM", "OPP_POS_REB_ALLOWED_PM", "OPP_POS_AST_ALLOWED_PM"]
    ].copy()


# ---------------------------------------------------------------------------
# Vacated minutes
# ---------------------------------------------------------------------------

def _vacated_minutes(
    player_frame: pd.DataFrame,
    positions: dict[int, str],
    overrides: set[int] | frozenset[int],
) -> pd.DataFrame:
    """For each team-game: season-average minutes of rotation players who
    missed the team's previous game (the pre-game expectation of absences),
    plus any manual overrides for future games.

    Returns one row per (TEAM_ABBR, GAME_KEY, POSITION): VACATED_MIN is the
    team-wide total, VACATED_MIN_SAMEPOS the portion at that position.
    """
    rows = []
    hist = player_frame
    for team, tdf in hist.groupby("TEAM_ABBR", sort=False):
        games = (
            tdf[["GAME_KEY", "GAME_DATE", "IS_FUTURE"]]
            .drop_duplicates()
            .sort_values("GAME_DATE")
            .reset_index(drop=True)
        )
        # Participation and running minutes per player.
        played: dict[int, list] = {}  # pid -> [game_idx_last_played, games, total_min]
        by_game = {
            k: set(v["PLAYER_ID"]) for k, v in tdf.groupby("GAME_KEY", sort=False)
        }
        mins_by_game = {
            k: dict(zip(v["PLAYER_ID"], v["MIN"]))
            for k, v in tdf.groupby("GAME_KEY", sort=False)
        }
        for idx, grow in games.iterrows():
            key = grow["GAME_KEY"]
            vac_total, vac_pos = 0.0, {"G": 0.0, "F": 0.0, "C": 0.0}
            for pid, (last_idx, n, total_min) in played.items():
                if n < 3:
                    continue
                avg_min = total_min / n
                if avg_min < 10:
                    continue
                recently_active = last_idx >= idx - 8
                missed_last = last_idx <= idx - 2
                forced_out = grow["IS_FUTURE"] and int(pid) in overrides
                if forced_out or (recently_active and missed_last):
                    vac_total += avg_min
                    vac_pos[positions.get(pid, "F")] += avg_min
            for pos in ("G", "F", "C"):
                rows.append((team, key, pos, vac_total, vac_pos[pos]))
            if not grow["IS_FUTURE"]:
                for pid in by_game.get(key, ()):  # update state after the game
                    m = mins_by_game[key].get(pid)
                    if pid in played:
                        played[pid][0] = idx
                        played[pid][1] += 1
                        played[pid][2] += float(m or 0)
                    else:
                        played[pid] = [idx, 1, float(m or 0)]
    return pd.DataFrame(
        rows,
        columns=["TEAM_ABBR", "GAME_KEY", "POSITION", "VACATED_MIN", "VACATED_MIN_SAMEPOS"],
    )
