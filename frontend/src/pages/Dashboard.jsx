// Dashboard — app home, styled in the editorial monogram aesthetic.
// Uses shared design tokens from ../lib/theme.js so it reads as one
// system alongside Landing, Login, and Analyze.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { colors, fonts, spacing, theme as t } from '../lib/theme';
import Logo from '../components/ui/Logo';
import FilledButton from '../components/ui/FilledButton';
import GhostButton from '../components/ui/GhostButton';

// ── Sidebar ──────────────────────────────────────────────────────────────
function Sidebar({ user, active, setActive, navigate }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'resumes',   label: 'My Resumes',  icon: '◻' },
    { id: 'history',   label: 'History',     icon: '◷' },
    { id: 'analyze',   label: 'Analyze',     icon: '◈' },
  ];

  return (
    <div
      style={{
        width: 220,
        background: colors.card,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      {/* Logo area */}
      <div
        style={{
          padding: '0 20px 24px',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Logo size={28} to="/dashboard" />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {links.map((link) => (
          <motion.button
            key={link.id}
            whileHover={{ background: colors.elevated }}
            onClick={() => setActive(link.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: active === link.id ? colors.elevated : 'transparent',
              border: 'none',
              borderRadius: 0,
              cursor: 'pointer',
              marginBottom: 4,
              color: active === link.id ? colors.creamDim : colors.textDim,
              fontFamily: fonts.sans,
              fontSize: 12,
              fontWeight: active === link.id ? 600 : 400,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textAlign: 'left',
              transition: 'color 0.2s, background 0.2s',
            }}
          >
            <span style={{ color: active === link.id ? colors.gold : colors.textDim, fontSize: 14 }}>
              {link.icon}
            </span>
            {link.label}
          </motion.button>
        ))}
      </nav>

      {/* User area */}
      <div
        style={{
          padding: '16px 12px',
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ padding: '10px 12px', marginBottom: 8 }}>
          <p
            style={{
              margin: 0,
              fontFamily: fonts.serif,
              fontWeight: 500,
              fontSize: 15,
              color: colors.cream,
            }}
          >
            {user?.full_name || 'User'}
          </p>
          <p style={{ margin: '2px 0 0', ...t.caption }}>
            {user?.email}
          </p>
        </div>
        <motion.button
          whileHover={{ color: colors.goldLight }}
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            background: 'transparent',
            border: 'none',
            borderRadius: 0,
            cursor: 'pointer',
            color: colors.textDim,
            fontFamily: fonts.sans,
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textAlign: 'left',
          }}
        >
          <span>↩</span> Sign out
        </motion.button>
      </div>
    </div>
  );
}

// ── Stat Tile (editorial style — serif value, gold eyebrow) ──────────────
function StatTile({ label, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        background: colors.card,
        padding: '24px 28px',
        borderRight: `1px solid ${colors.border}`,
      }}
    >
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: colors.gold,
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: fonts.serif,
          fontSize: 32,
          fontWeight: 500,
          color: colors.cream,
          letterSpacing: '-0.02em',
          margin: 0,
        }}
      >
        {value}
      </p>
    </motion.div>
  );
}

// ── Upload Card ──────────────────────────────────────────────────────────
function UploadCard({ uploading, onUpload }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ ...t.label, marginBottom: 16 }}>Upload Resume</p>
      <label
        style={{
          display: 'block',
          border: `1px dashed ${colors.border}`,
          padding: 40,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.2s, background 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = colors.goldMuted;
          e.currentTarget.style.background = colors.goldBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = colors.border;
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={onUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ color: colors.textMuted, fontSize: 14, margin: 0 }}
          >
            Uploading...
          </motion.p>
        ) : (
          <>
            <p
              style={{
                fontFamily: fonts.serif,
                fontSize: 18,
                fontWeight: 400,
                color: colors.cream,
                marginBottom: 6,
                margin: 0,
              }}
            >
              Drop your manuscript here
            </p>
            <p style={{ ...t.caption, margin: '6px 0 0' }}>
              PDF or DOCX · Max 10MB
            </p>
          </>
        )}
      </label>
    </div>
  );
}

// ── Resumes List ─────────────────────────────────────────────────────────
function ResumesList({ resumes, onAnalyze, onDelete, onPreview, onDownload }) {
  if (resumes.length === 0) {
    return (
      <div
        style={{
          border: `1px solid ${colors.border}`,
          padding: '48px 32px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: colors.textMuted, fontSize: 14, fontFamily: fonts.sans }}>
          No resumes yet. Upload one above to get started.
        </p>
      </div>
    );
  }

  return (
    <div style={{ border: `1px solid ${colors.border}` }}>
      <AnimatePresence>
        {resumes.map((resume, i) => {
          // Only PDFs can be inlined; DOCX falls back to download-only.
          const ext = (resume.file_name || '').split('.').pop()?.toLowerCase();
          const canPreview = ext === 'pdf';
          return (
          <motion.div
            key={resume.id}
            layout
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{
              opacity: { duration: 0.3 },
              layout: { duration: 0.4, type: 'spring', bounce: 0.2 },
            }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom:
                i < resumes.length - 1 ? `1px solid ${colors.border}` : 'none',
              background: colors.card,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  color: colors.gold,
                  fontFamily: fonts.mono,
                  fontSize: 11,
                  letterSpacing: '0.08em',
                }}
              >
                DOC
              </span>
              <div>
                <p
                  style={{
                    color: colors.creamDim,
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: fonts.sans,
                    margin: 0,
                  }}
                >
                  {resume.file_name}
                </p>
                <p style={{ ...t.caption, margin: '2px 0 0' }}>
                  {resume.created_at
                    ? new Date(resume.created_at).toLocaleDateString()
                    : '—'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <GhostButton small onClick={() => onAnalyze(resume.id)}>
                Analyze →
              </GhostButton>
              {canPreview && onPreview && (
                <GhostButton
                  small
                  onClick={() => onPreview(resume)}
                  style={{ color: colors.textDim }}
                >
                  Preview
                </GhostButton>
              )}
              {onDownload && (
                <GhostButton
                  small
                  onClick={() => onDownload(resume)}
                  style={{ color: colors.textDim }}
                >
                  Download
                </GhostButton>
              )}
              {onDelete && (
                <GhostButton
                  small
                  onClick={() => onDelete(resume)}
                  style={{ color: colors.textDim }}
                >
                  Delete
                </GhostButton>
              )}
            </div>
          </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ── History List ─────────────────────────────────────────────────────────
function HistoryList({ analyses, onView, onDelete }) {
  if (analyses.length === 0) {
    return (
      <div
        style={{
          border: `1px solid ${colors.border}`,
          padding: '48px 32px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: colors.textMuted, fontSize: 14, fontFamily: fonts.sans }}>
          No analyses yet. Pick a resume to scan against a job.
        </p>
      </div>
    );
  }

  return (
    <div style={{ border: `1px solid ${colors.border}` }}>
      {analyses.map((a, i) => {
        const score = Math.round(Number(a.match_score || 0));
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onView(a)}
            style={{
              display: 'grid',
              gridTemplateColumns: '90px 1fr 120px 90px 90px',
              gap: 16,
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom:
                i < analyses.length - 1 ? `1px solid ${colors.border}` : 'none',
              background: colors.card,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = colors.elevated)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = colors.card)
            }
          >
            {/* Score */}
            <div>
              <span
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 24,
                  fontWeight: 500,
                  color: colors.cream,
                  letterSpacing: '-0.02em',
                }}
              >
                {score}
              </span>
              <span style={{ ...t.caption, fontSize: 12 }}>%</span>
            </div>
            {/* Title + date */}
            <div>
              <p
                style={{
                  color: colors.creamDim,
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: fonts.sans,
                  margin: 0,
                }}
              >
                {a.job_title || 'Untitled role'}
              </p>
              <p style={{ ...t.caption, margin: '2px 0 0' }}>
                {a.generated_at
                  ? new Date(a.generated_at).toLocaleString()
                  : '—'}
              </p>
              {a.verdict && (
                <p
                  style={{
                    ...t.caption,
                    margin: '4px 0 0',
                    color: colors.textMuted,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 320,
                  }}
                >
                  {a.verdict}
                </p>
              )}
            </div>
            {/* Gaps */}
            <div style={{ color: colors.textMuted, fontSize: 12, fontFamily: fonts.sans }}>
              {Array.isArray(a.missing_skills)
                ? `${a.missing_skills.length} gaps`
                : '—'}
            </div>
            {/* View link */}
            <div
              style={{
                textAlign: 'right',
                color: colors.gold,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: fonts.sans,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              view →
            </div>
            {/* Delete */}
            {onDelete && (
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(a);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: colors.textDim,
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: fonts.sans,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 8px',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = colors.creamDim)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = colors.textDim)
                  }
                >
                  delete
                </button>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Preview Modal ────────────────────────────────────────────────────────
// Inline PDF preview rendered in an iframe. We can't point the iframe at the
// download endpoint directly — iframes are sandboxed documents that can't
// read the parent's localStorage, and we don't use cookies, so the JWT would
// be missing. Instead, fetch the bytes through axios (which DOES attach the
// JWT) and feed a blob: URL to the iframe. The token never leaves JS memory
// and never appears in the URL.
function PreviewModal({ open, resume, onClose }) {
  const [src, setSrc] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !resume) return;

    let cancelled = false;
    let blobUrl = null;
    setError(null);
    setLoading(true);

    (async () => {
      try {
        const res = await api.get(
          `/api/resumes/${resume.id}/download`,
          { responseType: 'blob' },
        );
        if (cancelled) return;
        const blob = new Blob([res.data], {
          type: res.headers['content-type'] || 'application/pdf',
        });
        blobUrl = URL.createObjectURL(blob);
        setSrc(blobUrl);
      } catch (err) {
        if (cancelled) return;
        const detail =
          err.response?.data?.detail ||
          (err.response?.status === 410
            ? 'Original file is no longer available — re-upload to restore preview.'
            : 'Could not load preview.');
        setError(detail);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [open, resume]);

  if (!open || !resume) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            width: 'calc(100vw - 64px)',
            height: 'calc(100vh - 64px)',
            maxWidth: 1100,
            maxHeight: 900,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div>
              <p
                style={{
                  ...t.label,
                  margin: 0,
                  color: colors.gold,
                }}
              >
                Preview
              </p>
              <p
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 16,
                  color: colors.cream,
                  margin: '4px 0 0',
                  fontWeight: 500,
                }}
              >
                {resume.file_name}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close preview"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: colors.textDim,
                fontFamily: fonts.sans,
                fontSize: 22,
                padding: 4,
                lineHeight: 1,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = colors.creamDim)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = colors.textDim)
              }
            >
              ×
            </button>
          </div>
          <div style={{ flex: 1, position: 'relative', background: colors.ink }}>
            {loading && (
              <p
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.textDim,
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                Loading preview…
              </p>
            )}
            {error && (
              <p
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.errorText,
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  margin: 0,
                  padding: 24,
                  textAlign: 'center',
                }}
              >
                {error}
              </p>
            )}
            {src && !error && (
              <iframe
                src={src}
                title={`Preview of ${resume.file_name}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


// ── Confirm Dialog ───────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', busy, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onCancel}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.card,
              border: `1px solid ${colors.border}`,
              padding: '32px 32px 24px',
              maxWidth: 440,
              width: 'calc(100% - 48px)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}
          >
            <p
              style={{
                ...t.label,
                marginBottom: 8,
                color: colors.gold,
              }}
            >
              {title}
            </p>
            <p
              style={{
                fontFamily: fonts.serif,
                fontSize: 17,
                color: colors.cream,
                margin: '0 0 8px',
                lineHeight: 1.5,
              }}
            >
              {message.headline}
            </p>
            {message.body && (
              <p
                style={{
                  fontSize: 13,
                  color: colors.textMuted,
                  fontFamily: fonts.sans,
                  margin: '0 0 24px',
                  lineHeight: 1.5,
                }}
              >
                {message.body}
              </p>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                marginTop: 16,
              }}
            >
              <GhostButton small onClick={onCancel} disabled={busy}>
                Cancel
              </GhostButton>
              <button
                onClick={onConfirm}
                disabled={busy}
                style={{
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  color: colors.creamDim,
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '10px 18px',
                  cursor: busy ? 'wait' : 'pointer',
                  opacity: busy ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!busy) {
                    e.currentTarget.style.borderColor = colors.goldMuted;
                    e.currentTarget.style.color = colors.goldLight;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.creamDim;
                }}
              >
                {busy ? 'Deleting...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


// ── Error Banner ────────────────────────────────────────────────────────
// Inline error surface that matches the PublicScan page banner. Used for
// ephemeral failures (upload, download, delete) so we don't pop a blocking
// `alert()` dialog in the middle of the editorial UI.
function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        background: colors.error,
        border: '1px solid rgba(239, 68, 68, 0.3)',
        padding: '12px 16px',
        color: colors.errorText,
        fontSize: 13,
        fontFamily: fonts.sans,
        marginBottom: 24,
      }}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.errorText,
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </motion.div>
  );
}


// ── Loading State ────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div
      style={{
        background: colors.ink,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            border: `1px solid ${colors.goldBorder}`,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <span
            style={{
              color: colors.gold,
              fontFamily: fonts.serif,
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 28,
            }}
          >
            R
          </span>
        </div>
      </motion.div>
      <motion.p
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          color: colors.textDim,
          fontSize: 11,
          fontFamily: fonts.sans,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
        }}
      >
        Loading Dashboard...
      </motion.p>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [active, setActive] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null); // {kind, target}
  const [deleting, setDeleting] = useState(false);
  const [previewResume, setPreviewResume] = useState(null);
  // Inline error banner. `uploadError` is sticky (user must dismiss or
  // upload again); `flashError` is the auto-dismissing variant for inline
  // actions like download / delete that shouldn't block the next click.
  const [uploadError, setUploadError] = useState('');
  const [flashError, setFlashError] = useState('');
  const navigate = useNavigate();

  // Show a transient banner (download/delete) and clear it on its own so
  // the user isn't left staring at stale errors. Cleanup on unmount or
  // when a new message supersedes the old one.
  useEffect(() => {
    if (!flashError) return undefined;
    const t = setTimeout(() => setFlashError(''), 5000);
    return () => clearTimeout(t);
  }, [flashError]);

  useEffect(() => {
    fetchUser();
    fetchResumes();
    fetchAnalyses();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/users/me');
      setUser(res.data);
    } catch {
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const res = await api.get('/api/resumes');
      setResumes(res.data || []);
    } catch (err) {
      console.error('fetchResumes', err);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const res = await api.get('/api/analyses');
      setAnalyses(res.data || []);
    } catch (err) {
      console.error('fetchAnalyses', err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/api/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResumes((prev) => [
        {
          id: res.data.resume_id,
          file_name: file.name,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      setUploadError(
        'Upload failed: ' +
          (err.response?.data?.detail ||
            err.response?.data?.error ||
            'Unknown error')
      );
    } finally {
      setUploading(false);
    }
  };

  const askDeleteResume = (resume) => {
    setPendingDelete({ kind: 'resume', target: resume });
  };

  const askDeleteAnalysis = (analysis) => {
    setPendingDelete({ kind: 'analysis', target: analysis });
  };

  const handlePreviewResume = (resume) => {
    setPreviewResume(resume);
  };

  const closePreview = () => {
    setPreviewResume(null);
  };

  const handleDownloadResume = async (resume) => {
    try {
      const res = await api.get(`/api/resumes/${resume.id}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: res.headers['content-type'] || 'application/octet-stream',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resume.file_name || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoke after the click handler has had a chance to use the URL.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      const status = err.response?.status;
      const detail =
        err.response?.data?.detail ||
        (status === 410
          ? 'Original file is no longer available — re-upload to restore download.'
          : status === 404
          ? 'Resume not found.'
          : 'Download failed.');
      setFlashError(detail);
    }
  };

  const cancelDelete = () => {
    if (deleting) return;
    setPendingDelete(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { kind, target } = pendingDelete;
    setDeleting(true);
    try {
      if (kind === 'resume') {
        await api.delete(`/api/resumes/${target.id}`);
        // Remove locally; the AnimatePresence on ResumesList will animate exit.
        setResumes((prev) => prev.filter((r) => r.id !== target.id));
        // Analyses that referenced this resume cascade-deleted on the server;
        // refresh the list so the History view stays accurate.
        fetchAnalyses();
      } else if (kind === 'analysis') {
        await api.delete(`/api/analyses/${target.id}`);
        setAnalyses((prev) => prev.filter((a) => a.id !== target.id));
      }
      setPendingDelete(null);
    } catch (err) {
      console.error('delete failed', err);
      setFlashError(
        'Delete failed: ' +
          (err.response?.data?.detail ||
            err.response?.data?.error ||
            'Unknown error')
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  const avgScore = analyses.length
    ? Math.round(
        analyses.reduce((s, a) => s + Number(a.match_score || 0), 0) /
          analyses.length
      )
    : 0;

  return (
    <div
      style={{
        ...t.page,
        display: 'flex',
        fontFamily: fonts.sans,
      }}
    >
      <Sidebar user={user} active={active} setActive={setActive} navigate={navigate} />

      <main style={{ marginLeft: 220, flex: 1, padding: '48px 56px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 48 }}
        >
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: colors.gold,
              marginBottom: 8,
            }}
          >
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1
            style={{
              fontFamily: fonts.serif,
              fontWeight: 400,
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              color: colors.cream,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Good{' '}
            {new Date().getHours() < 12 ? 'morning' : 'afternoon'},{' '}
            {user?.full_name?.split(' ')[0] || 'there'}.
          </h1>
        </motion.div>

        {/* Upload errors are sticky so the user can read them. */}
        <ErrorBanner
          message={uploadError}
          onDismiss={() => setUploadError('')}
        />

        {/* Stats Row — editorial grid with gold border */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0,
            border: `1px solid ${colors.border}`,
            marginBottom: 32,
          }}
        >
          <StatTile label="Resumes" value={resumes.length} delay={0.1} />
          <StatTile label="Analyses Run" value={analyses.length} delay={0.15} />
          <StatTile label="Avg Match" value={`${avgScore}%`} delay={0.2} />
          <StatTile
            label="Plan"
            value="Free"
            delay={0.25}
            style={{ borderRight: 'none' }}
          />
        </div>

        {/* Inline action errors (download, delete) auto-dismiss after 5s. */}
        <ErrorBanner message={flashError} />

        {/* Active view */}
        {active === 'dashboard' && (
          <>
            <UploadCard uploading={uploading} onUpload={handleUpload} />
            <div>
              <p style={{ ...t.label, marginBottom: 16 }}>
                Your Resumes{' '}
                {resumes.length > 0 && `— ${resumes.length}`}
              </p>
              <ResumesList
                resumes={resumes}
                onAnalyze={(id) => navigate(`/analyze/${id}`)}
                onDelete={askDeleteResume}
                onPreview={handlePreviewResume}
                onDownload={handleDownloadResume}
              />
            </div>
          </>
        )}

        {active === 'resumes' && (
          <>
            <UploadCard uploading={uploading} onUpload={handleUpload} />
            <div>
              <p style={{ ...t.label, marginBottom: 16 }}>All Resumes</p>
              <ResumesList
                resumes={resumes}
                onAnalyze={(id) => navigate(`/analyze/${id}`)}
                onDelete={askDeleteResume}
                onPreview={handlePreviewResume}
                onDownload={handleDownloadResume}
              />
            </div>
          </>
        )}

        {active === 'analyze' && (
          <div>
            <p style={{ ...t.label, marginBottom: 16 }}>
              Pick a resume to analyze
            </p>
            <ResumesList
              resumes={resumes}
              onAnalyze={(id) => navigate(`/analyze/${id}`)}
              onDelete={askDeleteResume}
              onPreview={handlePreviewResume}
              onDownload={handleDownloadResume}
            />
          </div>
        )}

        {active === 'history' && (
          <div>
            <p style={{ ...t.label, marginBottom: 16 }}>Past Analyses</p>
            <HistoryList
              analyses={analyses}
              onView={(a) => {
                if (a.id) navigate(`/analysis/${a.id}`);
              }}
              onDelete={askDeleteAnalysis}
            />
          </div>
        )}
      </main>

      <ConfirmDialog
        open={!!pendingDelete}
        title={
          pendingDelete?.kind === 'resume' ? 'Delete Resume' : 'Delete Analysis'
        }
        message={
          pendingDelete?.kind === 'resume'
            ? {
                headline: `Delete ${pendingDelete.target.file_name}?`,
                body:
                  'This removes the resume and every analysis you ran against it. This cannot be undone.',
              }
            : {
                headline: `Delete this analysis${
                  pendingDelete?.target?.job_title
                    ? ` for “${pendingDelete.target.job_title}”`
                    : ''
                }?`,
                body: 'The analysis will be removed from your history. Your resume will not be affected.',
              }
        }
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <PreviewModal
        open={!!previewResume}
        resume={previewResume}
        onClose={closePreview}
      />
    </div>
  );
}
