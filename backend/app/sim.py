"""AquaBaseline 15-Minute Simulator
Ported and extended from spec/simulate_reference.py per spec/simulation_and_model.md.
Generates 35 days of synthetic water meter readings for campus buildings.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Optional, List, Tuple

BUILDINGS = {
    "hostel": {
        "id": "hostel",
        "name": "Hostel Block A",
        "headcount": 400,
        "daily_l_per_person": 110,
        "weekend": 0.92,
        "leak_l_per_hour": 1000.0,
    },
    "canteen": {
        "id": "canteen",
        "name": "Canteen",
        "headcount": 1200,
        "daily_l_per_person": 20,
        "weekend": 0.60,
        "leak_l_per_hour": 600.0,
    },
    "academic": {
        "id": "academic",
        "name": "Academic Block B",
        "headcount": 1500,
        "daily_l_per_person": 25,
        "weekend": 0.20,
        "leak_l_per_hour": 600.0,
    },
}

def gaussian(h: np.ndarray, mu: float, sd: float) -> np.ndarray:
    return np.exp(-((h - mu) / sd) ** 2)

def shape(kind: str, hour: np.ndarray) -> np.ndarray:
    if kind == "hostel":
        s = 0.16 + 1.0 * gaussian(hour, 7.5, 1.6) + 0.8 * gaussian(hour, 20.5, 2.0) + 0.3 * gaussian(hour, 13.0, 2.0)
        return np.where((hour >= 1) & (hour < 5), 0.07, s)
    if kind == "canteen":
        s = 0.01 + 0.9 * gaussian(hour, 8.0, 1.0) + 1.0 * gaussian(hour, 13.0, 1.3) + 0.8 * gaussian(hour, 19.5, 1.2)
        return np.where((hour >= 22) | (hour < 6), 0.01, s)
    # academic
    s = 0.02 + 0.9 * gaussian(hour, 10.5, 1.5) + 1.0 * gaussian(hour, 14.0, 2.0)
    return np.where((hour >= 19) | (hour < 7), 0.02, s)

def simulate_raw(
    kind: str,
    days: int = 35,
    seed: int = 7,
    start: str = "2026-10-01",
    scenario: Optional[Dict[str, Any]] = None,
) -> pd.DataFrame:
    """Generate 15-minute readings for a given building with optional scenario injection."""
    rng = np.random.default_rng(seed)
    b = BUILDINGS[kind]
    t = pd.date_range(start, periods=days * 96, freq="15min")
    hour = t.hour + t.minute / 60.0
    day_idx = np.repeat(np.arange(days), 96)
    
    base = shape(kind, hour)
    wk = np.where(t.day_of_week >= 5, b["weekend"], 1.0)
    target_day = b["headcount"] * b["daily_l_per_person"]
    # Base normalized so sum of 96 intervals on a standard day equals target_day
    base = base / base[:96].sum() * target_day
    
    daily_noise = rng.normal(1.0, 0.06, days)[day_idx]
    interval_noise = rng.normal(1.0, 0.12, len(t))
    flow = np.clip(base * wk * daily_noise * interval_noise, 0.0, None)
    
    leak_mask = np.zeros(len(t), dtype=bool)
    is_missing = np.zeros(len(t), dtype=bool)
    is_stuck = np.zeros(len(t), dtype=bool)
    
    # Inject scenarios if provided
    if scenario and scenario.get("building_id") == kind:
        stype = scenario.get("type")
        start_d = scenario.get("start_day", 30)
        nights = scenario.get("nights", 3)
        mag = scenario.get("magnitude")
        
        target_days = list(range(start_d, min(start_d + nights, days)))
        
        if stype == "night_leak":
            rate_per_15m = (mag if mag is not None else b["leak_l_per_hour"]) / 4.0
            for d in target_days:
                mask = (day_idx == d) & (hour >= 2.0) & (hour < 4.0)
                flow[mask] += rate_per_15m
                leak_mask[mask] = True
                
        elif stype == "tank_overflow":
            rate_per_15m = (mag if mag is not None else 800.0) / 4.0
            for d in target_days:
                mask = (day_idx == d) & (hour >= 0.0) & (hour < 6.0)
                flow[mask] += rate_per_15m
                leak_mask[mask] = True
                
        elif stype == "stuck_meter":
            # Meter repeats the same constant value for 6 hours on specified day
            d = target_days[0] if target_days else 30
            mask = (day_idx == d) & (hour >= 10.0) & (hour < 16.0)
            flow[mask] = 12.5  # Constant stuck reading
            is_stuck[mask] = True
            
        elif stype == "data_gap":
            # Missing readings for 4 hours
            d = target_days[0] if target_days else 30
            mask = (day_idx == d) & (hour >= 12.0) & (hour < 16.0)
            is_missing[mask] = True
            flow[mask] = np.nan
            
        elif stype == "holiday":
            factor = mag if mag is not None else 0.4
            for d in target_days:
                mask = (day_idx == d)
                flow[mask] *= factor

    df = pd.DataFrame({
        "t": t,
        "flow15": flow,
        "leak": leak_mask,
        "is_missing": is_missing,
        "is_stuck": is_stuck,
        "day": day_idx,
        "building_id": kind,
        "headcount": b["headcount"],
    })
    return df

def aggregate_hourly(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregate 15-minute readings to hourly intervals."""
    temp = df.copy()
    temp["hr"] = temp["t"].dt.floor("h")
    
    # Aggregation
    agg_dict = {
        "flow15": lambda x: np.nan if x.isna().all() else x.sum(min_count=1),
        "leak": "max",
        "is_missing": "max",
        "is_stuck": "max",
        "day": "first",
        "building_id": "first",
        "headcount": "first",
    }
    
    h = temp.groupby("hr").agg(agg_dict).reset_index().rename(columns={"hr": "t", "flow15": "flow"})
    h["hour"] = h["t"].dt.hour
    return h
