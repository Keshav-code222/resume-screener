import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password required'); return; }
    if (isSignup && !fullName) { setError('Full name required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    setError('');

    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const payload = isSignup ? { email, password, full_name: fullName } : { email, password };
      const res = await API.post(endpoint, payload);
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 409) setError('Email already exists. Sign in instead.');
      else if (err.response?.status === 401) setError('Invalid email or password.');
      else if (err.message === 'Network Error') setError('Cannot reach server. Is backend running?');
      else setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      {/* Left Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 48px', borderRight: '1px solid #111' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '28px', height: '28px', background: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'black', fontWeight: '900', fontSize: '14px' }}>R</span>
          </div>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>resumap.</span>
        </div>

        <div style={{ maxWidth: '420px' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p style={{ color: '#444', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
              {isSignup ? 'Create account' : 'Welcome back'}
            </p>
            <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px', color: 'white', marginBottom: '8px' }}>
              {isSignup ? 'Start navigating\nyour career.' : 'Sign in to\nResuMap.'}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '40px' }}>
              {isSignup ? 'Free to start. No credit card required.' : 'Your career dashboard awaits.'}
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isSignup && (
                <div>
                  <label style={{ color: '#6b7280', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '8px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )}
              <div>
                <label style={{ color: '#6b7280', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '8px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ color: '#6b7280', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '8px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <motion.button
                whileHover={{ background: '#f0f0f0' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '14px', background: 'white', border: 'none', borderRadius: '8px', color: 'black', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '8px' }}
              >
                {loading ? 'Please wait...' : isSignup ? 'Create account →' : 'Sign in →'}
              </motion.button>
            </form>

            <p style={{ color: '#444', fontSize: '14px', marginTop: '24px', textAlign: 'center' }}>
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={() => { setIsSignup(!isSignup); setError(''); }} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                {isSignup ? 'Sign in' : 'Sign up free'}
              </button>
            </p>
          </motion.div>
        </div>

        <p style={{ color: '#222', fontSize: '13px' }}>© 2026 ResuMap</p>
      </div>

      {/* Right Panel - Dark feature showcase */}
      <div style={{ flex: 1, background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          {/* Score Card */}
          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '24px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ color: '#6b7280', fontSize: '13px' }}>Resume Match Score</span>
              <span style={{ color: '#3B82F6', fontSize: '12px', fontWeight: '600' }}>Senior Engineer · Google</span>
            </div>
            <div style={{ fontSize: '56px', fontWeight: '800', letterSpacing: '-2px', color: 'white', marginBottom: '16px' }}>87<span style={{ fontSize: '28px', color: '#444' }}>%</span></div>
            <div style={{ height: '3px', background: '#111', borderRadius: '2px', marginBottom: '20px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '87%' }}
                transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', background: '#3B82F6', borderRadius: '2px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Python', 'React', 'System Design', 'AWS'].map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  style={{ padding: '4px 10px', background: '#111', border: '1px solid #222', borderRadius: '4px', color: '#9ca3af', fontSize: '12px' }}
                >
                  ✓ {s}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
            <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '12px', letterSpacing: '0.05em' }}>MISSING SKILLS</p>
            {['Kubernetes', 'Go', 'gRPC'].map((s, i) => (
              <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid #111' : 'none' }}>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>{s}</span>
                <span style={{ color: '#3B82F6', fontSize: '12px', cursor: 'pointer' }}>learn →</span>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '12px', padding: '16px' }}>
            <p style={{ color: '#3B82F6', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>AI RECOMMENDATION</p>
            <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.5' }}>Add Kubernetes and Go experience to increase your match score to 96% for this role.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}