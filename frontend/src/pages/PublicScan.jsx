// PublicScan — anonymous "try it" page hitting the public POST /scan
// endpoint. No account required; nothing is saved. After the result the
// secondary action funnels to /login so a curious visitor can convert.
//
// Shares the LoadingAnalysis animation and AnalysisResults renderer with the
// logged-in Analyze flow; only the scan request + data shape differ
// (/scan returns overall_score / missing_keywords / top_suggestions).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { colors, fonts, theme as t } from '../lib/theme';
import Logo from '../components/ui/Logo';
import FilledButton from '../components/ui/FilledButton';
import GhostButton from '../components/ui/GhostButton';
import LoadingAnalysis from '../components/analysis/LoadingAnalysis';
import AnalysisResults from '../components/analysis/AnalysisResults';

// Map the public /scan payload onto the shape AnalysisResults expects
// (mirrors backend _to_recommendations in create_analysis).
function normalizeScan(raw, jobTitle) {
  return {
    match_score: Number(raw.overall_score || 0),
    missing_skills: raw.missing_keywords || [],
    recommendations: (raw.top_suggestions || []).map((s) => ({
      type: 'content',
      priority: 'high',
      text: s,
      action: 'Update resume',
    })),
    verdict: raw.verdict || '',
    job_title: jobTitle,
  };
}

function ScanForm({
  jobTitle,
  setJobTitle,
  jobDescription,
  setJobDescription,
  file,
  setFile,
  error,
  loading,
  onSubmit,
}) {
  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
    >
      <p style={{ ...t.label, marginBottom: 12 }}>
        Public scan — no account required
      </p>
      <h1
        style={{
          fontFamily: fonts.serif,
          fontWeight: 400,
          fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
          color: colors.cream,
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}
      >
        A free reading of your resume
      </h1>
      <p
        style={{
          color: colors.textMuted,
          fontSize: 15,
          fontFamily: fonts.sans,
          marginBottom: 40,
        }}
      >
        Upload a resume, paste the job description, and get an instant AI match
        score. Your resume is only used for this scan — nothing is saved.
      </p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: colors.error,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '12px 16px',
            color: colors.errorText,
            fontSize: 13,
            fontFamily: fonts.sans,
            marginBottom: 24,
          }}
        >
          {error}
        </motion.div>
      )}

      <form
        onSubmit={onSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        <div>
          <label
            style={{
              color: colors.textMuted,
              fontSize: 12,
              fontFamily: fonts.sans,
              display: 'block',
              marginBottom: 8,
            }}
          >
            Job Title <span style={{ color: colors.textDim }}>(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Senior Full Stack Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            disabled={loading}
            style={{ ...t.input }}
          />
        </div>

        <div>
          <label
            style={{
              color: colors.textMuted,
              fontSize: 12,
              fontFamily: fonts.sans,
              display: 'block',
              marginBottom: 8,
            }}
          >
            Resume (PDF or DOCX)
          </label>
          <label
            style={{
              display: 'block',
              border: `1px dashed ${colors.border}`,
              padding: '28px 24px',
              textAlign: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = colors.goldMuted;
                e.currentTarget.style.background = colors.goldBg;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files[0] || null)}
              disabled={loading}
              style={{ display: 'none' }}
            />
            {file ? (
              <>
                <span
                  style={{
                    color: colors.cream,
                    fontSize: 14,
                    fontFamily: fonts.sans,
                    display: 'block',
                  }}
                >
                  {file.name}
                </span>
                <span
                  style={{
                    color: colors.textDim,
                    fontSize: 12,
                    fontFamily: fonts.sans,
                    display: 'block',
                    marginTop: 6,
                  }}
                >
                  Click to choose a different file
                </span>
              </>
            ) : (
              <span
                style={{
                  color: colors.textMuted,
                  fontSize: 14,
                  fontFamily: fonts.sans,
                }}
              >
                Choose your resume — PDF or DOCX
              </span>
            )}
          </label>
        </div>

        <div>
          <label
            style={{
              color: colors.textMuted,
              fontSize: 12,
              fontFamily: fonts.sans,
              display: 'block',
              marginBottom: 8,
            }}
          >
            Job Description
          </label>
          <textarea
            placeholder="Paste the complete job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={loading}
            rows="8"
            style={{
              ...t.input,
              resize: 'vertical',
              minHeight: 160,
              lineHeight: 1.6,
            }}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <FilledButton
            fullWidth
            type="submit"
            disabled={loading}
            style={{ minHeight: 50, fontSize: 13 }}
          >
            Run Free Scan →
          </FilledButton>
        </div>
      </form>
    </motion.div>
  );
}

export default function PublicScan() {
  const navigate = useNavigate();

  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a resume (PDF or DOCX).');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please paste a job description.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription.trim());

    try {
      const res = await api.post('/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysis(normalizeScan(res.data, jobTitle.trim()));
    } catch (err) {
      if (err.response?.data?.detail) setError(err.response.data.detail);
      else if (err.message === 'Network Error')
        setError('Cannot connect to server.');
      else setError('Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setJobTitle('');
    setJobDescription('');
    setFile(null);
    setError('');
  };

  return (
    <div
      style={{
        ...t.page,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: fonts.sans,
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          background: colors.card,
          borderBottom: `1px solid ${colors.border}`,
          padding: '20px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Logo size={28} to="/" />
        <GhostButton small onClick={() => navigate('/login')}>
          Sign in
        </GhostButton>
      </nav>

      <main
        style={{
          flex: 1,
          padding: '48px 56px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 720 }}>
          {!analysis ? (
            <AnimatePresence mode="wait">
              {loading ? (
                <LoadingAnalysis />
              ) : (
                <ScanForm
                  jobTitle={jobTitle}
                  setJobTitle={setJobTitle}
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                  file={file}
                  setFile={setFile}
                  error={error}
                  loading={loading}
                  onSubmit={handleScan}
                />
              )}
            </AnimatePresence>
          ) : (
            <AnalysisResults
              analysis={analysis}
              primaryLabel="Scan Another Resume"
              primaryAction={reset}
              secondaryLabel="Create Free Account →"
              secondaryAction={() => navigate('/login')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
