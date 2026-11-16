# AquaBaseline Architecture Documentation

**System Title:** AquaBaseline: Smart Water Monitoring That Learns What "Normal" Looks Like  
**Author:** Krish Sandhu (KIET Group of Institutions, Uttar Pradesh)  
**Program:** 1M1B Internships on Green Skills and Applied AI for Climate Action  

---

## 1. System Architecture Diagram

```mermaid
flowchart TD
    subgraph Client Layer [Frontend - Vite + React 18 + Tailwind CSS]
        UI_HOME[Home Page /]
        UI_STORY[Story Page /story]
        UI_RESEARCH[Research Page /research]
        UI_DASH[Dashboard /dashboard]
        UI_LAB[Scenario Lab /lab]
        UI_ALERTS[Alerts Inbox /alerts]
        UI_DQ[Data Quality Auditor /data-quality]
        UI_IMPACT[Impact & ESG /impact]
        UI_VAL[Validation /validation]
        UI_ABOUT[About & Ethics /about]
    end

    subgraph API & Gateway Layer [FastAPI Application - Port 8000]
        API_ROUTER[FastAPI Main Router]
        CORS[CORS Middleware]
        LIFESPAN[Application Lifespan & Seeding]
    end

    subgraph Service Layer [Backend Core Engines]
        SIM_ENG[15-Min Simulator - app/sim.py\n3 Buildings: Hostel, Canteen, Academic]
        MODEL_ENG[Hour-Aware Isolation Forest - app/model.py\nFeatures: rel, flow, hour | Grouping: 2+ hrs]
        VAL_ENG[20-Seed Experiment Runner - app/validation.py\nEvaluation against ground truth]
        DQ_ENG[Data Quality Engine - app/quality.py\nIQR outliers, jump anomalies, >2B implied pop]
        RES_ENG[Research Analytics Engine - app/research.py\nKaggle 500-record dataset analysis]
        ESG_ENG[ESG & Savings Calculator - app/metrics.py\n6 Indicators, ~50M L/yr, 95/70 Gate]
    end

    subgraph Storage Layer [Persistence & Data Files]
        SQLITE[(SQLite DB - data/aquabaseline.db\nSettings, Scenarios, Alerts, Feedback)]
        CSV_DATA[data/cleaned_water_dataset.csv\n20 Countries, 2000-2024]
        VAL_JSON[data/validation_results.json\nEmpirical Evaluation Results]
    end

    UI_HOME & UI_DASH & UI_LAB & UI_ALERTS & UI_DQ & UI_IMPACT & UI_VAL --> API_ROUTER
    API_ROUTER --> CORS --> LIFESPAN
    LIFESPAN --> SIM_ENG --> MODEL_ENG
    MODEL_ENG --> SQLITE
    API_ROUTER --> DQ_ENG
    API_ROUTER --> RES_ENG --> CSV_DATA
    API_ROUTER --> ESG_ENG --> SQLITE
    VAL_ENG --> VAL_JSON
    API_ROUTER --> VAL_JSON
```

---

## 2. Component Specifications

### 2.1 Meter Telemetry Simulator (`app/sim.py`)
- Simulates **35 days** of **15-minute** readings for three distinct building typologies:
  - **Hostel Block A:** 400 headcount, 110 L/person/day target, morning (07:30) & evening (20:30) peaks, minimum baseline (01:00–05:00: 0.07), weekend factor 0.92.
  - **Canteen:** 1,200 headcount, 20 L/person/day target, sharp meal peaks at 08:00, 13:00, 19:30, near-zero night flow (22:00–06:00: 0.01), weekend factor 0.60.
  - **Academic Block B:** 1,500 headcount, 25 L/person/day target, daytime lecture peaks at 10:30 and 14:00, night base 0.02, weekend factor 0.20.
- Gaussian shape functions scaled to target daily volumes with 6% daily noise and 12% interval noise.
- Supports fault injection for days 28–34: night leaks, tank overflows, stuck meters, data gaps, and holiday factors.

### 2.2 Hour-Aware Isolation Forest Detector (`app/model.py`)
- Unsupervised Isolation Forest (200 trees, 0.01 contamination, random_state=1) fitted per building on days 0–27.
- **Hour-Aware Feature Engineering:**
  $$\text{rel} = \frac{\text{flow}}{\text{median}(\text{flow}_{\text{hour}})}$$
  Feature matrix: `["rel", "flow", "hour"]`. Without relative hour scaling, detection collapses to ~0%.
- **Alert Grouping Logic:** Two or more consecutive flagged hours trigger an **Alert** incident. Isolated single flagged hours are classified as **Watch** digests.
- **Rule-Based Explanation:** Analyzes the leading deviating feature to generate plain-language explanations (e.g. *"Night flow was 9.8x the usual level for 03:00"*).

### 2.3 Data Governance & Quality Engine (`app/quality.py`)
- Stream checks: completeness, negative values, stuck sensors (8 consecutive equal readings), and implausible spikes (>10x 75th percentile).
- CSV File Auditor: Column types, IQR distribution outliers, single-year jumps (>100% YoY), and the physical sanity check:
  $$\text{Implied Population} = \frac{\text{Total BCM} \times 10^{12}}{\text{PerCapita L/day} \times 365}$$
  Flags rows where implied population exceeds 2 billion people.

---

## 3. REST API Surface

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Health status and prototype metadata |
| `/api/buildings` | GET | List of 3 buildings with live today vs baseline metrics |
| `/api/readings` | GET | Hourly or 15-min readings with normal bands and flags |
| `/api/scenarios` | POST | Inject fault into building days 28–34 |
| `/api/scenarios/reset` | POST | Reset all faults back to baseline |
| `/api/alerts` | GET | Maintenance inbox incidents list |
| `/api/alerts/{id}/feedback` | POST | Submit maintenance inspection outcome |
| `/api/model/retrain` | POST | Retrain models incorporating feedback |
| `/api/settings` | GET / POST | Alert sensitivity percentile and campus size |
| `/api/metrics` | GET | Six ESG metrics, savings calc, 95%/70% scale-up gate |
| `/api/metrics/manual` | POST | Update manual staff check hours & complaints |
| `/api/data-quality/validate` | POST | Upload CSV file for audit |
| `/api/data-quality/sample` | GET | Audit bundled 500-row Kaggle dataset |
| `/api/research/summary` | GET | 25-year trend series, country means, and histogram |
| `/api/validation/results` | GET | Retrieve empirical 20-seed validation results |
| `/api/validation/run` | POST | Re-run 20-seed experiment dynamically |
