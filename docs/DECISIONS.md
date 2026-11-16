# Architectural & Product Design Decisions (ADR)

**Project:** AquaBaseline: Smart Water Monitoring That Learns What "Normal" Looks Like  
**Author:** Krish Sandhu (KIET Group of Institutions, Uttar Pradesh)  
**Program:** 1M1B Internships on Green Skills and Applied AI for Climate Action  

---

## Decision 1: Building-Specific Baselines over Fixed Campus Thresholds
- **Context:** Campuses typically monitor total monthly inflow or set fixed campus-wide leak thresholds.
- **Problem:** Exploration of water consumption data revealed that internal year-to-year variation within a unit (~42 L/day) exceeds the gap between different units (~30 L/day). Furthermore, a hostel operates with night and morning peaks, while an academic block operates primarily between 09:00 and 16:00.
- **Decision:** Train separate, localized Isolation Forest models per building, learning individual diurnal baselines by hour of day.
- **Outcome:** Substantially eliminated false alarms and enabled catching a 600 L/h leak in an academic block that would otherwise be dwarfed by hostel base flow.

---

## Decision 2: Hour-Aware Relative Feature Scaling (`rel`)
- **Context:** Initial baseline models fed raw flow and hour features into Isolation Forest.
- **Problem:** In simulation testing, a night leak of 1,000 L/h is numerically much smaller than a normal daytime peak of 3,500 L/h. Without hour awareness, the model considered 1,000 L/h completely normal, yielding **0 of 60 nights caught** (0% recall).
- **Decision:** Engineer the `rel` feature: $\text{rel} = \text{flow} / \text{median}(\text{flow}_{\text{hour}})$.
- **Outcome:** Night leaks at 02:00–04:00 now produce `rel` ratios of 8x to 15x normal, causing anomaly scores to surge and increasing recall to **80–85%**.

---

## Decision 3: Two-Consecutive-Hour Alert Rule vs Single-Hour Watch Tier
- **Context:** Balancing alert sensitivity against maintenance crew alert fatigue.
- **Problem:** Single flagged hours caught ~90% of leak nights, but generated **15–27% false alarm days** due to random stochastic usage spikes.
- **Decision:** Implement a two-tiered classification:
  - **Alert (Urgent):** 2 or more contiguous flagged hours.
  - **Watch (Digest):** Single isolated flagged hours.
- **Outcome:** False alert days dropped to **1.2%–2.5%** on normal test days, making notifications practical for real campus plumbing staff.

---

## Decision 4: Lightweight SQLite & Standard Python Stack
- **Context:** Selecting backend persistence and modeling architecture.
- **Decision:** Avoid external database engines (PostgreSQL, Redis) and complex microservices. Implement lightweight stdlib `sqlite3` and in-memory model caching with FastAPI, Scikit-learn, and Pandas.
- **Outcome:** The entire system starts in seconds, runs cross-platform with zero external service costs or API keys, and compiles cleanly on macOS, Windows, and Linux.

---

## Decision 5: Max 8 Slides Portfolio Deck
- **Context:** The 1M1B submission guide specifies "max 7-8 slides" while some prompts mentioned "up to 8 slides".
- **Decision:** Standardized on exactly **8 slides** strictly matching the student journey order from problem to ethical disclosure.
- **Outcome:** Ensures complete compliance with the 1M1B submission rubric while preserving large, readable typography and screenshot evidence.

