// ForgotPassword — request a password reset link by email.
// Matches the Login page's left-panel editorial aesthetic so the journey
// feels continuous. Always shows the same success message regardless of
// whether the email exists, to prevent account enumeration (the backend
// enforces the same contract).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { colors, fonts, theme as t } from '../lib/theme';
import Logo from '../components/ui/Logo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // "submitted" flips once we get any response from the API — we render the
  // generic message and let the user know what to do next regardless of
  // whether the email exists.
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/forgot-password', { email });
      // Always success from the user's POV — the backend returns the same
      // message whether or not the email is on file.
      setSubmitted(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.message === 'Network Error') {
        setError('Cannot reach server. Is the backend running?');
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(', '));
      } else {
        setError(detail || err.response?.data?.error || 'Something went wrong.');
      }
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
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 56px',
          maxWidth: 560,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <Logo size={28} to="/" />

        <div style={{ marginTop: 'clamp(3rem, 10vh, 6rem)' }}>
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
              Password recovery
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
              {submitted ? 'Check your inbox.' : 'Forgot your\npassword?'}
            </h1>
            <p
              style={{
                color: colors.textMuted,
                fontSize: 15,
                fontFamily: fonts.sans,
                marginBottom: 40,
                lineHeight: 1.5,
              }}
            >
              {submitted
                ? 'If an account exists for that email, we just sent a reset link. It expires in one hour.'
                : "Enter your email and we'll send you a reset link if your account exists."}
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

            {!submitted && (
              <form
                onSubmit={handleSubmit}
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
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ ...t.input }}
                    autoFocus
                  />
                </div>
                <div style={{ marginTop: 8 }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      minHeight: 48,
                      fontSize: 13,
                      fontFamily: fonts.sans,
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      padding: '14px 24px',
                      background: colors.gold,
                      color: colors.ink,
                      border: 'none',
                      borderRadius: 0,
                      cursor: loading ? 'default' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? 'Please wait...' : 'Send reset link →'}
                  </button>
                </div>
              </form>
            )}

            <p
              style={{
                color: colors.textDim,
                fontSize: 13,
                fontFamily: fonts.sans,
                marginTop: 32,
                textAlign: 'center',
              }}
            >
              Remembered it?{' '}
              <Link
                to="/login"
                style={{
                  color: colors.gold,
                  textDecoration: 'none',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                }}
              >
                Back to sign in
              </Link>
            </p>
          </motion.div>
        </div>

        <p
          style={{
            color: colors.textDim,
            fontSize: 12,
            fontFamily: fonts.sans,
            marginTop: 'auto',
            paddingTop: 48,
          }}
        >
          © 2026 ResuMap
        </p>
      </div>
    </div>
  );
}
