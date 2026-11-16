#!/usr/bin/env python3
"""Capture desktop (1440x900) and mobile (390x844) screenshots for all 10 pages using Playwright."""

import os
import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://127.0.0.1:5173"
OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "deliverables", "screenshots"))

PAGES = [
    ("01_home_desktop.png", "/", 1440, 900),
    ("02_story_desktop.png", "/story", 1440, 900),
    ("03_research_desktop.png", "/research", 1440, 900),
    ("04_dashboard_desktop.png", "/dashboard", 1440, 900),
    ("05_scenario_lab_desktop.png", "/lab", 1440, 900),
    ("06_alerts_desktop.png", "/alerts", 1440, 900),
    ("07_data_quality_desktop.png", "/data-quality", 1440, 900),
    ("08_impact_desktop.png", "/impact", 1440, 900),
    ("09_validation_desktop.png", "/validation", 1440, 900),
    ("10_about_desktop.png", "/about", 1440, 900),
    ("11_dashboard_mobile.png", "/dashboard", 390, 844),
    ("12_scenario_lab_mobile.png", "/lab", 390, 844),
]

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"Capturing screenshots to: {OUT_DIR}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        for filename, route, width, height in PAGES:
            target_url = f"{BASE_URL}{route}"
            print(f"Capturing {filename} at {width}x{height} from {target_url}...")
            
            context = browser.new_context(
                viewport={"width": width, "height": height},
                device_scale_factor=2 if width < 500 else 1,
            )
            page = context.new_page()
            try:
                page.goto(target_url, wait_until="networkidle", timeout=15000)
                time.sleep(1.0) # allow recharts transitions to complete
                save_path = os.path.join(OUT_DIR, filename)
                page.screenshot(path=save_path, full_page=False)
                print(f" Saved: {save_path}")
            except Exception as e:
                print(f" Failed to capture {filename}: {e}")
            finally:
                context.close()
                
        browser.close()
    print("Screenshot capture complete.")

if __name__ == "__main__":
    main()
