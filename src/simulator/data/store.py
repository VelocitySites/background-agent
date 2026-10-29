"""Canonical on-disk dataset: schema-normalized Parquet files under RAW_DIR.

Every data source (live nba_api, synthetic generator) writes the same four
frames, so the feature/model/screener layers are source-agnostic:

- ``player_games``: one row per player per completed game
  (PLAYER_ID, PLAYER_NAME, TEAM_ABBR, GAME_ID, GAME_DATE, IS_HOME, OPP_ABBR,
  MIN, PTS, REB, AST, PF, SEASON)
- ``team_games``: one row per team per completed game
  (TEAM_ABBR, GAME_ID, GAME_DATE, IS_HOME, OPP_ABBR, PTS, FGA, FTA, OREB,
  DREB, REB, TOV, WL, SEASON)
- ``rosters``: (PLAYER_ID, PLAYER_NAME, TEAM_ABBR, POSITION) with coarse
  positions 'G'/'F'/'C'
- ``upcoming_games``: scheduled future games (GAME_DATE, HOME_ABBR, AWAY_ABBR)
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone

import pandas as pd

from simulator import config

PLAYER_GAMES_COLS = [
    "PLAYER_ID", "PLAYER_NAME", "TEAM_ABBR", "GAME_ID", "GAME_DATE",
    "IS_HOME", "OPP_ABBR", "MIN", "PTS", "REB", "AST", "PF", "SEASON",
]
TEAM_GAMES_COLS = [
    "TEAM_ABBR", "GAME_ID", "GAME_DATE", "IS_HOME", "OPP_ABBR",
    "PTS", "FGA", "FTA", "OREB", "DREB", "REB", "TOV", "WL", "SEASON",
]
ROSTERS_COLS = ["PLAYER_ID", "PLAYER_NAME", "TEAM_ABBR", "POSITION"]
UPCOMING_COLS = ["GAME_DATE", "HOME_ABBR", "AWAY_ABBR"]


@dataclass
class Bundle:
    player_games: pd.DataFrame
    team_games: pd.DataFrame
    rosters: pd.DataFrame
    upcoming_games: pd.DataFrame
    source: str


def save_bundle(
    player_games: pd.DataFrame,
    team_games: pd.DataFrame,
    rosters: pd.DataFrame,
    upcoming_games: pd.DataFrame,
    source: str,
) -> None:
    config.ensure_dirs()
    _validate(player_games, PLAYER_GAMES_COLS, "player_games")
    _validate(team_games, TEAM_GAMES_COLS, "team_games")
    _validate(rosters, ROSTERS_COLS, "rosters")
    _validate(upcoming_games, UPCOMING_COLS, "upcoming_games")

    player_games[PLAYER_GAMES_COLS].to_parquet(config.RAW_DIR / "player_games.parquet")
    team_games[TEAM_GAMES_COLS].to_parquet(config.RAW_DIR / "team_games.parquet")
    rosters[ROSTERS_COLS].to_parquet(config.RAW_DIR / "rosters.parquet")
    upcoming_games[UPCOMING_COLS].to_parquet(config.RAW_DIR / "upcoming_games.parquet")
    meta = {"source": source, "fetched_at": datetime.now(timezone.utc).isoformat()}
    (config.RAW_DIR / "meta.json").write_text(json.dumps(meta, indent=2))


def load_bundle() -> Bundle:
    meta_path = config.RAW_DIR / "meta.json"
    if not meta_path.exists():
        raise FileNotFoundError(
            "No dataset found. Run `simulator fetch` (live NBA data) or "
            "`simulator fetch --source synthetic` first."
        )
    meta = json.loads(meta_path.read_text())
    pg = pd.read_parquet(config.RAW_DIR / "player_games.parquet")
    tg = pd.read_parquet(config.RAW_DIR / "team_games.parquet")
    ro = pd.read_parquet(config.RAW_DIR / "rosters.parquet")
    up = pd.read_parquet(config.RAW_DIR / "upcoming_games.parquet")
    for df in (pg, tg, up):
        df["GAME_DATE"] = pd.to_datetime(df["GAME_DATE"])
    pg = pg.sort_values(["GAME_DATE", "GAME_ID"]).reset_index(drop=True)
    tg = tg.sort_values(["GAME_DATE", "GAME_ID"]).reset_index(drop=True)
    return Bundle(pg, tg, ro, up, meta["source"])


def _validate(df: pd.DataFrame, cols: list[str], name: str) -> None:
    missing = [c for c in cols if c not in df.columns]
    if missing:
        raise ValueError(f"{name} is missing columns: {missing}")
