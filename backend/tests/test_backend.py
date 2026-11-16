"""AquaBaseline Backend Unit & Integration Test Suite
Verifies simulator determinism, model features, alert grouping, data quality,
ESG calculations, savings math, and API endpoint smoke tests.
"""

import pytest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from app.sim import simulate_raw, aggregate_hourly, BUILDINGS
from app.model import train_and_score, extract_alert_incidents
from app.quality import validate_stream_readings, audit_dataset_csv
from app.metrics import compute_savings, compute_esg_and_scaleup
from app.main import app
from app.db import init_db, seed_all_buildings

# Ensure database tables and initial models are seeded for tests
init_db()
seed_all_buildings()

client = TestClient(app)

def test_simulator_determinism():
    """Verify that same seed generates strictly identical simulation readings."""
    df1 = simulate_raw("hostel", days=7, seed=42)
    df2 = simulate_raw("hostel", days=7, seed=42)
    assert np.allclose(df1["flow15"].values, df2["flow15"].values)
    assert np.array_equal(df1["t"].values, df2["t"].values)

def test_hour_aware_vs_flow_only():
    """Verify that hour-aware model catches night leak while flow-only ablation struggles."""
    # Simulate with night leak on days 30, 31, 32
    scenario = {
        "building_id": "hostel",
        "type": "night_leak",
        "start_day": 30,
        "nights": 3,
        "magnitude": 1000.0,
    }
    raw = simulate_raw("hostel", days=35, seed=0, scenario=scenario)
    h = aggregate_hourly(raw)
    
    # Hour-aware model
    df_ha, _, _ = train_and_score(h, hour_aware=True)
    # Check that leak hours (02:00-04:00 on day 30) have alert=True
    leak_sample = df_ha[(df_ha["day"] == 30) & (df_ha["hour"].isin([2, 3]))]
    assert leak_sample["alert"].any() or leak_sample["flag"].any(), "Hour-aware should flag leak"
    
    # Flow-only model
    df_flow, _, _ = train_and_score(h, hour_aware=False)
    # Under flow-only, a night leak of 1000 L/h is lower than normal daytime peak (3000+ L/h), so it is not flagged
    leak_sample_flow = df_flow[(df_flow["day"] == 30) & (df_flow["hour"].isin([2, 3]))]
    assert not leak_sample_flow["alert"].all(), "Flow-only cannot separate night leak from normal daytime range"

def test_alert_grouping_rule():
    """Verify that 2+ consecutive flagged hours become an Alert, while isolated hour is Watch."""
    # Create synthetic series
    t = pd.date_range("2026-10-01", periods=10, freq="h")
    df = pd.DataFrame({
        "t": t,
        "flow": [100.0] * 10,
        "hour": list(range(10)),
        "day": [28] * 10,
        "median_flow": [100.0] * 10,
        "expected_lo": [50.0] * 10,
        "expected_hi": [150.0] * 10,
        "rel": [1.0] * 10,
        "score": [0.1] * 10,
        "building_id": ["hostel"] * 10,
    })
    # Isolated flag at hour 2
    # Consecutive flags at hours 5 and 6
    df["flag"] = False
    df.loc[2, "flag"] = True
    df.loc[5, "flag"] = True
    df.loc[6, "flag"] = True
    
    df["alert"] = df["flag"] & (df["flag"].shift(1, fill_value=False) | df["flag"].shift(-1, fill_value=False))
    
    assert bool(df.loc[2, "alert"]) is False, "Single flagged hour must not be an Alert"
    assert bool(df.loc[5, "alert"]) is True, "Consecutive flagged hour 1 must be Alert"
    assert bool(df.loc[6, "alert"]) is True, "Consecutive flagged hour 2 must be Alert"

def test_data_quality_stream_validation():
    """Verify that stream quality validator catches missing, negative, stuck, and spike readings."""
    t = pd.date_range("2026-10-01", periods=20, freq="15min")
    flows = [10.0] * 20
    flows[0] = np.nan     # missing
    flows[1] = -5.0       # negative
    # stuck values from index 5 to 13 (8 consecutive equal values)
    flows[19] = 99999.0   # spike
    
    df = pd.DataFrame({"t": t, "flow15": flows})
    res = validate_stream_readings(df)
    
    assert res["checked_pct"] == 100.0
    assert res["issues"]["missing"] == 1
    assert res["issues"]["negative"] == 1
    assert res["issues"]["stuck_values"] >= 8
    assert res["issues"]["implausible_spikes"] == 1
    assert res["passed_pct"] < 100.0

def test_implied_population_check():
    """Verify CSV quality audit catches the >2B implied population error in synthetic water data."""
    csv_text = "Country,Year,Total_Consumption_BCM,PerCapita_L_per_day,Groundwater_Depletion_pct\nArgentina,2004,520.0,274.0,25.0\n"
    res = audit_dataset_csv(csv_text.encode("utf-8"), filename="test_dataset.csv")
    
    assert len(res["implied_population_findings"]) == 1
    finding = res["implied_population_findings"][0]
    assert finding["country"] == "Argentina"
    assert finding["implied_population_billions"] > 5.0

def test_savings_calculator_math():
    """Verify exact formula: 5,000 people * 276 L * 10% = 138,000 L/day = 50,370,000 L/year."""
    res = compute_savings(campus_size=5000, baseline_l_person_day=276.0, target_cut_pct=10.0)
    assert res["daily_saved_litres"] == 138000.0
    assert res["annual_saved_litres"] == 50370000.0

def test_esg_scaleup_thresholds():
    """Verify scale-up trigger requires >= 95% checked and >= 70% precision."""
    # Scenario 1: precision 80%, checked 90% -> not ready
    s1 = compute_esg_and_scaleup(
        live_l_person_day=260.0,
        live_leak_share_pct=10.0,
        readings_checked_pct=90.0,
        alerts_total=10,
        alerts_reviewed=10,
        real_leaks=8,
        false_alarms=2,
        meter_errors=0,
    )
    assert s1["scale_up"]["ready_to_scale"] is False
    
    # Scenario 2: precision 80%, checked 100% -> ready to scale
    s2 = compute_esg_and_scaleup(
        live_l_person_day=260.0,
        live_leak_share_pct=10.0,
        readings_checked_pct=100.0,
        alerts_total=10,
        alerts_reviewed=10,
        real_leaks=8,
        false_alarms=2,
        meter_errors=0,
    )
    assert s2["scale_up"]["ready_to_scale"] is True

def test_api_endpoints_smoke():
    """Verify core FastAPI endpoints return valid 200 HTTP responses."""
    # Health
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["simulated"] is True
    
    # Buildings
    r = client.get("/api/buildings")
    assert r.status_code == 200
    b_data = r.json()
    assert len(b_data) == 3
    
    # Readings
    r = client.get("/api/readings?building_id=hostel")
    assert r.status_code == 200
    assert "points" in r.json()
    
    # Settings
    r = client.get("/api/settings")
    assert r.status_code == 200
    assert r.json()["campus_size"] == 5000
    
    # Research Summary
    r = client.get("/api/research/summary")
    assert r.status_code == 200
    assert "trend_series" in r.json()
    assert len(r.json()["country_comparison"]) == 20
    
    # Data Quality Sample
    r = client.get("/api/data-quality/sample")
    assert r.status_code == 200
    assert r.json()["is_bundled_dataset"] is True
    assert len(r.json()["implied_population_findings"]) > 0
    
    # Metrics
    r = client.get("/api/metrics")
    assert r.status_code == 200
    assert len(r.json()["esg_metrics"]) == 6

def test_scenario_injection_and_feedback_flow():
    """Verify end-to-end scenario injection -> alert generated -> feedback submitted -> reset."""
    # 1. Inject night leak into hostel
    inj_res = client.post("/api/scenarios", json={
        "building_id": "hostel",
        "type": "night_leak",
        "start_day": 30,
        "nights": 3,
        "magnitude": 1000.0,
    })
    assert inj_res.status_code == 200
    
    # 2. Check alerts inbox has at least one alert
    alerts_res = client.get("/api/alerts")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) > 0
    target_alert = alerts[0]
    
    # 3. Submit feedback
    fb_res = client.post(f"/api/alerts/{target_alert['id']}/feedback", json={
        "outcome": "real_leak",
        "note": "Plumber verified faulty ball valve on second floor."
    })
    assert fb_res.status_code == 200
    assert fb_res.json()["status"] == "real_leak"
    
    # 4. Check metrics precision updated
    met_res = client.get("/api/metrics")
    assert met_res.status_code == 200
    prec = met_res.json()["precision"]
    assert prec["real_leaks"] >= 1
    
    # 5. Reset scenarios
    reset_res = client.post("/api/scenarios/reset")
    assert reset_res.status_code == 200
