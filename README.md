# UdyamSathi (SIH26092)
## AI-Driven Scheme Matching & Channel Partner Routing for Marginalized Entrepreneurs

UdyamSathi is an end-to-end intelligent digital platform designed for the **National Scheduled Castes Finance and Development Corporation (NSFDC)**, Ministry of Social Justice and Empowerment, Government of India. It bridges the awareness, discovery, and operational gaps for Scheduled Caste entrepreneurs and students accessing concessional finance.

---

## 🌟 Key Features & Requirements Matrix

| ID | Requirement | Status | Implementation Details |
|----|-------------|--------|------------------------|
| **FR-1** | **Smart Scheme Recommender** | ✅ Live | Deterministic statutory decision engine (`app/services/eligibility_engine.py`) covering all NSFDC schemes + MUDRA/PMEGP/Stand-Up India with 100% explainability. |
| **FR-2** | **Financial Calculator** | ✅ Live | Dynamic EMI & repayment simulator (`/calculator`) handling scheme loan caps, 6.0%–15% interest rates, and 3–12 months moratorium periods. |
| **FR-3** | **Geo-Spatial Partner Locator** | ✅ Live | Distance calculation (Haversine formula) finding nearest State Channelizing Agencies (SCAs), Public Sector Banks, and RRBs with real-time radius filtering. |
| **FR-4** | **Partner Health & NPA Filter** | ✅ Live | Dynamic composite scoring based on NPA rate, fund utilization, and SLA turnaround. Low-health partners (NPA > 5%) are flagged with red warnings or filtered out. |
| **FR-5** | **Multi-Lingual Support** | ✅ Live | Language switching (English, Hindi, Gujarati) across the interface and conversational AI assistant. |
| **FR-6** | **Offline Capability & PWA** | ✅ Live | Static generation and local client-side financial calculations without network dependencies. |
| **FR-7** | **Application Pipeline** | ✅ Live | Complete CRUD management of loan applications (`/admin/applications` and `/api/v1/applications`) with status progression (Draft -> Submitted -> Under Review -> Approved -> Rejected). |
| **FR-8** | **Financial Literacy & Guide** | ✅ Live | Bite-sized explanations of moratorium relief, reducing balance calculations, and document checklists. |

---

## 🚀 Quick Start (1-Click Run)

### Method 1: Double-Click Startup
Double-click `start-dev.bat` in the project root folder. It will launch:
1. **FastAPI Backend** on `http://localhost:8001`
2. **Next.js Frontend** on `http://localhost:3000`

### Method 2: Manual Terminal Startup

**Terminal 1 (Backend):**
```bash
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npx next dev -p 3000
```

---

## 🔑 Default Credentials

- **Admin Portal (`/admin`):**
  - **Email:** `admin@udyamsathi.in`
  - **Password:** `admin123`
- **Test Beneficiary (`/dashboard`):**
  - **Email:** `test@udyamsathi.in`
  - **Password:** `test123`

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (Turbopack, App Router), React 19, Tailwind CSS v4, Lucide Icons, Recharts
- **Backend:** FastAPI, Python 3.12, SQLAlchemy, Pydantic v2, Uvicorn
- **Database:** PostgreSQL (with SQLite compatibility fallback)
- **AI/LLM:** Google Gemini 1.5 Flash (with deterministic statutory fallback)
- **Security:** JWT authentication (HS256), bcrypt password hashing, CORS protection

---

## 🧪 Verification & Automated Tests

To run the complete 34-test validation suite verifying all models, foreign keys, statutory rules, female 0.5% interest rebate, and partner health scoring:
```bash
cd backend
.\venv\Scripts\python.exe -m tests.verify_all_models
```
Result: **All 34/34 tests pass cleanly.**

---

## 📡 Core API Endpoints

- `GET /api/v1/schemes/` — List all verified government schemes
- `POST /api/v1/eligibility/assess` — Deterministic eligibility check & recommendation
- `POST /api/v1/calculator/emi` — Loan repayment schedule & moratorium calculation
- `GET /api/v1/partners/` — Geolocation-based channel partner search with health filtering
- `POST /api/v1/assistant/chat` — Multilingual conversational AI guidance
- `GET /api/v1/applications/` — Loan applications pipeline & status management
- `GET /api/v1/applications/stats/summary` — Application pipeline stage counts
