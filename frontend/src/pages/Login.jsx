// Login / Signup — editorial monograph style, same design tokens as Landing.
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { colors, fonts, spacing, theme as t } from '../lib/theme';
import Logo from '../components/ui/Logo';
import FilledButton from '../components/ui/FilledButton';
import GhostButton from '../components/ui/GhostButton';

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
    if (!email || !password) {
      setError('Email and password required');
      return;
    }
    if (isSignup && !fullName) {
      setError('Full name required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const payload = isSignup
        ? { email, password, full_name: fullName }
        : { email, password };
      const res = await api.post(endpoint, payload);
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 409) setError('Email already exists. Sign in instead.');
      else if (status === 401) setError('Invalid email or password.');
      else if (err.message === 'Network Error')
        setError('Cannot reach server. Is the backend running?');
      else if (Array.isArray(detail))
        setError(detail.map((d) => d.msg).join(', '));
      else
        setError(
          detail || err.response?.data?.error || 'Something went wrong.'
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        ...t.page,
        display: 'flex',
        fontFamily: fonts.sans,
      }}
    >
      {/* ── Left Panel ─────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 56px',
          borderRight: `1px solid ${colors.border}`,
        }}
      >
        <Logo size={28} to="/" />

        <div style={{ maxWidth: 420 }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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
              {isSignup ? 'Create account' : 'Welcome back'}
            </p>
            <h1
              style={{
                fontFamily: fonts.serif,
                fontWeight: 400,
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                color: colors.cream,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                margin: '0 0 8px',
                whiteSpace: 'pre-line',
              }}
            >
              {isSignup
                ? 'Start navigating\nyour career.'
                : 'Sign in to\nResuMap.'}
            </h1>
            <p
              style={{
                color: colors.textMuted,
                fontSize: 15,
                fontFamily: fonts.sans,
                marginBottom: 40,
              }}
            >
              {isSignup
                ? 'Free to start. No credit card required.'
                : 'Your career dashboard awaits.'}
            </p>

            {/* Error message */}
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

            <motion.form
              layout
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              <AnimatePresence mode="popLayout">
                {isSignup && (
                  <motion.div
                    key="fullName"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <label
                      style={{
                        color: colors.textMuted,
                        fontSize: 12,
                        fontFamily: fonts.sans,
                        display: 'block',
                        marginBottom: 8,
                      }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ ...t.input }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout>
                <label
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    fontFamily: fonts.sans,
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ ...t.input }}
                />
              </motion.div>

              <motion.div layout>
                <label
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    fontFamily: fonts.sans,
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...t.input }}
                />
              </motion.div>

              {!isSignup && (
                <div style={{ marginTop: -8, textAlign: 'right' }}>
                  <Link
                    to="/forgot-password"
                    style={{
                      color: colors.textMuted,
                      fontSize: 12,
                      fontFamily: fonts.sans,
                      letterSpacing: '0.04em',
                      textDecoration: 'none',
                      borderBottom: `1px solid ${colors.border}`,
                      paddingBottom: 1,
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <div style={{ marginTop: 8 }}>
                <FilledButton
                  fullWidth
                  type="submit"
                  disabled={loading}
                  style={{ minHeight: 48, fontSize: 13 }}
                >
                  {loading
                    ? 'Please wait...'
                    : isSignup
                      ? 'Create account →'
                      : 'Sign in →'}
                </FilledButton>
              </div>
            </motion.form>

            <p
              style={{
                color: colors.textDim,
                fontSize: 13,
                fontFamily: fonts.sans,
                marginTop: 24,
                textAlign: 'center',
              }}
            >
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.gold,
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: 13,
                  fontFamily: fonts.sans,
                  letterSpacing: '0.04em',
                  padding: 0,
                }}
              >
                {isSignup ? 'Sign in' : 'Sign up free'}
              </button>
            </p>
          </motion.div>
        </div>

        <p style={{ color: colors.textDim, fontSize: 12, fontFamily: fonts.sans }}>
          © 2026 ResuMap
        </p>
      </div>

      {/* ── Right Panel — Dashboard preview (editorial style) ──────── */}
      <div
        style={{
          flex: 1,
          background: colors.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          {/* Score Card */}
          <div
            style={{
              border: `1px solid ${colors.border}`,
              background: colors.ink,
              padding: 28,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
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
                Resume Match Score
              </span>
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  color: colors.textDim,
                }}
              >
                Senior Engineer · Google
              </span>
            </div>
            <div
              style={{
                fontFamily: fonts.serif,
                fontSize: 56,
                fontWeight: 500,
                color: colors.cream,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                marginBottom: 16,
              }}
            >
              87<span style={{ fontSize: 28, color: colors.gold }}>%</span>
            </div>
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
                animate={{ width: '87%' }}
                transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: 1,
                  background: colors.gold,
                }}
              />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}
            >
              {['Python', 'React', 'System Design', 'AWS'].map((s) => (
                <div
                  key={s}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: fonts.sans,
                    fontSize: 12,
                    color: colors.creamDim,
                  }}
                >
                  <span style={{ color: colors.gold }}>✓</span>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div
            style={{
              border: `1px solid ${colors.border}`,
              background: colors.ink,
              padding: 24,
              marginBottom: 12,
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
                marginBottom: 16,
              }}
            >
              Missing Skills
            </p>
            {['Kubernetes', 'Go', 'gRPC'].map((s, i, arr) => (
              <div
                key={s}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom:
                    i < arr.length - 1 ? `1px solid ${colors.border}` : 'none',
                }}
              >
                <span
                  style={{
                    color: colors.textMuted,
                    fontSize: 14,
                    fontFamily: fonts.sans,
                  }}
                >
                  {s}
                </span>
                <span
                  style={{
                    color: colors.gold,
                    fontSize: 11,
                    fontFamily: fonts.sans,
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                  }}
                >
                  learn →
                </span>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div
            style={{
              border: `1px solid ${colors.goldBorder}`,
              background: colors.goldBg,
              padding: 20,
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
                marginBottom: 6,
              }}
            >
              AI Recommendation
            </p>
            <p
              style={{
                color: colors.creamDim,
                fontSize: 13,
                fontFamily: fonts.serif,
                fontStyle: 'italic',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Add Kubernetes and Go experience to increase your match score to
              96% for this role.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
