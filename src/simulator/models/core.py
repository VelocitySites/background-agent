"""MinutesModel + RatesModel: LightGBM regressors over the feature frame.

- MinutesModel predicts tonight's minutes (the "25-average plays 35" signal).
- RatesModel is three regressors for PPM/RPM/APM, sample-weighted by minutes
  played so garbage-time blips don't dominate.

Artifacts are persisted to MODELS_DIR together with the feature list, training
metrics, and feature importances, so `simulator predict` can explain which
factors the models actually lean on.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor, early_stopping, log_evaluation
from sklearn.metrics import mean_absolute_error

from simulator import config
from simulator.features import FeatureSet

_LGBM_PARAMS = dict(
    n_estimators=600,
    learning_rate=0.05,
    num_leaves=63,
    min_child_samples=30,
    subsample=0.9,
    subsample_freq=1,
    colsample_bytree=0.85,
    random_state=0,
    verbosity=-1,
)

_TARGET_SPECS = [
    ("MIN", "minutes", False),
    ("PPM", "ppm", True),
    ("RPM", "rpm", True),
    ("APM", "apm", True),
]


@dataclass
class ModelBundle:
    models: dict[str, LGBMRegressor]
    features: list[str]
    trained_at: str
    metrics: dict[str, float] = field(default_factory=dict)
    importances: dict[str, dict[str, float]] = field(default_factory=dict)

    def predict(self, frame: pd.DataFrame) -> pd.DataFrame:
        """Return PRED_MIN / PRED_PPM / PRED_RPM / PRED_APM for each row."""
        X = frame[self.features]
        out = pd.DataFrame(index=frame.index)
        out["PRED_MIN"] = np.clip(self.models["MIN"].predict(X), 0, 48)
        for t in ("PPM", "RPM", "APM"):
            out[f"PRED_{t}"] = np.clip(self.models[t].predict(X), 0, None)
        return out

    def minutes_contributions(self, frame: pd.DataFrame) -> pd.DataFrame:
        """Per-row feature contributions (SHAP-style) to the minutes prediction."""
        X = frame[self.features]
        contrib = self.models["MIN"].predict(X, pred_contrib=True)
        return pd.DataFrame(
            contrib[:, :-1], columns=self.features, index=frame.index
        )

    def staleness_days(self) -> float:
        trained = datetime.fromisoformat(self.trained_at)
        return (datetime.now(timezone.utc) - trained).total_seconds() / 86400.0


def train_models(
    fs: FeatureSet, valid_tail_frac: float = 0.15, cutoff: pd.Timestamp | None = None
) -> ModelBundle:
    """Fit all four models on historical rows.

    ``cutoff``: if given, only rows strictly before this date are used (needed
    for walk-forward backtesting). The validation split is the most recent
    ``valid_tail_frac`` of training dates — chronological, never random, so
    validation mimics predicting the future.
    """
    hist = fs.frame[~fs.frame["IS_FUTURE"]].copy()
    if cutoff is not None:
        hist = hist[hist["GAME_DATE"] < cutoff]
    hist = hist.sort_values("GAME_DATE")
    if len(hist) < 500:
        raise ValueError(f"Not enough training rows ({len(hist)}); fetch more seasons.")

    dates = hist["GAME_DATE"].drop_duplicates().sort_values()
    split_date = dates.iloc[int(len(dates) * (1 - valid_tail_frac))]
    train, valid = hist[hist["GAME_DATE"] < split_date], hist[hist["GAME_DATE"] >= split_date]

    models: dict[str, LGBMRegressor] = {}
    metrics: dict[str, float] = {}
    importances: dict[str, dict[str, float]] = {}
    for target, label, weight_by_min in _TARGET_SPECS:
        tr = train.dropna(subset=[target])
        va = valid.dropna(subset=[target])
        model = LGBMRegressor(**_LGBM_PARAMS)
        model.fit(
            tr[fs.features],
            tr[target],
            sample_weight=tr["MIN"] if weight_by_min else None,
            eval_X=va[fs.features],
            eval_y=va[target],
            eval_sample_weight=[va["MIN"]] if weight_by_min else None,
            callbacks=[early_stopping(50, verbose=False), log_evaluation(0)],
        )
        models[target] = model
        metrics[f"mae_{label}"] = float(
            mean_absolute_error(va[target], model.predict(va[fs.features]))
        )
        imp = model.booster_.feature_importance(importance_type="gain")
        total = imp.sum() or 1.0
        importances[target] = {
            f: round(float(v) / total, 4)
            for f, v in sorted(zip(fs.features, imp), key=lambda x: -x[1])[:12]
        }

    return ModelBundle(
        models=models,
        features=list(fs.features),
        trained_at=datetime.now(timezone.utc).isoformat(),
        metrics=metrics,
        importances=importances,
    )


def save_models(bundle: ModelBundle, directory: Path | None = None) -> None:
    directory = directory or config.MODELS_DIR
    directory.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle.models, directory / "models.joblib")
    meta = {
        "features": bundle.features,
        "trained_at": bundle.trained_at,
        "metrics": bundle.metrics,
        "importances": bundle.importances,
    }
    (directory / "meta.json").write_text(json.dumps(meta, indent=2))


def load_models(directory: Path | None = None) -> ModelBundle:
    directory = directory or config.MODELS_DIR
    meta_path = directory / "meta.json"
    if not meta_path.exists():
        raise FileNotFoundError("No trained models found. Run `simulator train` first.")
    meta = json.loads(meta_path.read_text())
    models = joblib.load(directory / "models.joblib")
    return ModelBundle(
        models=models,
        features=meta["features"],
        trained_at=meta["trained_at"],
        metrics=meta.get("metrics", {}),
        importances=meta.get("importances", {}),
    )
