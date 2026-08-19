// ResetPassword — consume a one-time reset token (from the email link) and
// set a new password. Reads the token from the query string so the user can
// paste the link straight into the browser. Shows the same generic error
// message whether the token is invalid or expired so an attacker can't tell
// the two states apart.
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { colors, fonts, theme as t } from '../lib/theme';
import Logo from '../components/ui/Logo';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawToken = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // If the link didn't include a token at all, surface it once on mount so
  // the user understands why the form is disabled.
  useEffect(() => {
    if (!rawToken) {
      setError(
        'Missing reset token. Open the link from your email, or request a new one.',
      );
    }
  }, [rawToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rawToken) return;
    if (!password) {
      setError('New password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/reset-password', {
        token: rawToken,
        new_password: password,
      });
      setDone(true);
      // Give the user a moment to read the success message, then bounce
      // them to the login page so they can sign in with the new password.
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      // Generic 400 from the backend for both invalid and expired tokens —
      // mirror that here so we don't leak which it was.
      const detail = err.response?.data?.detail;
      if (err.message === 'Network Error') {
        setError('Cannot reach server. Is the backend running?');
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(', '));
      } else {
        setError(
          detail || err.response?.data?.error || 'Something went wrong.',
        );
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
              Set a new password
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
              {done ? 'Password updated.' : 'Almost\nthere.'}
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
              {done
                ? "Redirecting you to sign in. Use your new password next time you log in."
                : 'Choose a new password for your ResuMap account.'}
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

            {!done && (
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
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ ...t.input }}
                    autoFocus
                    disabled={!rawToken}
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
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    style={{ ...t.input }}
                    disabled={!rawToken}
                  />
                </div>
                <div style={{ marginTop: 8 }}>
                  <button
                    type="submit"
                    disabled={loading || !rawToken}
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
                      cursor: loading || !rawToken ? 'default' : 'pointer',
                      opacity: loading || !rawToken ? 0.5 : 1,
                    }}
                  >
                    {loading ? 'Updating...' : 'Update password →'}
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
              Need a fresh link?{' '}
              <Link
                to="/forgot-password"
                style={{
                  color: colors.gold,
                  textDecoration: 'none',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                }}
              >
                Request one
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
