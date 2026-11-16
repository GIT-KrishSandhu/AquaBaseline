# AquaBaseline: 60-Second Video Shot List

**Companion to:** `script_60s.md` and `record_demo.py`  
**Output Video:** `deliverables/video/demo_capture.webm` (1280x720, 60fps)

---

### Shot-by-Shot Production Table

| Shot | Time | Route / Page | Visual Action & Camera Focus | On-Screen Caption Text |
|---|---|---|---|---|
| **1** | 0:00 – 0:08 | `/dashboard` | Smooth pan over building summary cards and Hostel Block A hourly flow waveform. Shaded light green diurnal band is visible. | *The Problem: Hidden leaks masked inside gross monthly utility bills* |
| **2** | 0:08 – 0:20 | `/research` | Scrolling past the 25-year trend chart and country comparison dot plot. Highlights the 42 L swing vs 30 L gap card. | *Discovery: Inside-unit variance exceeds the gap between units* |
| **3** | 0:20 – 0:28 | `/lab` | Scenario Lab controls. Selecting "Night Leak (+1000 L/h)", clicking "Inject Fault into Model". Form updates. | *AquaBaseline: Hour-Aware Isolation Forest per building* |
| **4** | 0:28 – 0:34 | `/lab` | Scrolling down to the Comparison Cards: AquaBaseline flags "Alert (2+ hours)", whereas Daily-Total IQR Rule shows "0 Flagged". | *AI flags night leaks immediately; daily rules miss 100%* |
| **5** | 0:34 – 0:45 | `/alerts` | Navigating to Alerts Inbox. Selecting the newly created incident card, reading the plain-language reason, and clicking "Real Leak Confirmed". | *Human-in-the-Loop: Maintenance feedback retunes sensitivity* |
| **6** | 0:45 – 0:54 | `/impact` | Viewing the 6 ESG metrics table, live leak share % calculation, and the 50,000,000 L annual campus savings card. | *Impact: 80–85% leak recall · ~50 Million Litres saved annually* |
| **7** | 0:54 – 1:00 | `/about` | Author bio, KIET institution credentials, 1M1B partnership logo, and ethical AI disclosures. | *What's Next: Physical meter pilot on KIET campus pipes* |

---

### Instructions for Video Assembly:
1. Run `npm run dev` to start backend (8000) and frontend (5173).
2. Run `npm run deliverables` or `python scripts/record_demo.py` to capture the base `demo_capture.webm`.
3. Open `demo_capture.webm` in any video editor (Clipchamp, iMovie, Premiere, CapCut, or DaVinci).
4. Import your audio voice-over recorded using `script_60s.md`.
5. Align audio markers with the 7 visual shots above.
6. Export as `KrishSandhu_AquaBaseline_1MinDemo.mp4` (1080p or 720p, under 100 MB).

