from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from simulator import config
from simulator.data.store import Bundle


@pytest.fixture
def tmp_data(tmp_path, monkeypatch):
    """Point all simulator state at a throwaway directory."""
    monkeypatch.setattr(config, "DATA_DIR", tmp_path)
    monkeypatch.setattr(config, "RAW_DIR", tmp_path / "raw")
    monkeypatch.setattr(config, "MODELS_DIR", tmp_path / "models")
    monkeypatch.setattr(config, "LEDGER_PATH", tmp_path / "ledger.csv")
    monkeypatch.setattr(config, "OVERRIDES_PATH", tmp_path / "overrides.csv")
    return tmp_path


def make_mini_bundle(
    n_games: int = 12,
    absent_player: int | None = None,
    absent_games: tuple[int, ...] = (),
) -> Bundle:
    """Two real teams (BOS home, DEN away alternating), 4 players each, fixed
    stat lines, games exactly 2 days apart except game 5 (back-to-back).

    Player ids 1-4 are BOS (G,G,F,C), 11-14 are DEN. Every player logs 30 min,
    15 pts, 6 reb, 3 ast, 2 pf unless absent.
    """
    dates = [pd.Timestamp("2025-01-01")]
    for i in range(1, n_games):
        step = 1 if i == 5 else 2
        dates.append(dates[-1] + pd.Timedelta(days=step))

    players = {
        1: ("BOS P1", "BOS", "G"), 2: ("BOS P2", "BOS", "G"),
        3: ("BOS P3", "BOS", "F"), 4: ("BOS P4", "BOS", "C"),
        11: ("DEN P1", "DEN", "G"), 12: ("DEN P2", "DEN", "G"),
        13: ("DEN P3", "DEN", "F"), 14: ("DEN P4", "DEN", "C"),
    }
    prow, trow = [], []
    for gi, d in enumerate(dates):
        gid = f"G{gi:04d}"
        home, away = ("BOS", "DEN") if gi % 2 == 0 else ("DEN", "BOS")
        for pid, (name, team, _pos) in players.items():
            if pid == absent_player and gi in absent_games:
                continue
            is_home = team == home
            opp = away if team == home else home
            prow.append((pid, name, team, gid, d, is_home, opp,
                         30.0, 15, 6, 3, 2, "TEST"))
        for team, opp, is_home in ((home, away, True), (away, home, False)):
            trow.append((team, gid, d, is_home, opp, 110, 88, 22, 10, 33, 43,
                         12, "W" if is_home else "L", "TEST"))

    from simulator.data.store import PLAYER_GAMES_COLS, ROSTERS_COLS, TEAM_GAMES_COLS, UPCOMING_COLS

    player_games = pd.DataFrame(prow, columns=PLAYER_GAMES_COLS)
    team_games = pd.DataFrame(trow, columns=TEAM_GAMES_COLS)
    rosters = pd.DataFrame(
        [(pid, v[0], v[1], v[2]) for pid, v in players.items()], columns=ROSTERS_COLS
    )
    upcoming = pd.DataFrame(
        [(dates[-1] + pd.Timedelta(days=2), "BOS", "DEN")], columns=UPCOMING_COLS
    )
    return Bundle(player_games, team_games, rosters, upcoming, "test")
