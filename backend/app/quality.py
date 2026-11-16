"""AquaBaseline Data Quality & Governance Engine
Handles automated stream data validation and comprehensive CSV file quality audits,
including outlier checks, jump detection, and the >2B implied-population sanity check.
"""

import io
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple

def validate_stream_readings(df: pd.DataFrame) -> Dict[str, Any]:
    """Validate 15-minute simulated or telemetry stream readings for governance metric G1."""
    total = len(df)
    if total == 0:
        return {"checked_pct": 100.0, "passed_pct": 100.0, "issues": {}}
    
    missing_count = int(df["flow15"].isna().sum())
    negative_count = int((df["flow15"] < 0).sum())
    dup_count = int(df["t"].duplicated().sum())
    
    # Stuck value check: same value >= 8 consecutive intervals (2 hours)
    flow_vals = df["flow15"].values
    stuck_mask = np.zeros(len(flow_vals), dtype=bool)
    if len(flow_vals) >= 8:
        for i in range(7, len(flow_vals)):
            window = flow_vals[i-7:i+1]
            if not np.any(np.isnan(window)) and np.all(window == window[0]) and window[0] > 0:
                stuck_mask[i-7:i+1] = True
    stuck_count = int(stuck_mask.sum())
    
    # Implausible spike: > 10x 75th percentile / upper quartile of normal flow (or > 5000L/15m)
    valid_flow = df.loc[df["flow15"].notna() & (df["flow15"] >= 0), "flow15"]
    if len(valid_flow) > 0:
        q75 = valid_flow.quantile(0.75)
        spike_thresh = max(q75 * 10.0, 2500.0)
        spike_count = int((valid_flow > spike_thresh).sum())
    else:
        spike_count = 0
        
    failed_rows = missing_count + negative_count + dup_count + stuck_count + spike_count
    passed_rows = max(0, total - failed_rows)
    passed_pct = round((passed_rows / float(total)) * 100.0, 2)
    
    return {
        "total_readings": total,
        "checked_pct": 100.0,
        "passed_pct": passed_pct,
        "issues": {
            "missing": missing_count,
            "negative": negative_count,
            "duplicates": dup_count,
            "stuck_values": stuck_count,
            "implausible_spikes": spike_count,
        }
    }

def audit_dataset_csv(content_bytes: bytes, filename: str = "uploaded.csv") -> Dict[str, Any]:
    """Comprehensive CSV dataset audit for Data Quality page and sample dataset runner."""
    try:
        df = pd.read_csv(io.BytesIO(content_bytes))
    except Exception as e:
        df = pd.read_csv(io.BytesIO(content_bytes), encoding="latin1")
        
    total_rows = len(df)
    total_cols = len(df.columns)
    
    issues_summary = {
        "missing_cells": int(df.isna().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
        "negative_values": 0,
        "iqr_outliers": 0,
        "jump_anomalies": 0,
        "implied_population_violations": 0,
    }
    
    column_stats = []
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    for col in df.columns:
        col_missing = int(df[col].isna().sum())
        is_num = col in num_cols
        stat = {
            "name": col,
            "dtype": str(df[col].dtype),
            "missing": col_missing,
            "is_numeric": is_num,
            "outliers_count": 0,
            "min": None,
            "max": None,
            "mean": None,
        }
        
        if is_num:
            series = df[col].dropna()
            if len(series) > 0:
                stat["min"] = round(float(series.min()), 2)
                stat["max"] = round(float(series.max()), 2)
                stat["mean"] = round(float(series.mean()), 2)
                
                neg_count = int((series < 0).sum())
                issues_summary["negative_values"] += neg_count
                
                q1 = series.quantile(0.25)
                q3 = series.quantile(0.75)
                iqr = q3 - q1
                lo = q1 - 1.5 * iqr
                hi = q3 + 1.5 * iqr
                outliers = int(((series < lo) | (series > hi)).sum())
                stat["outliers_count"] = outliers
                issues_summary["iqr_outliers"] += outliers
                
        column_stats.append(stat)
        
    # Jump detection: group by Country or categorical entity, sort by Year if present
    jump_anomalies = []
    country_col = next((c for c in df.columns if c.lower() in ("country", "location", "entity", "site")), None)
    year_col = next((c for c in df.columns if c.lower() in ("year", "date", "time")), None)
    value_col = next((c for c in df.columns if "percapita" in c.lower() or "per_capita" in c.lower() or "l_per_day" in c.lower()), None)
    
    if country_col and year_col and value_col:
        try:
            sorted_df = df.sort_values(by=[country_col, year_col])
            for country, group in sorted_df.groupby(country_col):
                g = group.dropna(subset=[year_col, value_col])
                vals = g[value_col].values
                years = g[year_col].values
                for idx in range(1, len(vals)):
                    prev = vals[idx - 1]
                    curr = vals[idx]
                    if prev > 0:
                        pct_change = (curr - prev) / float(prev) * 100.0
                        if abs(pct_change) > 100.0:
                            jump_anomalies.append({
                                "entity": str(country),
                                "year": int(years[idx]) if str(years[idx]).isdigit() else str(years[idx]),
                                "prev_val": round(float(prev), 1),
                                "curr_val": round(float(curr), 1),
                                "pct_change": round(float(pct_change), 1),
                                "metric": value_col,
                            })
                            issues_summary["jump_anomalies"] += 1
        except Exception:
            pass
            
    # Implied Population Check: total consumption BCM vs per-capita L/day
    implied_pop_findings = []
    bcm_col = next((c for c in df.columns if "total_consumption_bcm" in c.lower() or "bcm" in c.lower()), None)
    pc_col = next((c for c in df.columns if "percapita" in c.lower() or "l_per_day" in c.lower()), None)
    
    if bcm_col and pc_col:
        for idx, row in df.iterrows():
            total_bcm = row[bcm_col]
            pc_l_day = row[pc_col]
            if pd.notna(total_bcm) and pd.notna(pc_l_day) and pc_l_day > 0:
                # 1 BCM = 1e9 m^3 = 1e12 Litres
                implied_people = (float(total_bcm) * 1e12) / (float(pc_l_day) * 365.0)
                if implied_people > 2e9:  # > 2 Billion people
                    c_name = row[country_col] if country_col in df.columns else f"Row {idx}"
                    yr_val = row[year_col] if year_col in df.columns else ""
                    implied_pop_findings.append({
                        "row_index": int(idx),
                        "country": str(c_name),
                        "year": int(yr_val) if str(yr_val).isdigit() else str(yr_val),
                        "total_bcm": round(float(total_bcm), 1),
                        "per_capita_l_day": round(float(pc_l_day), 1),
                        "implied_population_billions": round(implied_people / 1e9, 2),
                    })
                    issues_summary["implied_population_violations"] += 1
                    
    is_bundled = "cleaned_water_dataset" in filename.lower() or (
        total_rows == 500 and bcm_col is not None and len(implied_pop_findings) > 100
    )
    
    total_issues = sum(issues_summary.values())
    passed_pct = round(max(0.0, 100.0 - (total_issues / float(total_rows * max(total_cols, 1))) * 100.0), 1)
    
    return {
        "filename": filename,
        "total_rows": total_rows,
        "total_columns": total_cols,
        "readings_checked_pct": 100.0,
        "passed_pct": passed_pct,
        "issues_summary": issues_summary,
        "column_stats": column_stats,
        "jump_anomalies": jump_anomalies,
        "implied_population_findings": implied_pop_findings,
        "is_bundled_dataset": is_bundled,
    }
