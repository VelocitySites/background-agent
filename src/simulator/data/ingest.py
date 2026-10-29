"""Live data ingestion from stats.nba.com via the nba_api package.

Design notes:
- ``PlayerGameLogs`` / ``TeamGameLogs`` return a full season in one request, so
  a 3-season fetch is only a handful of calls plus 30 roster calls.
- stats.nba.com throttles datacenter/cloud IPs aggressively; every request is
  spaced by ``NBA_API_SLEEP_SECONDS`` and retried with backoff.
- Everything is normalized into the canonical schema in ``store.py`` so the
  rest of the pipeline never touches nba_api frames directly.
"""

from __future__ import annotations

import time
from datetime import date, timedelta

import pandas as pd

from simulator import config
from simulator.data import store

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Referer": "https://www.nba.com/",
    "Origin": "https://www.nba.com",
}


def _call(endpoint_cls, retries: int = 3, **kwargs) -> pd.DataFrame:
    """Call an nba_api endpoint politely, returning its first dataframe."""
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            time.sleep(config.NBA_API_SLEEP_SECONDS)
            ep = endpoint_cls(
                headers=_HEADERS, timeout=config.NBA_API_TIMEOUT_SECONDS, **kwargs
            )
            return ep.get_data_frames()[0]
        except Exception as err:  # nba_api raises bare exceptions on throttle
            last_err = err
            time.sleep(2 ** (attempt + 1))
    raise RuntimeError(
        f"stats.nba.com request failed after {retries} attempts: {last_err}. "
        "NBA throttles/blocks many cloud IPs; retry later or from a "
        "residential connection, or use `--source synthetic` to exercise "
        "the pipeline."
    )


def _parse_matchup(matchup: pd.Series) -> tuple[pd.Series, pd.Series]:
    """'DAL @ BOS' -> away; 'DAL vs. BOS' -> home. Returns (is_home, opp_abbr)."""
    is_home = ~matchup.str.contains("@")
    opp = matchup.str.extract(r"(?:@|vs\.)\s*(\w+)$")[0]
    return is_home, opp


def fetch_nba(seasons: list[str], upcoming_days: int = 3) -> None:
    """Fetch seasons of logs plus the upcoming schedule, and save the bundle.

    ``seasons`` uses nba_api notation, e.g. ["2023-24", "2024-25"].
    """
    from nba_api.stats.endpoints import (
        commonteamroster,
        playergamelogs,
        scoreboardv2,
        teamgamelogs,
    )
    from nba_api.stats.static import teams as static_teams

    player_frames, team_frames = [], []
    for season in seasons:
        pg = _call(playergamelogs.PlayerGameLogs, season_nullable=season)
        is_home, opp = _parse_matchup(pg["MATCHUP"])
        player_frames.append(
            pd.DataFrame(
                {
                    "PLAYER_ID": pg["PLAYER_ID"].astype(int),
                    "PLAYER_NAME": pg["PLAYER_NAME"],
                    "TEAM_ABBR": pg["TEAM_ABBREVIATION"],
                    "GAME_ID": pg["GAME_ID"].astype(str),
                    "GAME_DATE": pd.to_datetime(pg["GAME_DATE"]).dt.normalize(),
                    "IS_HOME": is_home,
                    "OPP_ABBR": opp,
                    "MIN": pg["MIN"].astype(float),
                    "PTS": pg["PTS"].astype(int),
                    "REB": pg["REB"].astype(int),
                    "AST": pg["AST"].astype(int),
                    "PF": pg["PF"].astype(int),
                    "SEASON": season,
                }
            )
        )

        tg = _call(teamgamelogs.TeamGameLogs, season_nullable=season)
        t_is_home, t_opp = _parse_matchup(tg["MATCHUP"])
        team_frames.append(
            pd.DataFrame(
                {
                    "TEAM_ABBR": tg["TEAM_ABBREVIATION"],
                    "GAME_ID": tg["GAME_ID"].astype(str),
                    "GAME_DATE": pd.to_datetime(tg["GAME_DATE"]).dt.normalize(),
                    "IS_HOME": t_is_home,
                    "OPP_ABBR": t_opp,
                    "PTS": tg["PTS"].astype(int),
                    "FGA": tg["FGA"].astype(int),
                    "FTA": tg["FTA"].astype(int),
                    "OREB": tg["OREB"].astype(int),
                    "DREB": tg["DREB"].astype(int),
                    "REB": tg["REB"].astype(int),
                    "TOV": tg["TOV"].astype(int),
                    "WL": tg["WL"],
                    "SEASON": season,
                }
            )
        )

    player_games = pd.concat(player_frames, ignore_index=True)
    team_games = pd.concat(team_frames, ignore_index=True)

    # Rosters (for coarse positions): one call per franchise.
    nba_teams = static_teams.get_teams()
    id_to_abbr = {t["id"]: t["abbreviation"] for t in nba_teams}
    roster_rows = []
    for t in nba_teams:
        ro = _call(commonteamroster.CommonTeamRoster, team_id=t["id"])
        for _, r in ro.iterrows():
            pos = str(r.get("POSITION", "") or "")
            coarse = pos[0] if pos and pos[0] in "GFC" else "F"
            roster_rows.append(
                {
                    "PLAYER_ID": int(r["PLAYER_ID"]),
                    "PLAYER_NAME": r["PLAYER"],
                    "TEAM_ABBR": t["abbreviation"],
                    "POSITION": coarse,
                }
            )
    rosters = pd.DataFrame(roster_rows)

    # Upcoming schedule: scoreboard per day for the next few days.
    upcoming_rows = []
    for offset in range(upcoming_days):
        d = date.today() + timedelta(days=offset)
        sb = _call(scoreboardv2.ScoreboardV2, game_date=d.strftime("%m/%d/%Y"))
        for _, g in sb.iterrows():
            home = id_to_abbr.get(int(g["HOME_TEAM_ID"]))
            away = id_to_abbr.get(int(g["VISITOR_TEAM_ID"]))
            if home and away:
                upcoming_rows.append(
                    {
                        "GAME_DATE": pd.Timestamp(d),
                        "HOME_ABBR": home,
                        "AWAY_ABBR": away,
                    }
                )
    upcoming = pd.DataFrame(upcoming_rows, columns=store.UPCOMING_COLS)

    store.save_bundle(player_games, team_games, rosters, upcoming, source="nba")


def default_seasons(n: int = 3) -> list[str]:
    """The n most recent seasons in nba_api notation, based on today's date."""
    today = date.today()
    # NBA seasons start in October; before October we are still in last year's season.
    end_year = today.year if today.month >= 10 else today.year - 1
    return [f"{y}-{str(y + 1)[-2:]}" for y in range(end_year - n + 1, end_year + 1)]
