// Analyze — editorial monograph style, same design tokens as Landing.
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { colors, fonts, spacing, theme as t } from '../lib/theme';
import Logo from '../components/ui/Logo';
import FilledButton from '../components/ui/FilledButton';
import GhostButton from '../components/ui/GhostButton';

function LoadingAnalysis() {
  return (
    <motion.div
      key="scanning"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 0',
        minHeight: 400,
      }}
    >
      {/* Document icon with scanning line */}
      <div
        style={{
          position: 'relative',
          width: 100,
          height: 140,
          border: `1px solid ${colors.border}`,
          background: colors.card,
          overflow: 'hidden',
          marginBottom: 32,
        }}
      >
        <div
          style={{ position: 'absolute', top: 24, left: 20, width: '60%', height: 3, background: colors.border }}
        />
        <div
          style={{ position: 'absolute', top: 38, left: 20, width: '75%', height: 3, background: colors.border }}
        />
        <div
          style={{ position: 'absolute', top: 52, left: 20, width: '65%', height: 3, background: colors.border }}
        />
        <div
          style={{ position: 'absolute', top: 66, left: 20, width: '80%', height: 3, background: colors.border }}
        />
        <div
          style={{ position: 'absolute', top: 80, left: 20, width: '45%', height: 3, background: colors.border }}
        />
        {/* Scanning laser */}
        <motion.div
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            background: colors.gold,
            boxShadow: `0 0 12px 3px ${colors.goldMuted}`,
          }}
        />
      </div>

      <motion.h2
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          fontFamily: fonts.serif,
          fontWeight: 400,
          fontSize: 20,
          color: colors.cream,
          marginBottom: 8,
        }}
      >
        Analyzing with AI
      </motion.h2>
      <p style={{ color: colors.textMuted, fontSize: 14, fontFamily: fonts.sans }}>
        Extracting keywords, scoring skills, and mapping gaps...
      </p>
    </motion.div>
  );
}

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

function AnalysisResults({ analysis, onNewScan, onBack }) {
  const score = Number(analysis.match_score || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      {/* Score Card */}
      <div style={{ border: `1px solid ${colors.border}`, background: colors.card, padding: 32 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: colors.gold,
            }}
          >
            Overall Match Score
          </span>
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: colors.textDim,
            }}
          >
            {analysis.job_title}
          </span>
        </div>

        <div
          style={{
            fontFamily: fonts.serif,
            fontSize: 72,
            fontWeight: 500,
            color: colors.cream,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: 24,
          }}
        >
          {score}<span style={{ fontSize: 32, color: colors.gold }}>%</span>
        </div>

        {/* Progress bar — gold hairline */}
        <div
          style={{
            position: 'relative',
            height: 1,
            background: colors.border,
            marginBottom: 24,
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: 1,
              background: colors.gold,
            }}
          />
        </div>

        <p
          style={{
            color: colors.textMuted,
            fontSize: 15,
            fontFamily: fonts.sans,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {analysis.verdict ||
            (score >= 80
              ? 'Excellent match. Your resume aligns very well with the requirements.'
              : score >= 60
                ? 'Good match. Some adjustments recommended to improve your chances.'
                : 'Needs improvement. Focus on the missing skills below.')}
        </p>
      </div>

      {/* Missing Skills */}
      {analysis.missing_skills && analysis.missing_skills.length > 0 && (
        <div style={{ border: `1px solid ${colors.border}`, background: colors.card, padding: 24 }}>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: colors.gold,
              marginBottom: 16,
            }}
          >
            Missing Keywords &amp; Skills
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {analysis.missing_skills.map((skill, idx) => (
              <span
                key={idx}
                style={{
                  padding: '6px 14px',
                  border: `1px solid rgba(239, 68, 68, 0.3)`,
                  background: colors.error,
                  color: colors.errorText,
                  fontFamily: fonts.sans,
                  fontSize: 12,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div style={{ border: `1px solid ${colors.goldBorder}`, background: colors.goldBg, padding: 24 }}>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: colors.gold,
              marginBottom: 16,
            }}
          >
            AI Recommendations
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {analysis.recommendations.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px 20px',
                  border: `1px solid ${colors.border}`,
                  background: colors.ink,
                }}
              >
                <p
                  style={{
                    color: colors.cream,
                    fontSize: 15,
                    fontWeight: 500,
                    fontFamily: fonts.serif,
                    marginBottom: 4,
                    margin: 0,
                  }}
                >
                  {rec.text}
                </p>
                {rec.action && (
                  <p style={{ color: colors.textMuted, fontSize: 14, fontFamily: fonts.sans, margin: '6px 0 0' }}>
                    {rec.action}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <FilledButton onClick={onNewScan} style={{ flex: 1 }}>
          Scan Another Job
        </FilledButton>
        <GhostButton onClick={onBack} style={{ flex: 1 }}>
          Back to Dashboard
        </GhostButton>
      </div>
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
              onNewScan={() => {
                setAnalysis(null);
                setJobTitle('');
                setJobDescription('');
              }}
              onBack={() => navigate('/dashboard')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
