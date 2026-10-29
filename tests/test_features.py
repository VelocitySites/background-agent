import pandas as pd

from simulator.data.teams import haversine_miles, team_meta
from simulator.features import build_features
from tests.conftest import make_mini_bundle


def _frame(bundle, **kwargs):
    return build_features(bundle, **kwargs).frame


def test_team_meta_covers_all_30_teams():
    meta = team_meta()
    assert len(meta) == 30
    assert meta["TEAM_ABBR"].is_unique
    den = meta[meta["TEAM_ABBR"] == "DEN"].iloc[0]
    assert den["ALTITUDE_FT"] >= 4000


def test_haversine_boston_to_la():
    bos = (42.366, -71.062)
    lal = (34.043, -118.267)
    miles = haversine_miles(*bos, *lal)
    assert 2500 < miles < 2700


def test_rest_days_and_back_to_back():
    df = _frame(make_mini_bundle())
    # Game 5 was scheduled one day after game 4 for both teams.
    g5 = df[df["GAME_ID"] == "G0005"]
    assert (g5["TEAM_REST_DAYS"] == 1).all()
    assert (g5["IS_B2B"] == 1).all()
    g6 = df[df["GAME_ID"] == "G0006"]
    assert (g6["TEAM_REST_DAYS"] == 2).all()
    assert (g6["IS_B2B"] == 0).all()


def test_rolling_rates_use_only_prior_games():
    # Every game is 30 min / 15 pts, so any leakage-free rate is exactly 0.5.
    df = _frame(make_mini_bundle())
    assert (df["PPM_SEASON"].round(6) == 0.5).all()
    assert (df["MIN_SEASON"].round(6) == 30.0).all()


def test_vacated_minutes_after_absence():
    # BOS player 1 (a guard) misses games 6-8; by game 7 the pre-game
    # expectation includes his ~30 vacated minutes.
    bundle = make_mini_bundle(absent_player=1, absent_games=(6, 7, 8))
    df = _frame(bundle)
    g7_bos = df[(df["GAME_ID"] == "G0007") & (df["TEAM_ABBR"] == "BOS")]
    assert (g7_bos["VACATED_MIN"] > 25).all()
    guards = g7_bos[g7_bos["POSITION"] == "G"]
    assert (guards["VACATED_MIN_SAMEPOS"] > 25).all()
    centers = g7_bos[g7_bos["POSITION"] == "C"]
    assert (centers["VACATED_MIN_SAMEPOS"] == 0).all()
    # Before the absence there was nothing vacated.
    g5_bos = df[(df["GAME_ID"] == "G0005") & (df["TEAM_ABBR"] == "BOS")]
    assert (g5_bos["VACATED_MIN"] == 0).all()


def test_games_since_return_tracks_absence():
    # Player 1 misses games 6-8 (7 calendar days without playing), so his
    # return game (game 9) must be flagged as game 0 since return.
    bundle = make_mini_bundle(absent_player=1, absent_games=(6, 7, 8))
    df = _frame(bundle)
    p1 = df[df["PLAYER_ID"] == 1].sort_values("GAME_DATE")
    returned = p1[p1["GAME_ID"] == "G0009"]
    assert (returned["GAMES_SINCE_RETURN"] == 0).all()
    nxt = p1[p1["GAME_ID"] == "G0010"]
    assert (nxt["GAMES_SINCE_RETURN"] == 1).all()


def test_altitude_flag_for_visitors_in_denver():
    df = _frame(make_mini_bundle())
    # DEN hosts odd games; BOS rows there are altitude games.
    bos_away = df[(df["TEAM_ABBR"] == "BOS") & (df["IS_HOME"] == 0)]
    assert (bos_away["ALTITUDE_GAME"] == 1).all()
    den_home = df[(df["TEAM_ABBR"] == "DEN") & (df["IS_HOME"] == 1)]
    assert (den_home["ALTITUDE_GAME"] == 0).all()


def test_future_slate_rows_get_features_without_targets():
    bundle = make_mini_bundle()
    df = _frame(bundle, slate=bundle.upcoming_games)
    fut = df[df["IS_FUTURE"]]
    assert len(fut) == 8  # all players on both teams
    assert fut["MIN"].isna().all()
    assert (fut["MIN_SEASON"].round(6) == 30.0).all()


def test_overrides_remove_candidate_and_vacate_minutes():
    bundle = make_mini_bundle()
    df = _frame(bundle, slate=bundle.upcoming_games, overrides={1})
    fut = df[df["IS_FUTURE"]]
    assert 1 not in set(fut["PLAYER_ID"])
    bos_guards = fut[(fut["TEAM_ABBR"] == "BOS") & (fut["POSITION"] == "G")]
    assert (bos_guards["VACATED_MIN_SAMEPOS"] > 25).all()
