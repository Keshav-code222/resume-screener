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
// Adds a "compare" affordance: a per-row checkbox plus a select-all header.
// When 2+ rows are selected, the parent shows a CompareBar that fetches
// /api/analyses/compare and renders the side-by-side view.
function HistoryList({
  analyses,
  onView,
  onDelete,
  selectedIds = [],
  onToggle,
  onToggleAll,
}) {
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

  const allSelected =
    analyses.length > 0 && selectedIds.length === analyses.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < analyses.length;

  return (
    <div style={{ border: `1px solid ${colors.border}` }}>
      {/* Select-all header — only meaningful when compare is wired up. */}
      {onToggle && onToggleAll && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '32px 90px 1fr 120px 90px 90px',
            gap: 16,
            alignItems: 'center',
            padding: '10px 24px',
            borderBottom: `1px solid ${colors.border}`,
            background: colors.elevated,
            color: colors.textDim,
            fontFamily: fonts.sans,
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title={allSelected ? 'Deselect all' : 'Select all'}
          >
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={onToggleAll}
              style={{ accentColor: colors.gold, cursor: 'pointer' }}
            />
          </label>
          <span style={{ gridColumn: 'span 2' }}>
            {selectedIds.length > 0
              ? `${selectedIds.length} selected for compare`
              : 'Select rows to compare'}
          </span>
        </div>
      )}
      {analyses.map((a, i) => {
        const score = Math.round(Number(a.match_score || 0));
        const isSelected = selectedIds.includes(a.id);
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onView(a)}
            style={{
              display: 'grid',
              gridTemplateColumns: '32px 90px 1fr 120px 90px 90px',
              gap: 16,
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom:
                i < analyses.length - 1 ? `1px solid ${colors.border}` : 'none',
              background: isSelected ? colors.goldBg : colors.card,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.background = colors.elevated;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isSelected
                ? colors.goldBg
                : colors.card;
            }}
          >
            {/* Compare checkbox */}
            {onToggle && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(a.id);
                }}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(a.id)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ accentColor: colors.gold, cursor: 'pointer' }}
                  aria-label={`Select ${a.job_title || 'analysis'} for compare`}
                />
              </div>
            )}
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

// ── Compare Bar ──────────────────────────────────────────────────────────
// Sticky bar that appears when the user has selected 2+ analyses. Lives
// inside the main column, not as a floating overlay, so it scrolls with the
// list and never blocks the delete button on the right.
function CompareBar({ count, max, busy, onCompare, onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 20px',
        background: colors.elevated,
        border: `1px solid ${colors.goldBorder}`,
        marginBottom: 16,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: fonts.sans,
          fontSize: 13,
          color: colors.creamDim,
        }}
      >
        {count} of {max} selected
        {count > max && (
          <span style={{ color: colors.warningText, marginLeft: 8 }}>
            (compare at most {max})
          </span>
        )}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <GhostButton small onClick={onClear} disabled={busy}>
          Clear
        </GhostButton>
        <FilledButton
          small
          onClick={onCompare}
          disabled={busy || count < 2 || count > max}
        >
          {busy ? 'Comparing…' : 'Compare selected'}
        </FilledButton>
      </div>
    </motion.div>
  );
}


// ── Compare View ────────────────────────────────────────────────────────
// Side-by-side comparison of 2-6 analyses the user picked from history.
// Layout: a horizontal scroll of "role cards" on top (score bar, verdict,
// open link) and a missing-skill matrix below — rows are unique skills
// flagged as missing across any selected analysis, columns are roles, cells
// show a gold tick if that role required the skill (i.e. it's missing from
// the resume for that role). The matrix is the actual "which skills are
// valued where" answer the user came for.
function CompareView({ data, onClose, onOpen, onDelete }) {
  if (!data) return null;
  const { analyses, skill_matrix } = data;
  const totalRoles = analyses.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        border: `1px solid ${colors.border}`,
        background: colors.card,
        marginBottom: 32,
      }}
    >
      {/* Header */}
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
          <p style={{ ...t.label, margin: 0, color: colors.gold }}>
            Comparison
          </p>
          <p
            style={{
              fontFamily: fonts.serif,
              fontSize: 18,
              color: colors.cream,
              margin: '4px 0 0',
              fontWeight: 500,
            }}
          >
            {totalRoles} roles · {skill_matrix.length} unique gaps
          </p>
        </div>
        <GhostButton small onClick={onClose}>
          ← Back to history
        </GhostButton>
      </div>

      {/* Role cards — horizontal scroll so 3+ roles don't squish */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: `1px solid ${colors.border}`,
          overflowX: 'auto',
        }}
      >
        {analyses.map((a, i) => {
          const score = Math.round(Number(a.match_score || 0));
          return (
            <div
              key={a.id}
              style={{
                flex: `0 0 ${Math.max(280, 100 / totalRoles * 100)}%`,
                minWidth: 280,
                padding: '20px 24px',
                borderRight:
                  i < analyses.length - 1
                    ? `1px solid ${colors.border}`
                    : 'none',
                background: colors.card,
                boxSizing: 'border-box',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: colors.gold,
                }}
              >
                Role {i + 1}
              </p>
              <p
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 18,
                  fontWeight: 500,
                  color: colors.cream,
                  margin: '4px 0 8px',
                  lineHeight: 1.2,
                }}
              >
                {a.job_title || 'Untitled role'}
              </p>
              <p
                style={{
                  ...t.caption,
                  margin: 0,
                  color: colors.textDim,
                }}
              >
                {a.generated_at
                  ? new Date(a.generated_at).toLocaleDateString()
                  : '—'}
              </p>

              {/* Score */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 6,
                  margin: '16px 0 8px',
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.serif,
                    fontSize: 36,
                    fontWeight: 500,
                    color: colors.cream,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}
                >
                  {score}
                </span>
                <span style={{ ...t.caption, fontSize: 13 }}>%</span>
              </div>
              <div style={t.progressTrack}>
                <div style={t.progressFill(score)} />
              </div>

              {/* Verdict */}
              {a.verdict && (
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 12,
                    color: colors.textMuted,
                    lineHeight: 1.5,
                    margin: '12px 0 0',
                  }}
                >
                  {a.verdict}
                </p>
              )}

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  marginTop: 16,
                  alignItems: 'center',
                }}
              >
                <button
                  onClick={() => onOpen(a.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: colors.gold,
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: 0,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = colors.goldLight)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = colors.gold)
                  }
                >
                  Open →
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(a)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: colors.textDim,
                      fontFamily: fonts.sans,
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: 0,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = colors.creamDim)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = colors.textDim)
                    }
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skill matrix */}
      <div style={{ padding: '20px 24px 24px' }}>
        <p
          style={{
            ...t.label,
            margin: '0 0 4px',
          }}
        >
          Missing-skill matrix
        </p>
        <p
          style={{
            ...t.caption,
            margin: '0 0 16px',
          }}
        >
          Sorted by how broadly each skill is required across the selected
          roles — the top of the list is universally demanded, the bottom is
          niche to one or two.
        </p>
        {skill_matrix.length === 0 ? (
          <p
            style={{
              ...t.body,
              margin: 0,
              color: colors.successText,
            }}
          >
            None of these roles flagged any missing skills.
          </p>
        ) : (
          <div
            style={{
              border: `1px solid ${colors.border}`,
              overflowX: 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: fonts.sans,
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: colors.elevated }}>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '10px 16px',
                      fontWeight: 500,
                      fontSize: 10,
                      letterSpacing: '0.24em',
                      textTransform: 'uppercase',
                      color: colors.gold,
                      borderBottom: `1px solid ${colors.border}`,
                      minWidth: 200,
                    }}
                  >
                    Skill
                  </th>
                  {analyses.map((a, i) => (
                    <th
                      key={a.id}
                      title={a.job_title || `Role ${i + 1}`}
                      style={{
                        padding: '10px 12px',
                        fontWeight: 500,
                        fontSize: 11,
                        color: colors.creamDim,
                        borderBottom: `1px solid ${colors.border}`,
                        borderLeft: `1px solid ${colors.border}`,
                        textAlign: 'center',
                        maxWidth: 160,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {a.job_title || `Role ${i + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skill_matrix.map((row, i) => (
                  <tr
                    key={row.skill}
                    style={{
                      background: i % 2 === 0 ? colors.card : colors.elevated,
                    }}
                  >
                    <td
                      style={{
                        padding: '10px 16px',
                        color: colors.creamDim,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      {row.skill}
                    </td>
                    {analyses.map((a) => {
                      const isMissing = row.missing_in.includes(a.id);
                      return (
                        <td
                          key={a.id}
                          style={{
                            padding: '10px 12px',
                            textAlign: 'center',
                            borderBottom: `1px solid ${colors.border}`,
                            borderLeft: `1px solid ${colors.border}`,
                            color: isMissing ? colors.gold : colors.textDim,
                            fontSize: 14,
                          }}
                          title={
                            isMissing
                              ? 'Required by this role but missing from your resume'
                              : 'Not flagged by this role'
                          }
                        >
                          {isMissing ? '✕' : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
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
  // Per-role comparison (item #10 in RECOMMENDATIONS.md). `selectedIds` is
  // the working set the user builds with the checkboxes; `compareData` is
  // the materialized result from /api/analyses/compare that drives the
  // side-by-side view. Compare is opt-in: leaving the history tab clears
  // the selection so it doesn't leak into a different visit.
  const [selectedIds, setSelectedIds] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [compareBusy, setCompareBusy] = useState(false);
  const COMPARE_MAX = 6;
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
      // 401s are handled globally by the api.js response interceptor,
      // which redirects to /login and clears the token. Other errors
      // (network, 5xx) just leave us with a null user below.
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

  // ── Compare selection ────────────────────────────────────────────────
  // Toggle one id in/out of the working set. The list caps at COMPARE_MAX
  // (server enforces the same bound), so a full list silently no-ops further
  // toggles — friendlier than a JS alert.
  const toggleCompare = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= COMPARE_MAX) return prev;
      return [...prev, id];
    });
  };
  const toggleAllCompare = () => {
    if (selectedIds.length === analyses.length) {
      setSelectedIds([]);
    } else {
      // Keep only the first COMPARE_MAX so we don't silently over-select.
      setSelectedIds(analyses.slice(0, COMPARE_MAX).map((a) => a.id));
    }
  };
  const clearCompare = () => {
    setSelectedIds([]);
    setCompareData(null);
  };
  const runCompare = async () => {
    if (selectedIds.length < 2) return;
    setCompareBusy(true);
    try {
      const res = await api.post('/api/analyses/compare', {
        analysis_ids: selectedIds,
      });
      setCompareData(res.data);
    } catch (err) {
      setFlashError(
        'Compare failed: ' +
          (err.response?.data?.detail ||
            err.response?.data?.error ||
            'Unknown error')
      );
    } finally {
      setCompareBusy(false);
    }
  };
  const closeCompare = () => {
    setCompareData(null);
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
        // If the user had picked this analysis for compare, drop it from
        // both the working set and the materialized comparison so the
        // side-by-side view doesn't show a ghost column.
        setSelectedIds((prev) => prev.filter((id) => id !== target.id));
        setCompareData((prev) =>
          prev
            ? {
                ...prev,
                analyses: prev.analyses.filter((a) => a.id !== target.id),
                skill_matrix: prev.skill_matrix
                  .map((row) => ({
                    ...row,
                    missing_in: row.missing_in.filter(
                      (id) => id !== target.id
                    ),
                  }))
                  .filter((row) => row.missing_in.length > 0),
              }
            : prev
        );
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
            {/* CompareView renders above the list when a result is loaded,
                so the user can scroll between the side-by-side view and
                the underlying rows. */}
            <AnimatePresence>
              {compareData && (
                <CompareView
                  data={compareData}
                  onClose={closeCompare}
                  onOpen={(id) => navigate(`/analysis/${id}`)}
                  onDelete={askDeleteAnalysis}
                />
              )}
            </AnimatePresence>
            {selectedIds.length > 0 && !compareData && (
              <CompareBar
                count={selectedIds.length}
                max={COMPARE_MAX}
                busy={compareBusy}
                onCompare={runCompare}
                onClear={clearCompare}
              />
            )}
            <HistoryList
              analyses={analyses}
              onView={(a) => {
                if (a.id) navigate(`/analysis/${a.id}`);
              }}
              onDelete={askDeleteAnalysis}
              selectedIds={selectedIds}
              onToggle={toggleCompare}
              onToggleAll={toggleAllCompare}
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
