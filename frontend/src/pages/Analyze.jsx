// Analyze — editorial monograph style, same design tokens as Landing.
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { colors, fonts, spacing, theme as t } from '../lib/theme';
import Logo from '../components/ui/Logo';
import FilledButton from '../components/ui/FilledButton';
import GhostButton from '../components/ui/GhostButton';
import AnalysisResults from '../components/analysis/AnalysisResults';
import LoadingAnalysis from '../components/analysis/LoadingAnalysis';

function AnalysisForm({ jobTitle, setJobTitle, jobDescription, setJobDescription, error, loading, onSubmit }) {
  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
    >
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
        Analyze Resume Match
      </h1>
      <p
        style={{
          color: colors.textMuted,
          fontSize: 15,
          fontFamily: fonts.sans,
          marginBottom: 40,
        }}
      >
        Paste the job description below to see how well your resume matches and
        get AI recommendations.
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
            Job Title
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
            Job Description
          </label>
          <textarea
            placeholder="Paste the complete job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={loading}
            rows="10"
            style={{
              ...t.input,
              resize: 'vertical',
              minHeight: 200,
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
            Scan Resume Match →
          </FilledButton>
        </div>
      </form>
    </motion.div>
  );
}

export default function Analyze() {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      setError('Job title is required');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Job description is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/analyses', {
        resume_id: resumeId,
        job_title: jobTitle,
        job_description: jobDescription,
      });
      setAnalysis(res.data);
    } catch (err) {
      if (err.response?.data?.error) setError(err.response.data.error);
      else if (err.message === 'Network Error')
        setError('Cannot connect to server.');
      else setError('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <Logo size={28} to="/dashboard" />
        <GhostButton small onClick={() => navigate('/dashboard')}>
          ← Dashboard
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
                <AnalysisForm
                  jobTitle={jobTitle}
                  setJobTitle={setJobTitle}
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                  error={error}
                  loading={loading}
                  onSubmit={handleAnalyze}
                />
              )}
            </AnimatePresence>
          ) : (
            <AnalysisResults
              analysis={analysis}
              primaryAction={() => {
                setAnalysis(null);
                setJobTitle('');
                setJobDescription('');
              }}
              secondaryAction={() => navigate('/dashboard')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
