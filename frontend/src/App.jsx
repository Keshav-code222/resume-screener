import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import SavedAnalysis from './pages/SavedAnalysis';

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

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
      <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
      <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
      <Route path="/analyze/:resumeId" element={<PageWrapper><Analyze /></PageWrapper>} />
      <Route path="/analysis/:analysisId" element={<PageWrapper><SavedAnalysis /></PageWrapper>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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