"""Static NBA team metadata used for travel, time-zone, and altitude features.

Coordinates are arena locations (approximate). ``tz_offset`` is the standard-time
UTC offset in hours; only the *difference* between venues matters for the
time-zones-crossed feature, so DST is ignored. ``altitude_ft`` drives the
high-altitude flag (Denver and Utah are the only venues above 4,000 ft).
"""

from __future__ import annotations

import math

import pandas as pd

_TEAMS = [
    # abbr, lat, lon, tz_offset, altitude_ft
    ("ATL", 33.757, -84.396, -5, 1050),
    ("BOS", 42.366, -71.062, -5, 20),
    ("BKN", 40.683, -73.975, -5, 30),
    ("CHA", 35.225, -80.839, -5, 751),
    ("CHI", 41.881, -87.674, -6, 594),
    ("CLE", 41.496, -81.688, -5, 653),
    ("DAL", 32.790, -96.810, -6, 430),
    ("DEN", 39.749, -105.008, -7, 5280),
    ("DET", 42.341, -83.055, -5, 600),
    ("GSW", 37.768, -122.388, -8, 10),
    ("HOU", 29.751, -95.362, -6, 50),
    ("IND", 39.764, -86.156, -5, 715),
    ("LAC", 34.043, -118.267, -8, 200),
    ("LAL", 34.043, -118.267, -8, 200),
    ("MEM", 35.138, -90.051, -6, 337),
    ("MIA", 25.781, -80.188, -5, 10),
    ("MIL", 43.045, -87.917, -6, 617),
    ("MIN", 44.979, -93.276, -6, 830),
    ("NOP", 29.949, -90.082, -6, 10),
    ("NYK", 40.750, -73.993, -5, 30),
    ("OKC", 35.463, -97.515, -6, 1200),
    ("ORL", 28.539, -81.384, -5, 82),
    ("PHI", 39.901, -75.172, -5, 40),
    ("PHX", 33.446, -112.071, -7, 1086),
    ("POR", 45.532, -122.667, -8, 50),
    ("SAC", 38.580, -121.500, -8, 30),
    ("SAS", 29.427, -98.437, -6, 650),
    ("TOR", 43.643, -79.379, -5, 250),
    ("UTA", 40.768, -111.901, -7, 4226),
    ("WAS", 38.898, -77.021, -5, 50),
]

HIGH_ALTITUDE_FT = 4000.0


def team_meta() -> pd.DataFrame:
    """Return one row per team: TEAM_ABBR, LAT, LON, TZ_OFFSET, ALTITUDE_FT."""
    return pd.DataFrame(
        _TEAMS, columns=["TEAM_ABBR", "LAT", "LON", "TZ_OFFSET", "ALTITUDE_FT"]
    )


def haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in miles between two points."""
    r = 3958.8
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))
