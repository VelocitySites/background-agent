"""Command-line interface.

    simulator fetch [--source nba|synthetic]   refresh the dataset
    simulator train                            fit minutes + rates models
    simulator predict [--date ...] [--top 5]   rank tonight's outlier candidates
    simulator settle                           fill actuals for past picks
    simulator daily                            fetch -> settle -> predict
    simulator backtest --start ... --end ...   walk-forward validation
    simulator ledger                           paper-trading performance summary
    simulator override add|clear|list          mark players out for upcoming games
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd
import typer
from rich.console import Console
from rich.table import Table

from simulator import config

app = typer.Typer(add_completion=False, help=__doc__)
override_app = typer.Typer(help="Manage availability overrides (players known to be out).")
app.add_typer(override_app, name="override")
console = Console()

DISCLAIMER = (
    "[dim]Research tool, not betting advice. Books price these same factors with better "
    "data; parlays multiply the house edge. Paper-trade via the ledger before risking "
    "anything, and never money needed for essentials.[/dim]"
)


def _load_bundle():
    from simulator.data import store

    return store.load_bundle()


def _load_overrides() -> set[int]:
    if not config.OVERRIDES_PATH.exists():
        return set()
    df = pd.read_csv(config.OVERRIDES_PATH)
    return set(df["PLAYER_ID"].astype(int))


@app.command()
def fetch(
    source: str = typer.Option("nba", help="'nba' (live stats.nba.com) or 'synthetic' (offline demo league)"),
    seasons: int = typer.Option(3, help="Number of recent seasons to pull (nba source)"),
    seed: int = typer.Option(7, help="RNG seed (synthetic source)"),
) -> None:
    """Download/refresh the dataset into the local Parquet cache."""
    if source == "synthetic":
        from simulator.data import synthetic

        synthetic.generate(seed=seed)
        console.print("[green]Synthetic league generated.[/green]")
    elif source == "nba":
        from simulator.data import ingest

        season_list = ingest.default_seasons(seasons)
        console.print(f"Fetching seasons {season_list} from stats.nba.com (rate-limited)...")
        ingest.fetch_nba(season_list)
        console.print("[green]NBA data fetched.[/green]")
    else:
        raise typer.BadParameter("source must be 'nba' or 'synthetic'")


@app.command()
def train() -> None:
    """Build features and fit the minutes and per-minute-rate models."""
    from simulator.features import build_features
    from simulator.models.core import save_models, train_models

    bundle = _load_bundle()
    fs = build_features(bundle)
    mb = train_models(fs)
    save_models(mb)
    console.print(f"[green]Models trained[/green] on {len(fs.frame):,} rows.")
    for k, v in mb.metrics.items():
        console.print(f"  validation {k}: {v:.3f}")
    console.print("Top minutes-model drivers (gain share):")
    for feat, share in list(mb.importances.get("MIN", {}).items())[:8]:
        console.print(f"  {feat}: {share:.1%}")


@app.command()
def predict(
    date: str = typer.Option(None, help="Slate date YYYY-MM-DD (default: earliest upcoming)"),
    top: int = typer.Option(config.DEFAULT_TOP_N, help="Number of candidates to show"),
    record: bool = typer.Option(True, help="Record picks to the paper-trading ledger"),
) -> None:
    """Rank the top minutes-uplift outlier candidates for a slate."""
    from simulator import ledger as ledger_mod
    from simulator.models.core import load_models
    from simulator.screener import screen_slate

    bundle = _load_bundle()
    models = load_models()
    if models.staleness_days() > config.MODEL_STALENESS_DAYS:
        console.print(
            f"[yellow]Warning: models are {models.staleness_days():.0f} days old; "
            "rotations drift - run `simulator train`.[/yellow]"
        )
    if date is None:
        if not len(bundle.upcoming_games):
            raise typer.BadParameter("No upcoming games stored; pass --date or re-fetch.")
        slate_date = bundle.upcoming_games["GAME_DATE"].min()
    else:
        slate_date = pd.Timestamp(date)

    picks = screen_slate(bundle, models, slate_date, top_n=top, overrides=_load_overrides())
    if not len(picks):
        console.print("No candidates cleared the minimum uplift bar for this slate.")
        return

    table = Table(title=f"Minutes-uplift outliers - {pd.Timestamp(slate_date).date()}")
    for col in ("#", "Player", "Tm", "Opp", "H/A", "Avg Min", "Proj Min",
                "Uplift", "P(+5m)", "P/min", "R/min", "A/min", "PTS P10-P90"):
        table.add_column(col, no_wrap=True)
    for i, (_, r) in enumerate(picks.iterrows(), start=1):
        table.add_row(
            str(i), str(r["PLAYER_NAME"]), r["TEAM_ABBR"], r["OPP_ABBR"],
            "H" if r["IS_HOME"] else "A",
            f"{r['MIN_SEASON']:.1f}",
            f"{r['PRED_MIN']:.1f} ({r['PRED_MIN_LO']:.0f}-{r['PRED_MIN_HI']:.0f})",
            f"[bold]{r['UPLIFT']:+.1f}[/bold]",
            f"{r['PROB_UPLIFT5']:.0%}",
            f"{r['PRED_PPM']:.2f}", f"{r['PRED_RPM']:.2f}", f"{r['PRED_APM']:.2f}",
            f"{r['PTS_P50']:.0f} ({r['PTS_P10']:.0f}-{r['PTS_P90']:.0f})",
        )
    console.print(table)
    for i, (_, r) in enumerate(picks.iterrows(), start=1):
        console.print(f"  [bold]{i}. {r['PLAYER_NAME']}[/bold]: {r['WHY']}")
    console.print(DISCLAIMER)

    if record:
        from simulator.screener import predictions_for_rows  # noqa: F401 (documented path)

        picks_with_ids = picks.copy()
        # screen_slate's report drops PLAYER_ID; recover it by name+team+date.
        added = ledger_mod.record_picks(_attach_ids(bundle, picks_with_ids))
        console.print(f"[dim]{added} pick(s) recorded to the paper-trading ledger.[/dim]")


def _attach_ids(bundle, picks: pd.DataFrame) -> pd.DataFrame:
    latest = (
        bundle.player_games.sort_values("GAME_DATE")
        .groupby("PLAYER_NAME")["PLAYER_ID"]
        .last()
    )
    picks = picks.copy()
    picks["PLAYER_ID"] = picks["PLAYER_NAME"].map(latest)
    return picks


@app.command()
def settle() -> None:
    """Fill in actual box-score results for unsettled ledger picks."""
    from simulator import ledger as ledger_mod

    bundle = _load_bundle()
    n = ledger_mod.settle(bundle)
    console.print(f"{n} pick(s) settled.")
    _print_ledger_summary()


@app.command()
def ledger() -> None:
    """Show paper-trading ledger performance."""
    _print_ledger_summary()


def _print_ledger_summary() -> None:
    from simulator import ledger as ledger_mod

    summary = ledger_mod.summarize()
    table = Table(title="Paper-trading ledger")
    table.add_column("Metric")
    table.add_column("Value")
    for k, v in summary.items():
        if k == "verdict":
            continue
        table.add_row(k, str(v))
    console.print(table)
    console.print(f"[bold]{summary['verdict']}[/bold]")
    console.print(DISCLAIMER)


@app.command()
def daily(top: int = typer.Option(config.DEFAULT_TOP_N)) -> None:
    """One-shot daily run: refresh data, settle past picks, predict today."""
    bundle_meta = config.RAW_DIR / "meta.json"
    source = "nba"
    if bundle_meta.exists():
        import json

        source = json.loads(bundle_meta.read_text()).get("source", "nba")
    fetch(source=source, seasons=3, seed=7)
    settle()
    predict(date=None, top=top, record=True)


@app.command()
def backtest(
    start: str = typer.Option(..., help="Start date YYYY-MM-DD"),
    end: str = typer.Option(..., help="End date YYYY-MM-DD"),
    retrain_every: int = typer.Option(30, help="Retrain cadence in days"),
    top: int = typer.Option(config.DEFAULT_TOP_N),
) -> None:
    """Walk-forward validation: train on the past only, score every call."""
    from simulator.backtest import walk_forward

    bundle = _load_bundle()
    res = walk_forward(
        bundle, start, end, retrain_every_days=retrain_every, top_n=top
    )
    table = Table(title=f"Walk-forward backtest {start} -> {end}")
    table.add_column("Metric")
    table.add_column("Value")
    for k, v in res.metrics.items():
        table.add_row(k, str(v))
    console.print(table)
    hits_df = res.daily_picks
    if len(hits_df):
        best = hits_df.sort_values("ACTUAL_UPLIFT", ascending=False).head(5)
        console.print("Best realized picks:")
        for _, r in best.iterrows():
            console.print(
                f"  {pd.Timestamp(r['GAME_DATE']).date()} {r['PLAYER_NAME']}: "
                f"avg {r['MIN_SEASON']:.1f} -> predicted {r['PRED_MIN']:.1f}, "
                f"actually played {r['MIN']:.1f}"
            )
    console.print(DISCLAIMER)


@override_app.command("add")
def override_add(name: str = typer.Argument(..., help="Player name (as in the data)")) -> None:
    """Mark a player OUT for upcoming games (adds his minutes to the vacated pool)."""
    bundle = _load_bundle()
    names = bundle.player_games[["PLAYER_ID", "PLAYER_NAME"]].drop_duplicates()
    matches = names[names["PLAYER_NAME"].str.lower() == name.lower()]
    if not len(matches):
        matches = names[names["PLAYER_NAME"].str.lower().str.contains(name.lower())]
    if not len(matches):
        console.print(f"[red]No player matching '{name}'.[/red]")
        raise typer.Exit(1)
    if len(matches) > 1:
        console.print(f"[red]Ambiguous name '{name}':[/red] {', '.join(matches['PLAYER_NAME'])}")
        raise typer.Exit(1)
    row = matches.iloc[0]
    existing = (
        pd.read_csv(config.OVERRIDES_PATH)
        if config.OVERRIDES_PATH.exists()
        else pd.DataFrame(columns=["PLAYER_ID", "PLAYER_NAME"])
    )
    if int(row["PLAYER_ID"]) not in set(existing["PLAYER_ID"].astype(int)):
        existing = pd.concat(
            [existing, pd.DataFrame([{"PLAYER_ID": int(row["PLAYER_ID"]), "PLAYER_NAME": row["PLAYER_NAME"]}])],
            ignore_index=True,
        )
        config.OVERRIDES_PATH.parent.mkdir(parents=True, exist_ok=True)
        existing.to_csv(config.OVERRIDES_PATH, index=False)
    console.print(f"[green]{row['PLAYER_NAME']} marked OUT for upcoming predictions.[/green]")


@override_app.command("clear")
def override_clear() -> None:
    """Remove all availability overrides."""
    if config.OVERRIDES_PATH.exists():
        config.OVERRIDES_PATH.unlink()
    console.print("Overrides cleared.")


@override_app.command("list")
def override_list() -> None:
    """Show current availability overrides."""
    if not config.OVERRIDES_PATH.exists():
        console.print("No overrides set.")
        return
    console.print(pd.read_csv(config.OVERRIDES_PATH).to_string(index=False))


if __name__ == "__main__":
    app()
