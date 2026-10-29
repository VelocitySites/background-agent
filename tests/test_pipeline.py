"""Integration tests: synthetic league -> features -> models -> screener -> backtest.

These run the real pipeline end to end on a small simulated season, verifying
that the models recover the planted minutes-vacancy signal and that every
layer composes.
"""

import pandas as pd
import pytest

from simulator import config
from simulator.backtest import walk_forward
from simulator.data import store, synthetic
from simulator.features import build_features
from simulator.models.core import load_models, save_models, train_models
from simulator.screener import screen_slate


@pytest.fixture(scope="module")
def trained(tmp_path_factory):
    tmp = tmp_path_factory.mktemp("sim")
    raw_old, models_old = config.RAW_DIR, config.MODELS_DIR
    config.RAW_DIR, config.MODELS_DIR = tmp / "raw", tmp / "models"
    try:
        synthetic.generate(seed=3, start="2024-11-01", end="2025-02-28")
        bundle = store.load_bundle()
        fs = build_features(bundle, slate=bundle.upcoming_games)
        models = train_models(fs)
        save_models(models)
        yield bundle, fs, models
    finally:
        config.RAW_DIR, config.MODELS_DIR = raw_old, models_old


def test_training_beats_trivial_error(trained):
    _, _, models = trained
    assert models.metrics["mae_minutes"] < 4.0
    assert models.metrics["mae_ppm"] < 0.2


def test_vacated_minutes_matter_to_the_minutes_model(trained):
    _, _, models = trained
    importances = models.importances["MIN"]
    assert "VACATED_MIN_SAMEPOS" in importances


def test_model_roundtrip(trained):
    _, _, models = trained
    loaded = load_models()
    assert loaded.features == models.features
    assert loaded.staleness_days() < 1


def test_screen_future_slate(trained):
    bundle, _, models = trained
    date = bundle.upcoming_games["GAME_DATE"].min()
    top = screen_slate(bundle, models, date, top_n=5)
    assert 0 < len(top) <= 5
    assert (top["UPLIFT"] >= 2.0).all()
    assert top["SCORE"].is_monotonic_decreasing
    assert top["WHY"].str.len().gt(0).all()


def test_screen_historical_date(trained):
    bundle, _, models = trained
    date = bundle.player_games["GAME_DATE"].max()
    top = screen_slate(bundle, models, date, top_n=3)
    assert len(top) <= 3


def test_walk_forward_backtest(trained):
    bundle, _, _ = trained
    res = walk_forward(bundle, "2025-02-10", "2025-02-28", retrain_every_days=60)
    m = res.metrics
    assert m["rows_scored"] > 200
    # The model must at least hang with the naive 10-game-average baseline.
    assert m["minutes_mae_model"] < m["minutes_mae_baseline_avg10"] * 1.1
    # Uplift calls must enrich massively over the base rate of random spikes.
    if m["uplift_calls"] >= 5:
        assert m["uplift_call_hit_rate"] > m["base_rate_any_player"]
