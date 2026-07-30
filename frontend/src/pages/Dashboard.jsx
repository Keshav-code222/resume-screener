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
function ResumesList({ resumes, onAnalyze }) {
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
        {resumes.map((resume, i) => (
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
            <GhostButton small onClick={() => onAnalyze(resume.id)}>
              Analyze →
            </GhostButton>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── History List ─────────────────────────────────────────────────────────
function HistoryList({ analyses, onView }) {
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
              gridTemplateColumns: '90px 1fr 120px 120px',
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
          </motion.div>
        );
      })}
    </div>
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
  const navigate = useNavigate();

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
      alert(
        'Upload failed: ' +
          (err.response?.data?.detail ||
            err.response?.data?.error ||
            'Unknown error')
      );
    } finally {
      setUploading(false);
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
            />
          </div>
        )}

        {active === 'history' && (
          <div>
            <p style={{ ...t.label, marginBottom: 16 }}>Past Analyses</p>
            <HistoryList
              analyses={analyses}
              onView={(a) => {
                if (a.resume_id) navigate(`/analyze/${a.resume_id}`);
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
