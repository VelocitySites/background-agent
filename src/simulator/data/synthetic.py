"""Synthetic league generator for offline development, tests, and demos.

Simulates a mini-NBA with the real causal structure the models are supposed to
recover: role-based minutes, injuries that vacate minutes to same-position
teammates, ramp-up curves on return, back-to-back and rest effects, pace and
opponent-defense scaling, home/altitude effects, and late-season tanking
minutes shifts. Because the effects are injected on purpose, a model trained
on this data should find them — making it a true end-to-end verification of
the pipeline, not just a smoke test.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
import pandas as pd

from simulator.data import store
from simulator.data.teams import team_meta

TEAM_POOL = [
    "BOS", "DEN", "UTA", "LAL", "MIA", "CHI",
    "DAL", "PHX", "NYK", "GSW", "MEM", "ORL",
]
POSITIONS = ["G", "G", "G", "G", "F", "F", "F", "F", "C", "C", "C"]


@dataclass
class _Player:
    pid: int
    name: str
    team: str
    pos: str
    base_min: float
    ppm: float
    rpm: float
    apm: float
    young: bool
    games_out_left: int = 0
    games_since_return: int = 99


@dataclass
class _Team:
    abbr: str
    strength: float
    pace: float
    defense: float  # multiplier on opponent scoring rates (<1 = good defense)
    players: list[_Player] = field(default_factory=list)


def _make_league(rng: np.random.Generator) -> list[_Team]:
    teams, pid = [], 1000
    for abbr in TEAM_POOL:
        team = _Team(
            abbr=abbr,
            strength=float(rng.normal(0, 1)),
            pace=float(rng.normal(100, 4)),
            defense=float(np.clip(rng.normal(1.0, 0.05), 0.88, 1.12)),
        )
        base_minutes = [34, 32, 30, 28, 26, 22, 18, 14, 12, 9, 7]
        order = rng.permutation(len(POSITIONS))
        for slot, pos_idx in enumerate(order):
            pos = POSITIONS[pos_idx]
            ppm = float(np.clip(rng.normal(0.52, 0.16), 0.15, 1.15))
            rpm = {"G": 0.10, "F": 0.18, "C": 0.28}[pos] * float(rng.lognormal(0, 0.3))
            apm = {"G": 0.20, "F": 0.10, "C": 0.05}[pos] * float(rng.lognormal(0, 0.3))
            team.players.append(
                _Player(
                    pid=pid,
                    name=f"{abbr} Player{slot + 1}",
                    team=abbr,
                    pos=pos,
                    base_min=float(base_minutes[slot]),
                    ppm=ppm,
                    rpm=rpm,
                    apm=apm,
                    young=bool(rng.random() < 0.35),
                )
            )
            pid += 1
        teams.append(team)
    return teams


def _schedule_days(
    rng: np.random.Generator, teams: list[_Team], start: pd.Timestamp, end: pd.Timestamp
) -> list[tuple[pd.Timestamp, str, str]]:
    """Day-by-day pairing with varied rest, including back-to-backs."""
    last_played = {t.abbr: start - pd.Timedelta(days=3) for t in teams}
    games = []
    day = start
    while day <= end:
        pool = []
        for t in teams:
            rest = (day - last_played[t.abbr]).days
            # Teams want to play every ~2 days; occasionally accept a back-to-back.
            if rest >= 2 or (rest == 1 and rng.random() < 0.28):
                pool.append(t.abbr)
        rng.shuffle(pool)
        for i in range(0, len(pool) - 1, 2):
            home, away = (pool[i], pool[i + 1]) if rng.random() < 0.5 else (pool[i + 1], pool[i])
            games.append((day, home, away))
            last_played[home] = day
            last_played[away] = day
        day += pd.Timedelta(days=1)
    return games


def _allocate_minutes(
    rng: np.random.Generator,
    team: _Team,
    is_b2b: bool,
    blowout_factor: float,
    tanking: bool,
    total_minutes: float = 240.0,
) -> dict[int, float]:
    """Distribute the game's minutes among available players with injected effects."""
    available = [p for p in team.players if p.games_out_left == 0]
    weights: dict[int, float] = {}
    vacated = {"G": 0.0, "F": 0.0, "C": 0.0}
    for p in team.players:
        if p.games_out_left > 0:
            vacated[p.pos] += p.base_min

    for p in available:
        m = p.base_min
        # Vacated minutes flow mostly to same-position teammates.
        same_pos = [q for q in available if q.pos == p.pos]
        if same_pos and vacated[p.pos] > 0:
            m += 0.7 * vacated[p.pos] * (p.base_min / sum(q.base_min for q in same_pos))
        other_vacated = sum(v for k, v in vacated.items() if k != p.pos)
        if other_vacated > 0:
            m += 0.3 * other_vacated * (p.base_min / sum(q.base_min for q in available))
        # Ramp-up on return from multi-game absence.
        if p.games_since_return == 0:
            m *= 0.6
        elif p.games_since_return == 1:
            m *= 0.8
        elif p.games_since_return == 2:
            m *= 0.95
        # Back-to-back trims heavy-minutes players.
        if is_b2b and p.base_min >= 26:
            m -= 1.5
        # Blowouts shift minutes from starters to bench.
        if p.base_min >= 26:
            m -= 4.0 * blowout_factor
        else:
            m += 2.5 * blowout_factor
        # Tanking teams late in the season push young players.
        if tanking:
            m += 6.0 if p.young else (-4.0 if p.base_min >= 28 else 0.0)
        m *= float(rng.lognormal(0, 0.08))
        weights[p.pid] = max(m, 0.0)

    total = sum(weights.values())
    return {pid: m / total * total_minutes for pid, m in weights.items()}


def generate(
    seed: int = 7,
    start: str = "2024-11-01",
    end: str = "2025-03-25",
    upcoming_days: int = 2,
) -> None:
    """Simulate a season and persist it as the canonical bundle."""
    rng = np.random.default_rng(seed)
    teams = _make_league(rng)
    by_abbr = {t.abbr: t for t in teams}
    meta = team_meta().set_index("TEAM_ABBR")
    start_ts, end_ts = pd.Timestamp(start), pd.Timestamp(end)
    season_label = "SYN-2024-25"

    all_games = _schedule_days(rng, teams, start_ts, end_ts)
    last_played = {t.abbr: None for t in teams}
    player_rows, team_rows = [], []

    for gi, (day, home, away) in enumerate(all_games):
        gid = f"SYN{gi:07d}"
        th, ta = by_abbr[home], by_abbr[away]
        pace = (th.pace + ta.pace) / 2 + float(rng.normal(0, 2))
        tanking_month = day.month in (3, 4)
        strength_gap = abs(th.strength - ta.strength)
        blowout = float(np.clip((strength_gap - 0.8) / 2.0, 0, 1)) * (rng.random() < 0.6)

        # Update injury state once per team-game.
        for team in (th, ta):
            for p in team.players:
                if p.games_out_left > 0:
                    p.games_out_left -= 1
                    if p.games_out_left == 0:
                        p.games_since_return = -1  # next game played is game 0 back
                elif rng.random() < 0.02:
                    p.games_out_left = int(rng.geometric(0.25))

        # Overtime stretches every rotation (~6% of games, 25 extra minutes).
        game_minutes = 265.0 if rng.random() < 0.06 else 240.0

        team_pts = {}
        for team, opp, is_home in ((th, ta, True), (ta, th, False)):
            is_b2b = (
                last_played[team.abbr] is not None
                and (day - last_played[team.abbr]).days == 1
            )
            rest_days = (
                (day - last_played[team.abbr]).days if last_played[team.abbr] else 3
            )
            tanking = tanking_month and team.strength < -0.6
            minutes = _allocate_minutes(
                rng, team, is_b2b, blowout, tanking, total_minutes=game_minutes
            )
            # Usage boost: with scorers out, remaining players shoot more often.
            vacated_total = sum(
                p.base_min for p in team.players if p.games_out_left > 0
            )
            usage_boost = 1.0 + 0.12 * min(vacated_total / 48.0, 1.5)

            altitude_away = (
                not is_home and meta.loc[opp.abbr, "ALTITUDE_FT"] >= 4000
            )
            ctx = 1.0
            ctx *= 1.02 if is_home else 0.98
            ctx *= 0.96 if is_b2b else (1.01 if rest_days >= 3 else 1.0)
            ctx *= 0.95 if altitude_away else 1.0
            ctx *= pace / 100.0
            ctx *= opp.defense

            pts_total = 0
            for p in team.players:
                if p.pid not in minutes:
                    continue
                if p.games_since_return == -1:
                    p.games_since_return = 0
                m = minutes[p.pid]
                pts = int(rng.poisson(max(p.ppm * ctx * usage_boost, 0.01) * m))
                reb = int(rng.poisson(max(p.rpm * (pace / 100.0), 0.01) * m))
                ast = int(rng.poisson(max(p.apm * (pace / 100.0), 0.01) * m))
                pf = int(rng.poisson(0.045 * m))
                pts_total += pts
                player_rows.append(
                    (p.pid, p.name, team.abbr, gid, day, is_home, opp.abbr,
                     round(m, 1), pts, reb, ast, pf, season_label)
                )
                if p.games_since_return < 99:
                    p.games_since_return += 1
            team_pts[team.abbr] = pts_total

        for team, opp, is_home in ((th, ta, True), (ta, th, False)):
            poss = pace + float(rng.normal(0, 3))
            team_rows.append(
                (team.abbr, gid, day, is_home, opp.abbr, team_pts[team.abbr],
                 int(poss * 0.84), int(poss * 0.24), int(poss * 0.10),
                 int(poss * 0.33), int(poss * 0.43), int(poss * 0.13),
                 "W" if team_pts[team.abbr] >= team_pts[opp.abbr] else "L",
                 season_label)
            )
        last_played[home] = day
        last_played[away] = day

    player_games = pd.DataFrame(player_rows, columns=store.PLAYER_GAMES_COLS)
    team_games = pd.DataFrame(team_rows, columns=store.TEAM_GAMES_COLS)
    rosters = pd.DataFrame(
        [(p.pid, p.name, t.abbr, p.pos) for t in teams for p in t.players],
        columns=store.ROSTERS_COLS,
    )

    upcoming = _schedule_days(
        rng, teams, end_ts + pd.Timedelta(days=1),
        end_ts + pd.Timedelta(days=upcoming_days),
    )
    upcoming_games = pd.DataFrame(
        [(d, h, a) for d, h, a in upcoming], columns=store.UPCOMING_COLS
    )

    store.save_bundle(player_games, team_games, rosters, upcoming_games, source="synthetic")
