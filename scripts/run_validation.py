#!/usr/bin/env python3
"""Run AquaBaseline Validation Suite and save output to backend/app/data/validation_results.json."""

import os
import sys

# Ensure backend directory is in python path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.validation import run_full_validation_suite

def main():
    save_path = os.path.join(backend_dir, "app", "data", "validation_results.json")
    print(f"Executing validation experiment. Target output: {save_path}")
    results = run_full_validation_suite(save_path=save_path)
    print("\n=== Validation Summary ===")
    for r in results["primary_results"]:
        print(f"Building: {r['building_name']:<18} | Caught: {r['alert_caught']}/{r['total_leak_nights']} ({r['alert_catch_pct']}%) | False Days: {r['false_alert_days']}/{r['total_normal_days']} | Daily Rule: {r['daily_rule_caught']}/{r['total_leak_nights']}")
    print("\nExperiment completed successfully.")

if __name__ == "__main__":
    main()
