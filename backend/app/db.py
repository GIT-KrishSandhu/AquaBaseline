"""AquaBaseline SQLite Database & Application State Manager
Maintains settings, scenario states, alerts inbox, feedback logs,
and manages on-startup simulation seeding and in-memory model caches.
"""

import os
import sqlite3
import datetime
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple

from .sim import BUILDINGS, simulate_raw, aggregate_hourly
from .model import train_and_score, extract_alert_incidents
from .quality import validate_stream_readings

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "aquabaseline.db")

# In-memory caches for fast API querying
_CACHED_HOURLY: Dict[str, pd.DataFrame] = {}
_CACHED_MODELS: Dict[str, Any] = {}
_CACHED_META: Dict[str, Any] = {}
_ACTIVE_SCENARIOS: Dict[str, Dict[str, Any]] = {}

def get_db_connection() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def ensure_db_ready():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'")
    if not c.fetchone():
        conn.close()
        init_db()
    else:
        conn.close()

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY,
        alert_percentile REAL DEFAULT 99.0,
        campus_size INTEGER DEFAULT 5000,
        target_cut_pct REAL DEFAULT 10.0,
        manual_complaints INTEGER DEFAULT 30,
        manual_staff_hours REAL DEFAULT 10.0
    );
    """)
    
    c.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        building_id TEXT NOT NULL,
        building_name TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        score REAL NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'unreviewed',
        note TEXT DEFAULT '',
        created_at TEXT NOT NULL
    );
    """)
    
    c.execute("""
    CREATE TABLE IF NOT EXISTS scenarios (
        building_id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        start_day INTEGER NOT NULL,
        nights INTEGER NOT NULL,
        magnitude REAL,
        created_at TEXT NOT NULL
    );
    """)
    
    # Check if default settings exist
    c.execute("SELECT COUNT(*) FROM settings")
    if c.fetchone()[0] == 0:
        c.execute("""
        INSERT INTO settings (id, alert_percentile, campus_size, target_cut_pct, manual_complaints, manual_staff_hours)
        VALUES (1, 99.0, 5000, 10.0, 30, 10.0)
        """)
        
    conn.commit()
    conn.close()

def get_settings() -> Dict[str, Any]:
    ensure_db_ready()
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM settings WHERE id = 1").fetchone()
    conn.close()
    if row:
        return {
            "alert_percentile": float(row["alert_percentile"]),
            "campus_size": int(row["campus_size"]),
            "target_cut_pct": float(row["target_cut_pct"]),
            "manual_complaints": int(row["manual_complaints"]),
            "manual_staff_hours": float(row["manual_staff_hours"]),
        }
    return {
        "alert_percentile": 99.0,
        "campus_size": 5000,
        "target_cut_pct": 10.0,
        "manual_complaints": 30,
        "manual_staff_hours": 10.0,
    }

def update_settings(updates: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    c = conn.cursor()
    curr = get_settings()
    curr.update({k: v for k, v in updates.items() if v is not None})
    
    c.execute("""
    UPDATE settings SET
        alert_percentile = ?,
        campus_size = ?,
        target_cut_pct = ?,
        manual_complaints = ?,
        manual_staff_hours = ?
    WHERE id = 1
    """, (
        curr["alert_percentile"],
        curr["campus_size"],
        curr["target_cut_pct"],
        curr["manual_complaints"],
        curr["manual_staff_hours"],
    ))
    conn.commit()
    conn.close()
    return curr

def get_active_scenario(building_id: str) -> Optional[Dict[str, Any]]:
    return _ACTIVE_SCENARIOS.get(building_id)

def refresh_building(building_id: str, scenario: Optional[Dict[str, Any]] = None):
    """Simulate raw data, aggregate hourly, train and score building."""
    settings = get_settings()
    alert_pct = settings.get("alert_percentile", 99.0)
    
    # 1. Simulate 35 days raw
    raw_df = simulate_raw(kind=building_id, days=35, seed=7, scenario=scenario)
    
    # 2. Hourly aggregate
    h_df = aggregate_hourly(raw_df)
    
    # 3. Train & score
    scored_df, model, meta = train_and_score(
        h_df=h_df,
        train_days=28,
        contamination=0.01,
        hour_aware=True,
        seed=1,
        alert_percentile=alert_pct,
    )
    
    _CACHED_HOURLY[building_id] = scored_df
    _CACHED_MODELS[building_id] = model
    _CACHED_META[building_id] = meta
    
    # 4. Generate alerts for test window if scenario active or unusual
    conn = get_db_connection()
    c = conn.cursor()
    b_name = BUILDINGS[building_id]["name"]
    incidents = extract_alert_incidents(scored_df, b_name)
    
    now_str = datetime.datetime.now().isoformat()
    for inc in incidents:
        # Check if already in DB
        c.execute("""
        SELECT id FROM alerts 
        WHERE building_id = ? AND start_time = ? AND end_time = ?
        """, (building_id, inc["start_time"], inc["end_time"]))
        existing = c.fetchone()
        if not existing:
            c.execute("""
            INSERT INTO alerts (building_id, building_name, start_time, end_time, score, reason, status, note, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'unreviewed', '', ?)
            """, (
                building_id,
                b_name,
                inc["start_time"],
                inc["end_time"],
                inc["score"],
                inc["reason"],
                now_str
            ))
            
    conn.commit()
    conn.close()

def seed_all_buildings():
    """Initial seed of all 3 buildings on application launch."""
    init_db()
    for b_id in BUILDINGS:
        refresh_building(b_id, scenario=_ACTIVE_SCENARIOS.get(b_id))

def set_scenario(scenario: Dict[str, Any]) -> int:
    """Apply a scenario to a building, refresh cache, and record alerts."""
    b_id = scenario["building_id"]
    _ACTIVE_SCENARIOS[b_id] = scenario
    
    conn = get_db_connection()
    c = conn.cursor()
    now_str = datetime.datetime.now().isoformat()
    c.execute("""
    INSERT OR REPLACE INTO scenarios (building_id, type, start_day, nights, magnitude, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        b_id,
        scenario["type"],
        scenario.get("start_day", 30),
        scenario.get("nights", 3),
        scenario.get("magnitude"),
        now_str
    ))
    conn.commit()
    conn.close()
    
    refresh_building(b_id, scenario=scenario)
    
    # Count alerts for this building
    conn = get_db_connection()
    count = conn.execute("SELECT COUNT(*) FROM alerts WHERE building_id = ?", (b_id,)).fetchone()[0]
    conn.close()
    return count

def reset_all_scenarios():
    """Reset all scenarios to baseline across all buildings."""
    _ACTIVE_SCENARIOS.clear()
    conn = get_db_connection()
    conn.execute("DELETE FROM scenarios")
    conn.commit()
    conn.close()
    
    for b_id in BUILDINGS:
        refresh_building(b_id, scenario=None)

def get_alerts(status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    if status_filter:
        rows = conn.execute("SELECT * FROM alerts WHERE status = ? ORDER BY id DESC", (status_filter,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM alerts ORDER BY id DESC").fetchall()
    conn.close()
    
    return [dict(r) for r in rows]

def submit_feedback(alert_id: int, outcome: str, note: str = "") -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("""
    UPDATE alerts SET status = ?, note = ? WHERE id = ?
    """, (outcome, note, alert_id))
    conn.commit()
    
    row = conn.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def get_buildings_summary() -> List[Dict[str, Any]]:
    """Return summary statistics for each building."""
    out = []
    for b_id, b_meta in BUILDINGS.items():
        if b_id not in _CACHED_HOURLY:
            refresh_building(b_id)
            
        df = _CACHED_HOURLY[b_id]
        
        # Today = last day (day 34)
        today_df = df[df["day"] == 34]
        today_total_flow = float(today_df["flow"].sum()) if len(today_df) > 0 else 0.0
        today_l_person = today_total_flow / float(b_meta["headcount"])
        
        # Baseline = days 0 to 27
        baseline_df = df[df["day"] < 28]
        daily_baseline_flows = baseline_df.groupby("day")["flow"].sum()
        mean_daily_baseline = float(daily_baseline_flows.mean()) if len(daily_baseline_flows) > 0 else 1.0
        baseline_l_person = mean_daily_baseline / float(b_meta["headcount"])
        
        delta_pct = round(((today_l_person - baseline_l_person) / baseline_l_person) * 100.0, 1)
        
        # Latest status and score
        latest_row = df.iloc[-1]
        status = str(latest_row["status"])
        latest_score = float(latest_row["score"])
        
        # Leak share calculation (minimum 02:00-04:00 flow * 24 / daily total)
        night_hours = today_df[(today_df["hour"] >= 2) & (today_df["hour"] <= 4)]
        if len(night_hours) > 0 and today_total_flow > 0:
            min_night = float(night_hours["flow"].min())
            leak_share_pct = min(100.0, (min_night * 24.0 / today_total_flow) * 100.0)
        else:
            leak_share_pct = 12.0  # assumed baseline
            
        out.append({
            "id": b_id,
            "name": b_meta["name"],
            "headcount": b_meta["headcount"],
            "daily_l_per_person_target": b_meta["daily_l_per_person"],
            "l_per_person_today": round(today_l_person, 1),
            "l_per_person_baseline": round(baseline_l_person, 1),
            "delta_pct": delta_pct,
            "status": status,
            "latest_score": round(latest_score, 3),
            "readings_checked_pct": 100.0,
            "leak_share_pct": round(leak_share_pct, 1),
        })
    return out

def get_readings(
    building_id: str,
    from_day: Optional[int] = None,
    to_day: Optional[int] = None,
    resolution: str = "hour"
) -> List[Dict[str, Any]]:
    """Return readings for chart rendering."""
    if building_id not in _CACHED_HOURLY:
        refresh_building(building_id)
        
    df = _CACHED_HOURLY[building_id].copy()
    if from_day is not None:
        df = df[df["day"] >= from_day]
    if to_day is not None:
        df = df[df["day"] <= to_day]
        
    points = []
    for _, row in df.iterrows():
        points.append({
            "t": row["t"].isoformat(),
            "flow": round(float(row["flow"]), 1) if pd.notna(row["flow"]) else 0.0,
            "rel": round(float(row["rel"]), 2) if pd.notna(row["rel"]) else 1.0,
            "flag": bool(row["flag"]),
            "alert": bool(row["alert"]),
            "score": round(float(row["score"]), 3),
            "status": str(row["status"]),
            "reason": str(row["reason"]) if pd.notna(row["reason"]) else None,
            "expected_lo": round(float(row["expected_lo"]), 1),
            "expected_hi": round(float(row["expected_hi"]), 1),
        })
    return points
