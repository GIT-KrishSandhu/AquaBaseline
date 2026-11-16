#!/usr/bin/env python3
"""Record 60-Second Silent Playwright Demo Walkthrough to deliverables/video/demo_capture.webm."""

import os
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://127.0.0.1:5173"
VIDEO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "deliverables", "video"))

def main():
    os.makedirs(VIDEO_DIR, exist_ok=True)
    temp_rec_dir = os.path.join(VIDEO_DIR, "temp_rec")
    os.makedirs(temp_rec_dir, exist_ok=True)
    
    print(f"Recording scripted 60-second prototype demo into: {VIDEO_DIR}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir=temp_rec_dir,
            record_video_size={"width": 1280, "height": 720},
        )
        page = context.new_page()

        try:
            # 1. Dashboard (0-12s)
            print("Step 1: Dashboard overview...")
            page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
            time.sleep(3.0)
            page.mouse.wheel(0, 300)
            time.sleep(3.0)
            page.mouse.wheel(0, -300)
            time.sleep(3.0)

            # 2. Scenario Lab (12-28s)
            print("Step 2: Injecting night leak in Scenario Lab...")
            page.goto(f"{BASE_URL}/lab", wait_until="networkidle")
            time.sleep(3.0)
            # Click Inject Fault button
            inject_btn = page.locator("button:has-text('Inject Fault into Model')")
            if inject_btn.count() > 0:
                inject_btn.click()
                time.sleep(4.0)
            page.mouse.wheel(0, 400)
            time.sleep(4.0)

            # 3. Alerts Inbox & Human Feedback (28-44s)
            print("Step 3: Alerts inbox & logging feedback...")
            page.goto(f"{BASE_URL}/alerts", wait_until="networkidle")
            time.sleep(3.0)
            # Click on first alert card
            alert_card = page.locator(".cursor-pointer").first
            if alert_card.count() > 0:
                alert_card.click()
                time.sleep(2.0)
            # Click Real Leak Confirmed
            real_leak_btn = page.locator("button:has-text('Real Leak Confirmed')")
            if real_leak_btn.count() > 0:
                real_leak_btn.click()
                time.sleep(3.0)
            page.mouse.wheel(0, 300)
            time.sleep(3.0)

            # 4. Impact & ESG Metrics (44-54s)
            print("Step 4: ESG Metrics & Savings...")
            page.goto(f"{BASE_URL}/impact", wait_until="networkidle")
            time.sleep(4.0)
            page.mouse.wheel(0, 350)
            time.sleep(3.0)

            # 5. Validation Results (54-60s)
            print("Step 5: Validation results...")
            page.goto(f"{BASE_URL}/validation", wait_until="networkidle")
            time.sleep(4.0)

            print("Demo recording walkthrough complete.")
        finally:
            page.close()
            context.close()
            browser.close()

    # Move recorded video to demo_capture.webm
    recorded_files = [os.path.join(temp_rec_dir, f) for f in os.listdir(temp_rec_dir) if f.endswith(".webm")]
    if recorded_files:
        latest = max(recorded_files, key=os.path.getctime)
        dest = os.path.join(VIDEO_DIR, "demo_capture.webm")
        if os.path.exists(dest):
            os.remove(dest)
        os.rename(latest, dest)
        print(f"Recorded video saved to: {dest}")
        # Clean up temp dir
        try:
            os.rmdir(temp_rec_dir)
        except Exception:
            pass

if __name__ == "__main__":
    main()

