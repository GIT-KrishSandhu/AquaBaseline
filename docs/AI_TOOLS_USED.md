# Ethical AI Tools Disclosure & Provenance

**Project:** AquaBaseline: Smart Water Monitoring That Learns What "Normal" Looks Like  
**Author:** Krish Sandhu (KIET Group of Institutions, Uttar Pradesh)  
**Program:** 1M1B Internships on Green Skills and Applied AI for Climate Action  

---

## 1. Overview of Ethical Transparency

In alignment with 1M1B academic honesty principles and the internship project evaluation criteria, all algorithmic models, libraries, and generative artificial intelligence tools used throughout the eight-week internship journey and final capstone engineering are disclosed below.

---

## 2. Technical Machine Learning Stack

The core data processing and anomaly detection engines use established open-source scientific algorithms:

1. **Isolation Forest (`scikit-learn`):**
   - **Role:** Primary anomaly detection engine.
   - **Why Chosen:** No labeled leak dataset exists prior to deployment. Supervised learning is inappropriate without ground-truth historical fault labels. Isolation Forest isolates observations by randomly selecting features and splitting values.
   - **Hyperparameters:** `n_estimators=200`, `contamination=0.01`, `random_state=1`.
   - **Custom Feature Engineering:** Added relative hourly scaling `rel = flow / median_hour_flow`, which transformed recall from ~0% to 80–85%.

2. **NumPy & Pandas:**
   - **Role:** 15-minute time series resampling, hourly aggregation, rolling 30-day baseline computation, empirical CDF percentile calibration, and multi-year climate dataset statistical auditing.

3. **FastAPI & Uvicorn:**
   - **Role:** High-performance, type-safe asynchronous Python REST API gateway connecting client requests to mathematical models.

---

## 3. Generative AI Assistants in the Student Journey

During the progression of the 1M1B internship, two primary AI assistants were leveraged to support ideation, research documentation, and full-stack implementation:

### 3.1 Claude (Anthropic)
- **Assignments Used:** Assignments 1A through 4B, Ideation Sprints, and Planet Prompt.AI hackathon concept drafting.
- **Tasks Performed:**
  - Facilitated brainstorming on campus environmental issues at KIET (dust, parking, water).
  - Drafted structured project notes, indicator mapping frameworks, and initial slide artifact prototypes.
  - Assisted in generating Python code snippets for exploratory Jupyter notebooks in Assignment 2A.
- **Human Oversight:** The student (Krish Sandhu) manually selected the water systems domain, conducted physical campus observations, curated indicator mappings, and edited all technical text.

### 3.2 Google Antigravity (Google DeepMind)
- **Role in Capstone:** Autonomous senior engineering agent for full-stack prototype development.
- **Tasks Performed:**
  - Scaffolding the React 18 + Vite + Tailwind CSS frontend and FastAPI SQLite backend.
  - Porting and validating the 20-seed simulation experiment.
  - Implementing end-to-end user workflows: Dashboard timeline replay, Scenario Lab injection, Alerts feedback loop, and Data Quality audits.
  - Automating the generation of the 8-slide PowerPoint portfolio deck (`KrishSandhu_ProjectPortfolio.pptx`) and headless screen recording scripts.
- **Verification:** All tests, empirical results, and code compilation were verified through local execution without third-party cloud API dependencies.

---

## 4. Student Authorship Statement

I, **Krish Sandhu**, confirm that:
- I directed all design requirements, problem scopes, and architectural trade-offs.
- I reviewed and refined every visual interface and written explanation.
- No pilot results, partner commitments, or cost savings were fabricated; all numbers are labeled as empirical simulation measurements or assumptions.
