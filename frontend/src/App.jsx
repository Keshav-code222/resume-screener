import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { colors, fonts } from './lib/theme';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analyze = lazy(() => import('./pages/Analyze'));
const SavedAnalysis = lazy(() => import('./pages/SavedAnalysis'));
const PublicScan = lazy(() => import('./pages/PublicScan'));

// PageWrapper — pure layout shell. We deliberately skip framer-motion's
// enter/exit transitions here because they fight with the Landing hero's
// scroll-position calculations and were causing black-flash frames during
// scroll. Each page is responsible for its own in-page motion.
function PageWrapper({ children }) {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#0A0907' }}>
      {children}
    </div>
  );
}

function LoadingPage() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: colors.ink,
        color: colors.gold,
        fontFamily: fonts.sans,
        fontSize: 12,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
      }}
    >
      Loading...
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/scan" element={<PageWrapper><PublicScan /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/analyze/:resumeId" element={<PageWrapper><Analyze /></PageWrapper>} />
        <Route path="/analysis/:analysisId" element={<PageWrapper><SavedAnalysis /></PageWrapper>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;