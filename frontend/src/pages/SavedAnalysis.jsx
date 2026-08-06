// SavedAnalysis — renders a stored analysis from history.
// Unlike /analyze/:resumeId (which re-runs the scan), this fetches the saved
// result via GET /api/analyses/:id so reopening history costs nothing and
// shows the exact verdict/recommendations from when it was run.

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { colors, fonts, theme as t } from '../lib/theme';
import Logo from '../components/ui/Logo';
import GhostButton from '../components/ui/GhostButton';
import FilledButton from '../components/ui/FilledButton';
import AnalysisResults from '../components/analysis/AnalysisResults';

function LoadingState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 0',
        minHeight: 400,
      }}
    >
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
        Loading analysis...
      </motion.p>
    </div>
  );
}

function ErrorState({ message, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ textAlign: 'center', padding: '64px 0' }}
    >
      <p
        style={{
          fontFamily: fonts.serif,
          fontSize: 24,
          color: colors.cream,
          marginBottom: 12,
        }}
      >
        Couldn't load this analysis
      </p>
      <p
        style={{
          color: colors.textMuted,
          fontSize: 14,
          fontFamily: fonts.sans,
          marginBottom: 24,
        }}
      >
        {message}
      </p>
      <FilledButton onClick={onBack}>Back to Dashboard</FilledButton>
    </motion.div>
  );
}

export default function SavedAnalysis() {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    api
      .get(`/api/analyses/${analysisId}`)
      .then((res) => {
        if (!cancelled) setAnalysis(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 404) setError('Analysis not found.');
        else if (err.message === 'Network Error')
          setError('Cannot connect to server.');
        else setError('Failed to load this analysis. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [analysisId]);

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
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onBack={() => navigate('/dashboard')} />
          ) : (
            <AnalysisResults
              analysis={analysis}
              primaryLabel="Analyze Another Role"
              primaryAction={() => navigate(`/analyze/${analysis.resume_id}`)}
              secondaryLabel="Back to Dashboard"
              secondaryAction={() => navigate('/dashboard')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
