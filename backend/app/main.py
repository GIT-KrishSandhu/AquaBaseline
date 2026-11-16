"""AquaBaseline FastAPI Backend Application
Exposes all REST endpoints for building summaries, readings, scenario lab,
alerts inbox with feedback loop, ESG metrics, research analytics, data quality, and validation results.
"""

import os
import json
import asyncio
from fastapi import FastAPI, HTTPException, UploadFile, File, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any

from .schemas import (
    BuildingSummary,
    ReadingsResponse,
    ScenarioRequest,
    ScenarioResponse,
    AlertItem,
    AlertFeedbackRequest,
    SettingsModel,
    ManualMetricsRequest,
    MetricsResponse,
    DataQualityReport,
    ResearchSummaryResponse,
)
from .db import (
    init_db,
    seed_all_buildings,
    get_buildings_summary,
    get_readings,
    set_scenario,
    reset_all_scenarios,
    get_alerts,
    submit_feedback,
    get_settings,
    update_settings,
    refresh_building,
    BUILDINGS,
)
from .metrics import compute_esg_and_scaleup
from .quality import audit_dataset_csv
from .research import get_research_summary, DATA_PATH

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_all_buildings()
    yield

app = FastAPI(
    title="AquaBaseline API",
    description="Smart water monitoring with AI anomaly detection, ESG metrics and data quality audits.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALIDATION_RESULTS_FILE = os.path.join(os.path.dirname(__file__), "data", "validation_results.json")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "AquaBaseline",
        "version": "1.0.0",
        "author": "Krish Sandhu (KIET, 1M1B)",
        "simulated": True,
    }

@app.get("/api/buildings", response_model=List[BuildingSummary])
def list_buildings():
    return get_buildings_summary()

@app.get("/api/readings", response_model=ReadingsResponse)
def get_building_readings(
    building_id: str = Query("hostel", description="Building id: hostel | canteen | academic"),
    from_day: Optional[int] = Query(None, description="Start day (0-34)"),
    to_day: Optional[int] = Query(None, description="End day (0-34)"),
    resolution: str = Query("hour", description="Resolution: hour or 15min"),
):
    if building_id not in BUILDINGS:
        raise HTTPException(status_code=404, detail=f"Building '{building_id}' not found.")
    
    points = get_readings(building_id=building_id, from_day=from_day, to_day=to_day, resolution=resolution)
    return {
        "building_id": building_id,
        "resolution": resolution,
        "points": points,
        "total_count": len(points),
    }

@app.post("/api/scenarios", response_model=ScenarioResponse)
def inject_scenario(req: ScenarioRequest):
    if req.building_id not in BUILDINGS:
        raise HTTPException(status_code=404, detail=f"Building '{req.building_id}' not found.")
    
    valid_types = ["night_leak", "tank_overflow", "stuck_meter", "data_gap", "holiday"]
    if req.type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Scenario type must be one of {valid_types}.")
        
    scenario_dict = {
        "building_id": req.building_id,
        "type": req.type,
        "start_day": req.start_day,
        "nights": req.nights,
        "magnitude": req.magnitude,
    }
    
    alerts_count = set_scenario(scenario_dict)
    return {
        "status": "success",
        "message": f"Injected scenario '{req.type}' into building '{req.building_id}' starting day {req.start_day} for {req.nights} nights.",
        "scenario": scenario_dict,
        "alerts_created": alerts_count,
    }

@app.post("/api/scenarios/reset", response_model=ScenarioResponse)
def reset_scenarios():
    reset_all_scenarios()
    return {
        "status": "success",
        "message": "All scenarios reset to baseline across all buildings.",
        "scenario": None,
        "alerts_created": 0,
    }

@app.get("/api/alerts", response_model=List[AlertItem])
def list_alerts(status: Optional[str] = Query(None, description="Filter: unreviewed, real_leak, false_alarm, meter_error")):
    return get_alerts(status_filter=status)

@app.post("/api/alerts/{alert_id}/feedback", response_model=AlertItem)
def submit_feedback_endpoint(alert_id: int, req: AlertFeedbackRequest):
    valid_outcomes = ["real_leak", "false_alarm", "meter_error"]
    if req.outcome not in valid_outcomes:
        raise HTTPException(status_code=400, detail=f"Outcome must be one of {valid_outcomes}")
        
    updated = submit_feedback(alert_id=alert_id, outcome=req.outcome, note=req.note or "")
    if not updated:
        raise HTTPException(status_code=404, detail=f"Alert with id {alert_id} not found.")
    return updated

@app.post("/api/model/retrain")
def retrain_models(building_id: Optional[str] = None):
    if building_id:
        if building_id not in BUILDINGS:
            raise HTTPException(status_code=404, detail="Building not found.")
        refresh_building(building_id)
    else:
        seed_all_buildings()
    return {"status": "success", "message": "Model retrained with current baseline and feedback adjustments."}

@app.get("/api/settings", response_model=SettingsModel)
def get_app_settings():
    s = get_settings()
    return SettingsModel(
        alert_percentile=s["alert_percentile"],
        campus_size=s["campus_size"],
        target_cut_pct=s["target_cut_pct"],
    )

@app.post("/api/settings", response_model=SettingsModel)
def update_app_settings(req: SettingsModel):
    updated = update_settings(req.model_dump())
    # Refresh buildings if threshold changed
    for b_id in BUILDINGS:
        refresh_building(b_id)
    return SettingsModel(
        alert_percentile=updated["alert_percentile"],
        campus_size=updated["campus_size"],
        target_cut_pct=updated["target_cut_pct"],
    )

@app.get("/api/metrics", response_model=MetricsResponse)
def get_metrics():
    settings = get_settings()
    summaries = get_buildings_summary()
    
    # Campus weighted average L/person/day
    total_people = sum(b["headcount"] for b in summaries)
    weighted_l = sum(b["l_per_person_today"] * b["headcount"] for b in summaries) / float(total_people) if total_people > 0 else 276.0
    mean_leak_share = sum(b["leak_share_pct"] for b in summaries) / float(len(summaries)) if summaries else 12.0
    
    all_alerts = get_alerts()
    total_alerts = len(all_alerts)
    reviewed = [a for a in all_alerts if a["status"] != "unreviewed"]
    real_leaks = sum(1 for a in reviewed if a["status"] == "real_leak")
    false_alarms = sum(1 for a in reviewed if a["status"] == "false_alarm")
    meter_errors = sum(1 for a in reviewed if a["status"] == "meter_error")
    
    metrics_data = compute_esg_and_scaleup(
        live_l_person_day=weighted_l,
        live_leak_share_pct=mean_leak_share,
        readings_checked_pct=100.0,
        alerts_total=total_alerts,
        alerts_reviewed=len(reviewed),
        real_leaks=real_leaks,
        false_alarms=false_alarms,
        meter_errors=meter_errors,
        manual_complaints=settings.get("manual_complaints", 30),
        manual_staff_hours=settings.get("manual_staff_hours", 10.0),
        campus_size=settings.get("campus_size", 5000),
        target_cut_pct=settings.get("target_cut_pct", 10.0),
    )
    return metrics_data

@app.post("/api/metrics/manual")
def update_manual_metrics(req: ManualMetricsRequest):
    updates = {}
    if req.complaints is not None:
        updates["manual_complaints"] = req.complaints
    if req.staff_hours is not None:
        updates["manual_staff_hours"] = req.staff_hours
    update_settings(updates)
    return {"status": "success", "message": "Manual metrics updated successfully."}

@app.post("/api/data-quality/validate", response_model=DataQualityReport)
async def validate_csv_file(file: UploadFile = File(...)):
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10 MB limit.")
    report = audit_dataset_csv(contents, filename=file.filename)
    return report

@app.get("/api/data-quality/sample", response_model=DataQualityReport)
def sample_dataset_report():
    if not os.path.exists(DATA_PATH):
        alt = os.path.join(os.path.dirname(__file__), "..", "..", "..", "AquaBaseline_Capstone_Pack", "data", "cleaned_water_dataset.csv")
        target_path = alt if os.path.exists(alt) else "cleaned_water_dataset.csv"
    else:
        target_path = DATA_PATH
        
    with open(target_path, "rb") as f:
        contents = f.read()
        
    return audit_dataset_csv(contents, filename="cleaned_water_dataset.csv")

@app.get("/api/research/summary", response_model=ResearchSummaryResponse)
def research_summary_endpoint():
    return get_research_summary()

@app.get("/api/validation/results")
def get_validation_results():
    if not os.path.exists(VALIDATION_RESULTS_FILE):
        raise HTTPException(
            status_code=404,
            detail="Validation results have not been generated yet. Run scripts/run_validation.py or trigger POST /api/validation/run"
        )
    with open(VALIDATION_RESULTS_FILE, "r") as f:
        data = json.load(f)
    return data

@app.post("/api/validation/run")
def trigger_validation_run(background_tasks: BackgroundTasks):
    from ..scripts_helper import execute_full_validation_experiment
    # Run synchronously or in background
    try:
        results = execute_full_validation_experiment(save_path=VALIDATION_RESULTS_FILE)
        return {"status": "success", "message": "Validation experiment executed and saved.", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
