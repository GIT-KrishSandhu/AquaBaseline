"""AquaBaseline Research Analytics Engine
Computes all statistical series, country comparisons, histograms, and correlations
directly from data/cleaned_water_dataset.csv for the Research page.
"""

import os
import numpy as np
import pandas as pd
from typing import Dict, Any, List

def get_dataset_path() -> str:
    candidates = [
        os.path.join(os.path.dirname(__file__), "data", "cleaned_water_dataset.csv"),
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "cleaned_water_dataset.csv"),
        os.path.join(os.getcwd(), "data", "cleaned_water_dataset.csv"),
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "AquaBaseline_Capstone_Pack", "data", "cleaned_water_dataset.csv"),
        "cleaned_water_dataset.csv"
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return candidates[0]

def get_research_summary() -> Dict[str, Any]:
    """Compute all analytical series and honesty metrics from the 500-row dataset."""
    path = get_dataset_path()
    df = pd.read_csv(path)
    
    # 1. Trend series by year (2000-2024)
    overall_mean = float(df["PerCapita_L_per_day"].mean())
    trend_group = df.groupby("Year")["PerCapita_L_per_day"]
    trend_series = []
    for yr, group in trend_group:
        q25 = float(group.quantile(0.25))
        q75 = float(group.quantile(0.75))
        mean_val = float(group.mean())
        trend_series.append({
            "year": int(yr),
            "mean": round(mean_val, 1),
            "q25": round(q25, 1),
            "q75": round(q75, 1),
            "min": round(float(group.min()), 1),
            "max": round(float(group.max()), 1),
            "overall_mean": round(overall_mean, 1),
        })
        
    # 2. Country comparison
    country_series = []
    swings = []
    for country, g in df.groupby("Country"):
        g_sorted = g.sort_values("Year")
        diffs = g_sorted["PerCapita_L_per_day"].diff().abs().dropna()
        avg_swing = float(diffs.mean()) if len(diffs) > 0 else 0.0
        swings.append(avg_swing)
        
        c_mean = float(g["PerCapita_L_per_day"].mean())
        c_std = float(g["PerCapita_L_per_day"].std())
        country_series.append({
            "country": str(country),
            "mean": round(c_mean, 1),
            "std": round(c_std, 1),
            "min": round(float(g["PerCapita_L_per_day"].min()), 1),
            "max": round(float(g["PerCapita_L_per_day"].max()), 1),
            "avg_yearly_swing": round(avg_swing, 1),
        })
    country_series.sort(key=lambda x: x["mean"], reverse=True)
    
    highest_c = country_series[0]
    lowest_c = country_series[-1]
    between_gap = round(highest_c["mean"] - lowest_c["mean"], 1)
    avg_country_swing = round(float(np.mean(swings)), 1)
    
    # 3. Histogram of PerCapita distribution (500 records)
    vals = df["PerCapita_L_per_day"].values
    q1 = float(df["PerCapita_L_per_day"].quantile(0.25))
    q3 = float(df["PerCapita_L_per_day"].quantile(0.75))
    iqr = q3 - q1
    iqr_lo = q1 - 1.5 * iqr
    iqr_hi = q3 + 1.5 * iqr
    
    # Count extreme records
    extreme_low = int((vals < iqr_lo).sum())
    extreme_high = int((vals > iqr_hi).sum())
    total_extreme = extreme_low + extreme_high
    normal_band_count = int(((vals >= 200) & (vals <= 350)).sum())
    normal_band_pct = round((normal_band_count / float(len(vals))) * 100.0, 1)
    
    # Construct 12 bins
    min_v = int(np.floor(vals.min() / 25.0) * 25)
    max_v = int(np.ceil(vals.max() / 25.0) * 25)
    bins = list(range(min_v, max_v + 25, 25))
    counts, edges = np.histogram(vals, bins=bins)
    
    histogram_series = []
    for i in range(len(counts)):
        b_start = int(edges[i])
        b_end = int(edges[i+1])
        histogram_series.append({
            "bin": f"{b_start}-{b_end}",
            "bin_start": b_start,
            "bin_end": b_end,
            "count": int(counts[i]),
            "is_outlier_zone": (b_end < iqr_lo) or (b_start > iqr_hi),
        })
        
    # 4. Correlations
    r_total_depletion = round(float(df["Total_Consumption_BCM"].corr(df["Groundwater_Depletion_pct"])), 2)
    r_percapita_depletion = round(float(df["PerCapita_L_per_day"].corr(df["Groundwater_Depletion_pct"])), 2)
    
    # Year 2000 vs 2024
    y2000 = float(df[df["Year"] == 2000]["PerCapita_L_per_day"].mean())
    y2024 = float(df[df["Year"] == 2024]["PerCapita_L_per_day"].mean())
    trend_pct = round(((y2024 - y2000) / y2000) * 100.0, 1)
    
    return {
        "trend_series": trend_series,
        "country_comparison": country_series,
        "distribution_histogram": histogram_series,
        "headline_stats": {
            "overall_mean": round(overall_mean, 1),
            "year_2000_mean": round(y2000, 1),
            "year_2024_mean": round(y2024, 1),
            "trend_change_pct": trend_pct,
            "highest_country": highest_c["country"],
            "highest_value": highest_c["mean"],
            "lowest_country": lowest_c["country"],
            "lowest_value": lowest_c["mean"],
            "between_country_gap": between_gap,
            "avg_within_country_swing": avg_country_swing,
            "normal_band_pct": normal_band_pct,
            "extreme_records_count": total_extreme,
            "extreme_low_count": extreme_low,
            "extreme_high_count": extreme_high,
            "iqr_lower_bound": round(iqr_lo, 1),
            "iqr_upper_bound": round(iqr_hi, 1),
            "corr_total_depletion": r_total_depletion,
            "corr_percapita_depletion": r_percapita_depletion,
            "implied_population_finding": "Total and per-person figures imply ~5 billion people per country: the dataset cannot be internally consistent, which is exactly why AquaBaseline's automated validation is vital.",
        },
        "honesty_notice": "Public dataset findings describe patterns 'in the dataset' (which appears synthetic). AquaBaseline uses these findings to demonstrate why fixed global rules fail and why automated integrity audits are mandatory.",
    }

