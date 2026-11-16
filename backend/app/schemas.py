from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class BuildingSummary(BaseModel):
    id: str
    name: str
    headcount: int
    daily_l_per_person_target: float
    l_per_person_today: float
    l_per_person_baseline: float
    delta_pct: float
    status: str  # Normal, Watch, Alert
    latest_score: float
    readings_checked_pct: float
    leak_share_pct: float

class ReadingPoint(BaseModel):
    t: str
    flow: float
    rel: float
    flag: bool
    alert: bool
    score: float
    status: str
    reason: Optional[str] = None
    expected_lo: float
    expected_hi: float

class ReadingsResponse(BaseModel):
    building_id: str
    resolution: str
    points: List[ReadingPoint]
    total_count: int

class ScenarioRequest(BaseModel):
    building_id: str
    type: str  # night_leak | tank_overflow | stuck_meter | data_gap | holiday
    start_day: int = 30
    nights: int = 3
    magnitude: Optional[float] = None

class ScenarioResponse(BaseModel):
    status: str
    message: str
    scenario: Optional[Dict[str, Any]] = None
    alerts_created: int

class AlertFeedbackRequest(BaseModel):
    outcome: str  # real_leak | false_alarm | meter_error
    note: Optional[str] = ""

class AlertItem(BaseModel):
    id: int
    building_id: str
    building_name: str
    start_time: str
    end_time: str
    score: float
    reason: str
    status: str  # unreviewed | real_leak | false_alarm | meter_error
    note: Optional[str] = ""
    created_at: str

class SettingsModel(BaseModel):
    alert_percentile: float = 99.0
    campus_size: int = 5000
    target_cut_pct: float = 10.0

class ManualMetricsRequest(BaseModel):
    complaints: Optional[int] = None
    staff_hours: Optional[float] = None

class ESGMetricItem(BaseModel):
    pillar: str  # E, S, G
    name: str
    current_value: str
    expected_value: str
    is_live: bool
    unit: str
    notes: str

class MetricsResponse(BaseModel):
    esg_metrics: List[ESGMetricItem]
    savings: Dict[str, Any]
    precision: Dict[str, Any]
    scale_up: Dict[str, Any]
    manual_inputs: Dict[str, Any]

class DataQualityReport(BaseModel):
    filename: str
    total_rows: int
    total_columns: int
    readings_checked_pct: float
    passed_pct: float
    issues_summary: Dict[str, int]
    column_stats: List[Dict[str, Any]]
    jump_anomalies: List[Dict[str, Any]]
    implied_population_findings: List[Dict[str, Any]]
    is_bundled_dataset: bool

class ResearchSummaryResponse(BaseModel):
    trend_series: List[Dict[str, Any]]
    country_comparison: List[Dict[str, Any]]
    distribution_histogram: List[Dict[str, Any]]
    headline_stats: Dict[str, Any]
    honesty_notice: str
