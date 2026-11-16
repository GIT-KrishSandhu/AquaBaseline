# AquaBaseline Build Progress

- [x] **M1: Backend skeleton, simulator, SQLite seeding, Isolation Forest, pytest**
  - [x] Python virtualenv and requirements setup
  - [x] Reference simulator & hourly aggregator (`app/sim.py`, `app/model.py`)
  - [x] Data validation & governance engine (`app/quality.py`)
  - [x] Research dataset engine (`app/research.py`)
  - [x] ESG metrics & savings calculator (`app/metrics.py`)
  - [x] Database schema, seeding & scenario injection (`app/db.py`)
  - [x] FastAPI endpoints & CORS (`app/main.py`)
  - [x] Pytest unit test suite passing (9/9 tests passed)

- [x] **M2: Validation experiment & dynamic results reporting**
  - [x] 20-seed experiment script (`scripts/run_validation.py`)
  - [x] Sensitivity matrix (leak size, training window)
  - [x] Output saved to `backend/app/data/validation_results.json`
  - [x] Dynamic API integration (`/api/validation/results`)

- [x] **M3: Frontend scaffold, design tokens, layout, nav, API client**
  - [x] Vite + React 18 + TypeScript + Tailwind CSS setup
  - [x] Design system tokens (`#F0F9FF`, `#0D9488`, `#06B6D4`, etc.)
  - [x] Fonts (Plus Jakarta Sans & Inter)
  - [x] Layout (Sticky Header, Footer, Simulated Data Badge, Skeletons)
  - [x] Typed API client (`src/lib/api.ts`)

- [x] **M4: Core pages (Dashboard, Scenario Lab, Alerts)**
  - [x] Dashboard with KPI cards, Recharts flow with normal band, 7-day replay
  - [x] Scenario Lab with 5 injection types, before/after chart, reset
  - [x] Alerts inbox, detail drawer, feedback buttons, precision banner, slider
  - [x] End-to-end feedback loop updates ESG metrics

- [x] **M5: Remaining pages (Data Quality, Research, Impact, Validation, Story, Home, About)**
  - [x] Home page with hero gradient, stats, 4-step strip, CTAs
  - [x] Story page with 6-stage journey & scroll rail
  - [x] Research page with 3 charts, 4 insight cards, ~5B population finding
  - [x] Data Quality page with CSV upload, sample run, jump & population checks
  - [x] Impact page with 6 ESG metrics, savings calc, roadmap, risks
  - [x] Validation page with live results, ablation, sensitivity, limitations
  - [x] About page with AI tools disclosed, limitations, student takeaways

- [x] **M6: Polish & accessibility**
  - [x] Mobile responsive audit (390px, 768px, 1440px)
  - [x] WCAG AA compliance, focus rings, semantic HTML
  - [x] Empty and error states
  - [x] `npm run build` succeeds with zero errors

- [x] **M7: Deliverables & documentation**
  - [x] Portfolio deck `KrishSandhu_ProjectPortfolio.pptx` (max 8 slides, speaker notes, live data)
  - [x] 60-second video kit (`script_60s.md`, `shotlist.md`, `demo_capture.webm`)
  - [x] Full screenshots of all 10 pages + mobile
  - [x] `SUBMISSION_CHECKLIST.md` with "Student must do" tasks
  - [x] Docs (`ARCHITECTURE.md`, `AI_TOOLS_USED.md`, `LIMITATIONS.md`, `DECISIONS.md`, `README.md`)
  - [x] Git init and initial commit (no push)

