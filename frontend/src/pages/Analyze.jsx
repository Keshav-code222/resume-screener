import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
    if (!jobTitle.trim()) { setError('Job title is required'); return; }
    if (!jobDescription.trim()) { setError('Job description is required'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await API.post('/api/analyses', {
        resume_id: resumeId,
        job_title: jobTitle,
        job_description: jobDescription,
      });
      setAnalysis(res.data);
    } catch (err) {
      if (err.response?.data?.error) setError(err.response.data.error);
      else if (err.message === 'Network Error') setError('Cannot connect to server.');
      else setError('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav style={{ padding: '24px 48px', borderBottom: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <div style={{ width: '28px', height: '28px', background: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'black', fontWeight: '900', fontSize: '14px' }}>R</span>
          </div>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>resumap.</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #222', borderRadius: '6px', color: '#9ca3af', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          ← Dashboard
        </button>
      </nav>

      <main style={{ flex: 1, padding: '48px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '720px' }}>
          {!analysis ? (
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', minHeight: '400px' }}
                >
                  <div style={{ position: 'relative', width: '120px', height: '160px', background: '#0d0d0d', border: '2px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
                    {/* Document Lines */}
                    <div style={{ position: 'absolute', top: '24px', left: '20px', width: '60%', height: '4px', background: '#222', borderRadius: '2px' }} />
                    <div style={{ position: 'absolute', top: '40px', left: '20px', width: '80%', height: '4px', background: '#222', borderRadius: '2px' }} />
                    <div style={{ position: 'absolute', top: '56px', left: '20px', width: '70%', height: '4px', background: '#222', borderRadius: '2px' }} />
                    <div style={{ position: 'absolute', top: '72px', left: '20px', width: '85%', height: '4px', background: '#222', borderRadius: '2px' }} />
                    <div style={{ position: 'absolute', top: '88px', left: '20px', width: '50%', height: '4px', background: '#222', borderRadius: '2px' }} />
                    
                    {/* Laser Scanner */}
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: '#3B82F6', boxShadow: '0 0 16px 4px rgba(59, 130, 246, 0.4)' }}
                    />
                  </div>
                  <motion.h2
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ color: 'white', fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '8px' }}
                  >
                    Analyzing with AI
                  </motion.h2>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>Extracting keywords, scoring skills, and mapping gaps...</p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4 }}
                >
                  <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px', color: 'white', marginBottom: '8px' }}>
                    Analyze Resume Match
                  </h1>
                  <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '40px' }}>
                    Paste the job description below to see how well your resume matches and get AI recommendations.
                  </p>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '12px 16px', color: '#f87171', fontSize: '14px', marginBottom: '24px' }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ color: '#6b7280', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g., Senior Full Stack Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        disabled={loading}
                        style={{ width: '100%', padding: '14px 16px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '8px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ color: '#6b7280', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Job Description</label>
                      <textarea
                        placeholder="Paste the complete job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        disabled={loading}
                        rows="10"
                        style={{ width: '100%', padding: '14px 16px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '8px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                      />
                    </div>

                    <motion.button
                      whileHover={!loading ? { background: '#f0f0f0' } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      type="submit"
                      disabled={loading}
                      style={{ width: '100%', padding: '16px', background: 'white', border: 'none', borderRadius: '8px', color: 'black', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '8px' }}
                    >
                      Scan Resume Match →
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Score Card (Matched with Landing page theme) */}
              <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Overall Match Score</span>
                  <span style={{ color: '#3B82F6', fontSize: '14px', fontWeight: '600' }}>{analysis.job_title}</span>
                </div>
                
                <div style={{ fontSize: '72px', fontWeight: '800', letterSpacing: '-2px', color: 'white', marginBottom: '24px' }}>
                  {analysis.match_score}<span style={{ fontSize: '36px', color: '#444' }}>%</span>
                </div>
                
                <div style={{ height: '4px', background: '#111', borderRadius: '2px', marginBottom: '24px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.match_score}%` }}
                    transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
                    style={{ height: '100%', background: analysis.match_score >= 80 ? '#10B981' : analysis.match_score >= 60 ? '#F59E0B' : '#EF4444', borderRadius: '2px' }}
                  />
                </div>
                
                <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6' }}>
                  {analysis.verdict || (analysis.match_score >= 80 ? 'Excellent match. Your resume aligns very well with the requirements.' : analysis.match_score >= 60 ? 'Good match. Some adjustments recommended to improve your chances.' : 'Needs improvement. Focus on the missing skills below.')}
                </p>
              </div>

              {/* Missing Skills */}
              {analysis.missing_skills && analysis.missing_skills.length > 0 && (
                <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '24px' }}>
                  <p style={{ color: '#6b7280', fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    Missing Keywords & Skills
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {analysis.missing_skills.map((skill, idx) => (
                      <span key={idx} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#f87171', fontSize: '13px' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '24px' }}>
                  <p style={{ color: '#6b7280', fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    AI Recommendations
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {analysis.recommendations.map((rec, idx) => (
                      <div key={idx} style={{ padding: '16px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: '8px' }}>
                        <p style={{ color: 'white', fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>{rec.text}</p>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>{rec.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <motion.button
                  whileHover={{ background: '#f0f0f0' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setAnalysis(null); setJobTitle(''); setJobDescription(''); }}
                  style={{ flex: 1, padding: '14px', background: 'white', border: 'none', borderRadius: '8px', color: 'black', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Scan Another Job
                </motion.button>
                <motion.button
                  whileHover={{ background: '#111' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard')}
                  style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid #222', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Back to Dashboard
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}