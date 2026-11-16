"""AquaBaseline ESG Metrics, Savings Calculator & Scale-Up Readiness Engine
Implements the six ESG metrics (Assignment 4A), campus savings calculator,
and the 95% readings checked / 70% alert precision expansion trigger.
"""

from typing import Dict, Any, List, Optional
from .schemas import ESGMetricItem

def compute_savings(
    campus_size: int = 5000,
    baseline_l_person_day: float = 276.0,
    target_cut_pct: float = 10.0,
) -> Dict[str, Any]:
    """Calculate projected daily and annual water savings."""
    daily_total_l = campus_size * baseline_l_person_day
    daily_saved_l = daily_total_l * (target_cut_pct / 100.0)
    annual_saved_l = daily_saved_l * 365.0
    
    return {
        "campus_size": campus_size,
        "baseline_l_person_day": baseline_l_person_day,
        "target_cut_pct": target_cut_pct,
        "daily_saved_litres": round(daily_saved_l, 0),
        "annual_saved_litres": round(annual_saved_l, 0),
        "daily_saved_formatted": f"{int(daily_saved_l):,} L/day",
        "annual_saved_formatted": f"{int(annual_saved_l):,} L/year (~{round(annual_saved_l / 1e6, 1)}M L/year)",
        "assumptions": "Campus population (5,000) and 10% target reduction are planning assumptions."
    }

def compute_esg_and_scaleup(
    live_l_person_day: float,
    live_leak_share_pct: float,
    readings_checked_pct: float,
    alerts_total: int,
    alerts_reviewed: int,
    real_leaks: int,
    false_alarms: int,
    meter_errors: int,
    manual_complaints: int = 30,
    manual_staff_hours: float = 10.0,
    campus_size: int = 5000,
    target_cut_pct: float = 10.0,
) -> Dict[str, Any]:
    """Assemble all ESG metrics, precision statistics, and expansion triggers."""
    # Alert outcome logged %
    alert_outcome_pct = round((alerts_reviewed / float(alerts_total)) * 100.0, 1) if alerts_total > 0 else 100.0
    
    # Precision: real / (real + false + meter_error)
    total_reviewed = real_leaks + false_alarms + meter_errors
    if total_reviewed > 0:
        precision_pct = round((real_leaks / float(total_reviewed)) * 100.0, 1)
    else:
        # Default before feedback
        precision_pct = 100.0
        
    needs_retuning = (total_reviewed >= 2 and precision_pct < 50.0)
    
    # 95% checked & 70% precision trigger
    checked_ready = readings_checked_pct >= 95.0
    precision_ready = precision_pct >= 70.0
    ready_to_scale = checked_ready and precision_ready
    
    esg_list = [
        ESGMetricItem(
            pillar="E",
            name="Water use per person",
            current_value=f"{round(live_l_person_day, 1)} L/person/day",
            expected_value="248 L/person/day (-10%)",
            is_live=True,
            unit="L/person/day",
            notes="Live weighted average across simulated meters today vs 276 L baseline (assumed)."
        ),
        ESGMetricItem(
            pillar="E",
            name="Share of water lost to leaks",
            current_value=f"{round(live_leak_share_pct, 1)}%",
            expected_value="6%",
            is_live=True,
            unit="%",
            notes="Rough estimate calculated as minimum 02:00-04:00 night flow × 24 / total inflow."
        ),
        ESGMetricItem(
            pillar="S",
            name="Water complaints per month",
            current_value=f"{manual_complaints}",
            expected_value="15 (-50%)",
            is_live=False,
            unit="complaints/month",
            notes="Assumed baseline (30/month); editable via staff manual input."
        ),
        ESGMetricItem(
            pillar="S",
            name="Staff hours on manual checks per week",
            current_value=f"{round(manual_staff_hours, 1)} hrs",
            expected_value="3 hrs (-70%)",
            is_live=False,
            unit="hours/week",
            notes="Assumed baseline (10 hrs/wk); editable via staff manual input."
        ),
        ESGMetricItem(
            pillar="G",
            name="Readings automatically checked",
            current_value=f"{round(readings_checked_pct, 1)}%",
            expected_value="100%",
            is_live=True,
            unit="%",
            notes="Evaluated by automated data governance pipeline (completeness, stuck meter, spikes)."
        ),
        ESGMetricItem(
            pillar="G",
            name="Alerts with a logged outcome",
            current_value=f"{round(alert_outcome_pct, 1)}%",
            expected_value="100%",
            is_live=True,
            unit="%",
            notes="Proportion of facility manager alerts reviewed with confirmed outcomes."
        ),
    ]
    
    savings = compute_savings(
        campus_size=campus_size,
        baseline_l_person_day=276.0,
        target_cut_pct=target_cut_pct
    )
    
    return {
        "esg_metrics": [m.model_dump() for m in esg_list],
        "savings": savings,
        "precision": {
            "total_alerts": alerts_total,
            "reviewed_alerts": alerts_reviewed,
            "real_leaks": real_leaks,
            "false_alarms": false_alarms,
            "meter_errors": meter_errors,
            "precision_pct": precision_pct,
            "needs_retuning": needs_retuning,
            "banner_message": "Retune the alert band and retrain before adding buildings" if needs_retuning else None,
        },
        "scale_up": {
            "readings_checked_pct": round(readings_checked_pct, 1),
            "readings_checked_target": 95.0,
            "readings_checked_met": checked_ready,
            "precision_pct": precision_pct,
            "precision_target": 70.0,
            "precision_met": precision_ready,
            "ready_to_scale": ready_to_scale,
            "status_text": "Ready to expand to all campus buildings and partner institutions" if ready_to_scale else "Calibration phase: Maintain >=95% checked readings and >=70% confirmed alert precision.",
        },
        "manual_inputs": {
            "complaints": manual_complaints,
            "staff_hours": manual_staff_hours,
        }
    }
