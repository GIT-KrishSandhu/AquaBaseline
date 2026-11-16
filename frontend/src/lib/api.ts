/**
 * AquaBaseline Type-Safe API Client
 */

export interface BuildingSummary {
  id: string;
  name: string;
  headcount: number;
  daily_l_per_person_target: number;
  l_per_person_today: number;
  l_per_person_baseline: number;
  delta_pct: number;
  status: 'Normal' | 'Watch' | 'Alert';
  latest_score: number;
  readings_checked_pct: number;
  leak_share_pct: number;
}

export interface ReadingPoint {
  t: string;
  flow: number;
  rel: number;
  flag: boolean;
  alert: boolean;
  score: number;
  status: 'Normal' | 'Watch' | 'Alert';
  reason: string | null;
  expected_lo: number;
  expected_hi: number;
}

export interface ReadingsResponse {
  building_id: string;
  resolution: string;
  points: ReadingPoint[];
  total_count: number;
}

export interface ScenarioRequest {
  building_id: string;
  type: 'night_leak' | 'tank_overflow' | 'stuck_meter' | 'data_gap' | 'holiday';
  start_day?: number;
  nights?: number;
  magnitude?: number | null;
}

export interface ScenarioResponse {
  status: string;
  message: string;
  scenario: any;
  alerts_created: number;
}

export interface AlertItem {
  id: number;
  building_id: string;
  building_name: string;
  start_time: string;
  end_time: string;
  score: number;
  reason: string;
  status: 'unreviewed' | 'real_leak' | 'false_alarm' | 'meter_error';
  note: string;
  created_at: string;
}

export interface SettingsModel {
  alert_percentile: number;
  campus_size: number;
  target_cut_pct: number;
}

export interface ESGMetricItem {
  pillar: 'E' | 'S' | 'G';
  name: string;
  current_value: string;
  expected_value: string;
  is_live: boolean;
  unit: string;
  notes: string;
}

export interface MetricsResponse {
  esg_metrics: ESGMetricItem[];
  savings: {
    campus_size: number;
    baseline_l_person_day: number;
    target_cut_pct: number;
    daily_saved_litres: number;
    annual_saved_litres: number;
    daily_saved_formatted: string;
    annual_saved_formatted: string;
    assumptions: string;
  };
  precision: {
    total_alerts: number;
    reviewed_alerts: number;
    real_leaks: number;
    false_alarms: number;
    meter_errors: number;
    precision_pct: number;
    needs_retuning: boolean;
    banner_message: string | null;
  };
  scale_up: {
    readings_checked_pct: number;
    readings_checked_target: number;
    readings_checked_met: boolean;
    precision_pct: number;
    precision_target: number;
    precision_met: boolean;
    ready_to_scale: boolean;
    status_text: string;
  };
  manual_inputs: {
    complaints: number;
    staff_hours: number;
  };
}

export interface DataQualityReport {
  filename: string;
  total_rows: number;
  total_columns: number;
  readings_checked_pct: number;
  passed_pct: number;
  issues_summary: {
    missing_cells: number;
    duplicate_rows: number;
    negative_values: number;
    iqr_outliers: number;
    jump_anomalies: number;
    implied_population_violations: number;
  };
  column_stats: Array<{
    name: string;
    dtype: string;
    missing: number;
    is_numeric: boolean;
    outliers_count: number;
    min: number | null;
    max: number | null;
    mean: number | null;
  }>;
  jump_anomalies: Array<{
    entity: string;
    year: number | string;
    prev_val: number;
    curr_val: number;
    pct_change: number;
    metric: string;
  }>;
  implied_population_findings: Array<{
    row_index: number;
    country: string;
    year: number | string;
    total_bcm: number;
    per_capita_l_day: number;
    implied_population_billions: number;
  }>;
  is_bundled_dataset: boolean;
}

export interface ResearchSummaryResponse {
  trend_series: Array<{
    year: number;
    mean: number;
    q25: number;
    q75: number;
    min: number;
    max: number;
    overall_mean: number;
  }>;
  country_comparison: Array<{
    country: string;
    mean: number;
    std: number;
    min: number;
    max: number;
    avg_yearly_swing: number;
  }>;
  distribution_histogram: Array<{
    bin: string;
    bin_start: number;
    bin_end: number;
    count: number;
    is_outlier_zone: boolean;
  }>;
  headline_stats: {
    overall_mean: number;
    year_2000_mean: number;
    year_2024_mean: number;
    trend_change_pct: number;
    highest_country: string;
    highest_value: number;
    lowest_country: string;
    lowest_value: number;
    between_country_gap: number;
    avg_within_country_swing: number;
    normal_band_pct: number;
    extreme_records_count: number;
    extreme_low_count: number;
    extreme_high_count: number;
    iqr_lower_bound: number;
    iqr_upper_bound: number;
    corr_total_depletion: number;
    corr_percapita_depletion: number;
    implied_population_finding: string;
  };
  honesty_notice: string;
}

export interface ValidationResultsResponse {
  timestamp: string;
  seeds_count: number;
  caption: string;
  primary_results: Array<{
    building_id: string;
    building_name: string;
    leak_rate_l_h: number;
    total_leak_nights: number;
    total_normal_days: number;
    alert_caught: number;
    alert_catch_pct: number;
    false_alert_days: number;
    false_alert_pct: number;
    watch_caught: number;
    watch_catch_pct: number;
    false_watch_days: number;
    false_watch_pct: number;
    daily_rule_caught: number;
    daily_rule_pct: number;
  }>;
  ablation_flow_only: Array<{
    building_id: string;
    building_name: string;
    caught: number;
    total_nights: number;
    catch_pct: number;
    false_days: number;
  }>;
  leak_size_sensitivity: Array<{
    leak_l_per_hour: number;
    caught: number;
    total_nights: number;
    catch_pct: number;
    false_days: number;
  }>;
  training_window_sensitivity: Array<{
    train_days: number;
    caught: number;
    total_nights: number;
    catch_pct: number;
    false_days: number;
  }>;
  honest_weaknesses: string[];
}

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorBody.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  getHealth: (): Promise<any> => fetch(`${BASE_URL}/health`).then((r) => handleResponse<any>(r)),
  
  getBuildings: (): Promise<BuildingSummary[]> =>
    fetch(`${BASE_URL}/buildings`).then((r) => handleResponse<BuildingSummary[]>(r)),
    
  getReadings: (buildingId: string, fromDay?: number, toDay?: number): Promise<ReadingsResponse> => {
    const params = new URLSearchParams({ building_id: buildingId });
    if (fromDay !== undefined) params.append('from_day', fromDay.toString());
    if (toDay !== undefined) params.append('to_day', toDay.toString());
    return fetch(`${BASE_URL}/readings?${params}`).then((r) => handleResponse<ReadingsResponse>(r));
  },
  
  injectScenario: (scenario: ScenarioRequest): Promise<ScenarioResponse> =>
    fetch(`${BASE_URL}/scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario),
    }).then((r) => handleResponse<ScenarioResponse>(r)),
    
  resetScenarios: (): Promise<ScenarioResponse> =>
    fetch(`${BASE_URL}/scenarios/reset`, { method: 'POST' }).then((r) => handleResponse<ScenarioResponse>(r)),
    
  getAlerts: (status?: string): Promise<AlertItem[]> => {
    const params = status ? `?status=${status}` : '';
    return fetch(`${BASE_URL}/alerts${params}`).then((r) => handleResponse<AlertItem[]>(r));
  },
  
  submitFeedback: (alertId: number, outcome: string, note: string = ''): Promise<AlertItem> =>
    fetch(`${BASE_URL}/alerts/${alertId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome, note }),
    }).then((r) => handleResponse<AlertItem>(r)),
    
  retrainModel: (buildingId?: string): Promise<any> =>
    fetch(`${BASE_URL}/model/retrain${buildingId ? `?building_id=${buildingId}` : ''}`, {
      method: 'POST',
    }).then((r) => handleResponse<any>(r)),
    
  getSettings: (): Promise<SettingsModel> =>
    fetch(`${BASE_URL}/settings`).then((r) => handleResponse<SettingsModel>(r)),
    
  updateSettings: (settings: SettingsModel): Promise<SettingsModel> =>
    fetch(`${BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }).then((r) => handleResponse<SettingsModel>(r)),
    
  getMetrics: (): Promise<MetricsResponse> =>
    fetch(`${BASE_URL}/metrics`).then((r) => handleResponse<MetricsResponse>(r)),
    
  updateManualMetrics: (complaints?: number, staffHours?: number): Promise<any> =>
    fetch(`${BASE_URL}/metrics/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaints, staff_hours: staffHours }),
    }).then((r) => handleResponse<any>(r)),
    
  validateCsv: (file: File): Promise<DataQualityReport> => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${BASE_URL}/data-quality/validate`, {
      method: 'POST',
      body: formData,
    }).then((r) => handleResponse<DataQualityReport>(r));
  },
  
  getSampleDataQuality: (): Promise<DataQualityReport> =>
    fetch(`${BASE_URL}/data-quality/sample`).then((r) => handleResponse<DataQualityReport>(r)),
    
  getResearchSummary: (): Promise<ResearchSummaryResponse> =>
    fetch(`${BASE_URL}/research/summary`).then((r) => handleResponse<ResearchSummaryResponse>(r)),
    
  getValidationResults: (): Promise<ValidationResultsResponse> =>
    fetch(`${BASE_URL}/validation/results`).then((r) => handleResponse<ValidationResultsResponse>(r)),
    
  runValidation: (): Promise<any> =>
    fetch(`${BASE_URL}/validation/run`, { method: 'POST' }).then((r) => handleResponse<any>(r)),
};
