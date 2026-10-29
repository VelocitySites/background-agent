"""Central paths and tunable constants for the simulator."""

from __future__ import annotations

import os
from pathlib import Path

# All mutable state (raw data cache, model artifacts, ledger) lives under DATA_DIR.
DATA_DIR = Path(os.environ.get("SIMULATOR_DATA_DIR", Path.home() / ".nba-simulator"))
RAW_DIR = DATA_DIR / "raw"
MODELS_DIR = DATA_DIR / "models"
LEDGER_PATH = DATA_DIR / "ledger.csv"
OVERRIDES_PATH = DATA_DIR / "availability_overrides.csv"

# Modeling constants
ROLLING_WINDOWS = (5, 10, 20)
MIN_GAMES_FOR_PREDICTION = 5  # player must have this many prior games this season
RECENT_ACTIVITY_DAYS = 14  # player considered rosterable if they played within this window

# Screener defaults
DEFAULT_TOP_N = 5
UPLIFT_CALL_THRESHOLD = 8.0  # minutes above season average that counts as an "outlier call"
STRONG_PPM = 0.9  # per-minute scoring considered elite for the headline use case

# Model staleness warning
MODEL_STALENESS_DAYS = 14

# Rate limiting for stats.nba.com (it throttles datacenter traffic aggressively)
NBA_API_SLEEP_SECONDS = 1.2
NBA_API_TIMEOUT_SECONDS = 30


def ensure_dirs() -> None:
    for d in (DATA_DIR, RAW_DIR, MODELS_DIR):
        d.mkdir(parents=True, exist_ok=True)
