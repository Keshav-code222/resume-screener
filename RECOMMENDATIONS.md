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

- [x] **4. Wire up anonymous "try it" scan** — `/scan` endpoint exists and README
      advertises it, but no frontend route/CTA uses it (all Landing CTAs →
      /login). Build a public scan page (conversion lever) or remove the endpoint.
      **Done 2026-08-13** — `PublicScan` page (`frontend/src/pages/PublicScan.jsx`)
      is reachable at `/scan` (registered in `App.jsx`); the three primary Landing
      CTAs all route to `/scan` (`HeroProlog` "Try a free scan", `ResultsChapter`
      "Try a reading", `BeginChapter` "Begin — it's free") and the top nav
      `FilledButton` ("Try it free") does too. The page posts to
      `POST /scan`, normalizes the `overall_score` / `missing_keywords` /
      `top_suggestions` payload into the `AnalysisResults` shape, and
      reuses `LoadingAnalysis`. Anonymous flow is end-to-end live: a real PDF
      against `https://resumap-api.onrender.com/scan` returned a 60% match
      with missing keywords and a verdict. Secondary CTA on the result page
      funnels visitors to `/login` (conversion lever preserved).
- [x] **5. Delete endpoints for resumes & analyses** — models cascade on delete but
      no `DELETE /api/resumes/{id}` / `DELETE /api/analyses/{id}`. Users can't
      manage their own data.
      **Done 2026-08-14** — both endpoints in `backend/main.py`. Ownership
      checked via joined `Resume.user_id`; missing-or-not-yours returns
      `404` (no existence leak). Resume delete cascades to its analyses,
      removes the on-disk file, and promotes another resume to
      `is_current` if the deleted one was current. Frontend
      `frontend/src/pages/Dashboard.jsx` adds a `Delete` button on every
      resume and analysis row plus an `AnimatePresence` confirm dialog;
      rows exit-animate out and (for resume deletes) the history list is
      refreshed so cascaded analyses disappear. Verified locally
      (`backend/test_delete_endpoints.py` 12/12 pass — ownership, cascade,
      cross-user 404, double-delete) and live on
      `resumap-api.onrender.com` (signup → upload → analyze → delete
      analysis → delete resume → double-delete 404, all expected codes).
- [x] **6. Uploaded files: preview/download or stop storing** — `_store_file`
      (`backend/main.py:195`) writes bytes no one can access; no cleanup (leak on
      dev, ephemeral on Render). Only `raw_text` is used downstream.
      **Done 2026-08-15** — authenticated `GET /api/resumes/{id}/download`
      in `backend/main.py` serves the original PDF/DOCX with the right
      `Content-Type` and `Content-Disposition`. Ownership check returns
      `404` (no existence leak); missing-file on Render's ephemeral disk
      returns `410 Gone` with a re-upload hint. `Delete` cascades the row
      *and* `os.remove`s the file (best-effort, swallows OSError). Frontend
      `Dashboard.jsx` exposes `Preview` (PDF only) and `Download` on every
      row; the inline `PreviewModal` fetches the file as a `blob` through
      the shared axios client so the JWT is never in the iframe URL, then
      renders it in an `<iframe src={blob:...}>`. Verified locally
      (`backend/test_download_endpoint.py` 11/11 pass — owner 200, content-
      type/bytes match, cross-user 404, missing-id 404, unauthenticated
      401, DOCX content-type, delete cascades file, public `/scan` still
      reachable) and live on `resumap-api.onrender.com` (signup → upload
      → `/api/resumes/{id}/download` returns the original PDF bytes).
- [x] **7. Replace `alert()` on upload error** — `frontend/src/pages/Dashboard.jsx:572`
      with the inline error banner pattern used elsewhere.
      **Done 2026-08-17** — added a small `ErrorBanner` subcomponent to
      `Dashboard.jsx` styled like the `PublicScan.jsx` banner (gold/dark
      palette: `colors.error` bg + `errorText` text). Two error states in
      the main component: `uploadError` is sticky (with a × dismiss)
      because the user needs to see what went wrong, and `flashError` is
      the auto-dismissing variant (5s) for inline actions like download
      and delete that shouldn't block the next click. All three former
      `alert()` call sites (upload catch, download 410/404 catch, delete
      catch) now call `setUploadError` / `setFlashError` and the banner
      renders above the stats row / active view. `handleUpload` also
      clears `uploadError` on retry. Verified `npm run build` clean
      (370 modules, 4.08s) and `grep "alert("` in the file only matches
      the comment in `ErrorBanner`'s docstring.
- [x] **8. Global 401 handling** — `frontend/src/lib/api.js` attaches the token but
      only Dashboard catches expired sessions; Analyze/SavedAnalysis show generic
      errors. Add a response interceptor → redirect to /login.
      **Done 2026-08-18** — added a `response.use` interceptor in
      `frontend/src/lib/api.js` that catches `401`/`403`, clears the
      stored token, and `window.location.href`-navigates to `/login`.
      Guards: a `redirecting` module-level flag collapses the burst of
      parallel 401s that Dashboard's three initial fetches (`/users/me`,
      `/resumes`, `/analyses`) trigger; an `if (pathname.startsWith('/login'))`
      early-return keeps Login's inline "Invalid email or password" error
      working instead of bouncing the user. Dashboard's
      `fetchUser` catch block lost its now-redundant
      `localStorage.removeItem('token') + navigate('/login')` and now
      just lets the interceptor do its job. Analyze and SavedAnalysis
      inherit the redirect for free (their `err.response?.data?.error`
      branches continue to surface non-auth errors as before).
      Verified `npm run build` clean (370 modules, 4.30s).
- [x] **9. Password reset / email verification** — accounts are unrecoverable if a
      password is lost.
      **Done 2026-08-25** — backend `POST /api/auth/forgot-password` and
      `POST /api/auth/reset-password` in `backend/main.py`; the `PasswordResetToken`
      model (`backend/models.py`) stores a SHA-256 hash of the random token
      (never the raw token) and cascades to user deletes; helpers in
      `backend/auth/utils.py` (`_hash_reset_token`, `generate_reset_token`,
      `reset_token_matches`) do the constant-time compare. Forgot-password
      always returns the same 200 body whether the email exists (no
      account enumeration), invalidates all prior tokens for the user on
      a fresh request, and is slowapi-limited to 5/min. Reset enforces
      6-char minimum, single-use (consumed row is deleted), and the
      generic `Invalid or expired reset link` 400 covers both bogus and
      expired tokens. Frontend `ForgotPassword.jsx` and `ResetPassword.jsx`
      in `frontend/src/pages/` are routed at `/forgot-password` and
      `/reset-password` (`App.jsx`); the Login page adds a `Forgot password?`
      link, the reset page reads the token from `?token=…`, and both
      share the editorial gold/dark palette of the Login page. Email
      delivery is stubbed via `print()` (no SMTP in the repo); swap for
      SES/SendGrid when configured. Verified locally with
      `backend/test_password_reset.py` 27/27 pass (no enumeration, valid
      reset, single-use, prior-token invalidation on re-forgot, expiry
      cleanup, short-password rejection) and `npm run build` clean
      (372 modules, 3.72s).
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
