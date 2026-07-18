import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import Preloader from './components/chrome/Preloader';
import { pageVariants } from './lib/variants';

const PRELOAD_KEY = 'resumap:preloaded';

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: '100%', minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/analyze/:resumeId" element={<PageWrapper><Analyze /></PageWrapper>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  // Preloader fires once per session.
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !sessionStorage.getItem(PRELOAD_KEY);
  });

  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => {
      sessionStorage.setItem(PRELOAD_KEY, '1');
      setIsLoading(false);
    }, 2200);
    return () => clearTimeout(t);
  }, [isLoading]);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <Preloader key="preloader" />
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', minHeight: '100vh' }}
        >
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
