# ResuMap — Recommended Improvements (living checklist)

Reviewed 2026-08-07 across the full stack (backend FastAPI + React/Vite frontend).
Each item is a self-contained change. Mark `[x]` when done. Start new sessions with
"work on RECOMMENDATIONS.md item #N" to pick up where you left off.

---

## 🔴 Security / production hardening

- [x] **1. JWT secret must fail fast in production** — `backend/auth/utils.py:14-26`.
      If `JWT_SECRET`/`SECRET_KEY` is missing in prod, tokens are signed with a
      public hardcoded fallback → total auth bypass. Raise at startup instead of
      falling back to the default when running against Postgres.
      **Done 2026-08-08** — raises `RuntimeError` at import when `DATABASE_URL`
      is Postgres and no secret is set; dev-only fallback kept for SQLite. Verified
      locally (prod no-secret raises; prod+secret boots; dev falls back).
- [x] **2. Pin CORS origins** — `backend/main.py:67-82`. Restrict to the Vercel
      frontend + localhost dev (configurable via `CORS_ORIGINS` env var, comma-
      separated), instead of `allow_origins=["*"]` + `allow_credentials=True`.
      **Done 2026-08-08** — verified live on `resumap-api.onrender.com`: Vercel
      origin + preflight accepted; `evil.example.com` gets no allow-origin header.
- [x] **3. Rate limiting** — `POST /scan` (unauthenticated, calls Groq = money)
      and login/signup have no limits. Add per-IP rate limiting (slowapi) so the
      free Groq quota / Render bandwidth can't be exhausted and auth can't be
      brute-forced.
      **Done 2026-08-10** — slowapi per-IP limits in `backend/main.py`:
      `/scan` 10/min, signup & login 20/min (trusts Render's
      `X-Forwarded-For`). Verified live on `resumap-api.onrender.com`: 11th
      `/scan` → 429, 21st `/login` → 429, fresh IP stays allowed. Local smoke
      test `backend/test_rate_limit.py` passes 6/6.

## 🟠 Product / UX gaps

- [ ] **4. Wire up anonymous "try it" scan** — `/scan` endpoint exists and README
      advertises it, but no frontend route/CTA uses it (all Landing CTAs →
      /login). Build a public scan page (conversion lever) or remove the endpoint.
- [ ] **5. Delete endpoints for resumes & analyses** — models cascade on delete but
      no `DELETE /api/resumes/{id}` / `DELETE /api/analyses/{id}`. Users can't
      manage their own data.
- [ ] **6. Uploaded files: preview/download or stop storing** — `_store_file`
      (`backend/main.py:195`) writes bytes no one can access; no cleanup (leak on
      dev, ephemeral on Render). Only `raw_text` is used downstream.
- [ ] **7. Replace `alert()` on upload error** — `frontend/src/pages/Dashboard.jsx:572`
      with the inline error banner pattern used elsewhere.
- [ ] **8. Global 401 handling** — `frontend/src/lib/api.js` attaches the token but
      only Dashboard catches expired sessions; Analyze/SavedAnalysis show generic
      errors. Add a response interceptor → redirect to /login.
- [ ] **9. Password reset / email verification** — accounts are unrecoverable if a
      password is lost.
- [ ] **10. Resume history comparison** — flat list today; add per-role comparison
      view (which skills valued where).

## 🟡 AI analysis quality

- [ ] **11. Upgrade the model** — `backend/ai.py:57` uses `llama-3.1-8b-instant`
      (weak/old). Prefer a current Groq model (e.g. llama-3.3-70b).
- [ ] **12. Use `response_format={"type": "json_object"}`** — `backend/ai.py:65`
      scrapes JSON with a greedy regex; force JSON output for deterministic parsing.
- [ ] **13. Normalize the LLM response** — fill missing keys
      (score/missing/suggestions/verdict) with defaults + clamp score 0–100.
- [ ] **14. Smarter input truncation** — `backend/ai.py:42-45` cuts resume/JD at
      2000 chars mid-sentence.
- [ ] **15. Structured recommendations** — `backend/main.py:294` flattens every
      suggestion to content/high. Have the model return typed recs
      (strength/gap/action, priority).

## 🟢 Code health

- [ ] **16. Dead code** — delete root `_legacy/` (`frontend_old`),
      `backend/_legacy/` (Flask prototype), unused `parse_resume` /
      `extract_text_from_pdf` / `extract_text_from_docx` in
      `backend/resume_parser.py`, and `PyPDF2` from requirements (pdfplumber is
      used for all live extraction).
- [ ] **17. Use `CreateAnalysisRequest` schema** — `backend/schemas.py:56` defined
      but `create_analysis` takes `payload: dict` (`backend/main.py:304`).
- [ ] **18. Server-side password policy** — Login enforces 6 chars client-side only.
- [ ] **19. `datetime.utcnow()` is deprecated** — `backend/auth/utils.py:32`; use
      timezone-aware now.
- [ ] **20. Tests + CI** — none exist. Add API smoke test (signup → login → upload
      → analyze).
- [ ] **21. Observability** — only `print()` logging; add structured logging +
      Sentry-style error tracking.

## 🔵 Nice-to-haves

- [ ] **22. Accessibility** — glyph icons (⊞◻◷◈) render inconsistently; 10–11px
      uppercase labels low-contrast; no visible focus states.
- [ ] **23. Route code-splitting** — lazy-load pages via React Router `lazy`.
