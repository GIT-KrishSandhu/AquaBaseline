# Project Limitations, Assumptions & Research Constraints

**Project:** AquaBaseline: Smart Water Monitoring That Learns What "Normal" Looks Like  
**Author:** Krish Sandhu (KIET Group of Institutions, Uttar Pradesh)  
**Program:** 1M1B Internships on Green Skills and Applied AI for Climate Action  

---

## 1. Simulation Nature of Prototype

AquaBaseline is currently an **honest simulated-data prototype**:
- **Simulated Sensor Readings:** No physical clamp-on ultrasonic or pulse-counter flow meters are currently wired into the KIET campus plumbing infrastructure. All 15-minute readings are synthesized by a parameterized mathematical simulator.
- **Assumed Baselines:** Baseline consumption figures (e.g. 110 L/person/day for hostels, 20 L for canteens, 25 L for academic blocks), campus headcount (5,000 students and staff), and the 12% leak loss share are engineering assumptions derived from literature and guidelines.
- **Physical Pilot Required:** While the mathematical detection algorithms and data governance pipeline are fully validated, physical deployment on campus pipes is necessary to observe real-world noise, cavitation, pump pressure drops, and scale buildup.

---

## 2. Model Performance Weaknesses

From the 20-seed validation experiment (60 leak nights, 80 normal days per building), several specific algorithmic limitations were observed:

1. **Transient Single-Hour Leaks:**
   - To keep false alarms minimal (<2.5% of normal days), the model enforces a **2-consecutive-hour alert threshold**.
   - Consequently, single-hour anomalous bursts (such as a 45-minute valve failure) trigger only a Watch digest, not an immediate urgent alert.
2. **Sub-250 L/hour Micro-Leaks:**
   - When leak magnitude falls to +250 L/h, detection recall drops to ~20–40%.
   - In large academic buildings or hostels with baseline nighttime noise, a small drip blends into regular stochastic variance unless observed over multiple consecutive nights.
3. **Model Drift during Academic Holidays:**
   - Without an integrated academic calendar feature, sudden campus closures (e.g. semester breaks or Diwali vacations) cause consumption to plummet, generating false alarms unless marked as holidays in advance.

---

## 3. Public Dataset Inconsistency Caveat

During Assignment 2A data exploration, the student analyzed the Kaggle **Global Water Consumption Dataset (2000–2024)**:
- **Internal Mathematical Contradiction:** While standard data cleaning showed 0 missing cells and consistent country labels, comparing total consumption (Billion Cubic Metres) with reported per-capita daily use revealed that all 20 countries implied populations of **~5.0 to 5.2 billion people each**.
- **Public Finding Status:** All statistical patterns described on the Research page (e.g. the 276 L flat average, the 42 L swing, and country gaps) represent patterns **"in the dataset"**, which is almost certainly synthetically generated.
- **Academic Relevance:** This finding directly motivated AquaBaseline's Data Quality Auditor, proving that automated domain sanity rules are mandatory before trusting environmental data.

---

## 4. No Commercial Claims

- No commercial pricing, vendor contracts, or hardware procurement commitments are claimed.
- Projected savings (~50 million litres per year) represent theoretical conservation potential assuming a 10% reduction is achieved across a 5,000-person campus.

