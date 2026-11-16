"""AquaBaseline Model & Anomaly Detection Pipeline
Hour-aware Isolation Forest per building with plain-language explanation generation.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, Tuple, List, Optional

def compute_hourly_baselines(tr: pd.DataFrame) -> Tuple[pd.Series, pd.Series, pd.Series]:
    """Compute hour-by-hour median, lo (10th pct) and hi (90th pct) flow from training set."""
    # Group by hour
    valid_tr = tr.dropna(subset=["flow"])
    med = valid_tr.groupby("hour")["flow"].median().replace(0, np.nan).fillna(1.0)
    lo = valid_tr.groupby("hour")["flow"].quantile(0.10).fillna(0.0)
    hi = valid_tr.groupby("hour")["flow"].quantile(0.90).fillna(1.0)
    return med, lo, hi

def generate_reason(hour: int, flow: float, median_flow: float, rel: float, is_night: bool) -> str:
    """Generate rule-based plain English reason for an alert."""
    if is_night or (1 <= hour <= 5):
        if rel >= 2.0:
            return f"Night flow ({hour:02d}:00) was {rel:.1f}x the usual baseline level ({flow:.0f} L vs median {median_flow:.0f} L)."
        else:
            return f"Elevated night flow during minimum baseline hours ({hour:02d}:00)."
    elif rel >= 2.5:
        return f"Flow was {rel:.1f}x the usual level for {hour:02d}:00 ({flow:.0f} L vs median {median_flow:.0f} L)."
    elif flow == 0 and median_flow > 100:
        return f"Unexpected zero flow reading during regular peak hour {hour:02d}:00."
    else:
        return f"Anomalous pattern detected: flow deviated from diurnal baseline at {hour:02d}:00 (rel={rel:.2f})."

def train_and_score(
    h_df: pd.DataFrame,
    train_days: int = 28,
    contamination: float = 0.01,
    hour_aware: bool = True,
    seed: int = 1,
    alert_percentile: float = 99.0,
    excluded_intervals: Optional[List[Tuple[pd.Timestamp, pd.Timestamp]]] = None,
) -> Tuple[pd.DataFrame, IsolationForest, Dict[str, Any]]:
    """Train Isolation Forest on days < train_days and score all days."""
    df = h_df.copy()
    
    # Exclude feedback false-alarm intervals from training if provided
    train_mask = (df["day"] < train_days) & (df["flow"].notna())
    if excluded_intervals:
        for start_t, end_t in excluded_intervals:
            train_mask &= ~((df["t"] >= start_t) & (df["t"] <= end_t))
            
    # 1. First compute median, lo, hi on valid training set flow
    raw_tr = df[train_mask]
    med, lo, hi = compute_hourly_baselines(raw_tr)
    
    # 2. Add baselines and rel to the entire dataframe
    df["median_flow"] = df["hour"].map(med).fillna(1.0)
    df["expected_lo"] = df["hour"].map(lo).fillna(0.0)
    df["expected_hi"] = df["hour"].map(hi).fillna(1.0)
    fill_flow = df["flow"].fillna(0.0)
    df["rel"] = (fill_flow / df["median_flow"]).clip(0.0, 50.0)
    
    # 3. Now slice tr with rel present
    tr = df[train_mask].copy()
    features = ["rel", "flow", "hour"] if hour_aware else ["flow"]
    
    # Prepare training matrix
    X_train = tr[features].copy().fillna(0.0)
        
    model = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        random_state=seed
    ).fit(X_train)
    
    # Score training set to establish empirical percentile scale
    train_raw = -model.score_samples(X_train)
    score_threshold = np.percentile(train_raw, alert_percentile)
    
    # Score full series
    X_all = df[features].copy()
    if "flow" in X_all.columns:
        X_all["flow"] = X_all["flow"].fillna(0.0)
    raw_scores = -model.score_samples(X_all)
    
    # Convert raw anomaly score into calibrated 0.0 - 1.0 percentile score
    # using empirical CDF against train_raw
    scores = np.searchsorted(np.sort(train_raw), raw_scores) / float(len(train_raw))
    df["score"] = np.clip(scores, 0.0, 1.0)
    
    # Flag single hour
    df["flag"] = (raw_scores >= score_threshold) | (model.predict(X_all) == -1)
    
    # Alert = 2+ consecutive flagged hours
    df["alert"] = df["flag"] & (df["flag"].shift(1, fill_value=False) | df["flag"].shift(-1, fill_value=False))
    
    # Assign status: Alert > Watch > Normal
    conditions = [
        df["alert"],
        df["flag"],
    ]
    choices = ["Alert", "Watch"]
    df["status"] = np.select(conditions, choices, default="Normal")
    
    # Assign reasons
    reasons = []
    for _, row in df.iterrows():
        if row["status"] in ("Alert", "Watch"):
            r = generate_reason(
                hour=int(row["hour"]),
                flow=float(row["flow"]) if pd.notna(row["flow"]) else 0.0,
                median_flow=float(row["median_flow"]),
                rel=float(row["rel"]),
                is_night=(row["hour"] >= 1 and row["hour"] <= 5)
            )
            reasons.append(r)
        else:
            reasons.append(None)
    df["reason"] = reasons
    
    meta = {
        "train_days": train_days,
        "contamination": contamination,
        "hour_aware": hour_aware,
        "score_threshold": float(score_threshold),
        "alert_percentile": alert_percentile,
    }
    
    return df, model, meta

def extract_alert_incidents(df: pd.DataFrame, building_name: str) -> List[Dict[str, Any]]:
    """Group contiguous Alert hours in the test window (day >= 28) into alert incidents."""
    test_df = df[df["day"] >= 28].copy().reset_index(drop=True)
    incidents = []
    
    in_alert = False
    cur_start = None
    cur_end = None
    max_score = 0.0
    key_reason = ""
    building_id = test_df["building_id"].iloc[0] if len(test_df) > 0 else "unknown"
    
    for idx, row in test_df.iterrows():
        if row["alert"]:
            if not in_alert:
                in_alert = True
                cur_start = row["t"]
                cur_end = row["t"]
                max_score = row["score"]
                key_reason = row["reason"] or ""
            else:
                cur_end = row["t"]
                if row["score"] > max_score:
                    max_score = row["score"]
                    if row["reason"]:
                        key_reason = row["reason"]
        else:
            if in_alert:
                in_alert = False
                incidents.append({
                    "building_id": building_id,
                    "building_name": building_name,
                    "start_time": cur_start.isoformat(),
                    "end_time": cur_end.isoformat(),
                    "score": round(float(max_score), 3),
                    "reason": key_reason,
                    "status": "unreviewed",
                    "note": "",
                })
                
    if in_alert:
        incidents.append({
            "building_id": building_id,
            "building_name": building_name,
            "start_time": cur_start.isoformat(),
            "end_time": cur_end.isoformat(),
            "score": round(float(max_score), 3),
            "reason": key_reason,
            "status": "unreviewed",
            "note": "",
        })
        
    return incidents
