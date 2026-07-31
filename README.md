# ResuMap — AI Resume Screener

> *A monograph on being hired.*  
> AI-powered resume analysis that reads your resume against any job description, scores the match, names the gaps, and tells you what to add before you send.

---

## Architecture

```
resume-screener/
├── backend/              # FastAPI (Python) — API server
│   ├── main.py           # Unified FastAPI app with all routes
│   ├── models.py         # SQLAlchemy models (User, Resume, Analysis, Subscription)
│   ├── schemas.py        # Pydantic request/response models
│   ├── database.py       # SQLAlchemy engine — SQLite (dev) / PostgreSQL (prod)
│   ├── ai.py             # Groq API integration for AI resume analysis
│   ├── resume_parser.py  # PDF/DOCX text extraction + keyword skill detection
│   ├── auth/
│   │   ├── utils.py      # JWT creation, password hashing (bcrypt)
│   │   └── dependencies.py  # JWT auth middleware (FastAPI Depends)
│   └── _legacy/          # Archived Flask prototype files
├── frontend/             # React + Vite — SPA
│   ├── src/
│   │   ├── App.jsx       # Router with animated page transitions
│   │   ├── pages/
│   │   │   ├── Landing.jsx    # 6-chapter marketing monograph
│   │   │   ├── Login.jsx      # Sign in / Sign up
│   │   │   ├── Dashboard.jsx  # Upload, manage, and analyze resumes
│   │   │   └── Analyze.jsx    # Job-match analysis with scan animation
│   │   ├── components/   # 20 reusable UI components
│   │   └── lib/
│   │       └── api.js    # Axios client with JWT interceptor
│   └── package.json
└── package.json          # Root scripts: `npm run dev` starts both servers
```

---

## Quick Start

### 1. Backend

```bash
cd backend

# Create virtual environment (first time only)
python -m venv venv
source venv/bin/activate   # Linux/Mac
.\venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Run the API server
python main.py
```

The backend starts at **http://localhost:5000**.  
It uses **SQLite** by default (no Postgres setup needed).

> **AI Analysis**: Set `GROQ_API_KEY` in `backend/.env` (get one free at [console.groq.com](https://console.groq.com/keys)).  
> Without it, the API returns default analysis results.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at **http://localhost:5173**.

### 3. Both together (from root)

```bash
npm install          # installs concurrently
npm run dev          # starts API (port 5000) + web (port 5173)
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/scan` | — | Anonymous scan (no account needed) |
| `POST` | `/api/auth/signup` | — | Create account |
| `POST` | `/api/auth/login` | — | Sign in |
| `GET` | `/api/users/me` | JWT | Current user profile |
| `GET` | `/api/resumes` | JWT | List uploaded resumes |
| `POST` | `/api/resumes/upload` | JWT | Upload resume (PDF/DOCX) |
| `POST` | `/api/analyses` | JWT | Analyze resume against job description |
| `GET` | `/api/analyses` | JWT | List past analyses |
| `GET` | `/api/analyses/{id}` | JWT | Get analysis details |
| `GET` | `/` | — | Health check |

---

## Features

- **Anonymous scan** — Try the tool without signing up via `/scan`
- **JWT auth** — Sign up / sign in with email + password
- **Resume upload** — Drag & drop or click (PDF/DOCX, max 10 MB)
- **AI analysis** — Groq-powered (LLaMA 3.1) match scoring, skill gap detection, and recommendations
- **Dashboard** — Manage resumes, view analysis history, track match scores
- **Loading states** — Scan animation during analysis
- **Error handling** — Network errors, validation, auth failures, empty states
- **Responsive** — Dark-themed editorial design with Tailwind 4 + framer-motion animations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, React Router 7, framer-motion, Tailwind 4 |
| Backend | Python 3.11+, FastAPI, SQLAlchemy 2.0 |
| Database | SQLite (dev) / PostgreSQL (production) |
| AI | Groq API (LLaMA 3.1 8B) |
| Auth | JWT (python-jose) + bcrypt |
| PDF | pdfplumber / PyPDF2 |
| DOCX | python-docx |

---

## Deployment

Production = **Vercel (frontend) + Render (backend) + Postgres**.

- Backend (FastAPI) deploys via `render.yaml` (Render Blueprint) as a free web
  service — see the comments in that file for the click-through steps.
  `DATABASE_URL`, `JWT_SECRET`, and `GROQ_API_KEY` are set as secrets (never
  committed). Tables auto-create on startup via `init_db()`.
- Frontend (Vite) deploys to Vercel with `VITE_API_URL` set to the Render
  service URL (e.g. `https://resumap-api.onrender.com`), which replaces the
  `localhost:5000` dev default in `frontend/src/lib/api.js`.
- Database is a free-tier Postgres (Neon/Supabase). The app's models already
  switch to Postgres UUID/JSONB types when `DATABASE_URL` is set.

> Free-tier note: the backend has no persistent disk, so uploaded resume *files*
> are ephemeral. Extracted resume text, accounts, and all analyses persist in
> Postgres, so the screening features work normally.

## Project Status

Complete — all endpoints functional, all pages built, auth flow verified, 
resume upload and AI analysis ready for use with a valid Groq API key.
